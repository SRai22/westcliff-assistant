import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Send,
  Sparkles,
  FileText,
  MessageSquare,
  Lock,
  Bot,
  Wand2,
  ListChecks,
  RefreshCw,
} from 'lucide-react';
import { categoryIcons } from '@/data/mockData';
import { Message, Ticket, TicketStatus, Priority, TICKET_STATUSES, PRIORITIES } from '@/types';
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

export default function AdminTicketDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [aiDraft, setAiDraft] = useState('');
  const [aiDraftLabel, setAiDraftLabel] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
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

    socket.on('status-changed', (data: { ticketId: string; newStatus: string }) => {
      setTicket(prev => prev ? { ...prev, status: data.newStatus as Ticket['status'] } : prev);
    });

    return () => {
      socket.emit('leave-ticket', ticketId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [ticketId]);

  // Initial data load
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

  const publicMessages = messages.filter(m => !m.isInternalNote);
  const internalNotes = messages.filter(m => m.isInternalNote);

  // Status change with optimistic update + revert on failure
  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticketId || !ticket) return;
    const oldStatus = ticket.status;

    setTicket(prev => prev ? { ...prev, status: newStatus } : prev);

    try {
      const res = await fetch(`${API_BASE}/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        setTicket(prev => prev ? { ...prev, status: oldStatus } : prev);
      }
    } catch {
      setTicket(prev => prev ? { ...prev, status: oldStatus } : prev);
    }
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
      // Message arrives via socket new-message event (with deduplication)
      setReplyText('');
    } catch {
      // error handling in PL-02
    } finally {
      setIsSending(false);
    }
  };

  const handleAddNote = async () => {
    if (!internalNote.trim() || !ticketId) return;
    setIsAddingNote(true);
    try {
      const res = await fetch(`${API_BASE}/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ body: internalNote.trim(), isInternalNote: true }),
      });
      if (!res.ok) throw new Error('Failed to add note');
      // Note arrives via socket new-message event (with deduplication)
      setInternalNote('');
    } catch {
      // error handling in PL-02
    } finally {
      setIsAddingNote(false);
    }
  };

  // FE-08: Wire to POST /tickets/:id/ai/summarize
  const handleAISummarize = async () => {
    if (!ticketId) return;
    setIsGenerating(true);
    setAiDraft('');
    try {
      const res = await fetch(`${API_BASE}/tickets/${ticketId}/ai/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        // ticketId required by Zod schema; empty messages array → backend fetches from DB
        body: JSON.stringify({ ticketId, messages: [] }),
      });
      if (!res.ok) throw new Error('Failed to summarize');
      const data = await res.json() as { summary: string };
      setAiDraftLabel('AI Summary');
      setAiDraft(data.summary ?? '');
    } catch {
      setAiDraftLabel('AI Summary');
      setAiDraft('Failed to generate summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // FE-08: Wire to POST /tickets/:id/ai/draft-reply
  const handleAIDraftResponse = async () => {
    if (!ticketId) return;
    setIsGenerating(true);
    setAiDraft('');
    try {
      const res = await fetch(`${API_BASE}/tickets/${ticketId}/ai/draft-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        // ticketId required by Zod schema; empty messages array → backend fetches from DB
        body: JSON.stringify({ ticketId, messages: [], tone: 'professional' }),
      });
      if (!res.ok) throw new Error('Failed to generate draft');
      const data = await res.json() as { draft: string };
      setAiDraftLabel('AI Draft Response');
      setAiDraft(data.draft ?? '');
    } catch {
      setAiDraftLabel('AI Draft Response');
      setAiDraft('Failed to generate draft. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAISuggestSteps = async () => {
    if (!ticketId) return;
    setIsGenerating(true);
    setAiDraft('');
    try {
      const res = await fetch(`${API_BASE}/tickets/${ticketId}/ai/suggest-steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        // ticketId required by Zod schema; empty messages array → backend fetches from DB
        body: JSON.stringify({ ticketId, messages: [] }),
      });
      if (!res.ok) throw new Error('Failed to generate steps');
      const data = await res.json() as { steps: string[] };
      setAiDraftLabel('AI Suggested Steps');
      setAiDraft((data.steps ?? []).map((s, i) => `${i + 1}. ${s}`).join('\n'));
    } catch {
      setAiDraftLabel('AI Suggested Steps');
      setAiDraft('Failed to generate steps. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const insertDraft = () => {
    setReplyText(aiDraft);
    setAiDraft('');
    setAiDraftLabel('');
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
        <Button onClick={() => navigate('/admin')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span>{ticket.studentName}</span>
                    <span>•</span>
                    <span>{ticket.studentEmail}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status — wired to PATCH /tickets/:id/status */}
                    <Select
                      value={ticket.status}
                      onValueChange={(value) => handleStatusChange(value as TicketStatus)}
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TICKET_STATUSES.map(s => (
                          <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Priority — read-only display (no PATCH endpoint yet) */}
                    <Select value={ticket.priority} disabled>
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map(p => (
                          <SelectItem key={p} value={p}>{priorityLabels[p]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Assignee — read-only display (no PATCH endpoint yet) */}
                    <Select value={ticket.assigneeId || 'unassigned'} disabled>
                      <SelectTrigger className="w-[160px] h-8">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {ticket.assigneeId && ticket.assigneeName && (
                          <SelectItem value={ticket.assigneeId}>{ticket.assigneeName}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Messages Tabs */}
          <Card>
            <Tabs defaultValue="conversation">
              <CardHeader className="pb-0">
                <TabsList>
                  <TabsTrigger value="conversation" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Conversation
                  </TabsTrigger>
                  <TabsTrigger value="internal" className="gap-2">
                    <Lock className="h-4 w-4" />
                    Internal Notes
                    {internalNotes.length > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {internalNotes.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <TabsContent value="conversation" className="m-0">
                <CardContent className="pt-6 space-y-4">
                  {publicMessages.map(message => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  {publicMessages.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No messages yet.
                    </p>
                  )}
                </CardContent>
              </TabsContent>

              <TabsContent value="internal" className="m-0">
                <CardContent className="pt-6 space-y-4">
                  {internalNotes.map(note => (
                    <div key={note.id} className="p-3 rounded-lg bg-muted/50 border border-dashed border-border">
                      <div className="flex items-center gap-2 mb-2 text-sm">
                        <Lock className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{note.senderName}</span>
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm">{note.body}</p>
                    </div>
                  ))}
                  {internalNotes.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No internal notes yet.
                    </p>
                  )}

                  {/* Add Internal Note */}
                  <div className="pt-4 border-t border-border">
                    <Textarea
                      placeholder="Add an internal note (only visible to staff)..."
                      value={internalNote}
                      onChange={e => setInternalNote(e.target.value)}
                      rows={2}
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={handleAddNote}
                        disabled={!internalNote.trim() || isAddingNote}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        {isAddingNote ? 'Adding...' : 'Add Note'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Reply Box */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Textarea
                  placeholder="Type your reply to the student..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  rows={4}
                />
                <div className="flex items-center justify-end gap-2">
                  <Button onClick={handleSendReply} disabled={!replyText.trim() || isSending}>
                    <Send className="h-4 w-4 mr-2" />
                    {isSending ? 'Sending...' : 'Send Reply'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Assist Sidebar */}
        <div className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Assist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handleAISummarize}
                disabled={isGenerating}
              >
                <FileText className="h-4 w-4" />
                Summarize Thread
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handleAIDraftResponse}
                disabled={isGenerating}
              >
                <Wand2 className="h-4 w-4" />
                Draft Response
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handleAISuggestSteps}
                disabled={isGenerating}
              >
                <ListChecks className="h-4 w-4" />
                Suggest Next Steps
              </Button>

              {/* AI Output */}
              {(isGenerating || aiDraft) && (
                <div className="mt-4 pt-4 border-t border-border">
                  {isGenerating ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Generating...
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {aiDraftLabel && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Bot className="h-3 w-3" />
                          <span>{aiDraftLabel} — AI-generated, review before sending</span>
                        </div>
                      )}
                      <div className="p-3 rounded-lg bg-secondary/50 text-sm whitespace-pre-wrap">
                        {aiDraft}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={insertDraft} className="flex-1">
                          Insert into Reply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setAiDraft(''); setAiDraftLabel(''); }}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ticket ID</span>
                <span className="font-mono text-xs truncate max-w-[140px]">{ticket.id}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Category</span>
                <Badge variant="outline">{ticket.category}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Service</span>
                <span>{ticket.service}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span>{formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className={cn(
      'flex gap-3',
      message.senderRole === 'STUDENT' && 'flex-row-reverse'
    )}>
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
  );
}
