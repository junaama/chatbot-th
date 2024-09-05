from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List

app = FastAPI()

clients: List[WebSocket] = []

@app.get("/api/python")
def hello_world():
    return {"message": "Hello World"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            for client in clients:
                await client.send_text(f"Message text was: {data}")
    except WebSocketDisconnect:
        clients.remove(websocket)
