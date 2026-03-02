import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  ArrowRight, 
  Ticket, 
  Clock,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConversationalTriage } from '@/components/ai/ConversationalTriage';
import type { Article, Ticket } from '@/types';
import { listArticles, listTickets } from '@/lib/api';
import { mockArticles } from '@/data/mockData';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [articles, setArticles] = useState<Article[]>(mockArticles.slice(0, 4));

  useEffect(() => {
    let isActive = true;

    Promise.all([
      listTickets({ limit: 20 }),
      listArticles({ limit: 4 }),
    ])
      .then(([ticketData, articleData]) => {
        if (!isActive) {
          return;
        }

        setTickets(ticketData);
        setArticles(articleData.length > 0 ? articleData : mockArticles.slice(0, 4));
      })
      .catch((error) => {
        console.error('Failed to load home page data:', error);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const openTickets = tickets.filter(t => t.status !== 'RESOLVED');
  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  const handleStartChat = () => {
    setShowChat(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && query.trim()) {
      e.preventDefault();
      setShowChat(true);
    }
  };

  if (showChat) {
    return (
      <ConversationalTriage 
        initialQuery={query} 
        onBack={() => {
          setShowChat(false);
          setQuery('');
        }}
        onTicketCreated={(ticketId) => {
          navigate(`/tickets/${ticketId}`);
        }}
      />
    );
  }

  return (
    <div className="container py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Greeting */}
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold">
              Hi, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              How can we help you today?
            </p>
          </div>

          {/* Chat Entry */}
          <Card className="shadow-card animate-slide-up overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                    <MessageSquare className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Chat with Support</h3>
                    <p className="text-sm text-muted-foreground">
                      Describe your issue and get instant help
                    </p>
                  </div>
                </div>

                <div className="chat-input-wrapper">
                  <Textarea
                    placeholder="What do you need help with?"
                    className="min-h-[60px] max-h-32 resize-none border-0 focus-visible:ring-0 bg-transparent text-base"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={2}
                  />
                  <Button 
                    size="icon"
                    onClick={handleStartChat}
                    disabled={!query.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Quick action bar */}
              <div className="border-t border-border bg-muted/30 px-6 py-3 flex items-center gap-4">
                <span className="text-xs text-muted-foreground">Or browse:</span>
                <Link to="/kb" className="text-sm font-medium text-primary hover:underline">
                  Help Articles
                </Link>
                <Link to="/tickets" className="text-sm font-medium text-primary hover:underline">
                  My Tickets
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/kb">
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/20 cursor-pointer group">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary group-hover:bg-primary/10 transition-colors">
                    <FileText className="h-5 w-5 text-secondary-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">Knowledge Base</h3>
                    <p className="text-sm text-muted-foreground">
                      Browse help articles
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </Link>
            <Link to="/tickets">
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/20 cursor-pointer group">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary group-hover:bg-primary/10 transition-colors">
                    <Ticket className="h-5 w-5 text-secondary-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">My Tickets</h3>
                    <p className="text-sm text-muted-foreground">
                      View your requests
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Popular Articles */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Popular Articles</h2>
            <div className="space-y-3">
              {articles.map(article => (
                <Link key={article.id} to={`/kb/${article.id}`}>
                  <Card className="transition-all hover:shadow-md hover:border-primary/20">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{article.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {article.summary}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {article.category.split(' ').slice(0, 2).join(' ')}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Your Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Your Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Open Tickets Count */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm">Open Tickets</span>
                <Badge variant="default">{openTickets.length}</Badge>
              </div>

              {/* Recent Tickets */}
              {recentTickets.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Recent</p>
                  {recentTickets.map(ticket => (
                    <Link key={ticket.id} to={`/tickets/${ticket.id}`}>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                        <div className={cn(
                          'h-2 w-2 rounded-full',
                          ticket.status === 'NEW' && 'bg-primary',
                          ticket.status === 'IN_PROGRESS' && 'bg-warning',
                          ticket.status === 'WAITING' && 'bg-purple-500',
                          ticket.status === 'RESOLVED' && 'bg-success',
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{ticket.summary}</p>
                          <p className="text-xs text-muted-foreground">{ticket.status}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent tickets
                </p>
              )}

              <Link to="/tickets">
                <Button variant="outline" size="sm" className="w-full">
                  View All Tickets
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Need Help */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Need immediate help?</h3>
              <p className="text-sm opacity-90 mb-4">
                Start a conversation and our AI will help you find answers or connect you with the right team.
              </p>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => {
                  setQuery('');
                  document.querySelector('textarea')?.focus();
                }}
              >
                Start chatting
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
