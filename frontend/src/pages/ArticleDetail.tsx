import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, Tag, Ticket, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Article } from '@/types';
import { categoryIcons } from '@/lib/categoryIcons';
import { getArticle, listArticles } from '@/lib/api';
import { mockArticles } from '@/data/mockData';

export default function ArticleDetailPage() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!articleId) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    getArticle(articleId)
      .then(async (articleData) => {
        if (!isActive) {
          return;
        }

        setArticle(articleData);

        const related = await listArticles({
          category: articleData.category,
          limit: 4,
        });

        if (!isActive) {
          return;
        }
        setRelatedArticles(
          (related.length > 0 ? related : mockArticles)
            .filter((item) => item.id !== articleData.id && item.category === articleData.category)
            .slice(0, 3)
        );
      })
      .catch((error) => {
        console.error('Failed to load article:', error);
        if (isActive) {
          const fallbackArticle = mockArticles.find((item) => item.id === articleId) ?? null;
          setArticle(fallbackArticle);
          setRelatedArticles(
            mockArticles
              .filter((item) => item.id !== articleId && item.category === fallbackArticle?.category)
              .slice(0, 3)
          );
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [articleId]);

  if (isLoading) {
    return (
      <div className="container py-12 text-center text-muted-foreground">
        Loading article...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The article you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate('/kb')}>
          Back to Knowledge Base
        </Button>
      </div>
    );
  }
  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/kb" className="hover:text-foreground transition-colors">
          Knowledge Base
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link 
          to={`/kb?category=${encodeURIComponent(article.category)}`}
          className="hover:text-foreground transition-colors"
        >
          {article.category}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground truncate max-w-[200px]">{article.title}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <article className="prose prose-slate max-w-none">
            {/* Header */}
            <div className="not-prose mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{categoryIcons[article.category]}</span>
                <Badge variant="secondary">{article.category}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
              <p className="text-lg text-muted-foreground">{article.summary}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Updated {new Date(article.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Article Content */}
            <div className="prose-headings:font-semibold prose-h2:text-xl prose-h3:text-lg prose-p:text-muted-foreground prose-li:text-muted-foreground">
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </div>

            {/* Tags */}
            <div className="not-prose mt-8 pt-6 border-t border-border">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {article.tags.map(tag => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </article>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Still need help */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Still need help?
              </h3>
              <p className="text-sm opacity-90 mb-4">
                If this article didn't answer your question, create a support ticket and our team will assist you.
              </p>
              <Link to={`/?article=${article.id}`}>
                <Button variant="secondary" className="w-full">
                  Create a Ticket
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Related Articles</h3>
                <div className="space-y-3">
                  {relatedArticles.map(related => (
                    <Link key={related.id} to={`/kb/${related.id}`}>
                      <div className="p-3 rounded-lg hover:bg-muted transition-colors">
                        <h4 className="text-sm font-medium line-clamp-2">{related.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {related.summary}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
