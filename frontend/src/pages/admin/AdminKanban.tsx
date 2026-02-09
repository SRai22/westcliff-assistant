import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search,
  GripVertical,
  Clock,
  User,
} from 'lucide-react';
import { mockTickets, categoryIcons, staffMembers } from '@/data/mockData';
import { Ticket, TicketStatus, Priority, TICKET_STATUSES } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const statusLabels: Record<TicketStatus, string> = {
  NEW: 'New',
  IN_PROGRESS: 'In Progress',
  WAITING: 'Waiting',
  RESOLVED: 'Resolved',
};

const statusColors: Record<TicketStatus, string> = {
  NEW: 'bg-primary/10 border-primary/20',
  IN_PROGRESS: 'bg-warning/10 border-warning/20',
  WAITING: 'bg-purple-500/10 border-purple-500/20',
  RESOLVED: 'bg-success/10 border-success/20',
};

const priorityLabels: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export default function AdminKanbanPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    return !searchQuery || 
      ticket.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.studentName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Group tickets by status
  const ticketsByStatus = TICKET_STATUSES.reduce((acc, status) => {
    acc[status] = filteredTickets.filter(t => t.status === status);
    return acc;
  }, {} as Record<TicketStatus, Ticket[]>);

  const handleStatusChange = (ticketId: string, newStatus: TicketStatus) => {
    setTickets(prev => 
      prev.map(t => t.id === ticketId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t)
    );
  };

  const handleAssigneeChange = (ticketId: string, assigneeId: string) => {
    const assignee = staffMembers.find(s => s.id === assigneeId);
    setTickets(prev => 
      prev.map(t => t.id === ticketId 
        ? { ...t, assigneeId, assigneeName: assignee?.name, updatedAt: new Date().toISOString() } 
        : t
      )
    );
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Ticket Dashboard</h1>
          <p className="text-muted-foreground">Manage and track all support tickets</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            className="pl-10"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {TICKET_STATUSES.map(status => (
          <Card key={status} className={cn('border-l-4', statusColors[status])}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{statusLabels[status]}</p>
                  <p className="text-2xl font-bold">{ticketsByStatus[status].length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {TICKET_STATUSES.map(status => (
          <div key={status} className="kanban-column min-w-[280px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <div className={cn(
                  'h-2 w-2 rounded-full',
                  status === 'NEW' && 'bg-primary',
                  status === 'IN_PROGRESS' && 'bg-warning',
                  status === 'WAITING' && 'bg-purple-500',
                  status === 'RESOLVED' && 'bg-success',
                )} />
                {statusLabels[status]}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {ticketsByStatus[status].length}
              </Badge>
            </div>

            <div className="space-y-3 flex-1">
              {ticketsByStatus[status].map(ticket => (
                <KanbanCard 
                  key={ticket.id}
                  ticket={ticket}
                  onStatusChange={handleStatusChange}
                  onAssigneeChange={handleAssigneeChange}
                />
              ))}
              {ticketsByStatus[status].length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No tickets
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface KanbanCardProps {
  ticket: Ticket;
  onStatusChange: (ticketId: string, status: TicketStatus) => void;
  onAssigneeChange: (ticketId: string, assigneeId: string) => void;
}

function KanbanCard({ ticket, onStatusChange, onAssigneeChange }: KanbanCardProps) {
  return (
    <Card className="kanban-card">
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab mt-0.5" />
        <div className="flex-1 min-w-0">
          <Link to={`/admin/tickets/${ticket.id}`}>
            <h4 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
              {ticket.summary}
            </h4>
          </Link>
          
          <div className="flex items-center gap-2 mt-2 flex-wrap">
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
            <span className="text-xs">{categoryIcons[ticket.category]}</span>
          </div>

          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
          </div>

          {/* Quick Actions */}
          <div className="mt-3 pt-3 border-t border-border space-y-2">
            <Select
              value={ticket.status}
              onValueChange={(value: TicketStatus) => onStatusChange(ticket.id, value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TICKET_STATUSES.map(s => (
                  <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={ticket.assigneeId || 'unassigned'}
              onValueChange={(value) => onAssigneeChange(ticket.id, value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <User className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Assign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {staffMembers.map(staff => (
                  <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  );
}
