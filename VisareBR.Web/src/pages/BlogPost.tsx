import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getArticleBySlug, getArticles } from '../api/blogService';
import type { Article, ArticleBlock } from '../api/blogService';
import { ArrowLeft, Calendar, User, Clock, AlignLeft, ChevronRight, Award } from 'lucide-react';
import BlockRenderer from '../components/BlockRenderer';
import ErrorBoundary from '../components/ErrorBoundary';
import { useSettings } from '../context/SettingsContext';

const SITE_BASE_URL = 'https://www.visarebr.com.br';

declare global {
  interface Window {
    __INITIAL_ARTICLE__?: Article;
  }
}

function getPreloadedArticle(slug?: string): Article | null {
  if (!slug || typeof window === 'undefined') return null;
  const initial = window.__INITIAL_ARTICLE__;
  if (initial && initial.slug === slug) {
    return initial;
  }
  return null;
}

function normalizeAuthorName(rawName?: string, fallbackName?: string): string {
  const candidate = (rawName || fallbackName || '').trim();
  if (
    !candidate ||
    candidate.toLowerCase() === 'administrador visarebr' ||
    candidate.toLowerCase() === 'admin' ||
    candidate.toLowerCase() === 'visarebr'
  ) {
    return 'Gilceli Braga';
  }
  return candidate;
}

interface ParsedHeading {
  id: string;
  text: string;
  level: number;
}

function processBlocks(blocks: ArticleBlock[], articleTitle: string): {
  processedBlocks: ArticleBlock[];
  headings: ParsedHeading[];
} {
  if (!Array.isArray(blocks)) return { processedBlocks: [], headings: [] };

  const headings: ParsedHeading[] = [];
  let headingCounter = 0;

  const processedBlocks = blocks.map((block) => {
    if (!block || block.type !== 'text' || !block.content) return block;

    const parser = new DOMParser();
    const doc = parser.parseFromString(block.content, 'text/html');

    // Enforce single H1 per page: demote any editor <h1> inside content blocks to <h2>
    doc.querySelectorAll('h1').forEach((h1El) => {
      const h2El = doc.createElement('h2');
      h2El.innerHTML = h1El.innerHTML;
      Array.from(h1El.attributes).forEach((attr) => h2El.setAttribute(attr.name, attr.value));
      h1El.replaceWith(h2El);
    });

    // Ensure any inline <img> inside rich text has alt, width, height, loading="lazy", and decoding="async"
    doc.querySelectorAll('img').forEach((imgEl) => {
      if (!imgEl.getAttribute('alt')) {
        imgEl.setAttribute('alt', articleTitle || 'Imagem do artigo');
      }
      if (!imgEl.getAttribute('width')) {
        imgEl.setAttribute('width', '800');
      }
      if (!imgEl.getAttribute('height')) {
        imgEl.setAttribute('height', '450');
      }
      if (!imgEl.getAttribute('loading')) {
        imgEl.setAttribute('loading', 'lazy');
      }
      if (!imgEl.getAttribute('decoding')) {
        imgEl.setAttribute('decoding', 'async');
      }
    });

    const headingElements = doc.querySelectorAll('h2, h3');
    headingElements.forEach((el) => {
      const id = el.id || `heading-${headingCounter++}`;
      el.id = id;
      headings.push({
        id,
        text: el.textContent || '',
        level: el.tagName === 'H2' ? 2 : 3
      });
    });

    return {
      ...block,
      content: doc.body.innerHTML
    };
  });

  return { processedBlocks, headings };
}

