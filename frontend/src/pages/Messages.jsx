import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API_BASE_URL from '../config';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/messages/conversations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (loading) return <div className="loading-state">Loading your messages...</div>;

  return (
    <div className="messages-page">
      <Navbar />
      
      <main className="messages-content">
        <div className="messages-header-container card shadow-sm">
           <div className="header-top">
             <h1>Messages</h1>
             <button className="new-chat-btn" onClick={() => navigate('/matches')}>New Chat</button>
           </div>
           <div className="messages-search">
             <input type="text" placeholder="Search conversations..." disabled />
           </div>
        </div>

        <div className="conversations-list card shadow-sm">
          {conversations.length > 0 ? (
            conversations.map(conv => (
              <div 
                key={conv.matchId} 
                className="conversation-item"
                onClick={() => navigate(`/chat/${conv.matchId}`)}
              >
                <div className="conv-avatar">
                   {conv.partner.photo ? (
                     <img src={conv.partner.photo} alt={conv.partner.name} />
                   ) : (
                     <div className="conv-avatar-placeholder">{conv.partner.name.charAt(0)}</div>
                   )}
                </div>
                <div className="conv-info">
                  <div className="conv-name-row">
                    <span className="conv-name">{conv.partner.name}</span>
                    <span className="conv-time">{formatTime(conv.timestamp)}</span>
                  </div>
                  <div className="conv-message-row">
                    <p className="last-message">{conv.lastMessage}</p>
                    {/* Unread indicator could go here */}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-conversations">
               <span className="empty-icon">💬</span>
               <h3>No Messages Yet</h3>
               <p>Find your matches and start a conversation to see them here.</p>
               <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard')}>
                 Start Browsing
               </button>
            </div>
          )}
        </div>
      </main>

      <style jsx="true">{`
        .messages-page {
          min-height: 100vh;
          background: #fdfafb;
          padding-bottom: 80px;
        }
        .messages-content {
          max-width: 700px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .messages-header-container {
          padding: 1.5rem;
          background: white;
          border-radius: 20px 20px 0 0;
          border-bottom: 1px solid #eee;
        }
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .header-top h1 {
          font-size: 2rem;
          color: var(--text-color);
        }
        .new-chat-btn {
          background: #fff0f0;
          color: var(--primary);
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .new-chat-btn:hover { background: #ffe4e4; }

        .messages-search input {
          width: 100%;
          padding: 0.8rem 1rem;
          border-radius: 12px;
          border: 1px solid #eee;
          background: #f8f9fa;
        }

        .conversations-list {
          background: white;
          border-radius: 0 0 20px 20px;
          overflow: hidden;
        }

        .conversation-item {
          display: flex;
          align-items: center;
          padding: 1.2rem 1.5rem;
          gap: 1.2rem;
          cursor: pointer;
          transition: background 0.2s;
          border-bottom: 1px solid #f8f9fa;
        }
        .conversation-item:hover {
          background: #fffcfd;
        }
        .conversation-item:last-child { border-bottom: none; }

        .conv-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          border: 2px solid white;
          box-shadow: 0 0 0 2px var(--primary-light);
        }
        .conv-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .conv-avatar-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #800000, #b22222);
          color: white; font-weight: 700; font-size: 1.5rem;
        }

        .conv-info {
          flex: 1;
          min-width: 0;
        }
        .conv-name-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.3rem;
        }
        .conv-name {
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--text-color);
        }
        .conv-time {
          font-size: 0.8rem;
          color: #999;
        }

        .last-message {
          color: #666;
          font-size: 0.95rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .empty-conversations {
          padding: 5rem 2rem;
          text-align: center;
        }
        .empty-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
        .empty-conversations h3 { margin-bottom: 0.5rem; }
        .empty-conversations p { color: #666; margin-bottom: 2rem; }
      `}</style>
    </div>
  );
};

export default Messages;
