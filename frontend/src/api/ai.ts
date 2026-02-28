/**
 * AI API client
 *
 * Wraps the backend AI proxy endpoints for the intake triage flow.
 * All calls go through the backend — never directly to the AI service.
 */

import { Article } from '@/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TicketDraft {
  summary: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface IntakeTriageResponse {
  category: string;
  service: string;
  clarifyingQuestions: string[];
  suggestedArticleIds: string[];
  ticketDraft: TicketDraft;
  confidence: number;
  handoffRecommendation: 'ARTICLE_FIRST' | 'CREATE_TICKET';
}

export interface IntakeFollowupResponse {
  category: string;
  service: string;
  ticketDraft: TicketDraft;
  confidence: number;
  additionalContext?: string;
}

export interface ConfirmIntakePayload {
  category: string;
  service?: string;
  priority: string;
  summary: string;
  description: string;
}

export interface ConfirmedTicket {
  id: string;
  category: string;
  priority: string;
  status: string;
  summary: string;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, options: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...options });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

// ─── Intake flow ──────────────────────────────────────────────────────────────

/** POST /tickets/intake/start — initial triage of a student issue */
export async function startIntake(
  text: string,
  userContext?: Record<string, unknown>,
): Promise<IntakeTriageResponse> {
  return apiFetch<IntakeTriageResponse>(`${API_BASE}/tickets/intake/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, userContext }),
  });
}

/** POST /tickets/intake/answer — refine draft after student answers questions */
export async function answerIntake(
  triageResult: IntakeTriageResponse,
  answers: string[],
): Promise<IntakeFollowupResponse> {
  return apiFetch<IntakeFollowupResponse>(`${API_BASE}/tickets/intake/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ triageResult, answers }),
  });
}

/** POST /tickets/intake/confirm — create the real ticket in the database */
export async function confirmIntake(payload: ConfirmIntakePayload): Promise<ConfirmedTicket> {
  const res = await apiFetch<{ message: string; ticket: ConfirmedTicket }>(
    `${API_BASE}/tickets/intake/confirm`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );
  return res.ticket;
}

// ─── Article lookup ───────────────────────────────────────────────────────────

/** Fetch a single KB article by ID. Returns null if not found or on error. */
export async function fetchArticleById(id: string): Promise<Article | null> {
  try {
    const res = await fetch(`${API_BASE}/articles/${id}`, { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    const raw: Record<string, unknown> = data.article ?? data;
    return {
      id: String(raw._id ?? raw.id ?? ''),
      title: String(raw.title ?? ''),
      category: raw.category as Article['category'],
      summary: String(raw.summary ?? ''),
      content: String(raw.content ?? ''),
      tags: (raw.tags as string[]) ?? [],
      updatedAt: String(raw.updatedAt ?? ''),
    };
  } catch {
    return null;
  }
}
