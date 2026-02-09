import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  Check, 
  Ticket,
  Upload,
  X,
} from 'lucide-react';
import { mockArticles, categoryIcons } from '@/data/mockData';
import { 
  AITriageResponse, 
  Article, 
  Category, 
  ClarifyingQuestion, 
  Priority,
  PRIORITIES,
} from '@/types';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface AITriageFlowProps {
  initialQuery: string;
  onBack: () => void;
  onTicketCreated: (ticketId: string) => void;
}

// Mock AI response generator
function generateMockAIResponse(query: string): AITriageResponse {
  const lowerQuery = query.toLowerCase();
  
  let category: Category = 'Student Services';
  let suggestedArticles: Article[] = [];
  
  if (lowerQuery.includes('i-20') || lowerQuery.includes('visa') || lowerQuery.includes('cpt') || lowerQuery.includes('opt') || lowerQuery.includes('international')) {
    category = 'International Affairs';
    suggestedArticles = mockArticles.filter(a => a.category === 'International Affairs').slice(0, 2);
  } else if (lowerQuery.includes('password') || lowerQuery.includes('login') || lowerQuery.includes('access') || lowerQuery.includes('okta')) {
    category = 'Information Technology';
    suggestedArticles = mockArticles.filter(a => a.category === 'Information Technology').slice(0, 2);
  } else if (lowerQuery.includes('payment') || lowerQuery.includes('tuition') || lowerQuery.includes('bill')) {
    category = 'Student Accounts';
    suggestedArticles = mockArticles.filter(a => a.category === 'Student Accounts').slice(0, 2);
  } else if (lowerQuery.includes('gap') || lowerQuery.includes('portal') || lowerQuery.includes('course')) {
    category = 'Learning Technologies';
    suggestedArticles = mockArticles.filter(a => a.category === 'Learning Technologies').slice(0, 2);
  }

  const questions: ClarifyingQuestion[] = [
    {
      id: 'q1',
      question: 'How urgent is this issue for you?',
      type: 'radio',
      options: ['Not urgent - can wait a few days', 'Somewhat urgent - need help within 24 hours', 'Very urgent - blocking my progress'],
    },
    {
      id: 'q2',
      question: 'Have you tried any solutions already?',
      type: 'radio',
      options: ['No, this is my first attempt', 'Yes, I tried but it didn\'t work', 'Yes, but I need additional help'],
    },
  ];

  return {
    category,
    service: 'General Inquiry',
    clarifyingQuestions: questions,
    suggestedArticles,
    ticketDraft: {
      summary: query.slice(0, 100),
      description: `User query: ${query}\n\nThis ticket was created via the AI triage system.`,
      priority: 'MEDIUM',
    },
    confidence: 0.85,
    handoffRecommendation: suggestedArticles.length > 0 ? 'ARTICLE_FIRST' : 'CREATE_TICKET',
  };
}

