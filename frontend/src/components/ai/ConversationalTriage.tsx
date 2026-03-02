import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send } from 'lucide-react';
import { ChatMessage, ChatMessageData, TypingIndicator } from './ChatMessage';
import type { AITriageResponse } from '@/types';
import { answerIntake, confirmTicket, startIntake } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface ConversationalTriageProps {
  initialQuery?: string;
  onBack: () => void;
  onTicketCreated: (ticketId: string) => void;
}

export function ConversationalTriage({ initialQuery = '', onBack, onTicketCreated }: ConversationalTriageProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [triageResult, setTriageResult] = useState<AITriageResponse | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) {
      return;
    }

    const trimmedContent = content.trim();
    const userMessage: ChatMessageData = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: trimmedContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const nextTriage = triageResult
        ? await answerIntake(
            triageResult,
            Object.fromEntries(
              triageResult.clarifyingQuestions.map((question) => [question.id, trimmedContent])
            )
          )
        : await startIntake(trimmedContent, {
            name: user?.name,
            email: user?.email,
            role: user?.role,
          });

      setTriageResult(nextTriage);

      const questionsText = nextTriage.clarifyingQuestions.length > 0
        ? `\n\nReply with any extra details about:\n${nextTriage.clarifyingQuestions
            .map((question, index) => `${index + 1}. ${question.question}`)
            .join('\n')}`
        : '';

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content:
            nextTriage.handoffRecommendation === 'ARTICLE_FIRST'
              ? `I found related resources and prepared a ticket draft if those do not solve it.${questionsText}`
              : `I prepared a ticket draft based on what you shared.${questionsText}`,
          timestamp: new Date(),
          suggestedArticles: nextTriage.suggestedArticles,
          ticketPreview: {
            summary: nextTriage.ticketDraft.summary,
            description: nextTriage.ticketDraft.description,
            category: nextTriage.category,
            priority: nextTriage.ticketDraft.priority,
          },
          actions: [
            {
              label: 'Submit Ticket',
              onClick: () => handleSubmitTicket(nextTriage),
            },
            {
              label: 'Add More Details',
              variant: 'outline',
              onClick: () => {
                setInput('Additional details: ');
                textareaRef.current?.focus();
              },
            },
          ],
        },
      ]);
    } catch (error) {
      console.error('Failed to process triage:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-error-${Date.now()}`,
          type: 'ai',
          content: error instanceof Error ? error.message : 'Unable to process your request right now.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmitTicket = async (result = triageResult) => {
    if (!result) {
      return;
    }

    try {
      const ticket = await confirmTicket({
        category: result.category,
        service: result.service,
        priority: result.ticketDraft.priority,
        summary: result.ticketDraft.summary,
        description: result.ticketDraft.description,
      });

      setTriageResult(null);
      setMessages((prev) => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          type: 'system',
          content: 'Ticket submitted successfully',
          timestamp: new Date(),
        },
      ]);

      setTimeout(() => {
        onTicketCreated(ticket.id);
      }, 800);
    } catch (error) {
      console.error('Failed to create ticket:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `system-error-${Date.now()}`,
          type: 'system',
          content: error instanceof Error ? error.message : 'Ticket creation failed',
          timestamp: new Date(),
        },
      ]);
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
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Get Help</h1>
          <p className="text-sm text-muted-foreground">Chat with our AI assistant</p>
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        <div className="space-y-4 pb-4">
          {messages.length === 0 && (
            <ChatMessage
              message={{
                id: 'welcome',
                type: 'ai',
                content: "Hi! Describe your issue and I'll pull in the intake service to draft the right support ticket.",
                timestamp: new Date(),
              }}
            />
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isTyping && <TypingIndicator />}
        </div>
      </ScrollArea>

      <div className="chat-input-wrapper mt-4">
        <Textarea
          ref={textareaRef}
          placeholder="Describe your issue or question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[44px] max-h-32 resize-none border-0 focus-visible:ring-0 bg-transparent"
          rows={1}
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
