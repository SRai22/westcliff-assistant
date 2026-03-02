import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { TICKET_STATUSES, PRIORITIES } from '@/types';
import type { Message, Ticket, TicketStatus, Priority } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { categoryIcons } from '@/lib/categoryIcons';
import {
  createTicketMessage,
  draftTicketReply,
  getTicket,
  getTicketMessages,
  summarizeTicket,
  updateTicketStatus,
} from '@/lib/api';

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

export default function AdminTicketDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [aiDraft, setAiDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!ticketId) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    Promise.all([getTicket(ticketId), getTicketMessages(ticketId)])
      .then(([ticketData, messageData]) => {
        if (!isActive) {
          return;
        }

        setTicket(ticketData);
        setMessages(messageData);
      })
      .catch((error) => {
        console.error('Failed to load admin ticket:', error);
        if (isActive) {
          setTicket(null);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [ticketId]);

  if (isLoading) {
    return (
      <div className="container py-12 text-center text-muted-foreground">
        Loading ticket...
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

  const publicMessages = messages.filter((message) => !message.isInternalNote);
  const internalNotes = messages.filter((message) => message.isInternalNote);

  const handleStatusChange = async (nextStatus: TicketStatus) => {
    if (!ticketId) {
      return;
    }

    try {
      const updated = await updateTicketStatus(ticketId, nextStatus);
      setTicket((prev) => prev ? {
        ...prev,
        status: nextStatus,
        updatedAt: String(updated.updatedAt ?? new Date().toISOString()),
      } : prev);
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  };

  const handleSendReply = async () => {
    if (!ticketId || !replyText.trim()) {
      return;
    }

    try {
      const message = await createTicketMessage(ticketId, replyText.trim());
      setMessages((prev) => [...prev, message]);
      setReplyText('');
    } catch (error) {
      console.error('Failed to send reply:', error);
    }
  };

  const handleAddNote = async () => {
    if (!ticketId || !internalNote.trim()) {
      return;
    }

    try {
      const message = await createTicketMessage(ticketId, internalNote.trim(), true);
      setMessages((prev) => [...prev, message]);
      setInternalNote('');
    } catch (error) {
      console.error('Failed to add internal note:', error);
    }
  };

  const handleAISummarize = async () => {
    if (!ticketId) {
      return;
    }

    setIsGenerating(true);

    try {
      const response = await summarizeTicket(ticketId, messages);
      setAiDraft(response.summary);
    } catch (error) {
      console.error('Failed to summarize ticket:', error);
      setAiDraft(error instanceof Error ? error.message : 'Failed to summarize ticket.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIDraftResponse = async () => {
    if (!ticketId) {
      return;
    }

    setIsGenerating(true);

    try {
      const response = await draftTicketReply(ticketId, messages);
      setAiDraft(response.draft);
    } catch (error) {
      console.error('Failed to draft reply:', error);
      setAiDraft(error instanceof Error ? error.message : 'Failed to draft reply.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAISuggestSteps = async () => {
    if (!ticketId) {
      return;
    }

    setIsGenerating(true);

    try {
      const response = await summarizeTicket(ticketId, messages);
      setAiDraft(`Suggested next steps endpoint is not available yet.\n\nCurrent thread summary:\n${response.summary}`);
    } catch (error) {
      console.error('Failed to summarize for next steps:', error);
      setAiDraft(error instanceof Error ? error.message : 'Failed to summarize ticket.');
    } finally {
      setIsGenerating(false);
    }
  };

  const insertDraft = () => {
    setReplyText(aiDraft);
    setAiDraft('');
  };

  return (
    <div className="container py-8">
      <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl">
                  {categoryIcons[ticket.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl mb-2">{ticket.summary}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span>{ticket.studentName || 'Student'}</span>
                    {ticket.studentEmail && (
                      <>
                        <span>•</span>
                        <span>{ticket.studentEmail}</span>
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={ticket.status} onValueChange={(value: TicketStatus) => handleStatusChange(value)}>
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TICKET_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>{statusLabels[status]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={ticket.priority} disabled>
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((priority) => (
                          <SelectItem key={priority} value={priority}>{priorityLabels[priority]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={ticket.assigneeId || 'unassigned'} disabled>
                      <SelectTrigger className="w-[160px] h-8">
                        <SelectValue placeholder="Assign to..." />
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
                  {publicMessages.map((message) => (
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
                  {internalNotes.map((note) => (
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

                  <div className="pt-4 border-t border-border">
                    <Textarea
                      placeholder="Add an internal note (only visible to staff)..."
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      rows={2}
                    />
                    <div className="flex justify-end mt-2">
                      <Button size="sm" onClick={handleAddNote} disabled={!internalNote.trim()}>
                        <Lock className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Textarea
                  placeholder="Type your reply to the student..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                />
                <div className="flex items-center justify-end gap-2">
                  <Button onClick={handleSendReply} disabled={!replyText.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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

              {(isGenerating || aiDraft) && (
                <div className="mt-4 pt-4 border-t border-border">
                  {isGenerating ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Generating...
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-secondary/50 text-sm whitespace-pre-wrap">
                        {aiDraft}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={insertDraft} className="flex-1">
                          Insert into Reply
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setAiDraft('')}>
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ticket ID</span>
                <span className="font-mono">{ticket.id}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Category</span>
                <Badge variant="outline">{ticket.category}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Service</span>
                <span>{ticket.service || 'General Inquiry'}</span>
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
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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
