import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send } from 'lucide-react';
import { ChatMessage, ChatMessageData, TypingIndicator } from './ChatMessage';
import { mockArticles, mockTickets } from '@/data/mockData';
import { Article, Category, Priority } from '@/types';

interface ConversationalTriageProps {
  initialQuery?: string;
  onBack: () => void;
  onTicketCreated: (ticketId: string) => void;
}

// Simulate AI responses - in production this would call your backend
function simulateAIResponse(
  userMessage: string, 
  conversationHistory: ChatMessageData[]
): { 
  content: string; 
  suggestedArticles?: Article[];
  ticketPreview?: { summary: string; description: string; category: string; priority: string };
  needsConfirmation?: boolean;
} {
  const lowerMessage = userMessage.toLowerCase();
  const messageCount = conversationHistory.filter(m => m.type === 'user').length;

  // First message - acknowledge and suggest articles
  if (messageCount === 1) {
    const matchedArticles = mockArticles.filter(a => 
      a.title.toLowerCase().includes(lowerMessage.split(' ')[0]) ||
      a.tags.some(t => lowerMessage.includes(t.toLowerCase()))
    ).slice(0, 2);

    if (matchedArticles.length > 0) {
      return {
        content: `I found some articles that might help with "${userMessage}". Take a look - if these don't solve your issue, just let me know more details and I'll create a support ticket for you.`,
        suggestedArticles: matchedArticles,
      };
    }

    return {
      content: `I understand you need help with "${userMessage}". Can you tell me a bit more about your situation? For example:\n\n• What have you already tried?\n• Is this urgent?\n• Any error messages you're seeing?`,
    };
  }

  // Second message - offer to create ticket
  if (messageCount === 2) {
    // Determine category based on keywords
    let category: Category = 'Student Services';
    let priority: Priority = 'MEDIUM';

    if (lowerMessage.includes('i-20') || lowerMessage.includes('visa') || lowerMessage.includes('international')) {
      category = 'International Affairs';
    } else if (lowerMessage.includes('password') || lowerMessage.includes('login') || lowerMessage.includes('computer')) {
      category = 'Information Technology';
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('tuition') || lowerMessage.includes('fee')) {
      category = 'Student Accounts';
    } else if (lowerMessage.includes('financial aid') || lowerMessage.includes('scholarship')) {
      category = 'Financial Aid';
    }

    if (lowerMessage.includes('urgent') || lowerMessage.includes('asap') || lowerMessage.includes('deadline')) {
      priority = 'HIGH';
    }

    const fullContext = conversationHistory
      .filter(m => m.type === 'user')
      .map(m => m.content)
      .join('\n\n');

    return {
      content: `Based on what you've told me, I'll create a support ticket for you. Here's a preview - let me know if you'd like to submit it or make any changes:`,
      ticketPreview: {
        summary: conversationHistory[0]?.content.slice(0, 100) || userMessage.slice(0, 100),
        description: fullContext,
        category,
        priority,
      },
      needsConfirmation: true,
    };
  }

  // Handle confirmation or additional info
  if (lowerMessage.includes('submit') || lowerMessage.includes('yes') || lowerMessage.includes('looks good')) {
    return {
      content: `Your ticket has been submitted! You'll receive updates via email and can track the status in "My Tickets". Is there anything else I can help you with?`,
    };
  }

  return {
    content: `Got it. Let me update the ticket with that information. Would you like to submit it now, or add anything else?`,
    ticketPreview: {
      summary: conversationHistory.find(m => m.type === 'user')?.content.slice(0, 100) || 'Support Request',
      description: conversationHistory.filter(m => m.type === 'user').map(m => m.content).join('\n\n'),
      category: 'Student Services',
      priority: 'MEDIUM',
    },
    needsConfirmation: true,
  };
}

export function ConversationalTriage({ initialQuery = '', onBack, onTicketCreated }: ConversationalTriageProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize with initial query
  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

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

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const aiResponse = simulateAIResponse(content, [...messages, userMessage]);
    
    const aiMessage: ChatMessageData = {
      id: `ai-${Date.now()}`,
      type: 'ai',
      content: aiResponse.content,
      timestamp: new Date(),
      suggestedArticles: aiResponse.suggestedArticles,
      ticketPreview: aiResponse.ticketPreview,
      actions: aiResponse.needsConfirmation ? [
        {
          label: 'Submit Ticket',
          onClick: () => handleSubmitTicket(),
        },
        {
          label: 'Edit Details',
          variant: 'outline',
          onClick: () => {
            setInput('I want to change: ');
            textareaRef.current?.focus();
          },
        },
      ] : undefined,
    };

    setIsTyping(false);
    setMessages(prev => [...prev, aiMessage]);
  };

  const handleSubmitTicket = () => {
    // Add confirmation message
    const confirmMessage: ChatMessageData = {
      id: `system-${Date.now()}`,
      type: 'system',
      content: 'Ticket submitted successfully',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, confirmMessage]);

    // In production, this would create a real ticket
    const newTicketId = `ticket-${Date.now()}`;
    
    setTimeout(() => {
      onTicketCreated(newTicketId);
    }, 1500);
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
          {/* Welcome message if no messages */}
          {messages.length === 0 && (
            <ChatMessage
              message={{
                id: 'welcome',
                type: 'ai',
                content: "Hi! I'm here to help you with any questions or issues. Just describe what you need, and I'll either find the answer or get you connected with the right team.",
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
          placeholder="Describe your issue or question..."
          value={input}
          onChange={e => setInput(e.target.value)}
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
