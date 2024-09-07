import json
import httpx
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List
from httpx import TimeoutException
model = "llama3.1"

app = FastAPI()

clients: List[WebSocket] = []

ollama_url = "http://localhost:11434/api/generate" 

# different bot modes
vacation_mode = "You are a laid-back chatbot with an island accent. Your responses should be relaxed, use island slang, and convey a 'go with the flow' attitude. Respond as if you're always on a tropical beach vacation."

work_mode = "You are a very serious and pushy chatbot focused on work efficiency. Your responses should be formal, direct, and emphasize urgency and productivity. Use phrases that convey a no-nonsense attitude.",


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
