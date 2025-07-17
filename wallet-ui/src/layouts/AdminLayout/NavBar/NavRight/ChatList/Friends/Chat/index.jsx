import PropTypes from 'prop-types';
import React, { useState, useRef, useEffect } from 'react';
import { FormControl, Button, InputGroup, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useChatStorage } from '../../../../../../../hooks/useChatStorage';
import ApiService from '../../../../../../../services/ApiService';
import Cookies from 'js-cookie';
import { Toast } from 'primereact/toast';

import chatMsg from './chat';
import Messages from './Messages';

const Chat = ({ user, chatOpen, listOpen, closed }) => {

  const toast = useRef(null);
  let chatClass = ['header-chat'];
  if (chatOpen && listOpen) {
    chatClass = [...chatClass, 'open'];
  }

  const psRef = useRef(null);
  const scrollRef = useRef(null);
  const {
    currentChat,
    addMessage,
    clearMessages,
    createNewChat,
    getChatList
  } = useChatStorage(Cookies.get('feed_id'));
  
  const [input, setInput] = useState('');
  const [inProgressMessage, setInProgressMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (psRef.current) {
      psRef.current.scrollTop = psRef.current.scrollHeight;
    }
  }, [currentChat?.messages, inProgressMessage]);  


  let message = (
    <Card className="d-flex align-items-center shadow-none mb-0 p-0" style={{ flexDirection: 'row', backgroundColor: 'unset' }}>
      <Card.Body className="p-0 chat-menu-content">
        <div className="">
          <p className="chat-cont">CHAT NOT FOUND</p>
        </div>
      </Card.Body>
    </Card>
  );

  const latestMessages = currentChat?.messages
    ?.filter((m) => m.role !== 'system')
    .slice(-50) || [];

  const displayedMessages = [...latestMessages];

  if (isTyping && !inProgressMessage) {
    displayedMessages.push({
      role: 'assistant',
      content: 'Yazıyor...'
    });
  } else if (inProgressMessage) {
    displayedMessages.push({
      role: 'assistant',
      content: inProgressMessage
    });
  }

  message = displayedMessages.map((msg, index) => {
    return <Messages key={`msg-${index}`} message={msg} />;
  });

  const handleSend = async () => {
    if (!input.trim()) return;
  
    const userMessage = {
      role: 'user',
      content: [{ type: 'text', text: input }]
    };
  
    addMessage(userMessage);
    setInput('');
    setInProgressMessage('');
    setIsTyping(true);
  
    try {
      const requestBody = {
        model: 'gpt-4o-mini',
        stream: true,
        messages: [...currentChat?.messages, userMessage]
      };

      console.log("requestBody 2", requestBody);
  
      const response = await ApiService.streamPost('/api/0/v1/chat/completions/send', requestBody);
  
      if (!response.ok || !response.body) {
        throw new Error('Yanıt alınamadı.');
      }
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulated = '';
  
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
  
        const chunk = decoder.decode(value, { stream: true });
  
        // her satır ayrı ayrı "data: {...}"
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'));
  
        for (let line of lines) {
          line = line.replace(/^data:\s*/, '').trim();
  
          if (line === '[DONE]') continue;
  
          try {
            const parsed = JSON.parse(line);
            const delta = parsed.choices?.[0]?.delta?.content;
  
            if (delta) {
              accumulated += delta;
              setInProgressMessage(accumulated); // anlık göster
            }
          } catch (err) {
            console.error('Geçersiz JSON:', line);
          }
        }
      }
  
      // tamamlanan mesajı kaydet
      addMessage({
        role: 'assistant',
        content: accumulated
      });
  
      setIsTyping(false);
      setInProgressMessage('');
    } catch (err) {
      console.error(err);
      addMessage({
        role: 'assistant',
        content: '⚠️ Yanıt alınamadı.'
      });
      setIsTyping(false);
      setInProgressMessage('');
    }
  };
  
  

  return (
    <React.Fragment>
      <Toast ref={toast} />
      <div className={chatClass.join(' ')}>
        <div className="h-list-header">
          <h6>Chat</h6>
          {/*<Link to="#" className="h-back-user-list" onClick={closed}>
            <i className="feather icon-chevron-left text-muted" />
          </Link>*/}
          {/*<Link to="#" className="h-settings" onClick={closed}>
            <i className="feather icon-settings text-muted" />
          </Link>*/}
          <Link to="#" className="h-history" onClick={closed}>
            <i className="feather icon-list text-muted" />
          </Link>
          <Link to="#" className="h-new-chat" onClick={(e) => {
            e.preventDefault();
            createNewChat(Cookies.get('feed_id'), Date.now().toString(), 'New Chat');
          }}>
            <i className="feather icon-plus text-muted" />
          </Link>
          
        </div>
        <div className="h-list-body">
          <div className="main-chat-cont">
            <PerfectScrollbar containerRef={ref => (psRef.current = ref)}>
              <div className="main-friend-chat">
                {message}
                <div ref={scrollRef} />
              </div>
            </PerfectScrollbar>
          </div>
        </div>
        <div className="h-list-footer">
          <InputGroup>
            <Button variant="success" className="btn-attach">
              <i className="feather icon-paperclip" />
            </Button>
            <FormControl type="text" name="h-chat-text" className="h-send-chat" placeholder="Ask something... " value={input} onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}/>
            <Button onClick={handleSend} className="input-group-append btn-send chat-message-send-button">
              <i className="pi pi-send" />
            </Button>
          </InputGroup>
        </div>
      </div>
    </React.Fragment>
  );
};

Chat.propTypes = {
  user: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  chatOpen: PropTypes.bool,
  listOpen: PropTypes.bool,
  id: PropTypes.number,
  closed: PropTypes.func,
  name: PropTypes.string
};

export default Chat;
