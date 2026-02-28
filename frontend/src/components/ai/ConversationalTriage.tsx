import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send } from 'lucide-react';
import { ChatMessage, ChatMessageData, TypingIndicator } from './ChatMessage';
import { Article } from '@/types';
import {
  startIntake,
  answerIntake,
  confirmIntake,
  fetchArticleById,
  IntakeTriageResponse,
  ConfirmIntakePayload,
} from '@/api/ai';

interface ConversationalTriageProps {
  initialQuery?: string;
  onBack: () => void;
  onTicketCreated: (ticketId: string) => void;
}

type Phase = 'start' | 'clarifying' | 'preview';

export function ConversationalTriage({ initialQuery = '', onBack, onTicketCreated }: ConversationalTriageProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [phase, setPhase] = useState<Phase>('start');
  const [triageResult, setTriageResult] = useState<IntakeTriageResponse | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize with initial query from home page
  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      handleSendMessage(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // ─── Confirm and create ticket ─────────────────────────────────────────────

  const handleSubmitTicket = async (payload: ConfirmIntakePayload) => {
    setIsTyping(true);
    try {
      const ticket = await confirmIntake(payload);

      const confirmedMsg: ChatMessageData = {
        id: `system-${Date.now()}`,
        type: 'system',
        content: 'Ticket submitted successfully',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, confirmedMsg]);

      setTimeout(() => {
        // Navigate to the real ticket — ticket.id comes from MongoDB (_id returned as id)
        const ticketId = String((ticket as unknown as Record<string, unknown>)._id ?? ticket.id ?? '');
        onTicketCreated(ticketId);
        navigate(`/tickets/${ticketId}`);
      }, 800);
    } catch (err) {
      const errorMsg: ChatMessageData = {
        id: `ai-err-${Date.now()}`,
        type: 'ai',
        content: `Sorry, I couldn't submit your ticket. ${err instanceof Error ? err.message : 'Please try again.'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
      setIsTyping(false);
    }
  };

  // ─── Build the ticket-preview AI message ───────────────────────────────────

  function buildPreviewMessage(
    intro: string,
    category: string,
    service: string,
    draft: { summary: string; description: string; priority: string },
  ): ChatMessageData {
    const payload: ConfirmIntakePayload = {
      category,
      service: service || undefined,
      priority: draft.priority,
      summary: draft.summary,
      description: draft.description,
    };

    return {
      id: `ai-${Date.now()}`,
      type: 'ai',
      content: intro,
      timestamp: new Date(),
      ticketPreview: {
        summary: draft.summary,
        description: draft.description,
        category,
        priority: draft.priority,
      },
      actions: [
        {
          label: 'Submit Ticket',
          onClick: () => handleSubmitTicket(payload),
        },
        {
          label: 'Edit Details',
          variant: 'outline' as const,
          onClick: () => {
            setInput('I want to change: ');
            textareaRef.current?.focus();
          },
        },
      ],
    };
  }

  // ─── Send message handler ──────────────────────────────────────────────────

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessageData = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      if (phase === 'start') {
        // ── Phase 1: initial triage ──────────────────────────────────────────
        const result = await startIntake(content.trim());
        setTriageResult(result);

        // Fetch suggested articles in parallel (fail gracefully)
        const articles: Article[] = (
          await Promise.all(result.suggestedArticleIds.map(id => fetchArticleById(id)))
        ).filter(Boolean) as Article[];

        if (result.clarifyingQuestions.length > 0) {
          // Show clarifying questions — wait for user's answer
          const questionList = result.clarifyingQuestions
            .map((q, i) => `${i + 1}. ${q}`)
            .join('\n');

          const aiMsg: ChatMessageData = {
            id: `ai-${Date.now()}`,
            type: 'ai',
            content: `I've categorised your issue as **${result.category}**. To make sure we get you the right help, I have a few questions:\n\n${questionList}\n\nPlease answer these and I'll create a tailored ticket for you.`,
            timestamp: new Date(),
            suggestedArticles: articles.length > 0 ? articles : undefined,
          };

          setMessages(prev => [...prev, aiMsg]);
          setPhase('clarifying');
        } else {
          // No clarifying questions — go straight to ticket preview
          const aiMsg = buildPreviewMessage(
            `I've analysed your issue and prepared a ticket draft${articles.length > 0 ? ' (see related articles below)' : ''}. Here's a preview — submit when you're happy or let me know if you'd like changes:`,
            result.category,
            result.service,
            result.ticketDraft,
          );
          if (articles.length > 0) {
            aiMsg.suggestedArticles = articles;
          }

          setMessages(prev => [...prev, aiMsg]);
          setPhase('preview');
        }
      } else {
        // ── Phase 2 & beyond: answer clarifying questions or request edits ───
        if (!triageResult) {
          throw new Error('Missing triage context. Please start over.');
        }

        const followup = await answerIntake(triageResult, [content.trim()]);

        const aiMsg = buildPreviewMessage(
          `Thanks for the details! Here's your updated ticket draft — submit when ready, or tell me anything you'd like to change:`,
          followup.category,
          followup.service,
          followup.ticketDraft,
        );

        setMessages(prev => [...prev, aiMsg]);
        setPhase('preview');
      }
    } catch (err) {
      const errorMsg: ChatMessageData = {
        id: `ai-err-${Date.now()}`,
        type: 'ai',
        content: `Sorry, I ran into an error. ${err instanceof Error ? err.message : 'Please try again.'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  return (
    <div className="container max-w-3xl py-6 h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Get Help</h1>
          <p className="text-sm text-muted-foreground">Chat with our AI assistant</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        <div className="space-y-4 pb-4">
          {messages.length === 0 && (
            <ChatMessage
              message={{
                id: 'welcome',
                type: 'ai',
                content: "Hi! I'm here to help you with any questions or issues. Just describe what you need and I'll either find the answer or get you connected with the right team.",
                timestamp: new Date(),
              }}
            />
          )}

          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isTyping && <TypingIndicator />}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="chat-input-wrapper mt-4">
        <Textarea
          ref={textareaRef}
          placeholder={
            phase === 'clarifying'
              ? 'Answer the questions above...'
              : phase === 'preview'
              ? 'Tell me what to change, or click Submit Ticket above...'
              : 'Describe your issue or question...'
          }
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[44px] max-h-32 resize-none border-0 focus-visible:ring-0 bg-transparent"
          rows={1}
          disabled={isTyping}
        />
        <Button
          size="icon"
          onClick={() => handleSendMessage(input)}
          disabled={!input.trim() || isTyping}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
