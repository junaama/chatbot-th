import { useState, useEffect } from 'react';
import { getAllAnonymousChats, getAllChatsByUserId } from '../helper/chat';

const useChatHistory = (isLoggedIn: boolean, user: any) => {
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (isLoggedIn && user?.user_id) {
        const history = await getAllChatsByUserId(user.user_id) as any;
        setChatHistory(history);
      } else {
        const history = await getAllAnonymousChats() as any;
        setChatHistory(history);
      }
    };

    fetchChatHistory();
  }, [isLoggedIn, user]);

  return { chatHistory, setChatHistory };
};

export default useChatHistory;