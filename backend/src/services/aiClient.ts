/**
 * AI Service Client
 * Handles communication with the FastAPI AI service
 * Falls back to stub responses when service is unavailable
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { env } from '../config/env.js';
import { CATEGORIES, PRIORITIES } from '../constants.js';

// Type definitions for AI service responses
export interface AITriageResponse {
  category: string;
  service: string;
  clarifyingQuestions: Array<{
    id: string;
    question: string;
    type: 'radio' | 'checkbox' | 'text';
    options?: string[];
  }>;
  suggestedArticles: Array<{
    id: string;
    title: string;
    category: string;
    summary: string;
  }>;
  ticketDraft: {
    summary: string;
    description: string;
    priority: string;
  };
  confidence: number;
  handoffRecommendation: 'ARTICLE_FIRST' | 'CREATE_TICKET';
}

export interface AIFollowupResponse {
  ticketDraft: {
    summary: string;
    description: string;
    priority: string;
    category?: string;
  };
  updatedCategory?: string;
  updatedPriority?: string;
  confidence: number;
}

export interface AISummaryResponse {
  summary: string;
}

export interface AIDraftReplyResponse {
  draft: string;
  suggestedNextSteps: string[];
}

export class AIServiceClient {
  private client: AxiosInstance;
  private useStubs: boolean = false;

  constructor() {
    this.client = axios.create({
      baseURL: env.AI_SERVICE_URL,
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Test connection on initialization
    this.testConnection();
  }

  private async testConnection(): Promise<void> {
    try {
      await this.client.get('/health', { timeout: 2000 });
      this.useStubs = false;
      console.log('[AI Service] Connected successfully');
    } catch (error) {
      this.useStubs = true;
      console.log('[AI Service] Not available, using stub responses');
    }
  }

  /**
   * POST /intake/triage - Initial triage classification
   */
  async startIntake(text: string, userContext?: Record<string, unknown>): Promise<AITriageResponse> {
    if (this.useStubs) {
      return this.getStubTriageResponse(text);
    }

    try {
      const response = await this.client.post('/intake/triage', { text, userContext });
      return response.data;
    } catch (error) {
      console.error('[AI Service] Triage request failed, using stub:', this.getErrorMessage(error));
      return this.getStubTriageResponse(text);
    }
  }

  /**
   * POST /intake/followup - Refine ticket draft based on answers
   */
  async followupIntake(
    triageResult: AITriageResponse,
    answers: Record<string, string | string[]>
  ): Promise<AIFollowupResponse> {
    if (this.useStubs) {
      return this.getStubFollowupResponse(triageResult, answers);
    }

    try {
      const response = await this.client.post('/intake/followup', { triageResult, answers });
      return response.data;
    } catch (error) {
      console.error('[AI Service] Followup request failed, using stub:', this.getErrorMessage(error));
      return this.getStubFollowupResponse(triageResult, answers);
    }
  }

  /**
   * POST /assist/summarize - Generate ticket summary for staff
   */
  async summarizeTicket(ticketId: string, messages: Array<any>): Promise<AISummaryResponse> {
    if (this.useStubs) {
      return this.getStubSummary(messages);
    }

    try {
      const response = await this.client.post('/assist/summarize', { ticketId, messages });
      return response.data;
    } catch (error) {
      console.error('[AI Service] Summarize request failed, using stub:', this.getErrorMessage(error));
      return this.getStubSummary(messages);
    }
  }

  /**
   * POST /assist/draft-reply - Generate draft reply for staff
   */
  async draftReply(
    ticketId: string,
    messages: Array<any>,
    tone: 'professional' | 'friendly' | 'concise' = 'professional'
  ): Promise<AIDraftReplyResponse> {
    if (this.useStubs) {
      return this.getStubDraftReply(messages, tone);
    }

    try {
      const response = await this.client.post('/assist/draft-reply', { ticketId, messages, tone });
      return response.data;
    } catch (error) {
      console.error('[AI Service] Draft reply request failed, using stub:', this.getErrorMessage(error));
      return this.getStubDraftReply(messages, tone);
    }
  }

  // Stub response generators
  private getStubTriageResponse(text: string): AITriageResponse {
    const lowerText = text.toLowerCase();

    // Simple keyword-based categorization
    let category: string = CATEGORIES[0]; // Default to Information Technology
    let service = 'General Inquiry';
    let priority: string = 'MEDIUM';

    if (lowerText.includes('i-20') || lowerText.includes('visa') || lowerText.includes('immigration')) {
      category = 'International Affairs';
      service = 'Visa Documents';
      priority = 'HIGH';
    } else if (lowerText.includes('password') || lowerText.includes('login') || lowerText.includes('access')) {
      category = 'Information Technology';
      service = 'Account Access';
      priority = 'HIGH';
    } else if (lowerText.includes('payment') || lowerText.includes('tuition') || lowerText.includes('fee')) {
      category = 'Student Accounts';
      service = 'Payment Issues';
      priority = 'HIGH';
    } else if (lowerText.includes('canvas') || lowerText.includes('course') || lowerText.includes('assignment')) {
      category = 'Learning Technologies';
      service = 'Learning Platform';
      priority = 'MEDIUM';
    } else if (lowerText.includes('registration') || lowerText.includes('transcript') || lowerText.includes('grade')) {
      category = 'Registrar';
      service = 'Registration';
      priority = 'MEDIUM';
    }

    return {
      category,
      service,
      clarifyingQuestions: [
        {
          id: 'q1',
          question: 'When did this issue first occur?',
          type: 'radio',
          options: ['Today', 'This week', 'More than a week ago'],
        },
        {
          id: 'q2',
          question: 'Have you tried any troubleshooting steps?',
          type: 'text',
        },
      ],
      suggestedArticles: [],
      ticketDraft: {
        summary: text.length > 100 ? text.substring(0, 97) + '...' : text,
        description: `Student inquiry: ${text}\n\nThis ticket was created via the AI intake system.`,
        priority,
      },
      confidence: 0.75,
      handoffRecommendation: 'CREATE_TICKET',
    };
  }

  private getStubFollowupResponse(
    triageResult: AITriageResponse,
    answers: Record<string, string | string[]>
  ): AIFollowupResponse {
    // Enhance the description with the answers
    const answerSummary = Object.entries(answers)
      .map(([key, value]) => {
        const question = triageResult.clarifyingQuestions.find((q) => q.id === key);
        const questionText = question?.question || key;
        const answerText = Array.isArray(value) ? value.join(', ') : value;
        return `${questionText}\n${answerText}`;
      })
      .join('\n\n');

    return {
      ticketDraft: {
        summary: triageResult.ticketDraft.summary,
        description: `${triageResult.ticketDraft.description}\n\nAdditional Information:\n${answerSummary}`,
        priority: triageResult.ticketDraft.priority,
        category: triageResult.category,
      },
      confidence: 0.85,
    };
  }

  private getStubSummary(messages: Array<any>): AISummaryResponse {
    if (messages.length === 0) {
      return { summary: 'No messages to summarize.' };
    }

    const messageCount = messages.length;
    const firstMessage = messages[0];
    const latestMessage = messages[messages.length - 1];

    return {
      summary: `This ticket has ${messageCount} message(s). Issue started with: "${firstMessage.body.substring(0, 100)}...". Latest update: "${latestMessage.body.substring(0, 100)}...". Status: In progress.`,
    };
  }

  private getStubDraftReply(messages: Array<any>, tone: string): AIDraftReplyResponse {
    const greeting =
      tone === 'friendly'
        ? 'Hi there!'
        : tone === 'concise'
          ? 'Hello,'
          : 'Hello and thank you for contacting Westcliff University Student Services,';

    const closing =
      tone === 'friendly'
        ? 'Let me know if you need anything else!'
        : tone === 'concise'
          ? 'Thanks.'
          : 'If you have any further questions, please don\'t hesitate to reach out.';

    return {
      draft: `${greeting}\n\nThank you for providing the additional information. I've reviewed your request and I'm working on resolving this issue for you.\n\nI'll need to verify a few details with the appropriate department and will follow up with you shortly.\n\n${closing}\n\nBest regards,\nStudent Services Team`,
      suggestedNextSteps: [
        'Verify student information in the system',
        'Contact the relevant department for clarification',
        'Update ticket status to IN_PROGRESS',
        'Set follow-up reminder for 2 business days',
      ],
    };
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      return error.message;
    }
    return String(error);
  }
}

// Export singleton instance
export const aiService = new AIServiceClient();
