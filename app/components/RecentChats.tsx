import React, { useState } from 'react';
import ChatHistoryModal from './ChatHistoryModal';

type Chat = {
  id: string;
  title: string;
}

type RecentChatsProps = {
  chatHistory: Chat[];
}

const RecentChats = ({ chatHistory }: RecentChatsProps) => {
  const [openChats, setOpenChats] = useState<{ [key: string]: boolean }>({});

  const toggleChat = (chatId: string) => {
    setOpenChats(prev => ({
      ...prev,
      [chatId]: !prev[chatId]
    }));
  };

  return (
    <div className="mt-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">Recent Chats:</h3>
      <div className="grid grid-cols-3 gap-2">
        {chatHistory.map((chat) => (
          <ChatHistoryModal
            key={chat.id}
            open={!!openChats[chat.id]}
            setOpen={() => toggleChat(chat.id)}
            chat={chat}
          />
        ))}
      </div>
    </div>
  );
};

export default RecentChats;