function resolveCanonicalImageUrl(featuredImageUrl: string | undefined, slug: string): string {
  if (!featuredImageUrl) {
    return `${SITE_BASE_URL}/logo%20fundo%20transparente.png`;
  }
  if (featuredImageUrl.startsWith('data:image/') || featuredImageUrl.startsWith('/imagens/artigos/')) {
    return `${SITE_BASE_URL}/imagens/artigos/${slug}.webp`;
  }
  if (featuredImageUrl.startsWith('http://') || featuredImageUrl.startsWith('https://')) {
    return featuredImageUrl;
  }
  return `${SITE_BASE_URL}/${featuredImageUrl.replace(/^\/+/, '')}`;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const initialPreloaded = getPreloadedArticle(slug);
  const initialProcessed = initialPreloaded && Array.isArray(initialPreloaded.contentBlocks)
    ? processBlocks(initialPreloaded.contentBlocks, initialPreloaded.title || '')
    : { processedBlocks: [], headings: [] };

  const [post, setPost] = useState<Article | null>(initialPreloaded);
  const [processedBlocks, setProcessedBlocks] = useState<ArticleBlock[]>(initialProcessed.processedBlocks);
  const [loading, setLoading] = useState(!initialPreloaded);
  const [headings, setHeadings] = useState<ParsedHeading[]>(initialProcessed.headings);
  const [activeId, setActiveId] = useState<string>('');
  const [relatedPosts, setRelatedPosts] = useState<Article[]>([]);
  const [allArticlesList, setAllArticlesList] = useState<Article[]>([]);
  const { whatsappUrl } = useSettings();

  useEffect(() => {
    if (slug) {
      const preloaded = getPreloadedArticle(slug);
      if (preloaded) {
        setPost(preloaded);
        if (Array.isArray(preloaded.contentBlocks)) {
          const { processedBlocks: newBlocks, headings: newHeadings } = processBlocks(
            preloaded.contentBlocks,
            preloaded.title || ''
          );
          setProcessedBlocks(newBlocks);
          setHeadings(newHeadings);
        }
        setLoading(false);
      } else {
        setLoading(true);
      }

      getArticleBySlug(slug)
        .then((res: any) => {
          const article = res?.data;
          if (!article || typeof article !== 'object') {
            if (!preloaded) setPost(null);
            return;
          }
          // If the article was renamed and resolved via redirect, replace the browser URL with the canonical new slug
          if (article.slug && article.slug !== slug) {
            navigate(`/artigos/${article.slug}`, { replace: true });
          }
          setPost(article);
          if (Array.isArray(article.contentBlocks)) {
            const { processedBlocks: newBlocks, headings: newHeadings } = processBlocks(
              article.contentBlocks,
              article.title || ''
            );
            setProcessedBlocks(newBlocks);
            setHeadings(newHeadings);
          } else {
            setProcessedBlocks([]);
            setHeadings([]);
          }

          getArticles()
            .then((allRes: any) => {
              const allPosts: Article[] = Array.isArray(allRes?.data) ? allRes.data : [];
              setAllArticlesList(allPosts);
              const articleTags = Array.isArray(article.tags) ? article.tags : [];
              if (articleTags.length > 0) {
                const related = allPosts.filter(
                  (p) =>
                    p &&
                    p.id !== article.id &&
                    Array.isArray(p.tags) &&
                    p.tags.some((tag) => articleTags.includes(tag))
                );
                setRelatedPosts(related.slice(0, 3));
              } else {
                setRelatedPosts(allPosts.filter((p) => p && p.id !== article.id).slice(0, 3));
              }
            })
            .catch((err: any) => {
              console.error('Error loading related articles:', err);
              setRelatedPosts([]);
            });
        })
        .catch((err: any) => {
          console.error('Error loading article:', err);
          // Only clear post if we did NOT already receive pre-rendered article data from the server
          if (!preloaded) {
            setPost(null);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [slug]);

  useEffect(() => {
    if (!post) return;

    const metaTitle = post.metaTitle || post.title;
    const fullTitle = `${metaTitle} | VisareBR`;
    const metaDesc = post.metaDescription || post.summary;
    const canonicalUrl = `${SITE_BASE_URL}/artigos/${post.slug}`;
    const canonicalImage = resolveCanonicalImageUrl(post.featuredImageUrl, post.slug);

    // Update Page Title
    document.title = fullTitle;

    // Helper to update or create a meta tag
    const updateMetaTag = (attributeName: string, attributeValue: string, contentValue: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentValue);
    };

    // Helper to update or create <link rel="canonical">
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Standard SEO Meta Tags
    updateMetaTag('name', 'title', fullTitle);
    updateMetaTag('name', 'description', metaDesc);

    // Open Graph Meta Tags (Facebook / WhatsApp / LinkedIn)
    updateMetaTag('property', 'og:title', metaTitle);
    updateMetaTag('property', 'og:description', metaDesc);
    updateMetaTag('property', 'og:type', 'article');
    updateMetaTag('property', 'og:image', canonicalImage);
    updateMetaTag('property', 'og:image:secure_url', canonicalImage);
    updateMetaTag('property', 'og:url', canonicalUrl);

    // Twitter Card Meta Tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', metaTitle);
    updateMetaTag('name', 'twitter:description', metaDesc);
    updateMetaTag('name', 'twitter:image', canonicalImage);
    updateMetaTag('name', 'twitter:url', canonicalUrl);

    // JSON-LD Structured Data: BlogPosting
    const blogPostingLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl
      },
      headline: metaTitle,
      description: metaDesc,
      image: [canonicalImage],
      datePublished: post.createdAt,
      dateModified: post.updatedAt || post.createdAt,
      author: {
        '@type': 'Person',
        name: 'Gilceli Braga',
        url: `${SITE_BASE_URL}/quem-somos`
      },
      publisher: {
        '@type': 'Organization',
        name: 'VisareBR',
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_BASE_URL}/logo.png`
        }
      }
    };

    // JSON-LD Structured Data: BreadcrumbList
    const breadcrumbLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Início',
          item: `${SITE_BASE_URL}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Artigos',
          item: `${SITE_BASE_URL}/artigos`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: post.title,
          item: canonicalUrl
        }
      ]
    };

    const upsertJsonLd = (id: string, data: object) => {
      let scriptEl = document.getElementById(id) as HTMLScriptElement | null;
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = id;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.text = JSON.stringify(data);
    };

    upsertJsonLd('jsonld-structured-data', blogPostingLd);
    upsertJsonLd('jsonld-breadcrumb-data', breadcrumbLd);

    return () => {
      document.title = 'VisareBR | Assessoria de Visto Americano';
      const defaultDesc =
        'Assessoria completa e especializada para o seu Visto Americano. Análise de perfil, preenchimento do formulário DS-160, agendamento consular e preparação para a entrevista.';
      updateMetaTag('name', 'title', 'VisareBR | Assessoria de Visto Americano');
      updateMetaTag('name', 'description', defaultDesc);
      updateMetaTag('property', 'og:type', 'website');
      updateMetaTag('property', 'og:title', 'VisareBR | Assessoria de Visto Americano');
      updateMetaTag('property', 'og:description', defaultDesc);
      updateMetaTag('property', 'og:url', `${SITE_BASE_URL}/`);

      ['jsonld-structured-data', 'jsonld-breadcrumb-data'].forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.parentNode) el.parentNode.removeChild(el);
      });
    };
  }, [post]);

  // Track scroll and highlight heading
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 130;

      let currentActiveId = '';
      for (const heading of headings) {
        const el = document.getElementById(heading.id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (scrollPosition >= top) {
            currentActiveId = heading.id;
          } else {
            break;
          }
        }
      }

      if (!currentActiveId && headings.length > 0) {
        currentActiveId = headings[0].id;
      }

      if (currentActiveId && currentActiveId !== activeId) {
        setActiveId(currentActiveId);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings, activeId]);

  if (loading) return <div className="py-20 text-center text-primary font-medium">Carregando artigo...</div>;
  if (!post) return <div className="py-20 text-center text-primary font-medium">Artigo não encontrado.</div>;

  const authorDisplayName = normalizeAuthorName(post.authorName, post.author?.fullName);
  const coverSrc =
    post.featuredImageUrl && post.featuredImageUrl.startsWith('data:image/')
      ? `/imagens/artigos/${post.slug}.webp`
      : post.featuredImageUrl;

  return (
    <article className="bg-secondary py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb Navigation */}
        <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5 text-xs sm:text-sm text-dark-gray/70">
            <Link to="/" className="hover:text-primary font-semibold transition-colors">
              Início
            </Link>
            <ChevronRight size={14} className="text-gray-400 shrink-0" />
            <Link to="/artigos" className="hover:text-primary font-semibold transition-colors">
              Artigos
            </Link>
            <ChevronRight size={14} className="text-gray-400 shrink-0" />
            <span className="text-primary font-bold truncate max-w-[260px] sm:max-w-md" aria-current="page">
              {post.title}
            </span>
          </nav>

          <Link
            to="/artigos"
            className="inline-flex items-center gap-2 text-accent-gold font-bold text-sm hover:underline hover:text-primary transition-all duration-200"
          >
            <ArrowLeft size={16} /> Voltar para os artigos
          </Link>
        </div>

        {/* Two-Column Grid: Main Content & Sticky TOC */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-7xl mx-auto">

          {/* Main Article Content */}
          <div className="lg:col-span-8 bg-white border border-light-gray rounded-3xl p-6 md:p-10 shadow-sm text-left">

            {/* SEO Tags Badge */}
            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-bold px-3 py-1 rounded-full border bg-accent-gold/10 text-accent-gold border-accent-gold/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Single H1: Article Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-primary mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Metadata (Author, Date, Read Time) */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-dark-gray/80 mb-8 border-b border-light-gray pb-6">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-accent-gold" />
                <time dateTime={post.createdAt}>
                  {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} className="text-accent-gold" />
                <span>{authorDisplayName}</span>
              </div>
              {post.readTimeMinutes > 0 && (
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-accent-gold" />
                  {post.readTimeMinutes} min de leitura
                </div>
              )}
            </div>

            {/* Featured Cover Image (No lazy loading on LCP cover image) */}
            {coverSrc && (
              <div className="w-full overflow-hidden rounded-3xl mb-10 shadow-md">
                <img
                  src={coverSrc}
                  alt={post.title}
                  width={1200}
                  height={630}
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Rendered Content Blocks wrapped in ErrorBoundary */}
            <ErrorBoundary>
              <BlockRenderer
                blocks={processedBlocks}
                allArticles={allArticlesList}
                articleTitle={post.title}
              />
            </ErrorBoundary>

            {/* Author Box (E-E-A-T Trust Signal for Google) */}
            <aside
              aria-label="Sobre a autora"
              className="mt-12 pt-8 border-t border-light-gray"
            >
              <div className="bg-slate-50 border border-gray-200/80 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-black text-xl shrink-0 border-2 border-accent-gold shadow-sm">
                  {authorDisplayName
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-accent-gold flex items-center gap-1">
                      <Award size={14} /> Especialista Consular
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-primary">
                    Escrito por {authorDisplayName}
                  </h2>
                  <p className="text-sm text-dark-gray leading-relaxed">
                    Especialista em Assessoria de Vistos Consulares na <strong>VisareBR</strong>, com mais de 5 anos de experiência e avaliação 5 estrelas no Google, auxiliando solicitantes brasileiros na aprovação do visto americano com análise estratégica de perfil, preenchimento técnico do DS-160 e preparo para entrevista.
                  </p>
                  <div className="pt-1">
                    <Link
                      to="/quem-somos"
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-accent-gold transition-colors uppercase tracking-wider"
                    >
                      Conheça nossa história e como trabalhamos <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Sidebar: Table of Contents */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-28 space-y-6">
            {headings.length > 0 && (
              <div className="bg-white/80 backdrop-blur-md border border-light-gray rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <h4 className="text-base font-black text-primary flex items-center gap-2 mb-4 border-b border-light-gray pb-3">
                  <AlignLeft size={18} className="text-accent-gold" />
                  Neste Artigo
                </h4>
                <nav className="space-y-1">
                  {headings.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveId(heading.id);
                        const element = document.getElementById(heading.id);
                        if (element) {
                          const yOffset = -95;
                          const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
                          window.scrollTo({ top: y, behavior: 'smooth' });
                        }
                      }}
                      className={`block py-2 text-sm leading-relaxed pl-3 border-l-2 transition-all duration-200 hover:text-accent-gold hover:pl-4 whitespace-normal break-words ${
                        heading.level === 3 ? 'ml-3 text-xs' : 'font-semibold'
                      } ${
                        activeId === heading.id
                          ? 'border-accent-gold text-accent-gold font-bold bg-accent-gold/5 pl-4'
                          : 'border-transparent text-dark-gray/70'
                      }`}
                    >
                      {heading.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Quick Contact CTA Card in sidebar */}
            <div className="bg-gradient-to-br from-primary to-[#0e4484] text-white rounded-3xl p-6 shadow-md relative overflow-hidden group">
              <h4 className="text-xl font-bold mb-2">Dúvidas sobre o visto?</h4>
              <p className="text-sm text-blue-100 mb-6">
                Fale com nossos especialistas agora mesmo e aumente as chances de aprovação do seu visto americano.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full py-3 bg-accent-gold hover:bg-[#d5b991] text-white font-bold text-center rounded-2xl shadow-md hover:shadow-xl hover:translate-y-[-2px] active:translate-y-0 transition-all duration-200"
              >
                Falar com Especialista
              </a>
            </div>
          </aside>

        </div>

        {/* Related Articles Section wrapped in ErrorBoundary */}
        <ErrorBoundary>
          {Array.isArray(relatedPosts) && relatedPosts.length > 0 && (
            <div className="mt-16 border-t border-light-gray pt-12 text-left">
              <h2 className="text-2xl font-black text-primary mb-8">Artigos Relacionados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((rPost) => {
                  const rImgSrc =
                    rPost.featuredImageUrl && rPost.featuredImageUrl.startsWith('data:image/')
                      ? `/imagens/artigos/${rPost.slug}.webp`
                      : rPost.featuredImageUrl;

                  return (
                    <Link
                      key={rPost.id}
                      to={`/artigos/${rPost.slug}`}
                      className="flex flex-col bg-white border border-light-gray rounded-3xl overflow-hidden shadow-xs hover:shadow-lg hover:border-accent-gold/45 hover:translate-y-[-2px] transition-all duration-300 group"
                    >
                      <div className="h-44 bg-light-gray overflow-hidden">
                        {rImgSrc ? (
                          <img
                            src={rImgSrc}
                            alt={rPost.title}
                            width={400}
                            height={225}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">Sem imagem</div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <span className="text-[10px] font-bold text-dark-gray/60 uppercase tracking-widest mb-2.5 block">
                          {new Date(rPost.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        <h3 className="text-lg font-bold text-primary mb-3 line-clamp-2 group-hover:text-accent-gold transition-colors duration-200">
                          {rPost.title}
                        </h3>
                        <p className="text-sm text-dark-gray/80 line-clamp-2 mb-6">{rPost.summary}</p>
                        <span className="text-sm font-bold text-accent-gold mt-auto group-hover:underline">Ler artigo →</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </ErrorBoundary>
      </div>

      {/* Dynamic Styling Overrides for Rich Text Headers Inside Article Body */}
      <style>{`
        .blog-content,
        .blog-content .ql-editor {
          word-break: normal !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
        .blog-content h1, .blog-content h2, .blog-content h3 {
          font-weight: 800;
          color: #0A3161;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .blog-content h2 {
          font-size: 1.85rem;
          border-left: 4px solid #C5A880;
          padding-left: 0.75rem;
        }
        .blog-content h3 {
          font-size: 1.45rem;
        }
        .blog-content p {
          margin-bottom: 1.25rem;
          line-height: 1.8;
          color: #374151;
        }
        .blog-content ul {
          list-style-type: disc;
          margin-left: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .blog-content li {
          margin-bottom: 0.5rem;
          color: #374151;
        }
        .blog-content strong {
          color: #1f2937;
        }
      `}</style>
    </article>
  );
}
