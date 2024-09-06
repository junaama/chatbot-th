import json
import httpx
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List

model = "llama3.1"

app = FastAPI()

clients: List[WebSocket] = []


async def process_message_stream(message: str, websocket: WebSocket):
    ollama_url = "http://localhost:11434/api/chat" 
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
                            await websocket.send_text(f"Error: {data['error']}")
                            return
                        if not data.get("done", False):
                            content = data.get("message", {}).get("content", "")
                            await websocket.send_text(content)
                        else:
                            await websocket.send_text("[DONE]")
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
