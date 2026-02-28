import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  Filter,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { categoryIcons } from '@/data/mockData';
import { Ticket, TicketStatus, Priority, TICKET_STATUSES, PRIORITIES } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

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

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  useEffect(() => {
    fetch(`${API_BASE}/tickets`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load tickets');
        return res.json();
      })
      .then(data => setTickets((data.tickets as Record<string, unknown>[]).map(mapApiTicket)))
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load tickets'))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = !searchQuery ||
      ticket.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Sort by most recent
  const sortedTickets = [...filteredTickets].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Tickets</h1>
          <p className="text-muted-foreground">Track your support requests</p>
        </div>
        <Link to="/">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                className="pl-10"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {TICKET_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>
                      {statusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  {PRIORITIES.map(priority => (
                    <SelectItem key={priority} value={priority}>
                      {priorityLabels[priority]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      {sortedTickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {tickets.length === 0
                ? "You haven't created any tickets yet."
                : 'No tickets match your filters.'}
            </p>
            {tickets.length === 0 ? (
              <Link to="/">
                <Button>Create Your First Request</Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedTickets.map(ticket => (
            <Link key={ticket.id} to={`/tickets/${ticket.id}`}>
              <Card className="transition-all hover:shadow-md hover:border-primary/20">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Category Icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-xl">
                      {categoryIcons[ticket.category]}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold line-clamp-1">{ticket.summary}</h3>
                        <Badge
                          className={cn(
                            'shrink-0',
                            ticket.status === 'NEW' && 'status-new',
                            ticket.status === 'IN_PROGRESS' && 'status-in-progress',
                            ticket.status === 'WAITING' && 'status-waiting',
                            ticket.status === 'RESOLVED' && 'status-resolved',
                          )}
                        >
                          {statusLabels[ticket.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {ticket.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            ticket.priority === 'HIGH' && 'priority-high border-destructive/30',
                            ticket.priority === 'MEDIUM' && 'priority-medium border-warning/30',
                            ticket.priority === 'LOW' && 'priority-low border-success/30',
                          )}
                        >
                          {priorityLabels[ticket.priority]}
                        </Badge>
                      </div>
                    </div>

                    <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
