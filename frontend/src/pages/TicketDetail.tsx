import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Clock,
  User,
  Bot,
  CheckCircle2,
} from 'lucide-react';
import { categoryIcons } from '@/data/mockData';
import { Ticket, Message, TicketStatus, Priority } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const statusLabels: Record<TicketStatus, string> = {
  NEW: 'New',
  IN_PROGRESS: 'In Progress',
  WAITING: 'Waiting',
  RESOLVED: 'Resolved',
};

const priorityLabels: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

function mapApiTicket(raw: Record<string, unknown>): Ticket {
  return {
    id: String(raw._id ?? raw.id ?? ''),
    studentId: String(raw.studentId ?? ''),
    studentName: String(raw.studentName ?? ''),
    studentEmail: String(raw.studentEmail ?? ''),
    category: raw.category as Ticket['category'],
    service: String(raw.service ?? ''),
    priority: raw.priority as Ticket['priority'],
    status: raw.status as Ticket['status'],
    summary: String(raw.summary ?? ''),
    description: String(raw.description ?? ''),
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
    assigneeId: raw.assigneeId ? String(raw.assigneeId) : undefined,
    assigneeName: raw.assigneeName ? String(raw.assigneeName) : undefined,
    attachments: (raw.attachments as Ticket['attachments']) ?? [],
  };
}

function mapApiMessage(raw: Record<string, unknown>): Message {
  return {
    id: String(raw._id ?? raw.id ?? ''),
    ticketId: String(raw.ticketId ?? ''),
    senderRole: raw.senderRole as Message['senderRole'],
    senderName: String(raw.senderName ?? ''),
    body: String(raw.body ?? ''),
    createdAt: String(raw.createdAt ?? ''),
    isInternalNote: Boolean(raw.isInternalNote),
  };
}

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Socket.io real-time connection
  useEffect(() => {
    if (!ticketId) return;

    const socket = io(API_BASE, { withCredentials: true });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-ticket', ticketId);
    });

    socket.on('new-message', (msg: {
      id: string;
      ticketId: string;
      senderRole: string;
      senderName: string;
      body: string;
      isInternalNote: boolean;
      createdAt: string;
    }) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, {
          id: msg.id,
          ticketId: msg.ticketId,
          senderRole: msg.senderRole as Message['senderRole'],
          senderName: msg.senderName,
          body: msg.body,
          createdAt: msg.createdAt,
          isInternalNote: msg.isInternalNote,
        }];
      });
    });

    socket.on('status-changed', (data: {
      ticketId: string;
      oldStatus: string;
      newStatus: string;
      changedBy: string;
      changedAt: string;
    }) => {
      setTicket(prev => prev ? { ...prev, status: data.newStatus as Ticket['status'] } : prev);
    });

    return () => {
      socket.emit('leave-ticket', ticketId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [ticketId]);

  useEffect(() => {
    if (!ticketId) return;

    Promise.all([
      fetch(`${API_BASE}/tickets/${ticketId}`, { credentials: 'include' }),
      fetch(`${API_BASE}/tickets/${ticketId}/messages`, { credentials: 'include' }),
    ])
      .then(async ([ticketRes, messagesRes]) => {
        if (!ticketRes.ok) {
          setTicket(null);
          return;
        }
        const [ticketData, messagesData] = await Promise.all([
          ticketRes.json(),
          messagesRes.ok ? messagesRes.json() : { messages: [] },
        ]);
        setTicket(mapApiTicket(ticketData.ticket as Record<string, unknown>));
        setMessages(
          (messagesData.messages as Record<string, unknown>[]).map(mapApiMessage)
        );
      })
      .catch(() => setTicket(null))
      .finally(() => setIsLoading(false));
  }, [ticketId]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !ticketId) return;
    setIsSending(true);
    try {
      const res = await fetch(`${API_BASE}/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ body: replyText.trim(), isInternalNote: false }),
      });
      if (!res.ok) throw new Error('Failed to send');
      // Message will arrive via the socket's new-message event (with deduplication)
      setReplyText('');
    } catch {
      // error handling comes in PL-02 (toast notifications)
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground">Loading ticket...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Ticket Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The ticket you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate('/tickets')}>
          Back to Tickets
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" size="sm" onClick={() => navigate('/tickets')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Tickets
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Header */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl">
                  {categoryIcons[ticket.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl mb-2">{ticket.summary}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      className={cn(
                        ticket.status === 'NEW' && 'status-new',
                        ticket.status === 'IN_PROGRESS' && 'status-in-progress',
                        ticket.status === 'WAITING' && 'status-waiting',
                        ticket.status === 'RESOLVED' && 'status-resolved',
                      )}
                    >
                      {statusLabels[ticket.status]}
                    </Badge>
                    <Badge variant="outline">{ticket.category}</Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        ticket.priority === 'HIGH' && 'priority-high border-destructive/30',
                        ticket.priority === 'MEDIUM' && 'priority-medium border-warning/30',
                        ticket.priority === 'LOW' && 'priority-low border-success/30',
                      )}
                    >
                      {priorityLabels[ticket.priority]}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Conversation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Conversation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.senderRole === 'STUDENT' && 'flex-row-reverse'
                  )}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className={cn(
                      'text-xs',
                      message.senderRole === 'STUDENT' && 'bg-primary text-primary-foreground',
                      message.senderRole === 'STAFF' && 'bg-secondary text-secondary-foreground',
                      message.senderRole === 'AI' && 'bg-accent text-accent-foreground',
                    )}>
                      {message.senderRole === 'AI' ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        getInitials(message.senderName)
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    'flex-1 max-w-[80%]',
                    message.senderRole === 'STUDENT' && 'text-right'
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{message.senderName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className={cn(
                      'rounded-2xl px-4 py-3 inline-block text-left',
                      message.senderRole === 'STUDENT'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-secondary text-secondary-foreground rounded-bl-sm'
                    )}>
                      <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                    </div>
                  </div>
                </div>
              ))}

              {messages.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No messages yet. Start the conversation below.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Reply Box */}
          {ticket.status !== 'RESOLVED' && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" disabled>
                      <Paperclip className="h-4 w-4 mr-2" />
                      Attach
                    </Button>
                    <Button
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || isSending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSending ? 'Sending...' : 'Send Reply'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ticket ID</span>
                <span className="font-mono text-xs truncate max-w-[140px]">{ticket.id}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span>{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Updated</span>
                <span>{formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Assigned To</span>
                <span>{ticket.assigneeName || 'Unassigned'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Clock className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Ticket Created</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                {ticket.assigneeId && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                      <User className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Assigned to {ticket.assigneeName}</p>
                      <p className="text-xs text-muted-foreground">Processing your request</p>
                    </div>
                  </div>
                )}
                {ticket.status === 'RESOLVED' && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-success-foreground">
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Resolved</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(ticket.updatedAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
