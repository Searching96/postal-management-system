import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
    Search,
    Send,
    User as UserIcon,
    Phone,
    Loader2,
    MessageSquare,
    Check,
    CheckCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../lib/AuthContext';
import { messageService, ContactResponse, MessageResponse } from '../../services/messageService';

export default function MessagesPage() {
    const { user: _ } = useAuth(); // Keeping hook call if needed for effect, or just remove if not needed.
    // Actually useAuth is likely needed for context, but if user is unused...
    // Let's check if useAuth provides anything else. 
    // const { user } = useAuth(); -> used to be.
    // I'll just remove 'user' from destructuring if possible or rename to _user.
    const { user: _user } = useAuth();
    const [view, setView] = useState<'recent' | 'unit' | 'search'>('unit');
    const [contacts, setContacts] = useState<ContactResponse[]>([]);
    const [selectedContact, setSelectedContact] = useState<ContactResponse | null>(null);
    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sending, setSending] = useState(false);

    // Polling refs
    const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    const { register, handleSubmit, reset } = useForm<{ content: string }>();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Cleanup polling
    useEffect(() => {
        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, []);

    // Load unit employees on mount or tab change
    useEffect(() => {
        if (view === 'unit') {
            loadUnitEmployees();
        } else if (view === 'recent') {
            loadRecentContacts();
        }
    }, [view]);

    // Poll for messages when a contact is selected
    useEffect(() => {
        if (selectedContact) {
            loadConversation(selectedContact.id);
            // Poll every 5 seconds
            pollInterval.current = setInterval(() => {
                loadConversation(selectedContact.id, true);
            }, 5000);
        } else {
            if (pollInterval.current) clearInterval(pollInterval.current);
            setMessages([]);
        }

        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, [selectedContact]);

    const loadRecentContacts = async () => {
        setLoadingContacts(true);
        try {
            const res = await messageService.getRecentContacts();
            if (res.success) {
                setContacts(res.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải danh sách liên hệ');
        } finally {
            setLoadingContacts(false);
        }
    };

    const loadUnitEmployees = async () => {
        setLoadingContacts(true);
        try {
            const res = await messageService.getUnitEmployees();
            if (res.success) {
                setContacts(res.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải danh sách đồng nghiệp');
        } finally {
            setLoadingContacts(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setView('search');
        setLoadingContacts(true);
        try {
            const res = await messageService.searchUsers(searchQuery);
            if (res.success) {
                setContacts(res.data);
            } else {
                setContacts([]);
            }
        } catch {
            toast.error('Lỗi khi tìm kiếm');
        } finally {
            setLoadingContacts(false);
        }
    };

    const loadConversation = async (userId: string, isPoll = false) => {
        if (!isPoll) setLoadingMessages(true);
        try {
            const res = await messageService.getConversation(userId);
            if (res.success) {
                // If polling, we might want to smarter merge, but simple set is okay for MVP 
                // provided we preserve scroll position if user is scrolling up (TODO for v2)
                // For now, simple replacement
                // Reverse because backend sends newest first, but chat displays oldest at top usually?
                // Backend: ORDER BY sentAt DESC (Newest first)
                // UI: Should be Oldest -> Newest (Top -> Bottom)
                setMessages([...res.data.content].reverse());

                // Mark as read after receiving messages
                if (res.data.content.some(m => !m.isMe && !m.isRead)) {
                    await messageService.markAsRead(userId);
                    // Update local unread count
                    setContacts(prev => prev.map(c => c.id === userId ? { ...c, unreadCount: 0 } : c));
                }
            }
        } catch {
            console.error('Error loading conversation');
        } finally {
            if (!isPoll) setLoadingMessages(false);
        }
    };

    const onSendMessage = async (data: { content: string }) => {
        if (!selectedContact || !data.content.trim()) return;

        setSending(true);
        try {
            const res = await messageService.sendMessage({
                receiverId: selectedContact.id,
                content: data.content
            });

            if (res.success) {
                reset();
                // Optimistic update or immediate refresh
                setMessages(prev => [...prev, { ...res.data, isMe: true }]);
                // Update contact preview in list if it exists
                setContacts(prev => prev.map(c =>
                    c.id === selectedContact.id
                        ? { ...c, lastMessage: data.content, sentAt: new Date().toISOString() }
                        : c
                ));
            }
        } catch {
            toast.error('Gửi tin nhắn thất bại');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
                <div className="p-4 border-b border-gray-200 bg-white">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary-600" />
                        Tin nhắn
                    </h2>

                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="Tìm NV qua số điện thoại..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    </form>

                    <div className="flex gap-2 mt-3 text-xs">
                        <button
                            onClick={() => setView('recent')}
                            className={`px-3 py-1 rounded-full ${view === 'recent' ? 'bg-primary-100 text-primary-700 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Gần đây
                        </button>
                        <button
                            onClick={() => setView('unit')}
                            className={`px-3 py-1 rounded-full ${view === 'unit' ? 'bg-primary-100 text-primary-700 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Đồng nghiệp
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loadingContacts ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                    ) : contacts.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            {view === 'search' ? 'Không tìm thấy nhân viên' : 'Chưa có tin nhắn nào'}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {contacts.map(contact => (
                                <div
                                    key={contact.id}
                                    onClick={() => setSelectedContact(contact)}
                                    className={`p-4 hover:bg-white cursor-pointer transition-colors ${selectedContact?.id === contact.id ? 'bg-white border-l-4 border-primary-500' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-medium text-sm ${selectedContact?.id === contact.id ? 'text-primary-700' : 'text-gray-900'}`}>
                                            {contact.name || contact.phoneNumber}
                                        </h3>
                                        {contact.sentAt && (
                                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                {new Date(contact.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate mb-1">
                                        {contact.lastMessage || (contact.role ? `Role: ${contact.role}` : 'Chưa có tin nhắn')}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Phone className="w-3 h-3" />
                                        {contact.phoneNumber}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedContact ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                    <UserIcon className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{selectedContact.name}</h3>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        {selectedContact.phoneNumber}
                                        <span className="mx-1">•</span>
                                        {selectedContact.role}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                            {loadingMessages ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-gray-400 my-auto py-12">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Bắt đầu cuộc trò chuyện với {selectedContact.name}</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${msg.isMe
                                                ? 'bg-primary-600 text-white rounded-br-none'
                                                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                                }`}
                                        >
                                            <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                                            <div className={`text-[10px] mt-1 flex items-center gap-1 ${msg.isMe ? 'text-primary-100 justify-end' : 'text-gray-400'}`}>
                                                {new Date(msg.sentAt).toLocaleString('vi-VN')}
                                                {msg.isMe && (
                                                    msg.isRead ? <CheckCheck className="w-3.5 h-3.5 text-white" /> : <Check className="w-3.5 h-3.5 opacity-70" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                            <form onSubmit={handleSubmit(onSendMessage)} className="flex gap-2">
                                <input
                                    {...register('content', { required: true })}
                                    type="text"
                                    placeholder="Nhập tin nhắn..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                    autoComplete="off"
                                />
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="p-2.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                >
                                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium opacity-60">Chọn một liên hệ để bắt đầu trò chuyện</p>
                    </div>
                )}
            </div>
        </div>
    );
}
