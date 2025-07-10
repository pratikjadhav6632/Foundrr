import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, User, Trash2, Pencil } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { matchService } from '../services/matchService';
import { messageService } from '../services/messageService';
import { profileService } from '../services/profileService';
import { forumService } from '../services/forumService';
import { Match, Message, Profile } from '../types';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getAppwriteFilePreviewUrl } from '../lib/appwrite';

interface ChatData {
  match: Match;
  otherUserProfile: Profile;
  lastMessage?: Message;
  unreadCount: number;
}

export const Messages: React.FC = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatData[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageValue, setEditMessageValue] = useState<string>('');
  const [editLoading, setEditLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  // Responsive: track if chat screen should be shown on mobile
  const [showChatScreen, setShowChatScreen] = useState(false);

  // Detect mobile screen size
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // When a chat is selected on mobile, show chat screen only
  useEffect(() => {
    if (isMobile && selectedChat) setShowChatScreen(true);
  }, [selectedChat, isMobile]);

  // When going back to chat list on mobile, clear selected chat
  const handleBackToList = () => {
    setShowChatScreen(false);
    setSelectedChat(null);
  };

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat);
      // Subscribe to real-time messages
      const unsubscribe = messageService.subscribeToMessages(selectedChat, (event: any) => {
        // Appwrite event types: 'databases.*.collections.*.documents.*.create', 'update', 'delete'
        const { events, payload } = event;
        if (events && Array.isArray(events)) {
          if (events.some(e => e.includes('delete'))) {
            setMessages(prev => prev.filter(msg => msg.$id !== payload.$id));
          } else if (events.some(e => e.includes('update'))) {
            setMessages(prev => prev.map(msg => msg.$id === payload.$id ? { ...msg, ...payload } : msg));
          } else if (events.some(e => e.includes('create'))) {
            setMessages(prev => {
              // Prevent duplicate
              if (prev.some(msg => msg.$id === payload.$id)) return prev;
              return [...prev, payload];
            });
          }
        } else {
          // Fallback: old behavior (add to end)
          setMessages(prev => [...prev, payload]);
        }
      });
      return () => unsubscribe();
    }
  }, [selectedChat]);

  useEffect(() => {
    if (user) {
      profileService.updateLastActive(user.$id);
    }
  }, [user]);

  useEffect(() => {
    if (!newMessage) {
      setIsTyping(false);
      return;
    }
    setIsTyping(true);
    const timeout = setTimeout(() => setIsTyping(false), 1200);
    return () => clearTimeout(timeout);
  }, [newMessage]);

  const loadChats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const matches = await matchService.getUserMatches(user.$id);
      
      const chatData: ChatData[] = [];
      
      for (const match of matches) {
        const otherUserId = match.user1Id === user.$id ? match.user2Id : match.user1Id;
        const otherUserProfile = await profileService.getProfile(otherUserId);
        
        if (otherUserProfile) {
          const matchMessages = await messageService.getMessages(match.$id);
          const lastMessage = matchMessages[matchMessages.length - 1];
          const unreadCount = matchMessages.filter(
            msg => msg.receiverId === user.$id && !msg.isRead
          ).length;

          chatData.push({
            match,
            otherUserProfile,
            lastMessage,
            unreadCount
          });
        }
      }

      // Sort by last message timestamp
      chatData.sort((a, b) => {
        const aTime = a.lastMessage?.$createdAt || a.match.$createdAt;
        const bTime = b.lastMessage?.$createdAt || b.match.$createdAt;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setChats(chatData);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (matchId: string) => {
    try {
      const matchMessages = await messageService.getMessages(matchId);
      setMessages(matchMessages);
      
      // Mark messages as read
      const unreadMessages = matchMessages.filter(
        msg => msg.receiverId === user?.$id && !msg.isRead
      );
      
      for (const message of unreadMessages) {
        await messageService.markMessageAsRead(message.$id);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    const selectedChatData = chats.find(chat => chat.match.$id === selectedChat);
    if (!selectedChatData) return;

    const receiverId = selectedChatData.match.user1Id === user.$id 
      ? selectedChatData.match.user2Id 
      : selectedChatData.match.user1Id;

    try {
      await messageService.sendMessage(selectedChat, user.$id, receiverId, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    setDeletingMessageId(messageId);
    try {
      await messageService.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.$id !== messageId));
      setSelectedMessageId(null);
      toast.success('Message deleted');
    } catch (err) {
      toast.error('Failed to delete message');
    } finally {
      setDeletingMessageId(null);
    }
  };

  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditMessageValue(content);
  };

  const handleSaveEdit = async (messageId: string) => {
    setEditLoading(true);
    try {
      await messageService.updateMessage(messageId, editMessageValue);
      setMessages(prev => prev.map(msg => msg.$id === messageId ? { ...msg, content: editMessageValue } : msg));
      setEditingMessageId(null);
      toast.success('Message updated');
    } catch (err) {
      toast.error('Failed to update message');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditMessageValue('');
  };

  const filteredChats = chats.filter(chat => {
    const username = chat.otherUserProfile.username || '';
    const name = chat.otherUserProfile.name || '';
    return (
      username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getProfileImageUrl = (url?: string) => {
    if (!url) return 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
    if (typeof url !== 'string') return 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return getAppwriteFilePreviewUrl(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-20 w-20 sm:h-32 sm:w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 py-6 sm:py-8 px-2 sm:px-4 messages-container">
      <div className='text-3xl font-bold text-center mt-3 mb-3'>
        <h1>Messages</h1>
      </div>
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-4 sm:gap-8">
        {/* Chat List - hide on mobile if chat is open */}
        <div
          className={`w-full sm:w-1/3 bg-white rounded-3xl shadow-xl p-0 sm:p-0 mb-4 sm:mb-0 overflow-y-auto max-h-[80vh] border border-gray-100 messages-list ${isMobile && showChatScreen ? 'hidden' : ''}`}
        >
          <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 sm:px-3 sm:py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-xs sm:text-base bg-purple-50 placeholder:text-purple-300"
                placeholder="Search by username or name..."
              />
            </div>
          </div>
          <div className="space-y-1 py-2">
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <svg width="64" height="64" fill="none" viewBox="0 0 24 24" className="mb-2 text-purple-200"><path d="M12 20h.01M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm0 0v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <div className="text-purple-300 text-xs sm:text-base text-center">No chats found.</div>
              </div>
            ) : (
              filteredChats.map(chat => (
                <div
                  key={chat.match.$id}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-l-4 rounded-xl ${selectedChat === chat.match.$id ? 'bg-gradient-to-r from-purple-100 to-blue-100 border-purple-600 shadow-md scale-[1.02]' : 'hover:bg-purple-50 border-transparent'} group`}
                  onClick={() => {
                    setSelectedChat(chat.match.$id);
                    if (isMobile) setShowChatScreen(true);
                  }}
                >
                  <img src={getProfileImageUrl(typeof chat.otherUserProfile.profileImage === 'string' ? chat.otherUserProfile.profileImage : undefined)} alt="User" className="w-11 h-11 rounded-full object-cover border-2 border-purple-100 group-hover:border-purple-300 transition-all" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-purple-900 truncate text-sm sm:text-base">{chat.otherUserProfile.username || chat.otherUserProfile.name}</div>
                    <div className="text-purple-400 text-xs truncate">{chat.lastMessage?.content || 'No messages yet.'}</div>
                  </div>
                  {chat.unreadCount > 0 && (
                    <span className="ml-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow">{chat.unreadCount}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        {/* Messages Section - hide on mobile if not showing chat screen */}
        <div
          className={`w-full sm:w-2/3 bg-white rounded-3xl shadow-xl flex flex-col max-h-[80vh] border border-gray-100 messages-chatbox ${isMobile && !showChatScreen ? 'hidden' : ''}`}
        >
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
                {/* Back button for mobile */}
                {isMobile && (
                  <button
                    className="mr-2 p-2 rounded-full hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    onClick={handleBackToList}
                  >
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                )}
                {(() => {
                  const selectedChatData = chats.find(chat => chat.match.$id === selectedChat);
                  return selectedChatData ? (
                    <>
                      <img src={getProfileImageUrl(typeof selectedChatData.otherUserProfile.profileImage === 'string' ? selectedChatData.otherUserProfile.profileImage : undefined)} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-purple-100" />
                      <div>
                        <div className="font-semibold text-purple-900 text-base">{selectedChatData.otherUserProfile.username || selectedChatData.otherUserProfile.name}</div>
                        <div className="text-xs text-purple-400">Last active: {formatTime(selectedChatData.otherUserProfile.lastActive || selectedChatData.otherUserProfile.$updatedAt)}</div>
                      </div>
                    </>
                  ) : null;
                })()}
              </div>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-2 py-4 space-y-0 bg-gradient-to-b from-purple-50 to-white">
                <AnimatePresence initial={false}>
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <svg width="64" height="64" fill="none" viewBox="0 0 24 24" className="mb-2 text-purple-200"><path d="M12 20h.01M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm0 0v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <div className="text-purple-300 text-xs sm:text-base text-center">No messages yet.</div>
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {messages.map((msg, idx) => {
                        const isMe = msg.senderId === user?.$id;
                        const prev = messages[idx - 1];
                        const next = messages[idx + 1];
                        const isFirstInGroup = !prev || prev.senderId !== msg.senderId;
                        const isLastInGroup = !next || next.senderId !== msg.senderId;
                        return (
                          <motion.div
                            key={msg.$id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ duration: 0.18 }}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2 mb-${isLastInGroup ? '4' : '1'} group relative`}
                          >
                            {!isMe && isFirstInGroup && (
                              <img src={getProfileImageUrl(typeof (() => {
                                const chat = chats.find(c => c.match.$id === selectedChat);
                                return chat?.otherUserProfile.profileImage;
                              })() === 'string' ? (() => {
                                const chat = chats.find(c => c.match.$id === selectedChat);
                                return chat?.otherUserProfile.profileImage;
                              })() : undefined)} alt="User" className="w-8 h-8 rounded-full object-cover border-2 border-purple-100 mb-1" loading="lazy" />
                            )}
                            <div className={`flex flex-col items-${isMe ? 'end' : 'start'} w-full max-w-[70%]`}>
                              <div className={`rounded-2xl px-4 py-2 ${isMe ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'bg-white text-purple-900 border border-purple-100'} ${isFirstInGroup ? '' : 'rounded-tl-none rounded-tr-none'} shadow-md mb-0.5`} style={{borderTopLeftRadius: isMe ? '1rem' : isFirstInGroup ? '1rem' : '0.5rem', borderTopRightRadius: !isMe ? '1rem' : isFirstInGroup ? '1rem' : '0.5rem'}}>
                                <span className="break-words whitespace-pre-line text-sm leading-relaxed">{msg.content}</span>
                              </div>
                              {isLastInGroup && (
                                <span className="text-xs text-purple-300 mt-1 mb-1">{formatTime(msg.$createdAt)}</span>
                              )}
                            </div>
                            {/* Delete button for own messages, outside the bubble */}
                            {isMe && (
                              <button
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-pink-100 ml-1 self-center"
                                title="Delete message"
                                onClick={() => handleDeleteMessage(msg.$id)}
                                disabled={deletingMessageId === msg.$id}
                              >
                                <Trash2 className={`w-4 h-4 ${deletingMessageId === msg.$id ? 'animate-spin text-purple-200' : 'text-pink-500'}`} />
                              </button>
                            )}
                            {isMe && <div className="w-8 h-8" />}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                  {/* Typing indicator */}
                  {isTyping && (
                    <motion.div
                      key="typing-indicator"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.18 }}
                      className="flex justify-end items-end gap-2 mb-4"
                    >
                      <div className="max-w-[70%] px-4 py-2 rounded-2xl shadow-md bg-gradient-to-r from-purple-300 to-blue-200 text-purple-900 relative">
                        <span className="inline-block animate-pulse">Typing...</span>
                      </div>
                      <div className="w-8 h-8" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Message Input */}
              <div className="px-4 py-3 border-t border-gray-100 bg-white sticky bottom-0 z-10 flex gap-2 items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  className="flex-1 px-3 py-2 rounded-full border border-purple-200 focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm sm:text-base bg-purple-50 placeholder:text-purple-300 messages-input"
                  placeholder="Type your message..."
                  disabled={editLoading}
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-purple-200 text-xs sm:text-base">
              <svg width="64" height="64" fill="none" viewBox="0 0 24 24" className="mb-2"><path d="M12 20h.01M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm0 0v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Select a chat to start messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};