import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowRight, ChevronRight } from 'lucide-react';
import { categoryIcons } from '@/utils/categoryIcons';
import { Article, CATEGORIES, Category } from '@/types';
import { cn } from '@/lib/utils';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

function mapApiArticle(raw: Record<string, unknown>): Article {
  return {
    id: String(raw._id ?? raw.id ?? ''),
    title: String(raw.title ?? ''),
    category: raw.category as Article['category'],
    summary: String(raw.summary ?? ''),
    content: String(raw.content ?? ''),
    tags: (raw.tags as string[]) ?? [],
    updatedAt: String(raw.updatedAt ?? ''),
  };
}

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/articles?limit=100`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load articles');
        return res.json();
      })
      .then(data => setArticles((data.articles as Record<string, unknown>[]).map(mapApiArticle)))
      .catch(() => setArticles([]))
      .finally(() => setIsLoading(false));
  }, []);

  // Category counts computed from live data
  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = articles.filter(a => a.category === cat).length;
    return acc;
  }, {} as Record<Category, number>);

  // Client-side filter: instant search UX
  const filteredArticles = articles.filter(article => {
    const matchesSearch = !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !selectedCategory || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Find answers to common questions and step-by-step guides
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search articles..."
          className="pl-12 h-12 text-base"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Categories
          </h2>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                !selectedCategory
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              <span>All Articles</span>
              <Badge variant={!selectedCategory ? 'secondary' : 'outline'} className="text-xs">
                {articles.length}
              </Badge>
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left',
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <span className="flex items-center gap-2 truncate">
                  <span>{categoryIcons[cat]}</span>
                  <span className="truncate">{cat}</span>
                </span>
                {categoryCounts[cat] > 0 && (
                  <Badge
                    variant={selectedCategory === cat ? 'secondary' : 'outline'}
                    className="text-xs shrink-0 ml-2"
                  >
                    {categoryCounts[cat]}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Articles List */}
        <div className="lg:col-span-3">
          {selectedCategory && (
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
                All
              </Button>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{selectedCategory}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Loading articles...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {articles.length === 0
                    ? 'No articles available yet.'
                    : 'No articles found matching your search.'}
                </p>
                {articles.length > 0 && (
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory(null);
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredArticles.map(article => (
                <Link key={article.id} to={`/kb/${article.id}`}>
                  <Card className="transition-all hover:shadow-md hover:border-primary/20">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl">
                          {categoryIcons[article.category]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1">{article.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {article.summary}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary">
                              {article.category}
                            </Badge>
                            {article.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
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
      </div>
    </div>
  );
}
