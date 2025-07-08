import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Form, Button, Card, InputGroup, Spinner,
  ListGroup, Row, Col, Badge, Modal, Image
} from 'react-bootstrap';
import {
  BsSend, BsPersonCircle, BsMic, BsImage
} from 'react-icons/bs';
import { io, Socket } from 'socket.io-client';
import Picker from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

type User = {
  id: string;
  fullName: string;
  email: string;
  role?: 'admin' | 'business' | 'student';
};

type Message = {
  id: string;
  content: string;
  sender: User;
  createdAt: string;
  chatId: string;
  reactions?: Record<string, string[]>;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio';
};

type Chat = {
  id: string;
  student: User;
  business: User;
  messages: Message[];
  unreadCount?: number;
};

const Chat: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchRole, setSearchRole] = useState<'all' | 'admin' | 'business'>('all');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEmoji, setShowEmoji] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaChunks, setMediaChunks] = useState<Blob[]>([]);
  const [showImagePreview, setShowImagePreview] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}') as User;

  useEffect(() => {
    const socket = io(API_BASE);
    socketRef.current = socket;

    socket.on('message', handleIncoming);
    socket.on('typing', ({ roomId }: { roomId: string }) => {
      if (selectedChat?.id === roomId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 1500);
      }
    });

    const fetchChats = async () => {
      const token = localStorage.getItem('token');
      if (!token) return setLoading(false);

      const res = await fetch(`${API_BASE}/api/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data: Chat[] = await res.json();
        setChats(data.map(c => ({ ...c, unreadCount: 0 })));
        if (data.length) setSelectedChat(data[0]);
      }

      setLoading(false);
    };

    fetchChats();

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedChat) {
      socketRef.current?.emit('join', { roomId: selectedChat.id });
      setChats(prev =>
        prev.map(c =>
          c.id === selectedChat.id ? { ...c, unreadCount: 0 } : c
        )
      );
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  function handleIncoming(msg: Message) {
    setChats(prev =>
      prev.map(c => {
        if (c.id === msg.chatId) {
          const isActive = selectedChat?.id === msg.chatId;
          const updatedMessages = [...c.messages, msg];
          return {
            ...c,
            messages: updatedMessages,
            unreadCount: isActive ? 0 : (c.unreadCount || 0) + 1
          };
        }
        return c;
      })
    );

    if (selectedChat?.id === msg.chatId) {
      setSelectedChat(prev => prev ? { ...prev, messages: [...prev.messages, msg] } : null);
    }
  }

  const sendMessage = async (body: Partial<Message>) => {
    if (!selectedChat) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/chats/${selectedChat.id}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) return console.error('Send failed');
    const msg: Message = await res.json();
    socketRef.current?.emit('message', { ...msg, roomId: selectedChat.id });
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && !mediaChunks.length) return;

    if (mediaChunks.length) {
      const blob = new Blob(mediaChunks);
      const url = URL.createObjectURL(blob);
      await sendMessage({
        content: '',
        mediaUrl: url,
        mediaType: blob.type.startsWith('image') ? 'image' : 'audio'
      });
      setMediaChunks([]);
      setRecording(false);
    } else {
      await sendMessage({ content: newMessage.trim() });
      setNewMessage('');
    }
  };

  const handleTyping = () => {
    if (!selectedChat) return;
    socketRef.current?.emit('typing', { roomId: selectedChat.id });
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) return setSearchResults([]);

    const res = await fetch(`${API_BASE}/api/users?search=${q}`);
    if (!res.ok) return;

    const users: User[] = await res.json();
    let filtered = users.filter(u => u.id !== currentUser.id);
    if (searchRole !== 'all') filtered = filtered.filter(u => u.role === searchRole);
    setSearchResults(filtered);
  };

  const handleStartChat = async (user: User) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/chats/access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ participantId: user.id })
    });

    if (!res.ok) return;
    const nc: Chat = await res.json();
    setChats(prev => [nc, ...prev.filter(c => c.id !== nc.id)]);
    setSelectedChat(nc);
    setSearchResults([]);
    setSearchQuery('');
  };

  const onEmoji = (emojiData: EmojiClickData) => {
  setNewMessage(prev => prev + emojiData.emoji);
};
  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mr = new MediaRecorder(stream);
        mediaRecorder.current = mr;
        mr.ondataavailable = e => setMediaChunks(prev => [...prev, e.data]);
        mr.start();
        setRecording(true);
      });
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
  };

  const toggleReaction = async (msg: Message, emoji: string) => {
    const hasReacted = msg.reactions?.[emoji]?.includes(currentUser.id);
    await fetch(`${API_BASE}/api/chats/${msg.chatId}/messages/${msg.id}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji, remove: hasReacted })
    });

    msg.reactions = msg.reactions || {};
    msg.reactions[emoji] = msg.reactions[emoji] || [];

    if (hasReacted) {
      msg.reactions[emoji] = msg.reactions[emoji].filter(id => id !== currentUser.id);
    } else {
      msg.reactions[emoji].push(currentUser.id);
    }

    setSelectedChat(prev => prev ? { ...prev } : null);
  };

  const grouped: Record<string, Message[]> = selectedChat?.messages.reduce((acc, msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {} as Record<string, Message[]>) || {};

  return (
    <Container className="py-4">
      <h4 className="mb-4 text-center">TomiLink Chat</h4>
      <Row>
        <Col md={4}>
          <Card className="shadow rounded-4 mb-3">
            <Form.Select
              value={searchRole}
              onChange={e => setSearchRole(e.target.value as any)}
            >
              <option value="all">All Users</option>
              <option value="admin">Admin</option>
              <option value="business">Business</option>
            </Form.Select>
            <InputGroup size="sm" className="my-2">
              <Form.Control
                placeholder="Search name or email"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
              />
            </InputGroup>
            {searchResults.length > 0 && (
              <ListGroup className="mb-2">
                {searchResults.map(u => (
                  <ListGroup.Item
                    key={u.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      {u.fullName}
                      <br /><small className="text-muted">{u.email} ({u.role})</small>
                    </div>
                    <Button size="sm" onClick={() => handleStartChat(u)}>
                      Start Chat
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card>

          <ListGroup>
            {chats.map(c => {
              const other = c.student.id === currentUser.id ? c.business : c.student;
              return (
                <ListGroup.Item
                  key={c.id}
                  action
                  active={c.id === selectedChat?.id}
                  onClick={() => setSelectedChat(c)}
                >
                  {other.fullName}
                  {!!c.unreadCount && (
                    <Badge bg="danger" className="ms-2">{c.unreadCount}</Badge>
                  )}
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </Col>

        <Col md={8}>
          <Card className="shadow rounded-4 border-0">
            <Card.Body className="p-3" style={{ maxHeight: '60vh', overflowY: 'auto', backgroundColor: '#f9f9f9' }}>
              {loading && (
                <div className="text-center my-4">
                  <Spinner animation="border" variant="primary" />
                </div>
              )}
              {!loading && !selectedChat && (
                <div className="text-center my-4 text-muted">
                  Select a chat to start messaging
                </div>
              )}
              {selectedChat && Object.entries(grouped).map(([date, msgs]) => (
                <div key={date}>
                  <div className="text-center text-muted my-2">{date}</div>
                  {msgs.map(m => (
                    <div
                      key={m.id}
                      className={`d-flex mb-3 ${m.sender.id === currentUser.id ? 'justify-content-end' : 'justify-content-start'}`}
                    >
                      {m.sender.id !== currentUser.id && (
                        <BsPersonCircle size={28} className="me-2 text-secondary" />
                      )}
                      <div>
                        {m.mediaUrl && m.mediaType === 'image' && (
                          <Image
                            src={m.mediaUrl}
                            thumbnail
                            style={{ cursor: 'pointer', maxWidth: '200px' }}
                            onClick={() => setShowImagePreview(m.mediaUrl!)}
                          />
                        )}
                        {m.mediaUrl && m.mediaType === 'audio' && (
                          <audio controls src={m.mediaUrl}></audio>
                        )}
                        {m.content && (
                          <div className={`p-3 rounded-3 shadow-sm ${m.sender.id === currentUser.id ? 'bg-primary text-white' : 'bg-light text-dark'}`} style={{ maxWidth: '70%' }}>
                            {m.content}
                          </div>
                        )}
                        <div className="mt-1">
                          <small style={{ opacity: 0.7, fontSize: '0.75rem' }}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </small>
                          <div className="mt-1">
                            {m.reactions && Object.entries(m.reactions).map(([emo, arr]) => (
                              <Button
                                key={emo}
                                size="sm"
                                variant={arr.includes(currentUser.id) ? 'primary' : 'outline-secondary'}
                                className="me-1"
                                onClick={() => toggleReaction(m, emo)}
                              >
                                {emo} {arr.length}
                              </Button>
                            ))}
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => toggleReaction(m, '👍')}
                            >
                              👍
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && <div className="fst-italic">Typing...</div>}
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </Card.Body>

            <Card.Footer className="bg-white border-top-0 p-3">
              <Form onSubmit={handleSend}>
                <InputGroup>
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowEmoji(v => !v)}
                  >😊</Button>
                  <Button
                    variant={recording ? 'danger' : 'outline-secondary'}
                    onClick={() => recording ? stopRecording() : startRecording()}
                  ><BsMic /></Button>
                  <Form.Control
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      } else {
                        handleTyping();
                      }
                    }}
                  />
                  <Button variant="outline-secondary" as="label">
                    <BsImage />
                    <Form.Control
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={e => {
                        const input = e.target as HTMLInputElement;
                        const file = input.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          sendMessage({
                            content: '',
                            mediaUrl: url,
                            mediaType: 'image'
                          });
                        }
                      }}
                    />
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!newMessage.trim() && !mediaChunks.length}
                  ><BsSend /></Button>
                </InputGroup>
              </Form>
              {showEmoji && <Picker onEmojiClick={onEmoji} />}
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      <Modal
        show={!!showImagePreview}
        onHide={() => setShowImagePreview(null)}
        size="lg"
        centered
      >
        <Modal.Body className="p-0">
          <Image src={showImagePreview!} fluid />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Chat;
