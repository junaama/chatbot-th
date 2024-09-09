'use client'
import React, { useState } from 'react';
import useAuth from './hooks/useAuth';
import useChatHistory from './hooks/useChatHistory';
import useWebSocket from './hooks/useWebSocket';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import ExamplesSection from './components/ExamplesSection';
import RecentChats from './components/RecentChats';

export default function Home() {
  const { user, isLoggedIn, logout } = useAuth();
  const [mode, setMode] = useState<string>("vacation");
  const [showExamples, setShowExamples] = useState(true);
  const [showChatHistory, setShowChatHistory] = useState(false);

  const {
    messages,
    setMessages,
    context,
    sendMessage,
    isBotLoading
  } = useWebSocket(isLoggedIn);

  const { chatHistory } = useChatHistory(isLoggedIn, user);

  const handleModeChange = () => setMode(mode === "vacation" ? "work" : "vacation");
  const toggleExample = () => setShowExamples(!showExamples);
  const toggleChatHistory = () => setShowChatHistory(!showChatHistory);
  const [selectedExample, setSelectedExample] = useState('');

  return (
    <main className="flex custom-stars-bg min-h-screen flex-col items-center justify-between p-6 md:p-24 ">
      <div className="z-10  w-full max-w-5xl items-center justify-between font-mono text-sm flex-wrap md:flex-nowrap gap-4">
        <Header
          isLoggedIn={isLoggedIn}
          user={user}
          logout={logout}
          handleModeChange={handleModeChange}
          toggleExample={toggleExample}
          toggleChatHistory={toggleChatHistory}
          mode={mode}
        />
        <div className="mt-6 p-6 bg-[#DDD8B8] dark:bg-gray-900 rounded-lg min-h-[200px] max-w-2xl mx-auto shadow-md">
          {
            messages.length > 0 ? (<>{showExamples && <ExamplesSection setSelectedExample={setSelectedExample} mode={mode} />}
              <ChatInterface
                messages={messages}
                setMessages={setMessages}
                context={context}
                sendMessage={sendMessage}
                mode={mode}
                isBotLoading={isBotLoading}
                exampleMessage={selectedExample}
                userId={user?.user_id}
              /></>) : (<>   <ChatInterface
                messages={messages}
                setMessages={setMessages}
                context={context}
                sendMessage={sendMessage}
                mode={mode}
                isBotLoading={isBotLoading}
                exampleMessage={selectedExample}
                userId={user?.user_id}
              />
                {showExamples && <ExamplesSection setSelectedExample={setSelectedExample} mode={mode} />}
              </>)
          }
        </div>
        <div className="max-w-2xl mx-auto">
          {!showChatHistory && <RecentChats chatHistory={chatHistory} />}

        </div>
      </div>
    </main>
  );
}