export function AITriageFlow({ initialQuery, onBack, onTicketCreated }: AITriageFlowProps) {
  const [step, setStep] = useState<'clarifying' | 'suggestion' | 'preview' | 'submitted'>('clarifying');
  const [aiResponse] = useState<AITriageResponse>(() => generateMockAIResponse(initialQuery));
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [ticketData, setTicketData] = useState({
    summary: aiResponse.ticketDraft.summary,
    description: aiResponse.ticketDraft.description,
    priority: aiResponse.ticketDraft.priority as Priority,
  });

  const steps = ['clarifying', 'suggestion', 'preview'];
  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleContinue = () => {
    if (step === 'clarifying') {
      setStep('suggestion');
    } else if (step === 'suggestion') {
      setStep('preview');
    }
  };

  const handleSubmitTicket = () => {
    // In a real app, this would make an API call
    const newTicketId = `ticket-${Date.now()}`;
    setStep('submitted');
    setTimeout(() => {
      onTicketCreated(newTicketId);
    }, 2000);
  };

  const handleArticleSolved = () => {
    // In a real app, this would track that the article solved the issue
    onBack();
  };

  if (step === 'submitted') {
    return (
      <div className="container max-w-2xl py-12">
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold">Ticket Submitted!</h2>
            <p className="text-muted-foreground">
              Your request has been received. Our team will review it shortly.
            </p>
            <div className="animate-pulse text-sm text-muted-foreground">
              Redirecting to your ticket...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Start Over
        </Button>
        <div className="flex items-center gap-4 mb-4">
          <Progress value={progress} className="flex-1 h-2" />
          <span className="text-sm text-muted-foreground">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
        </div>
      </div>

      {/* User Query Bubble */}
      <div className="flex justify-end mb-6">
        <div className="user-bubble max-w-[80%]">
          <p>{initialQuery}</p>
        </div>
      </div>

      {/* AI Response */}
      <div className="flex gap-3 mb-6">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex-1">
          {step === 'clarifying' && (
            <div className="space-y-4 animate-slide-up">
              <div className="ai-bubble">
                <p className="mb-2">
                  I understand you need help with <strong>{aiResponse.category}</strong>.
                </p>
                <p className="text-sm text-muted-foreground">
                  A couple quick questions to help me assist you better:
                </p>
              </div>

              {/* Clarifying Questions */}
              <Card>
                <CardContent className="pt-6 space-y-6">
                  {aiResponse.clarifyingQuestions.map((q, index) => (
                    <div key={q.id} className="space-y-3">
                      <Label className="text-base">
                        {index + 1}. {q.question}
                      </Label>
                      <RadioGroup
                        value={answers[q.id] || ''}
                        onValueChange={value => handleAnswerChange(q.id, value)}
                      >
                        {q.options?.map(option => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`${q.id}-${option}`} />
                            <Label htmlFor={`${q.id}-${option}`} className="font-normal cursor-pointer">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Button 
                onClick={handleContinue}
                disabled={Object.keys(answers).length < aiResponse.clarifyingQuestions.length}
                className="w-full"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 'suggestion' && (
            <div className="space-y-4 animate-slide-up">
              <div className="ai-bubble">
                <p>
                  Based on your responses, I found some helpful resources that might solve your issue.
                </p>
              </div>

              {/* Suggested Articles */}
              {aiResponse.suggestedArticles.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Suggested Articles</p>
                  {aiResponse.suggestedArticles.map(article => (
                    <Card key={article.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-xl">
                            {categoryIcons[article.category]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium">{article.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {article.summary}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Check className="h-3 w-3 text-success" />
                                Solved by 78%
                              </span>
                              <span>Avg time: 3 min</span>
                            </div>
                          </div>
                          <Link to={`/kb/${article.id}`}>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={handleArticleSolved}>
                  <Check className="h-4 w-4 mr-2" />
                  This solved my issue
                </Button>
                <Button className="flex-1" onClick={handleContinue}>
                  <Ticket className="h-4 w-4 mr-2" />
                  I still need help
                </Button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4 animate-slide-up">
              <div className="ai-bubble">
                <p>
                  No problem! I've prepared a support ticket for you. Review the details below and submit when ready.
                </p>
              </div>

              {/* Ticket Preview Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Ticket className="h-5 w-5" />
                    Ticket Preview
                  </CardTitle>
                  <CardDescription>Review and edit before submitting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Category (locked) */}
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                      <span className="text-xl">{categoryIcons[aiResponse.category]}</span>
                      <span>{aiResponse.category}</span>
                      <Badge variant="secondary" className="ml-auto">Locked</Badge>
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <div className="flex gap-2">
                      {PRIORITIES.map(p => (
                        <Button
                          key={p}
                          type="button"
                          variant={ticketData.priority === p ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTicketData(prev => ({ ...prev, priority: p }))}
                          className={cn(
                            ticketData.priority === p && p === 'HIGH' && 'bg-destructive',
                            ticketData.priority === p && p === 'LOW' && 'bg-success',
                          )}
                        >
                          {p}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-2">
                    <Label htmlFor="summary">Summary</Label>
                    <Input
                      id="summary"
                      value={ticketData.summary}
                      onChange={e => setTicketData(prev => ({ ...prev, summary: e.target.value }))}
                      placeholder="Brief summary of your issue"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={ticketData.description}
                      onChange={e => setTicketData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Provide more details about your issue"
                      rows={4}
                    />
                  </div>

                  {/* Attachments */}
                  <div className="space-y-2">
                    <Label>Attachments</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Drag & drop files here or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        (Demo mode - uploads disabled)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('suggestion')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button className="flex-1" onClick={handleSubmitTicket}>
                  Submit Ticket
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
