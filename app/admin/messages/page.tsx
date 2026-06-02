'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Item {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface Reply {
  id: number;
  message_id: number;
  reply_text: string;
  sender: string;
  created_at: string;
}

interface Conversation {
  email: string;
  name: string;
  messages: Item[];
  latestMessage: Item;
  unreadCount: number;
  replyCount: number;
}

// ID sementara untuk optimistic update (bilangan negatif agar tidak bentrok dengan ID dari DB)
let optimisticIdCounter = -1;

export default function MessagesPage() {
  const [data, setData] = useState<Item[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [replyStatus, setReplyStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailReplyText, setEmailReplyText] = useState('');

  // Ref untuk auto-scroll ke pesan terbaru
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const { data: res } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (res) setData(res);
    setLoading(false);
  }, []);

  const fetchReplies = useCallback(async () => {
    const { data: res } = await supabase
      .from('message_replies')
      .select('*')
      .order('created_at', { ascending: true });
    if (res) setReplies(res);
  }, []);

  useEffect(() => {
    fetchData();
    fetchReplies();
  }, [fetchData, fetchReplies]);

  // Auto-scroll ke bawah setiap kali timeline berubah
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [replies, selectedEmail]);

  const conversations: Conversation[] = useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const msg of data) {
      const list = map.get(msg.email);
      if (list) list.push(msg);
      else map.set(msg.email, [msg]);
    }
    return Array.from(map.entries())
      .map(([email, messages]) => {
        const sorted = [...messages].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        const msgIds = messages.map((m) => m.id);
        // Hitung hanya reply nyata (ID positif), bukan optimistic
        const replyCount = replies.filter(
          (r) => msgIds.includes(r.message_id) && r.id > 0,
        ).length;
        return {
          email,
          name: sorted[0].name,
          messages: sorted,
          latestMessage: sorted[0],
          unreadCount: messages.filter((m) => !m.is_read).length,
          replyCount,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.latestMessage.created_at).getTime() -
          new Date(a.latestMessage.created_at).getTime(),
      );
  }, [data, replies]);

  const selectedConv = useMemo(() => {
    if (!selectedEmail) return null;
    return conversations.find((c) => c.email === selectedEmail) ?? null;
  }, [selectedEmail, conversations]);

  const selectedMsgIds = useMemo(() => {
    if (!selectedConv) return [];
    return selectedConv.messages.map((m) => m.id);
  }, [selectedConv]);

  const chatReplies = useMemo(() => {
    if (!selectedMsgIds.length) return [];
    return replies.filter((r) => selectedMsgIds.includes(r.message_id));
  }, [replies, selectedMsgIds]);

  /**
   * Timeline: gabungkan semua pesan masuk + reply lalu urutkan
   * berdasarkan created_at agar history tampil kronologis.
   */
  const timeline = useMemo(() => {
    if (!selectedConv) return [];

    const items: {
      type: 'incoming' | 'outgoing';
      id: string;
      text: string;
      time: Date;
      isOptimistic?: boolean;
    }[] = [];

    for (const msg of selectedConv.messages) {
      items.push({
        type: 'incoming',
        id: `msg-${msg.id}`,
        text: msg.message,
        time: new Date(msg.created_at),
      });
    }

    for (const reply of chatReplies) {
      items.push({
        type: reply.sender === 'visitor' ? 'incoming' : 'outgoing',
        id: `reply-${reply.id}`,
        text: reply.reply_text,
        time: new Date(reply.created_at),
        isOptimistic: reply.id < 0,
      });
    }

    // Sort kronologis agar pesan & reply tampil berurutan
    items.sort((a, b) => a.time.getTime() - b.time.getTime());

    return items;
  }, [selectedConv, chatReplies]);

  const markAsRead = async (email: string) => {
    const unreadIds = data
      .filter((m) => m.email === email && !m.is_read)
      .map((m) => m.id);
    if (!unreadIds.length) return;
    await supabase
      .from('messages')
      .update({ is_read: true })
      .in('id', unreadIds);
    setData((prev) =>
      prev.map((m) => (unreadIds.includes(m.id) ? { ...m, is_read: true } : m)),
    );
  };

  const deleteConversation = async (email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from('messages').delete().eq('email', email);
    setData((prev) => prev.filter((m) => m.email !== email));
    if (selectedEmail === email) setSelectedEmail(null);
    fetchReplies();
  };

  const sendReply = async () => {
    if (!selectedConv || !replyText.trim()) return;
    setSending(true);
    setReplyStatus(null);

    const targetMsg = selectedConv.latestMessage;
    const replyContent = replyText.trim();

    // ── Optimistic update: tambahkan reply sementara ke state ──
    const optimisticId = optimisticIdCounter--;
    const optimisticReply: Reply = {
      id: optimisticId,
      message_id: targetMsg.id,
      reply_text: replyContent,
      sender: 'admin',
      created_at: new Date().toISOString(),
    };
    setReplies((prev) => [...prev, optimisticReply]);
    setReplyText('');

    try {
      const res = await fetch('/api/send-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedConv.email,
          subject: `Re: Message from ${selectedConv.name}`,
          message: replyContent,
          replyToMessage: targetMsg.message,
          messageId: targetMsg.id,
        }),
      });

      const responseData = await res.json();

      if (responseData.success) {
        setReplyStatus({ type: 'success', text: 'Reply terkirim!' });
        // Ganti optimistic entry dengan data asli dari DB
        await fetchReplies();
      } else {
        // Rollback optimistic update jika gagal
        setReplies((prev) => prev.filter((r) => r.id !== optimisticId));
        setReplyText(replyContent);
        setReplyStatus({
          type: 'error',
          text: responseData.error || 'Gagal mengirim reply',
        });
      }
    } catch {
      // Rollback jika network error
      setReplies((prev) => prev.filter((r) => r.id !== optimisticId));
      setReplyText(replyContent);
      setReplyStatus({ type: 'error', text: 'Gagal mengirim reply' });
    } finally {
      setSending(false);
    }
  };

  const addEmailReply = async () => {
    if (!selectedConv || !emailReplyText.trim()) return;
    const targetMsg = selectedConv.latestMessage;
    try {
      const res = await fetch('/api/add-email-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: targetMsg.id,
          replyText: emailReplyText.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowEmailModal(false);
        setEmailReplyText('');
        fetchReplies();
      }
    } catch {
      // silent
    }
  };

  const handleSelect = (conv: Conversation) => {
    setSelectedEmail(conv.email);
    setReplyStatus(null);
    if (conv.unreadCount > 0) markAsRead(conv.email);
  };

  if (loading) {
    return (
      <div className='flex justify-center py-12'>
        <div className='w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin' />
      </div>
    );
  }

  return (
    <div>
      <h1 className='font-display text-2xl font-extrabold text-on-surface mb-6'>
        Messages
      </h1>

      {conversations.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-20 text-center'>
          <div className='w-16 h-16 bg-primary-muted rounded-[20px] flex items-center justify-center mb-4'>
            <span
              className='material-symbols-outlined text-primary'
              style={{ fontSize: 32 }}
            >
              mail
            </span>
          </div>
          <p className='text-[0.95rem] text-on-surface-muted'>
            No messages yet.
          </p>
        </div>
      ) : (
        <div className='flex h-[calc(100vh-180px)] bg-surface-card rounded-[16px] border border-outline-variant overflow-hidden'>
          {/* ── Left Panel: Conversation List ── */}
          <div className='w-[380px] min-w-[380px] border-r border-outline-variant flex flex-col'>
            <div className='p-4 border-b border-outline-variant'>
              <h2 className='font-display text-[1rem] font-bold text-on-surface'>
                Inbox
              </h2>
            </div>
            <div className='flex-1 overflow-y-auto'>
              {conversations.map((conv) => (
                <div
                  key={conv.email}
                  onClick={() => handleSelect(conv)}
                  className={`group flex items-start gap-3 p-4 cursor-pointer transition-colors border-b border-outline-variant/50 ${
                    selectedEmail === conv.email
                      ? 'bg-primary-muted/25'
                      : 'hover:bg-surface-low'
                  } ${conv.unreadCount > 0 ? 'bg-primary-muted/10' : ''}`}
                >
                  <div className='w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0'>
                    <span className='text-[0.9rem] font-bold text-primary'>
                      {conv.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between gap-2'>
                      <span
                        className={`text-[0.85rem] truncate ${
                          conv.unreadCount > 0
                            ? 'font-bold text-on-surface'
                            : 'font-medium text-on-surface'
                        }`}
                      >
                        {conv.name}
                      </span>
                      <span className='text-[0.7rem] text-on-surface-muted whitespace-nowrap'>
                        {new Date(
                          conv.latestMessage.created_at,
                        ).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <div className='text-[0.75rem] text-on-surface-muted mt-0.5 truncate'>
                      {conv.latestMessage.message}
                    </div>
                    <div className='flex items-center gap-2 mt-1'>
                      {conv.unreadCount > 0 && (
                        <span className='w-2 h-2 rounded-full bg-primary shrink-0' />
                      )}
                      <span className='text-[0.7rem] text-on-surface-muted'>
                        {conv.messages.length} message
                        {conv.messages.length > 1 ? 's' : ''}
                      </span>
                      {conv.replyCount > 0 && (
                        <span className='text-[0.7rem] text-primary'>
                          · {conv.replyCount} reply
                          {conv.replyCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => deleteConversation(conv.email, e)}
                    className='p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-on-surface-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0'
                    title='Delete conversation'
                  >
                    <span
                      className='material-symbols-outlined'
                      style={{ fontSize: 18 }}
                    >
                      delete
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Panel: Chat View ── */}
          <div className='flex-1 flex flex-col bg-[#e8f4f8] dark:bg-[#0b1a22] relative'>
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className='flex items-center gap-3 px-5 py-3 bg-surface-card border-b border-outline-variant'>
                  <div className='w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0'>
                    <span className='text-[0.85rem] font-bold text-primary'>
                      {selectedConv.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='text-[0.9rem] font-semibold text-on-surface truncate'>
                      {selectedConv.name}
                    </div>
                    <div className='text-[0.75rem] text-on-surface-muted truncate'>
                      {selectedConv.email}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className='p-2 rounded-lg hover:bg-primary/10 text-on-surface-muted hover:text-primary transition-colors'
                    title='Add email reply from visitor'
                  >
                    <span
                      className='material-symbols-outlined'
                      style={{ fontSize: 20 }}
                    >
                      forward_to_inbox
                    </span>
                  </button>
                  <button
                    onClick={(e) => deleteConversation(selectedConv.email, e)}
                    className='p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-on-surface-muted hover:text-red-500 transition-colors'
                    title='Delete conversation'
                  >
                    <span
                      className='material-symbols-outlined'
                      style={{ fontSize: 20 }}
                    >
                      delete
                    </span>
                  </button>
                </div>

                {/* Chat Messages */}
                <div className='flex-1 overflow-y-auto p-5 space-y-3'>
                  {timeline.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex ${
                        entry.type === 'incoming'
                          ? 'justify-start'
                          : 'justify-end'
                      }`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2.5 shadow-sm transition-opacity ${
                          entry.type === 'incoming'
                            ? 'bg-white dark:bg-surface-card rounded-[8px_16px_16px_16px]'
                            : 'bg-primary text-white rounded-[16px_8px_16px_16px]'
                        } ${entry.isOptimistic ? 'opacity-60' : 'opacity-100'}`}
                      >
                        <p className='text-[0.85rem] leading-[1.6] whitespace-pre-wrap'>
                          {entry.text}
                        </p>
                        <div className='flex items-center justify-end gap-1 mt-1'>
                          <span
                            className={`text-[0.65rem] ${
                              entry.type === 'incoming'
                                ? 'text-on-surface-muted'
                                : 'text-white/70'
                            }`}
                          >
                            {entry.time.toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {entry.type === 'outgoing' && (
                            <span
                              className='material-symbols-outlined text-white/70'
                              style={{ fontSize: 14 }}
                            >
                              {/* Jam pasir jika masih optimistic, centang jika sudah terkirim */}
                              {entry.isOptimistic ? 'schedule' : 'done_all'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Anchor untuk auto-scroll */}
                  <div ref={chatBottomRef} />
                </div>

                {/* Modal: Add incoming email reply */}
                {showEmailModal && (
                  <div className='absolute inset-0 bg-black/30 flex items-center justify-center z-10' onClick={() => setShowEmailModal(false)}>
                    <div className='bg-surface-card rounded-[16px] border border-outline-variant p-5 w-[480px] shadow-xl' onClick={(e) => e.stopPropagation()}>
                      <h3 className='font-display text-[1rem] font-bold text-on-surface mb-1'>Add Incoming Email</h3>
                      <p className='text-[0.8rem] text-on-surface-muted mb-4'>
                        Paste the reply sent by {selectedConv?.name} via Gmail.
                      </p>
                      <textarea
                        value={emailReplyText}
                        onChange={(e) => setEmailReplyText(e.target.value)}
                        placeholder='Paste the visitor email reply here...'
                        rows={5}
                        className='w-full bg-surface-low border border-outline-variant rounded-[10px] p-3 text-[0.85rem] text-on-surface placeholder:text-on-surface-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/40'
                      />
                      <div className='flex justify-end gap-3 mt-4'>
                        <button
                          onClick={() => { setShowEmailModal(false); setEmailReplyText(''); }}
                          className='px-4 py-2 rounded-[10px] text-[0.85rem] font-semibold text-on-surface-muted hover:bg-surface-low transition-colors'
                        >
                          Cancel
                        </button>
                        <button
                          onClick={addEmailReply}
                          disabled={!emailReplyText.trim()}
                          className='px-4 py-2 rounded-[10px] text-[0.85rem] font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50'
                        >
                          Add to Conversation
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Input */}
                <div className='border-t border-outline-variant bg-surface-card p-4'>
                  <div className='flex items-end gap-3'>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder='Ketik balasan...'
                      rows={1}
                      onInput={(e) => {
                        const el = e.currentTarget;
                        el.style.height = 'auto';
                        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                      }}
                      className='flex-1 bg-surface-low border border-outline-variant rounded-[12px] px-4 py-2.5 text-[0.85rem] text-on-surface placeholder:text-on-surface-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/40'
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendReply();
                        }
                      }}
                    />
                    <button
                      onClick={sendReply}
                      disabled={sending || !replyText.trim()}
                      className='w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0'
                    >
                      {sending ? (
                        <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                      ) : (
                        <span
                          className='material-symbols-outlined'
                          style={{ fontSize: 20 }}
                        >
                          send
                        </span>
                      )}
                    </button>
                  </div>
                  {replyStatus && (
                    <div
                      className={`mt-2 text-[0.75rem] ${
                        replyStatus.type === 'success'
                          ? 'text-green-600'
                          : 'text-red-500'
                      }`}
                    >
                      {replyStatus.text}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className='flex flex-col items-center justify-center h-full text-center px-8'>
                <div className='w-16 h-16 bg-primary-muted rounded-full flex items-center justify-center mb-4'>
                  <span
                    className='material-symbols-outlined text-primary'
                    style={{ fontSize: 32 }}
                  >
                    chat
                  </span>
                </div>
                <p className='text-[0.9rem] text-on-surface-muted'>
                  Pilih percakapan untuk melihat pesan
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
