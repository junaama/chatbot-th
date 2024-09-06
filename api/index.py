import json
import httpx
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List

model = "llama3.1"

app = FastAPI()

clients: List[WebSocket] = []

ollama_url = "http://localhost:11434/api/generate" 

# helper methods

async def process_message_stream(context: List[str], current_message: str, websocket: WebSocket):
    payload = {
        "model": "llama3.1", 
        "prompt": current_message,
        "stream": True,
        "context": context 
    }

    async with httpx.AsyncClient() as client:
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
                            # Send a special signal to indicate the message stream is done
                            await websocket.send_text(json.dumps({"type": "done"}))
                            return
                    except json.JSONDecodeError:
                        continue

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
            await process_message_stream(context, current_message, websocket)
    except WebSocketDisconnect:
        clients.remove(websocket)
