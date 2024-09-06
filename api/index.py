import json
import httpx
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List

model = "llama3.1"

app = FastAPI()

clients: List[WebSocket] = []

ollama_url = "http://localhost:11434/api/chat" 

# helper methods

async def process_message_stream(message: str, websocket: WebSocket):
    payload = {
        "model": "llama3.1", 
        "messages": [{"role": "user", "content": message}],
        "stream": True
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
                            content = data.get("message", {}).get("content", "")
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
            await process_message_stream(data, websocket)
    except WebSocketDisconnect:
        clients.remove(websocket)
