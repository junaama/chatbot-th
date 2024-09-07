'use client'
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";

export default function Home() {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const websocketRef = useRef<WebSocket | null>(null);
  const currentMessageRef = useRef('');
  const [context, setContext] = useState<number[]>([]);

  const connectWebSocket = () => {
    websocketRef.current = new WebSocket("ws://localhost:8000/ws");

    websocketRef.current.onopen = () => {
      console.log('WebSocket connection established');
    };
    websocketRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "message":
          currentMessageRef.current += message.content;

          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];

            updatedMessages[updatedMessages.length - 1] = `AI: ${currentMessageRef.current}`;
            return updatedMessages;
          });

          break;
        case "done":
          setContext(message.context)
          currentMessageRef.current = '';

          break;
        case "error":
          console.error("Server Error: ", message.message);
          break;
        default:
          console.log('Unhandled message type');
      }
    };

    websocketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocketRef.current.onclose = () => {
      console.log('WebSocket connection closed');
      setTimeout(() => {
        connectWebSocket(); // Reconnect after a delay
      }, 5000);
    };
  }

  useEffect(() => {
    connectWebSocket()
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && websocketRef.current) {
      const messageData = {
        context: context,
        current: inputMessage
      }
      websocketRef.current.send(JSON.stringify(messageData))
      setMessages(prevMessages => [...prevMessages, `You: ${inputMessage}`]);
      setMessages(prevMessages => [...prevMessages, `AI: Thinking...`]);
      setInputMessage('');
      currentMessageRef.current = '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Chatbot
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By Naama Paulemont
          </a>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="mb-4">
          <textarea
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            rows={4}
            placeholder="Enter your question here..."
            onChange={handleInputChange}
            value={inputMessage}
          ></textarea>
        </div>
        <div className="flex justify-end">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" onClick={handleSendMessage}>
            Send
          </button>
        </div>
        
        <div className="mt-4 mb-4">
          <h3 className="text-lg font-semibold mb-2">Choose from an example below:</h3>
          <div className="grid grid-cols-3 gap-2">
            <button 
              className="p-2 text-left bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              onClick={() => setInputMessage("What is the capital of France?")}
            >
              What is the color of the sky?
            </button>
            <button 
              className="p-2 text-left bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              onClick={() => setInputMessage("Explain the concept of machine learning in simple terms.")}
            >
              How many pieces are in a chess board?
            </button>
            <button 
              className="p-2 text-left bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              onClick={() => setInputMessage("What are the benefits of regular exercise?")}
            >
              What are the benefits of taking iron supplements?
            </button>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg min-h-[200px]">
          {messages.map((message, index) => (
            <Markdown className="prose" key={index}>{message}</Markdown>

          ))}
        </div>
      </div>
    </main>
  );
}
