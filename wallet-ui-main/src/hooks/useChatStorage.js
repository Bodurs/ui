// hooks/useChatStorage.js

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'chat_histories';
const MAX_CHAT_COUNT = 10;

export const useChatStorage = () => {
  const [currentChat, setCurrentChat] = useState(null);
  const [chatHistories, setChatHistories] = useState([]);

  // İlk yükleme
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          parsed.sort((a, b) => new Date(b.last_used_at) - new Date(a.last_used_at));
          setChatHistories(parsed);
          setCurrentChat(parsed[0]);
        } else {
          createInitialChat();
        }
      } catch (e) {
        console.error('localStorage okunamadı:', e);
        createInitialChat();
      }
    } else {
      createInitialChat();
    }
  }, []);

  const createInitialChat = () => {
    const id = `chat_${Date.now()}`;
    const newChat = {
      id,
      title: 'Yeni Sohbet',
      messages: [
        {
          role: 'system',
          content: JSON.stringify({ feed_id: id }),
        },
      ],
      last_used_at: new Date().toISOString(),
    };
    setCurrentChat(newChat);
    setChatHistories([newChat]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newChat]));
  };

  const addMessage = (message) => {
    setCurrentChat((prev) => {
      if (!prev) return prev;
  
      const nonSystemMessages = prev.messages.filter((m) => m.role !== 'system');
  
      let newTitle = prev.title;
  
      if (
        message.role === 'user' &&
        nonSystemMessages.length === 0 &&
        (prev.title === 'Yeni Sohbet' || prev.title === 'New Chat')
      ) {
        let content = '';
  
        if (typeof message.content === 'string') {
          content = message.content;
        } else if (Array.isArray(message.content)) {
          // Örneğin [{ type: 'text', text: '...' }]
          content = message.content
            .map((part) => part.text || '')
            .join(' ');
        } else if (typeof message.content === 'object' && message.content !== null) {
          // JSON object ise
          content = JSON.stringify(message.content);
        } else {
          content = '';
        }
  
        const words = content.trim().split(/\s+/).slice(0, 5).join(' ');
        newTitle = words + (content.trim().split(/\s+/).length > 5 ? '...' : '');
      }
  
      const updatedChat = {
        ...prev,
        title: newTitle,
        messages: [...prev.messages, message],
        last_used_at: new Date().toISOString(),
      };
  
      setChatHistories((prevHistories) => {
        const updatedHistories = updateOrInsertChat(prevHistories, updatedChat);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistories));
        return updatedHistories;
      });
  
      return updatedChat;
    });
  };
  

  const createNewChat = (feedId, id, title) => {
    const newChat = {
      id,
      title,
      messages: [
        {
          role: 'system',
          content: JSON.stringify({ feed_id: feedId }),
        },
      ],
      last_used_at: new Date().toISOString(),
    };  
    setCurrentChat(newChat);
    setChatHistories((prev) => {
      const updatedHistories = updateOrInsertChat(prev, newChat);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistories));
      return updatedHistories;
    });
  };
  

  const clearMessages = () => {
    setCurrentChat((prev) => {
      if (!prev) return prev;

      const cleared = {
        ...prev,
        messages: [
          {
            role: 'system',
            content: JSON.stringify({ feed_id: prev.id }),
          },
        ],
        last_used_at: new Date().toISOString(),
      };

      setChatHistories((prevHistories) => {
        const updatedHistories = updateOrInsertChat(prevHistories, cleared);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistories));
        return updatedHistories;
      });

      return cleared;
    });
  };

  const selectChat = (id) => {
    setChatHistories((prevHistories) => {
      const found = prevHistories.find((c) => c.id === id);
      if (found) {
        const updatedChat = {
          ...found,
          last_used_at: new Date().toISOString(),
        };
        setCurrentChat(updatedChat);

        const updatedHistories = updateOrInsertChat(prevHistories, updatedChat);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistories));
        return updatedHistories;
      }
      return prevHistories;
    });
  };

  const updateOrInsertChat = (histories, chat) => {
    const idx = histories.findIndex((c) => c.id === chat.id);
    let updatedHistories;
    if (idx !== -1) {
      updatedHistories = [...histories];
      updatedHistories[idx] = chat;
    } else {
      updatedHistories = [...histories, chat];
    }
    updatedHistories.sort((a, b) => new Date(b.last_used_at) - new Date(a.last_used_at));
    if (updatedHistories.length > MAX_CHAT_COUNT) {
      updatedHistories = updatedHistories.slice(0, MAX_CHAT_COUNT);
    }
    return updatedHistories;
  };

  const getChatList = () => {
    return [...chatHistories]
      .sort((a, b) => new Date(b.last_used_at) - new Date(a.last_used_at))
      .map(({ id, title, last_used_at, messages }) => {
        let lastMessage = '';
        if (messages?.length > 0) {
          lastMessage = messages[messages.length - 1].content;
  
          // JSON parse dene, object ise temizle
          if (typeof lastMessage === 'string') {
            try {
              const maybeJson = JSON.parse(lastMessage);
              if (typeof maybeJson === 'object') {
                lastMessage = '';
              }
            } catch (e) {
              // Geçerli string, JSON değil
            }
          } else {
            // Hiç string değilse fallback boş string
            lastMessage = '';
          }
        }
  
        const preview = typeof lastMessage === 'string'
          ? lastMessage.substring(0, 40)
          : '';
  
        return {
          id,
          title,
          last_used_at,
          preview,
        };
      });
  };
  
  

  return {
    currentChat,
    addMessage,
    clearMessages,
    createNewChat,
    selectChat,
    getChatList,
  };
};
