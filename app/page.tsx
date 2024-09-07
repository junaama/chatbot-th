'use client'
import { ChangeEvent, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";

export default function Home() {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [context, setContext] = useState<number[]>([]);
  const [mode, setMode] = useState<string>("vacation")
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isBotLoading, setIsBotLoading] = useState(false)
  const websocketRef = useRef<WebSocket | null>(null);
  const currentMessageRef = useRef('');

  const connectWebSocket = () => {
    websocketRef.current = new WebSocket("ws://localhost:8000/ws");

    websocketRef.current.onopen = () => {
      console.log('WebSocket connection established');
    };
    websocketRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "message":
          setIsBotLoading(false)
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

  useEffect(() => {
    let dots = '';
    let interval: NodeJS.Timeout;

    if (isBotLoading) {
      interval = setInterval(() => {
        dots = dots.length < 3 ? dots + '.' : '';
        setMessages(prevMessages => {
          const newMessages = [...prevMessages];
          newMessages[newMessages.length - 1] = `AI: Thinking${dots}`;
          return newMessages;
        });
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBotLoading]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((inputMessage.trim() || imageBase64) && websocketRef.current) {
      const messageData = {
        context: context,
        current: inputMessage,
        images: [imageBase64],
        mode: mode // allow single image upload
      }
      websocketRef.current.send(JSON.stringify(messageData))
      setMessages(prevMessages => [...prevMessages, `You: ${inputMessage}`]);
      setMessages(prevMessages => [...prevMessages, `AI: Thinking...`]);
      setInputMessage('');
      setImageBase64(null)
      currentMessageRef.current = '';
      setIsBotLoading(true)
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageBase64(base64String.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageBase64(null);
    if (document.getElementById('imageInput')) {
      (document.getElementById('imageInput') as HTMLInputElement).value = '';
    }
  }

  const handleSignUp = () => {
    const username = prompt("Enter your username:");
    if (username) {
      setUser({ username });
    }
  }
  const handleLogout = () => {
    setUser(null);
    setDropdownOpen(false);
  };

  const handleModeChange = () => {
    setMode(mode === "vacation" ? "work" : "vacation");
  }

  return (
    <main className="flex custom-stars-bg min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl flex items-center justify-between font-mono text-sm">
        <p className="flex-shrink-0 border-b border-gray-300 bg-gradient-to-b from-zinc-200 px-4 py-2 backdrop-blur-2xl dark:border-neutral-800 dark:from-inherit rounded-xl border bg-gray-200 dark:bg-zinc-800/30">
          Chatbot
        </p>
        <div className="flex items-center">
          {!user ? (
            <button
              className="px-4 py-2 bg-[#4C2E05] text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              onClick={handleSignUp}
            >
              Sign Up
            </button>
          ) : (
            <div className="relative">
              <button
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200 focus:outline-none"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {user.username}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  <button onClick={handleModeChange} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ">Switch to {mode === "vacation" ? `Work` : `Vacation`} Mode</button>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Use Dark Mode</a>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto p-6 bg-[#DDD8B8] dark:bg-gray-800 rounded-lg shadow-md mt-6">
        <div className="mb-4">
          <textarea
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            rows={4}
            placeholder="Enter your question here..."
            onChange={handleInputChange}
            value={inputMessage}
          ></textarea>
        </div>
        <div className="flex flex-wrap justify-end items-center gap-4">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="imageInput"
            onChange={handleImageUpload}
          />
          <label
            htmlFor="imageInput"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 cursor-pointer "
          >
            Upload Image
          </label>
          {imageBase64 && (
            <>
              <span className="text-sm text-gray-600 ">
                1 file uploaded
              </span>
              <button
                onClick={handleRemoveImage}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 "
              >
                Remove Image
              </button>
            </>
          )}
          <button
            className="px-4 py-2 bg-[#4C2E05] text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>

        <div className="mt-4 mb-4">
          <h3 className="text-lg font-semibold mb-2">Choose from an example below:</h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              className="p-2 text-left border border-[#CEC288] shadow-md dark:bg-gray-700 rounded-lg hover:bg-[#CEC288] dark:hover:bg-gray-600 transition-colors"
              onClick={() => setInputMessage("What is the color of the sky?")}
            >
              What is the color of the sky?
            </button>
            <button
              className="p-2 text-left border border-[#CEC288] shadow-md dark:bg-gray-700 rounded-lg hover:bg-[#CEC288] dark:hover:bg-gray-600 transition-colors"
              onClick={() => setInputMessage("How many pieces are in a chess board?")}
            >
              How many pieces are in a chess board?
            </button>
            <button
              className="p-2 text-left border border-[#CEC288] shadow-md dark:bg-gray-700 rounded-lg hover:bg-[#CEC288] dark:hover:bg-gray-600 transition-colors"
              onClick={() => setInputMessage("What are the benefits of taking iron supplements?")}
            >
              What are the benefits of taking iron supplements?
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-[#DDD8B8]  dark:bg-gray-900 rounded-lg min-h-[200px]">
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 p-4 rounded-lg ${index % 2 === 0 ? 'bg-[#CEC288] dark:bg-red-800 ' : 'bg-[#DDD8B8]   border-[#4C2E05] dark:bg-blue-800 shadow-md'}`}>
              <Markdown className="prose">{message}</Markdown>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
