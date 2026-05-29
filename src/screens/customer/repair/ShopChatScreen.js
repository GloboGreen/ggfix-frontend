import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Phone,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Camera,
  ShieldCheck,
  MessageCircle,
  CheckCheck,
  Check,
} from 'lucide-react-native';
import { Loader, EmptyState, Badge } from '../../../components/rnr';
import { notify } from '../../../components/confirm';
import { openChat, getChatMessages, sendChatMessage } from '../../../api/marketplace';
import { getShop } from '../../../api/shops';

const QUICK_REPLIES = [
  'Hi, I need a quote for a repair',
  'Is doorstep pickup available?',
  'How long will it take?',
  'Do you provide warranty?',
];

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function groupByDay(messages) {
  const groups = [];
  let lastDay = null;
  for (const m of messages) {
    const d = m.createdAt ? new Date(m.createdAt) : new Date();
    const key = d.toDateString();
    if (key !== lastDay) {
      groups.push({ type: 'date', key, label: dayLabel(d) });
      lastDay = key;
    }
    groups.push({ type: 'msg', message: m });
  }
  return groups;
}

function dayLabel(d) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ShopChatScreen({ navigation, route }) {
  const shopId = route?.params?.shopId;
  const isEnquiry = route?.params?.mode === 'ENQUIRY';
  const [shop, setShop] = useState(null);
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const scrollRef = useRef(null);

  const bootstrap = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const s = shopId ? await getShop(shopId).catch(() => null) : null;
      setShop(s);
      try {
        const t = await openChat(shopId);
        setThread(t);
        if (t?.id) {
          const m = await getChatMessages(t.id).catch(() => []);
          setMessages(m);
        }
      } catch (e) {
        setLoadError(e?.message || 'Could not open chat with this shop.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { bootstrap(); }, [shopId]);

  // Optimistic send: shows the bubble immediately, even before API replies.
  const send = async (overrideText) => {
    const body = (overrideText ?? text).trim();
    if (!body) return;
    if (!overrideText) setText('');

    // If the thread didn't open, surface that â€” don't silently swallow the tap.
    if (!thread?.id) {
      notify(
        'Chat not connected',
        loadError
          ? `${loadError}\n\nTap retry on the banner to reconnect.`
          : 'Still connecting to the shop. Please wait a moment and try again.',
      );
      // restore the message so the user doesn't lose what they typed
      if (!overrideText) setText(body);
      return;
    }

    const tempId = `tmp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      sender: 'CUSTOMER',
      body,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages((m) => [...m, optimistic]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);

    setSending(true);
    try {
      const sent = await sendChatMessage(thread.id, body);
      // Swap the optimistic bubble for the server's response
      setMessages((m) => m.map((x) => (x.id === tempId ? { ...sent, pending: false } : x)));
    } catch (e) {
      // Mark the optimistic message as failed so it's not lost
      setMessages((m) => m.map((x) => (x.id === tempId ? { ...x, failed: true, pending: false } : x)));
      notify("Couldn't send", e?.message || 'Try again. Check that marketplace-service (port 8087) is running.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loader label="Opening chat..." />;

  const groups = groupByDay(messages);
  const showWelcome = messages.length === 0;
  const shopName = shop?.name || 'Shop';

  return (
    <View className="flex-1 bg-background">
      {/* Custom header (replaces default stack header) */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFFFFF' }}>
        <View className="flex-row items-center px-3 py-2 bg-card border-b border-border"
              style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            className="h-9 w-9 rounded-full bg-background items-center justify-center active:opacity-70"
          >
            <ChevronLeft size={20} color="#0F172A" />
          </Pressable>
          <View className="h-10 w-10 rounded-full bg-primary items-center justify-center ml-2">
            <Text className="text-white text-[14px] font-extrabold">{shopName.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View className="flex-1 ml-2.5">
            <Text className="text-[14px] font-extrabold text-text" numberOfLines={1}>{shopName}</Text>
            <View className="flex-row items-center mt-0.5">
              <View className="h-1.5 w-1.5 rounded-full bg-success mr-1" />
              <Text className="text-[10px] text-text-muted">Online Â· Typically replies in ~10 min</Text>
            </View>
          </View>
          <Pressable
            onPress={() => shop?.phone && notify('Call shop', `Dial ${shop.phone}`)}
            className="h-9 w-9 rounded-full bg-success/10 items-center justify-center ml-1 active:opacity-70"
          >
            <Phone size={16} color="#10B981" />
          </Pressable>
          <Pressable
            onPress={() => {}}
            className="h-9 w-9 rounded-full bg-background items-center justify-center ml-1 active:opacity-70"
          >
            <MoreVertical size={16} color="#64748B" />
          </Pressable>
        </View>

        {/* Mode banner */}
        {isEnquiry ? (
          <View className="bg-success/10 border-b border-success/20 px-4 py-2 flex-row items-center">
            <MessageCircle size={12} color="#10B981" />
            <Text className="text-[11px] font-bold text-success ml-1.5">ENQUIRY MODE</Text>
            <Text className="text-[11px] text-text-muted ml-2 flex-1" numberOfLines={1}>
              Free chat Â· No booking yet
            </Text>
          </View>
        ) : null}

        {/* Connection failure banner */}
        {!loading && !thread ? (
          <View className="bg-danger/10 border-b border-danger/30 px-4 py-2 flex-row items-center">
            <View className="h-2 w-2 rounded-full bg-danger mr-2" />
            <View className="flex-1 pr-2">
              <Text className="text-[12px] font-extrabold text-danger" numberOfLines={1}>Couldn't connect to chat</Text>
              <Text className="text-[10px] text-text-muted" numberOfLines={2}>
                {loadError || 'marketplace-service may be offline.'}
              </Text>
            </View>
            <Pressable
              onPress={bootstrap}
              className="bg-danger rounded-full px-3 py-1 active:opacity-80"
            >
              <Text className="text-white text-[11px] font-bold">Retry</Text>
            </Pressable>
          </View>
        ) : null}
      </SafeAreaView>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{ padding: 12, paddingBottom: 16 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {/* Encryption notice */}
          <View className="self-center bg-card border border-border rounded-full px-3 py-1 mb-3 flex-row items-center">
            <ShieldCheck size={11} color="#10B981" />
            <Text className="text-[10px] text-text-muted ml-1">
              Encrypted via ggfix Â· Booking-safe chat
            </Text>
          </View>

          {showWelcome ? (
            <View className="flex-1 items-center">
              <EmptyState
                icon={<MessageCircle size={28} color="#00008B" />}
                title={`Chat with ${shopName}`}
                description="Send a message to start the conversation. The shop typically replies within 10 minutes."
              />

              <View className="px-1">
                <Text className="text-[11px] font-extrabold text-text-muted tracking-widest mb-2 text-center">QUICK REPLIES</Text>
                <View className="items-center">
                  {QUICK_REPLIES.map((q) => (
                    <Pressable
                      key={q}
                      onPress={() => send(q)}
                      className="bg-card border border-primary/30 rounded-full px-4 py-2 mb-2 active:opacity-80"
                    >
                      <Text className="text-[12px] font-bold text-primary">{q}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          ) : (
            groups.map((g, idx) => {
              if (g.type === 'date') {
                return (
                  <View key={`d-${idx}`} className="items-center my-2">
                    <View className="bg-card border border-border rounded-full px-3 py-0.5">
                      <Text className="text-[10px] font-bold text-text-muted">{g.label}</Text>
                    </View>
                  </View>
                );
              }
              const m = g.message;
              const mine = m.sender === 'CUSTOMER';
              const bubbleBg = m.failed
                ? 'bg-danger/10 border border-danger/30 rounded-2xl rounded-br-sm'
                : mine
                  ? `${m.pending ? 'bg-primary/70' : 'bg-primary'} rounded-2xl rounded-br-sm`
                  : 'bg-card border border-border rounded-2xl rounded-bl-sm';
              const txtColor = m.failed ? 'text-danger' : mine ? 'text-white' : 'text-text';
              const metaColor = m.failed ? 'text-danger/70' : mine ? 'text-white/70' : 'text-text-muted';
              return (
                <View key={m.id || idx} className={`${mine ? 'items-end' : 'items-start'} mb-1.5`}>
                  <View className={`max-w-[82%] px-3 py-2 ${bubbleBg}`}>
                    <Text className={`text-[13.5px] leading-5 ${txtColor}`}>{m.body}</Text>
                    <View className="flex-row items-center justify-end mt-1">
                      <Text className={`text-[10px] ${metaColor}`}>
                        {m.failed ? 'Failed to send' : (m.pending ? 'Sending...' : formatTime(m.createdAt))}
                      </Text>
                      {mine && !m.pending && !m.failed ? (
                        m.read
                          ? <CheckCheck size={11} color="#A7F3D0" style={{ marginLeft: 4 }} />
                          : <Check size={11} color="rgba(255,255,255,0.7)" style={{ marginLeft: 4 }} />
                      ) : null}
                    </View>
                  </View>
                  {m.failed ? (
                    <Pressable
                      onPress={() => {
                        setMessages((arr) => arr.filter((x) => x.id !== m.id));
                        send(m.body);
                      }}
                      className="mt-1 mr-1 active:opacity-70"
                    >
                      <Text className="text-[10px] font-bold text-danger underline">Tap to retry</Text>
                    </Pressable>
                  ) : null}
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Composer */}
        <View className="px-3 pt-2 pb-3 bg-card border-t border-border"
              style={{ shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: -3 }, elevation: 8 }}>
          <View className="flex-row items-end">
            <View className="flex-1 bg-background border border-border rounded-3xl flex-row items-center px-2 py-1">
              <Pressable className="h-9 w-9 items-center justify-center active:opacity-70">
                <Paperclip size={18} color="#64748B" />
              </Pressable>
              <TextInput
                placeholder="Type a message..."
                placeholderTextColor="#94A3B8"
                value={text}
                onChangeText={setText}
                multiline
                maxLength={1000}
                className="flex-1 text-text text-[14px] py-2 px-1"
                style={{ maxHeight: 100 }}
              />
              <Pressable className="h-9 w-9 items-center justify-center active:opacity-70 mr-0.5">
                <Smile size={18} color="#64748B" />
              </Pressable>
              <Pressable className="h-9 w-9 items-center justify-center active:opacity-70 mr-0.5">
                <Camera size={18} color="#64748B" />
              </Pressable>
            </View>
            <Pressable
              onPress={() => send()}
              disabled={!text.trim() || sending}
              className={`h-12 w-12 rounded-full ml-2 items-center justify-center ${text.trim() && !sending ? 'bg-primary' : 'bg-border'}`}
              style={text.trim() && !sending ? { shadowColor: '#00008B', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 } : null}
            >
              <Send size={18} color={text.trim() && !sending ? '#fff' : '#94A3B8'} style={{ marginLeft: -2 }} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

