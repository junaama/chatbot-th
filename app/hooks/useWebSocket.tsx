import { useState, useEffect, useRef, useCallback } from 'react';
import { createAnonymousChat, createChat, getChatById } from '../helper/chat';

const useWebSocket = (isLoggedIn: boolean) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [context, setContext] = useState<number[]>([]);
  const [chatId, setChatId] = useState("");
  const [isBotLoading, setIsBotLoading] = useState(false);

  const websocketRef = useRef<WebSocket | null>(null);
  const currentMessageRef = useRef('');

  const connectWebSocket = useCallback(() => {
    if (chatId) {
      websocketRef.current = new WebSocket(`ws://localhost:8000/ws/${chatId}`);

      websocketRef.current.onopen = () => {
        console.log('WebSocket connection established');
      };

      websocketRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        switch (message.type) {
          case "message":
            setIsBotLoading(false);
            currentMessageRef.current += message.content;
            setMessages(prevMessages => {
              const updatedMessages = [...prevMessages];
              updatedMessages[updatedMessages.length - 1] = `AI: ${currentMessageRef.current}`;
              return updatedMessages;
            });
            break;
          case "done":
            setContext(message.context);
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
          connectWebSocket();
        }, 5000);
      };
    }
  }, [chatId]);

  const initializeChat = useCallback(async () => {
    const storedChatId = localStorage.getItem('chatId');
    if (storedChatId) {
      setChatId(storedChatId);
      await getChatById({ chatId: storedChatId });
    } else {
      const newChat = isLoggedIn ? await createChat() as any : await createAnonymousChat({ token: localStorage.getItem("access_token") }) as any;
      setChatId(newChat.id);
      localStorage.setItem('chatId', newChat.id);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    initializeChat();
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, [initializeChat]);

  useEffect(() => {
    if (chatId) {
      connectWebSocket();
    }
  }, [chatId, connectWebSocket]);

  const sendMessage = useCallback((message: string, imageBase64: string | null, mode: string, userId: number) => {
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      const messageData = {
        context: context,
        current: message,
        images: imageBase64 ? [imageBase64] : [],
        mode, 
        user_id: userId, 
        current_message_context: messages[messages.length - 1]
      };
      websocketRef.current.send(JSON.stringify(messageData));
      setMessages(prevMessages => [...prevMessages, `You: ${message}`]);
      setMessages(prevMessages => [...prevMessages, `AI: Thinking...`]);
      setIsBotLoading(true);
    } else {
      console.error('WebSocket is not connected');
      // Reconnect
      connectWebSocket();
    }
  }, [context, messages, connectWebSocket]);

  // Add loading indicator to Ai: Thinking text
  useEffect(() => {
    if (isBotLoading) {
      let dots = '';
      const interval = setInterval(() => {
        dots = dots.length < 3 ? dots + '.' : '';
        setMessages(prevMessages => {
          const newMessages = [...prevMessages];
          newMessages[newMessages.length - 1] = `AI: Thinking${dots}`;
          return newMessages;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isBotLoading]);

  return { messages, setMessages, context, setContext, chatId, sendMessage, isBotLoading };
};

export default useWebSocket;