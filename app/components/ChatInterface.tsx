import React, { useState, ChangeEvent, useEffect } from 'react';
import Markdown from 'react-markdown';
import { Transition } from '@headlessui/react';

type ChatInterfaceProps = {
  messages: string[];
  setMessages: React.Dispatch<React.SetStateAction<string[]>>;
  context: number[];
  sendMessage: (message: string, imageBase64: string | null, mode: string, userId: number) => void;
  mode: string;
  isBotLoading: boolean;
  exampleMessage?: string; 
  userId: number
}

const ChatInterface = ({
  messages,
  setMessages,
  context,
  sendMessage,
  mode,
  isBotLoading,
  exampleMessage,
  userId
}: ChatInterfaceProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  useEffect(() => {
    if (exampleMessage) {
      setInputMessage(exampleMessage);
    }
  }, [exampleMessage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() || imageBase64) {
      sendMessage(inputMessage, imageBase64, mode, userId);
      setInputMessage('');
      setImageBase64(null);
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
  };

  return (
    <>
      <form onSubmit={handleSendMessage} className="mb-4">
        <textarea
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          rows={4}
          placeholder="Enter your question here..."
          onChange={handleInputChange}
          value={inputMessage}
        ></textarea>
        <div className="flex flex-wrap justify-end items-center gap-4 mt-2">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="imageInput"
            onChange={handleImageUpload}
          />
          <label
            htmlFor="imageInput"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 cursor-pointer"
          >
            Upload Image
          </label>
          {imageBase64 && (
            <>
              <span className="text-sm text-gray-600">1 file uploaded</span>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              >
                Remove Image
              </button>
            </>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-[#4C2E05] text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            disabled={isBotLoading}
          >
            Send
          </button>
        </div>
      </form>
      {messages.map((message, index) => (
        <Transition appear={true} show={true} key={index}>
          <div className={`transition duration-300 ease-in mb-4 p-4 rounded-lg ${index % 2 === 0 ? 'bg-[#CEC288] dark:bg-red-800' : 'bg-[#f3eed2] border-[#4C2E05] dark:bg-blue-800 shadow-md'
            }`}>
            <Markdown className="prose">{message}</Markdown>
          </div>
        </Transition>
      ))}
    </>

  );
};

export default ChatInterface;