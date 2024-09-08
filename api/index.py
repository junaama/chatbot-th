import json
import httpx
import jwt
from sqlalchemy import ForeignKey, create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, Session, declarative_base, relationship
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from httpx import TimeoutException
from passlib.context import CryptContext
from pydantic import BaseModel
from datetime import datetime, timedelta


model = "llama3.1"

app = FastAPI()

# middleware
origins = [
    "http://localhost:3000",
    "https://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
clients: List[WebSocket] = []

ollama_url = "http://localhost:11434/api/generate" 

# different bot modes
vacation_mode = "You are a laid-back chatbot with an island accent. Your responses should be relaxed, use island slang, and convey a 'go with the flow' attitude. Respond as if you're always on a tropical beach vacation."

work_mode = "You are a very serious and pushy chatbot focused on work efficiency. Your responses should be formal, direct, and emphasize urgency and productivity. Use phrases that convey a no-nonsense attitude.",

# database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# user
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

# message
class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    chat_id = Column(Integer, ForeignKey("chats.id"), nullable=False)
    created_at = Column(String, default=datetime.utcnow)

    user = relationship("User")
    chat = relationship("Chat", back_populates="messages")

# chat
class Chat(Base):
    __tablename__ = "chats"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    messages = relationship("Message", back_populates="chat")


Base.metadata.create_all(bind=engine)

class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

SECRET_KEY = "your-secret-key" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# db methods
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user: UserCreate):
    db_user = User(username=user.username, hashed_password=get_password_hash(user.password))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    user = get_user(db, username=username)
    if user is None:
        raise credentials_exception
    return user


# helper methods

async def process_message_stream(context: List[str], current_message: str, websocket: WebSocket, mode: str):
    if mode == "vacation":
        selected_mode = vacation_mode
    elif mode == "work":
        selected_mode = work_mode
    payload = {
        "model": "llama3.1", 
        "prompt": f"{selected_mode}\nHuman: {current_message}",
        "stream": True,
        "context": context,
        "options": {
            "num_ctx": 4096
        }
    }

    try:
        async with httpx.AsyncClient(timeout=180) as client:
            async with client.stream("POST", ollama_url, json=payload) as response:
                async for line in response.aiter_lines():
                    if line:
                        try:
                            data = json.loads(line)
                            if "error" in data:
                                await websocket.send_text(json.dumps({"type": "error", "message": data['error']}))
                                return
                            if not data.get("done", False):
                                content = data.get("response", "")
                                await websocket.send_text(json.dumps({"type": "message", "content": content}))
                            else:
                                # Indicate the message stream is done and collect context
                                await websocket.send_text(json.dumps({"type": "done", "context": data.get("context", [])}))
                                return
                        except json.JSONDecodeError:
                            continue
    except TimeoutException as e:
        error_message = f"Request timed out: {str(e)}"
        await websocket.send_text(json.dumps({"type": "error", "message": error_message}))
    except httpx.HTTPError as e:
        error_message = f"HTTP error occurred: {str(e)}"
        await websocket.send_text(json.dumps({"type": "error", "message": error_message}))
    except Exception as e:
        error_message = f"An unexpected error occurred: {str(e)}"
        await websocket.send_text(json.dumps({"type": "error", "message": error_message}))

# routes

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            context = message_data.get("context", [])
            current_message = message_data.get("current", "")
            mode = message_data.get("mode", "")
            await process_message_stream(context, current_message, websocket, mode)
    except WebSocketDisconnect:
        clients.remove(websocket)

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    user = create_user(db, user)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login")
def login(user: UserCreate, db: Session = Depends(get_db)):
    user = authenticate_user(db, user.username, user.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return {"username": current_user.username}

@app.post("/chat")
async def create_new_chat(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chat_instance = Chat(user_id=current_user.id)
    db.add(chat_instance)
    db.commit()
    db.refresh(chat_instance)
    return {"chat_id": chat_instance.id}

@app.post("/message")
async def send_message(chat_id: int, message: str, db: Session = Depends(get_db)):
    chat_instance = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat_instance:
        raise HTTPException(status_code=404, detail="Chat not found")
    message_instance = Message(chat_id=chat_id, content=message)
    db.add(message_instance)
    db.commit()
    db.refresh(message_instance)
    return {"message_id": message_instance.id}

@app.get("/chats")
async def get_chats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chats = db.query(Chat).filter(Chat.user_id == current_user.id).all()
    return {"chats": [{"id": chat.id, "user_id": chat.user_id} for chat in chats]}

@app.get("/messages/{chat_id}")
async def get_messages(chat_id: int, db: Session = Depends(get_db)):
    messages = db.query(Message).filter(Message.chat_id == chat_id).all()
    return {"messages": [{"id": message.id, "content": message.content} for message in messages]}
