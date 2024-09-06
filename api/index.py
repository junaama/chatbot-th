import json
import requests
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List

model = "llama3.1"

app = FastAPI()

clients: List[WebSocket] = []


def process_message(message: str):
    ollama_url = "http://localhost:11434/api/chat" 
    payload = {
        "model": "llama3.1", 
        "messages": [{"role": "user", "content": message}],
        "stream": True
    }
    response = requests.post(ollama_url, json=payload, stream=True)
    response.raise_for_status()
    output = ""

    for line in response.iter_lines():
        body = json.loads(line)
        if "error" in body:
            raise Exception(body["error"])
        if body.get("done") is False:
            message = body.get("message", "")
            content = message.get("content", "")
            output += content
            # the response streams one token at a time, print that as we receive it
            print(content, end="", flush=True)

        if body.get("done", False):
            message["content"] = output
            return message

# routes

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            processed_message = process_message(data)
            for client in clients:
                await client.send_text(processed_message)
    except WebSocketDisconnect:
        clients.remove(websocket)
