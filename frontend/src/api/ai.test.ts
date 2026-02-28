/**
 * Unit tests for src/api/ai.ts
 *
 * Uses vi.stubGlobal to replace fetch so no network is required.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  startIntake,
  answerIntake,
  confirmIntake,
  fetchArticleById,
  IntakeTriageResponse,
} from './ai';

// ── Helpers ──────────────────────────────────────────────────────────────────

function mockFetch(status: number, body: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    }),
  );
}

function mockFetchError(message: string): void {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error(message)));
}

const SAMPLE_TRIAGE_RESPONSE: IntakeTriageResponse = {
  category: 'International Affairs',
  service: 'I-20 Renewal',
  clarifyingQuestions: ['When does your current I-20 expire?'],
  suggestedArticleIds: ['article-123'],
  ticketDraft: {
    summary: 'I-20 renewal needed',
    description: 'Student needs I-20 updated for an upcoming visa appointment.',
    priority: 'HIGH',
  },
  confidence: 0.92,
  handoffRecommendation: 'CREATE_TICKET',
};

beforeEach(() => {
  vi.unstubAllGlobals();
});

// ── startIntake ───────────────────────────────────────────────────────────────

describe('startIntake', () => {
  it('sends POST to /tickets/intake/start with text in body', async () => {
    mockFetch(200, SAMPLE_TRIAGE_RESPONSE);

    await startIntake('I need my I-20 renewed');

    const fetchMock = vi.mocked(fetch);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/tickets/intake/start');
    expect(options?.method).toBe('POST');
    expect(JSON.parse(options?.body as string)).toEqual({
      text: 'I need my I-20 renewed',
    });
  });

  it('includes credentials in the request', async () => {
    mockFetch(200, SAMPLE_TRIAGE_RESPONSE);

    await startIntake('I need my I-20 renewed');

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(options?.credentials).toBe('include');
  });

  it('sends userContext when provided', async () => {
    mockFetch(200, SAMPLE_TRIAGE_RESPONSE);

    await startIntake('Canvas login issue', { role: 'student' });

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(JSON.parse(options?.body as string)).toEqual({
      text: 'Canvas login issue',
      userContext: { role: 'student' },
    });
  });

  it('returns the parsed triage response', async () => {
    mockFetch(200, SAMPLE_TRIAGE_RESPONSE);

    const result = await startIntake('I need my I-20 renewed');

    expect(result.category).toBe('International Affairs');
    expect(result.clarifyingQuestions).toEqual(['When does your current I-20 expire?']);
    expect(result.suggestedArticleIds).toEqual(['article-123']);
    expect(result.ticketDraft.priority).toBe('HIGH');
  });

  it('throws when the server returns a non-ok status', async () => {
    mockFetch(401, { error: 'Unauthorized' });

    await expect(startIntake('I need my I-20 renewed')).rejects.toThrow('Unauthorized');
  });

  it('throws with generic message when error body has no error field', async () => {
    mockFetch(500, {});

    await expect(startIntake('I need my I-20 renewed')).rejects.toThrow('Request failed (500)');
  });
});

// ── answerIntake ──────────────────────────────────────────────────────────────

describe('answerIntake', () => {
  const SAMPLE_FOLLOWUP = {
    category: 'International Affairs',
    service: 'I-20 Renewal',
    ticketDraft: {
      summary: 'I-20 expires in 2 weeks — urgent renewal',
      description: 'Student confirmed I-20 expires 2026-03-10.',
      priority: 'HIGH',
    },
    confidence: 0.97,
    additionalContext: 'Student has visa appointment.',
  };

  it('sends POST to /tickets/intake/answer with triageResult and answers', async () => {
    mockFetch(200, SAMPLE_FOLLOWUP);

    await answerIntake(SAMPLE_TRIAGE_RESPONSE, ['My I-20 expires in two weeks']);

    const [url, options] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toContain('/tickets/intake/answer');
    expect(options?.method).toBe('POST');

    const body = JSON.parse(options?.body as string);
    expect(body.triageResult).toEqual(SAMPLE_TRIAGE_RESPONSE);
    expect(body.answers).toEqual(['My I-20 expires in two weeks']);
  });

  it('returns the refined follow-up response', async () => {
    mockFetch(200, SAMPLE_FOLLOWUP);

    const result = await answerIntake(SAMPLE_TRIAGE_RESPONSE, ['In two weeks']);

    expect(result.category).toBe('International Affairs');
    expect(result.confidence).toBe(0.97);
    expect(result.additionalContext).toBe('Student has visa appointment.');
  });

  it('throws on a non-ok response', async () => {
    mockFetch(422, { error: 'Validation error' });

    await expect(
      answerIntake(SAMPLE_TRIAGE_RESPONSE, ['My answer']),
    ).rejects.toThrow('Validation error');
  });
});

// ── confirmIntake ─────────────────────────────────────────────────────────────

describe('confirmIntake', () => {
  const CONFIRMED_TICKET_RESPONSE = {
    message: 'Ticket created successfully',
    ticket: {
      id: 'ticket-abc123',
      category: 'International Affairs',
      priority: 'HIGH',
      status: 'NEW',
      summary: 'I-20 renewal needed',
      createdAt: '2026-02-28T00:00:00.000Z',
    },
  };

  it('sends POST to /tickets/intake/confirm with ticket payload', async () => {
    mockFetch(201, CONFIRMED_TICKET_RESPONSE);

    await confirmIntake({
      category: 'International Affairs',
      service: 'I-20 Renewal',
      priority: 'HIGH',
      summary: 'I-20 renewal needed',
      description: 'Student needs I-20 updated.',
    });

    const [url, options] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toContain('/tickets/intake/confirm');
    expect(options?.method).toBe('POST');

    const body = JSON.parse(options?.body as string);
    expect(body.category).toBe('International Affairs');
    expect(body.priority).toBe('HIGH');
  });

  it('extracts and returns the ticket object from the response envelope', async () => {
    mockFetch(201, CONFIRMED_TICKET_RESPONSE);

    const ticket = await confirmIntake({
      category: 'International Affairs',
      priority: 'HIGH',
      summary: 'I-20 renewal needed',
      description: 'Student needs I-20 updated.',
    });

    expect(ticket.id).toBe('ticket-abc123');
    expect(ticket.status).toBe('NEW');
  });

  it('throws on non-ok response', async () => {
    mockFetch(400, { error: 'Invalid category' });

    await expect(
      confirmIntake({
        category: 'Bad Category',
        priority: 'HIGH',
        summary: 'Test',
        description: 'Test description here.',
      }),
    ).rejects.toThrow('Invalid category');
  });
});

// ── fetchArticleById ──────────────────────────────────────────────────────────

describe('fetchArticleById', () => {
  it('returns a mapped Article object on success', async () => {
    mockFetch(200, {
      article: {
        _id: 'article-001',
        title: 'How to Renew Your I-20',
        category: 'International Affairs',
        summary: 'Step-by-step I-20 renewal guide.',
        content: 'Detailed content here...',
        tags: ['i-20', 'visa', 'renewal'],
        updatedAt: '2026-02-01T00:00:00.000Z',
      },
    });

    const article = await fetchArticleById('article-001');

    expect(article).not.toBeNull();
    expect(article!.id).toBe('article-001');
    expect(article!.title).toBe('How to Renew Your I-20');
    expect(article!.tags).toContain('i-20');
  });

  it('returns null when the article is not found (404)', async () => {
    mockFetch(404, { error: 'Not found' });

    const result = await fetchArticleById('nonexistent-id');

    expect(result).toBeNull();
  });

  it('returns null when fetch rejects (network error)', async () => {
    mockFetchError('Network error');

    const result = await fetchArticleById('article-001');

    expect(result).toBeNull();
  });

  it('handles response with id instead of _id', async () => {
    mockFetch(200, {
      article: {
        id: 'article-002',
        title: 'Financial Aid FAQ',
        category: 'Financial Aid',
        summary: 'Common financial aid questions.',
        content: 'Content...',
        tags: [],
        updatedAt: '2026-01-15T00:00:00.000Z',
      },
    });

    const article = await fetchArticleById('article-002');

    expect(article!.id).toBe('article-002');
  });
});
