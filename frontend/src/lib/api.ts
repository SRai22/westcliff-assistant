import type { AITriageResponse, Article, Message, Priority, Ticket, TicketStatus } from '@/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
type ApiRecord = Record<string, unknown>;

type ApiOptions = RequestInit & {
  query?: Record<string, string | number | undefined | null>;
};

async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { query, headers, ...init } = options;
  const search = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE}${path}${search.size ? `?${search.toString()}` : ''}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...init,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (payload as { error?: string; message?: string }).error ||
      (payload as { error?: string; message?: string }).message ||
      'Request failed';
    throw new Error(message);
  }

  return payload as T;
}

function mapAttachment(raw: ApiRecord) {
  return {
    id: String(raw.id ?? raw._id ?? raw.fileUrl ?? ''),
    name: String(raw.name ?? raw.fileName ?? ''),
    url: String(raw.url ?? raw.fileUrl ?? ''),
    type: String(raw.type ?? raw.mimeType ?? ''),
    size: Number(raw.size ?? raw.fileSize ?? 0),
  };
}

function mapTicket(raw: ApiRecord): Ticket {
  const attachments = Array.isArray(raw.attachments) ? raw.attachments as ApiRecord[] : [];

  return {
    id: String(raw.id ?? raw._id ?? ''),
    studentId: String(raw.studentId ?? ''),
    studentName: String(raw.studentName ?? ''),
    studentEmail: String(raw.studentEmail ?? ''),
    category: raw.category as Ticket['category'],
    service: String(raw.service ?? ''),
    priority: raw.priority as Priority,
    status: raw.status as TicketStatus,
    summary: String(raw.summary ?? ''),
    description: String(raw.description ?? ''),
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? raw.createdAt ?? ''),
    assigneeId: raw.assigneeId ? String(raw.assigneeId) : undefined,
    assigneeName: raw.assigneeName ? String(raw.assigneeName) : undefined,
    attachments: attachments.map(mapAttachment),
  };
}

function mapMessage(raw: ApiRecord): Message {
  return {
    id: String(raw.id ?? raw._id ?? ''),
    ticketId: String(raw.ticketId ?? ''),
    senderRole: raw.senderRole as Message['senderRole'],
    senderName: String(raw.senderName ?? ''),
    body: String(raw.body ?? ''),
    createdAt: String(raw.createdAt ?? ''),
    isInternalNote: Boolean(raw.isInternalNote),
  };
}

function mapArticle(raw: ApiRecord): Article {
  const tags = Array.isArray(raw.tags) ? raw.tags.map(String) : [];

  return {
    id: String(raw.id ?? raw._id ?? ''),
    title: String(raw.title ?? ''),
    category: raw.category as Article['category'],
    summary: String(raw.summary ?? ''),
    content: String(raw.content ?? ''),
    tags,
    updatedAt: String(raw.updatedAt ?? raw.createdAt ?? ''),
  };
}

export async function listTickets(filters: {
  status?: TicketStatus;
  priority?: Priority;
  category?: string;
  limit?: number;
} = {}) {
  const data = await apiRequest<{ tickets: ApiRecord[] }>('/tickets', {
    method: 'GET',
    query: filters,
  });

  return data.tickets.map(mapTicket);
}

export async function getTicket(ticketId: string) {
  const data = await apiRequest<{ ticket: ApiRecord }>(`/tickets/${ticketId}`);
  return mapTicket(data.ticket);
}

export async function getTicketMessages(ticketId: string) {
  const data = await apiRequest<{ messages: ApiRecord[] }>(`/tickets/${ticketId}/messages`);
  return data.messages.map(mapMessage);
}

export async function createTicketMessage(ticketId: string, body: string, isInternalNote = false) {
  const data = await apiRequest<{ data: ApiRecord }>(`/tickets/${ticketId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body, isInternalNote }),
  });

  return mapMessage({
    ...data.data,
    ticketId,
  });
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus, reason?: string) {
  const data = await apiRequest<{ ticket: ApiRecord }>(`/tickets/${ticketId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason }),
  });

  return data.ticket;
}

export async function listArticles(filters: {
  category?: string;
  search?: string;
  limit?: number;
} = {}) {
  const data = await apiRequest<{ articles: ApiRecord[] }>('/articles', {
    method: 'GET',
    query: filters,
  });

  return data.articles.map(mapArticle);
}

export async function getArticle(articleId: string) {
  const data = await apiRequest<{ article: ApiRecord }>(`/articles/${articleId}`);
  return mapArticle(data.article);
}

export async function startIntake(text: string, userContext?: Record<string, unknown>) {
  return apiRequest<AITriageResponse>('/tickets/intake/start', {
    method: 'POST',
    body: JSON.stringify({ text, userContext }),
  });
}

export async function answerIntake(
  triageResult: AITriageResponse,
  answers: Record<string, string | string[]>
) {
  return apiRequest<AITriageResponse>('/tickets/intake/answer', {
    method: 'POST',
    body: JSON.stringify({ triageResult, answers }),
  });
}

export async function confirmTicket(payload: {
  category: string;
  service?: string;
  priority: Priority;
  summary: string;
  description: string;
}) {
  const data = await apiRequest<{ ticket: { id: string } }>('/tickets/intake/confirm', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return data.ticket;
}

export async function summarizeTicket(ticketId: string, messages: Message[]) {
  return apiRequest<{ summary: string }>(`/tickets/${ticketId}/ai/summarize`, {
    method: 'POST',
    body: JSON.stringify({
      ticketId,
      messages: messages.map((message) => ({
        senderRole: message.senderRole,
        senderName: message.senderName,
        body: message.body,
        createdAt: message.createdAt,
      })),
    }),
  });
}

export async function draftTicketReply(ticketId: string, messages: Message[], tone = 'professional') {
  return apiRequest<{ draft: string }>(`/tickets/${ticketId}/ai/draft-reply`, {
    method: 'POST',
    body: JSON.stringify({
      ticketId,
      messages: messages.map((message) => ({
        senderRole: message.senderRole,
        senderName: message.senderName,
        body: message.body,
        createdAt: message.createdAt,
      })),
      tone,
    }),
  });
}
