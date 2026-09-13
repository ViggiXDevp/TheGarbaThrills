import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Smile,
  ImageIcon,
  ShieldOff,
  ShieldAlert,
  ChevronsDown,
  MoreVertical,
  Trash2,
  UserRound,
  Search, 
  ChevronUp, 
  ChevronDown,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Sticker from '../components/Sticker';
import type { StickerId } from '../components/Sticker';
import StickerPicker from '../components/StickerPicker';
import GifPicker from '../components/GifPicker';
import FestiveBackgroundArt from '../components/FestiveBackgroundArt';
import ConfirmDialog from '../components/ConfirmDialog';

interface ChatMessage {
  _id: string;
  matchId: string;
  senderId: string;
  type: 'text' | 'sticker' | 'gif';
  content: string;
  createdAt: string;
}

interface MatchPartner {
  _id: string;
  name: string;
  photos: string[];
}

const POLL_INTERVAL_MS = 2500;

const ChatWindow = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const initialPartner = (location.state as { partner?: MatchPartner } | null)?.partner;

  const [partner, setPartner] = useState<MatchPartner | null>(initialPartner || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [activePicker, setActivePicker] = useState<'sticker' | 'gif' | null>(null);
  const [blockedByMe, setBlockedByMe] = useState(false);
  const [blockedByThem, setBlockedByThem] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [blockActionLoading, setBlockActionLoading] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearingChat, setClearingChat] = useState(false);
  const [searchMode, setSearchMode] = useState(false); 
  const [searchQuery, setSearchQuery] = useState(''); 
  const [searchMatchIds, setSearchMatchIds] = useState<string[]>([]); 
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pickerPanelRef = useRef<HTMLDivElement>(null);
  const toggleButtonsRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isNewSearchQueryRef = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      const container = bottomRef.current.closest('.chat-messages');
      if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      } else {
        bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const scrollToMessage = (messageId: string) => { 
    const container = messagesContainerRef.current; 
    const target = container?.querySelector(`[data-message-id="${messageId}"]`) as HTMLElement | null; 
    if (container && target) { 
      const offset = target.offsetTop - container.offsetTop - 40; 
      container.scrollTo({ top: offset, behavior: 'smooth' }); 
    } 
  };

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollButton(distanceFromBottom > 80);
  };

  useEffect(() => { 
    isNewSearchQueryRef.current = true; 
  }, [searchQuery]); 

  useEffect(() => { 
    if (!searchQuery.trim()) { 
      setSearchMatchIds([]); 
      setCurrentSearchIndex(0); 
      return; 
    } 
    const q = searchQuery.trim().toLowerCase(); 
    const matchIds = messages .filter((m) => m.type === 'text' && m.content.toLowerCase().includes(q)) .map((m) => m._id); 
    setSearchMatchIds(matchIds); 
    if (isNewSearchQueryRef.current) { 
      const lastIndex = matchIds.length > 0 ? matchIds.length - 1 : 0; 
      setCurrentSearchIndex(lastIndex); 
      if (matchIds.length > 0) { 
        setTimeout(() => scrollToMessage(matchIds[lastIndex]), 50); 
      } 
      isNewSearchQueryRef.current = false; 
    } else { 
      setCurrentSearchIndex((prevIndex) => matchIds.length === 0 ? 0 : Math.min(prevIndex, matchIds.length - 1), ); 
    } 
  }, [searchQuery, messages]);

  const goToPrevMatch = () => { 
    if (searchMatchIds.length === 0) return;
    const newIndex = (currentSearchIndex - 1 + searchMatchIds.length) % searchMatchIds.length; 
    setCurrentSearchIndex(newIndex); 
    scrollToMessage(searchMatchIds[newIndex]); 
  };

  const goToNextMatch = () => { 
    if (searchMatchIds.length === 0) return; 
    const newIndex = (currentSearchIndex + 1) % searchMatchIds.length; 
    setCurrentSearchIndex(newIndex); 
    scrollToMessage(searchMatchIds[newIndex]); 
  };

  const highlightText = (content: string, query: string) => {
    if (!query.trim()) return content;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = content.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="chat-search-highlight">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  const fetchMessages = async (silent = false) => {
    if (!matchId) return;
    if (!silent) setLoading(true);
    try {
      const res = await api.get(`/chat/${matchId}/messages`);
      setMessages(res.data.messages);
      setError('');
      markAsRead();
    } catch (err: any) {
      if (!silent) {
        setError(err?.response?.data?.message || 'Could not load messages.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const markAsRead = async () => { 
    if (!matchId) return; 
    try { 
      await api.post(`/chat/${matchId}/read`); 
    } catch { 
      // Non-fatal 
    } 
  };

  useEffect(() => {
    if (!matchId) return;
    const fetchPartner = async () => {
      try {
        const res = await api.get(`/matches/${matchId}`);
        setPartner(res.data.user);
        setBlockedByMe(res.data.blockedByMe);
        setBlockedByThem(res.data.blockedByThem);
      } catch {
        // If this fails, the header just falls back to a generic "Chat" label
      }
    };
    fetchPartner();
  }, [matchId]);

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(() => fetchMessages(true), POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Close the sticker/GIF picker on any click outside of it (including the message input)
  useEffect(() => {
    if (!activePicker) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insidePanel = pickerPanelRef.current?.contains(target);
      const insideToggles = toggleButtonsRef.current?.contains(target);
      if (!insidePanel && !insideToggles) {
        setActivePicker(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activePicker]);

  // Close the 3-dot menu on any click outside of it
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const sendMessage = async (type: 'text' | 'sticker' | 'gif', content: string) => {
    if (!matchId || !content.trim()) return;
    setSending(true);

    // Optimistic append so it feels instant instead of waiting for the next poll
    const optimisticMessage: ChatMessage = {
      _id: `temp-${Date.now()}`,
      matchId,
      senderId: user?.id || '',
      type,
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      await api.post(`/chat/${matchId}/messages`, { type, content });
      fetchMessages(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Message failed to send.');
      setMessages((prev) => prev.filter((m) => m._id !== optimisticMessage._id));
    } finally {
      setSending(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage('text', text.trim());
    setText('');
  };

  const handleStickerSelect = (id: StickerId) => {
    sendMessage('sticker', id);
    setActivePicker(null);
  };

  const handleGifSelect = (gifUrl: string) => {
    sendMessage('gif', gifUrl);
    setActivePicker(null);
  };

  const handleBlock = async () => {
    if (!partner) return;
    setBlockActionLoading(true);
    try {
      await api.post(`/block/${partner._id}`);
      if (reportReason) {
        try {
          await api.post(`/report/${partner._id}`, { reason: reportReason });
        } catch {
          // Non-fatal — the block itself already succeeded
        }
      }
      setBlockedByMe(true);
      setShowBlockConfirm(false);
      setReportReason('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not block this user. Please try again.');
    } finally {
      setBlockActionLoading(false);
    }
  };

  const handleUnblock = async () => {
    if (!partner) return;
    setBlockActionLoading(true);
    try {
      await api.delete(`/block/${partner._id}`);
      setBlockedByMe(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not unblock this user. Please try again.');
    } finally {
      setBlockActionLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!matchId) return;
    setClearingChat(true);
    try {
      await api.post(`/chat/${matchId}/clear`);
      setMessages([]);
      setShowClearConfirm(false);
    } catch {
      setError('Could not clear chat. Please try again.');
    } finally {
      setClearingChat(false);
    }
  };

  return (
    <div className="chat-page">
      <FestiveBackgroundArt />

      <div className="chat-page-inner">
                <div className="chat-header-bar">
          {searchMode ? (
            <div className="chat-search-bar">
              <button
                type="button"
                className="chat-back-link"
                onClick={() => {
                  setSearchMode(false);
                  setSearchQuery('');
                }}
              >
                <ArrowLeft size={18} />
              </button>
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="chat-search-input"
              />
              <span className="chat-search-count">
                {searchMatchIds.length > 0 ? `${currentSearchIndex + 1}/${searchMatchIds.length}` : '0/0'}
              </span>
              <button
                type="button"
                className="chat-search-nav-btn"
                onClick={goToPrevMatch}
                disabled={searchMatchIds.length === 0}
                aria-label="Previous match"
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                className="chat-search-nav-btn"
                onClick={goToNextMatch}
                disabled={searchMatchIds.length === 0}
                aria-label="Next match"
              >
                <ChevronDown size={16} />
              </button>
            </div>
          ) : (
            <>
              <Link to="/matches" className="chat-back-link">
                <ArrowLeft size={18} />
              </Link>
              {partner ? (
                <Link to={`/user/${partner._id}`} className="chat-header-identity">
                  <div className="chat-header-avatar">
                    {partner.photos?.[0] ? (
                      <img src={partner.photos[0]} alt={partner.name} />
                    ) : (
                      <div className="chat-header-avatar-empty" />
                    )}
                  </div>
                  <span className="chat-header-name">{partner.name}</span>
                </Link>
              ) : (
                <span className="chat-header-name">Chat</span>
              )}

              <div className="chat-menu-wrap" ref={menuRef}>
                <button
                  type="button"
                  className="chat-block-toggle-btn"
                  onClick={() => setShowMenu((v) => !v)}
                  aria-label="More options"
                  title="More options"
                >
                  <MoreVertical size={18} />
                </button>

                {showMenu && (
                  <div className="chat-dropdown-menu">
                    <button
                      type="button"
                      className="chat-dropdown-item"
                      onClick={() => {
                        setShowMenu(false);
                        setSearchMode(true);
                      }}
                    >
                      <Search size={15} />
                      Search
                    </button>
                    <button
                      type="button"
                      className="chat-dropdown-item"
                      onClick={() => {
                        setShowMenu(false);
                        setShowClearConfirm(true);
                      }}
                    >
                      <Trash2 size={15} />
                      Clear Chat
                    </button>
                    {blockedByMe ? (
                      <button
                        type="button"
                        className="chat-dropdown-item"
                        onClick={() => {
                          setShowMenu(false);
                          handleUnblock();
                        }}
                        disabled={blockActionLoading}
                      >
                        <ShieldOff size={15} />
                        Unblock
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="chat-dropdown-item"
                        onClick={() => {
                          setShowMenu(false);
                          setShowBlockConfirm(true);
                        }}
                        disabled={!partner}
                      >
                        <ShieldAlert size={15} />
                        Block
                      </button>
                    )}
                    <button
                      type="button"
                      className="chat-dropdown-item"
                      onClick={() => {
                        setShowMenu(false);
                        if (partner) navigate(`/user/${partner._id}`);
                      }}
                      disabled={!partner}
                    >
                      <UserRound size={15} />
                      View Contact
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {showBlockConfirm && (
          <ConfirmDialog
            title="Block this person?"
            message={`${partner?.name || 'This person'} won't be able to message you, and you won't see their profile again. You can unblock them anytime from this chat.`}
            confirmLabel="Block"
            onConfirm={handleBlock}
            onCancel={() => setShowBlockConfirm(false)}
            confirmDisabled={blockActionLoading}
          >
            <label style={{ marginBottom: 0 }}>
              Reason (optional)
              <select value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                <option value="">Prefer not to say</option>
                <option value="harassment">Harassment</option>
                <option value="fake_profile">Fake Profile</option>
                <option value="inappropriate_content">Inappropriate Content</option>
                <option value="spam">Spam</option>
                <option value="other">Other</option>
              </select>
            </label>
          </ConfirmDialog>
        )}

        {showClearConfirm && (
          <ConfirmDialog
            title="Clear this chat?"
            message="This removes the message history from your view only. The other person will still see it."
            confirmLabel="Clear"
            onConfirm={handleClearChat}
            onCancel={() => setShowClearConfirm(false)}
            confirmDisabled={clearingChat}
          />
        )}

        {loading && <div className="loading-screen">Loading conversation...</div>}
        {!loading && error && <div className="error-banner">{error}</div>}

        {!loading && !error && (
          <div className="chat-window">
            <div
              className="chat-messages"
              ref={messagesContainerRef}
              onScroll={handleMessagesScroll}
            >
              {messages.length === 0 && (
                <p className="chat-empty-hint">This is the start of something sweet 💕 say hi!</p>
              )}

              {messages.map((msg) => {
                const isMine = msg.senderId === user?.id;
                const isCurrentSearchMatch = searchMatchIds.length > 0 && searchMatchIds[currentSearchIndex] === msg._id;
                return (
                  <div
                    key={msg._id}
                    data-message-id={msg._id}
                    className={`chat-bubble-row ${isMine ? 'chat-bubble-row-mine' : ''}`}
                  >
                    {msg.type === 'text' && (
                      <div
                        className={`chat-bubble ${isMine ? 'chat-bubble-mine' : ''} ${
                          isCurrentSearchMatch ? 'chat-bubble-current-match' : ''
                        }`}
                      >
                        {searchQuery.trim() ? highlightText(msg.content, searchQuery.trim()) : msg.content}
                      </div>
                    )}
                    {msg.type === 'sticker' && (
                      <div className="chat-sticker-bubble">
                        <Sticker id={msg.content as StickerId} size={64} />
                      </div>
                    )}
                    {msg.type === 'gif' && (
                      <div className="chat-gif-bubble">
                        <img src={msg.content} alt="GIF" onLoad={scrollToBottom} />
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {showScrollButton && (
              <button
                type="button"
                className="chat-scroll-bottom-btn"
                onClick={scrollToBottom}
                aria-label="Scroll to latest messages"
              >
                <ChevronsDown size={14} />
              </button>
            )}

            <div ref={pickerPanelRef}>
              {activePicker && !blockedByMe && !blockedByThem && (
                <div className="chat-picker-wrap">
                  {activePicker === 'sticker' && <StickerPicker onSelect={handleStickerSelect} />}
                  {activePicker === 'gif' && <GifPicker onSelect={handleGifSelect} />}
                </div>
              )}
            </div>

            {blockedByMe ? (
              <div className="chat-blocked-banner">
                <ShieldOff size={16} />
                <span>You've blocked {partner?.name || 'this person'}.</span>
                <button type="button" onClick={handleUnblock} disabled={blockActionLoading}>
                  Unblock
                </button>
              </div>
            ) : blockedByThem ? (
              <div className="chat-blocked-banner">
                <ShieldAlert size={16} />
                <span>This conversation is no longer available.</span>
              </div>
            ) : (
              <form className="chat-input-row" onSubmit={handleTextSubmit}>
                <div className="chat-toggle-buttons" ref={toggleButtonsRef}>
                  <button
                    type="button"
                    className="chat-icon-btn"
                    onClick={() => setActivePicker(activePicker === 'sticker' ? null : 'sticker')}
                    aria-label="Stickers"
                  >
                    <Smile size={20} />
                  </button>
                  <button
                    type="button"
                    className="chat-icon-btn"
                    onClick={() => setActivePicker(activePicker === 'gif' ? null : 'gif')}
                    aria-label="GIFs"
                  >
                    <ImageIcon size={19} />
                  </button>
                </div>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Say something sweet..."
                  className="chat-text-input"
                />
                <button type="submit" className="chat-send-btn" disabled={sending || !text.trim()}>
                  <Send size={17} />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;