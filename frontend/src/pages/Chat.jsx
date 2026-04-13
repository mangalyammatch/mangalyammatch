import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API_BASE_URL from '../config';
import './Chat.css';

const Chat = () => {
  const { matchId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [partner, setPartner] = useState(null);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const [msgRes, partnerRes, meRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/messages/${matchId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/api/interests/matches`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/api/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (!msgRes.ok) throw new Error('Unabled to load messages');
        
        const msgData = await msgRes.json();
        setMessages(msgData);

        const meData = await meRes.json();
        setMe(meData.profile);

        const matches = await partnerRes.json();
        const currentMatch = matches.find(m => m.matchId === matchId);
        if (currentMatch) {
          setPartner(currentMatch);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000); // Polling for now
    return () => clearInterval(interval);
  }, [matchId, navigate]);

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ matchId, content: newMessage })
      });

      if (response.ok) {
        const sentMsg = await response.json();
        setMessages([...messages, sentMsg]);
        setNewMessage('');
      }
    } catch (err) {
      alert('Failed to send message');
    }
  };

  if (loading) return <div className="loading-state">Opening chat...</div>;

  return (
    <div className="chat-container">
      <Navbar user={me} />
      
      <div className="chat-app card">
        <div className="chat-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>←</button>
          <div className="chat-partner-info">
            <div className="chat-avatar">{partner?.name?.charAt(0) || '?'}</div>
            <div>
              <h3>{partner?.name}</h3>
              <span className="online-indicator">Online</span>
            </div>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((msg) => {
            const isMe = msg.senderId === me.userId;
            return (
              <div key={msg.id} className={`message-bubble ${isMe ? 'sent' : 'received'}`}>
                <div className="message-content">{msg.content}</div>
                <div className="message-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSendMessage}>
          <input 
            type="text" 
            placeholder="Type your message..." 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Send ✉️</button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
