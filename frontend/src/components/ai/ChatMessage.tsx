import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Article } from '@/types';
import { Link } from 'react-router-dom';

export type MessageType = 'user' | 'ai' | 'system';

export interface ChatMessageData {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  // For AI suggestions
  suggestedArticles?: Article[];
  // For ticket preview
  ticketPreview?: {
    summary: string;
    description: string;
    category: string;
    priority: string;
  };
  // For confirmation actions
  actions?: {
    label: string;
    variant?: 'default' | 'outline';
    onClick: () => void;
  }[];
}

interface ChatMessageProps {
  message: ChatMessageData;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
      'flex gap-3 animate-slide-up',
      isUser ? 'flex-row-reverse' : 'flex-row'
    )}>
      {/* Avatar */}
      <div className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
        isUser ? 'bg-primary' : 'bg-muted'
      )}>
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-foreground" />
        )}
      </div>

      {/* Message content */}
      <div className={cn(
        'flex flex-col gap-3 max-w-[80%]',
        isUser ? 'items-end' : 'items-start'
      )}>
        <div className={cn(
          isUser ? 'user-bubble' : 'ai-bubble'
        )}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Suggested Articles */}
        {message.suggestedArticles && message.suggestedArticles.length > 0 && (
          <div className="w-full space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Related articles:</p>
            {message.suggestedArticles.map(article => (
              <Link key={article.id} to={`/kb/${article.id}`}>
                <Card className="p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                  <h4 className="text-sm font-medium line-clamp-1">{article.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                    {article.summary}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Ticket Preview */}
        {message.ticketPreview && (
          <Card className="w-full p-4 border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">Ticket Preview</span>
              <div className="flex gap-1.5">
                <Badge variant="outline" className="text-xs">
                  {message.ticketPreview.category}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={cn(
                    'text-xs',
                    message.ticketPreview.priority === 'HIGH' && 'priority-high',
                    message.ticketPreview.priority === 'MEDIUM' && 'priority-medium',
                    message.ticketPreview.priority === 'LOW' && 'priority-low',
                  )}
                >
                  {message.ticketPreview.priority}
                </Badge>
              </div>
            </div>
            <h4 className="font-medium text-sm">{message.ticketPreview.summary}</h4>
            <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
              {message.ticketPreview.description}
            </p>
          </Card>
        )}

        {/* Action buttons */}
        {message.actions && message.actions.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {message.actions.map((action, idx) => (
              <Button
                key={idx}
                size="sm"
                variant={action.variant || 'default'}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <Bot className="h-4 w-4 text-foreground" />
      </div>
      <div className="ai-bubble flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-foreground/40 animate-typing" style={{ animationDelay: '0ms' }} />
        <span className="h-2 w-2 rounded-full bg-foreground/40 animate-typing" style={{ animationDelay: '200ms' }} />
        <span className="h-2 w-2 rounded-full bg-foreground/40 animate-typing" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  );
}
