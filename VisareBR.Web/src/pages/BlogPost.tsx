import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticleBySlug } from '../api/blogService';
import type { Article } from '../api/blogService';
import { ArrowLeft, Calendar, User, Clock, AlignLeft } from 'lucide-react';
import BlockRenderer from '../components/BlockRenderer';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (slug) {
      setLoading(true);
      getArticleBySlug(slug)
        .then((res: any) => setPost(res.data))
        .catch((err: any) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  useEffect(() => {
    if (!post) return;

    // Update Page Title
    const originalTitle = document.title;
    document.title = `${post.metaTitle || post.title} | VisareBR`;

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

    // Standard SEO Meta Tags
    updateMetaTag('name', 'description', post.metaDescription || post.summary);

    // Open Graph Meta Tags (Facebook / WhatsApp / etc.)
    updateMetaTag('property', 'og:title', post.metaTitle || post.title);
    updateMetaTag('property', 'og:description', post.metaDescription || post.summary);
    updateMetaTag('property', 'og:type', 'article');
    if (post.featuredImageUrl) {
      updateMetaTag('property', 'og:image', post.featuredImageUrl);
    }
    updateMetaTag('property', 'og:url', window.location.href);

    // Twitter Card Meta Tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', post.metaTitle || post.title);
    updateMetaTag('name', 'twitter:description', post.metaDescription || post.summary);
    if (post.featuredImageUrl) {
      updateMetaTag('name', 'twitter:image', post.featuredImageUrl);
    }

    // JSON-LD Structured Data (Google Rich Snippets)
    const jsonLdData = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      },
      "headline": post.metaTitle || post.title,
      "description": post.metaDescription || post.summary,
      "image": post.featuredImageUrl || "",
      "datePublished": post.createdAt,
      "author": {
        "@type": "Person",
        "name": post.author?.fullName || post.authorName || "VisareBR"
      },
      "publisher": {
        "@type": "Organization",
        "name": "VisareBR",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/logo.png`
        }
      }
    };

    let scriptElement = document.getElementById('jsonld-structured-data') as HTMLScriptElement;
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = 'jsonld-structured-data';
      scriptElement.type = 'application/ld+json';
      document.body.appendChild(scriptElement);
    }
    scriptElement.text = JSON.stringify(jsonLdData);

    // Cleanup function when component unmounts or post changes
    return () => {
      document.title = originalTitle;
      
      const metaSelectors = [
        'meta[name="description"]',
        'meta[property="og:title"]',
        'meta[property="og:description"]',
        'meta[property="og:type"]',
        'meta[property="og:image"]',
        'meta[property="og:url"]',
        'meta[name="twitter:card"]',
        'meta[name="twitter:title"]',
        'meta[name="twitter:description"]',
        'meta[name="twitter:image"]'
      ];
      metaSelectors.forEach(selector => {
        const el = document.querySelector(selector);
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });

      const ldJsonScript = document.getElementById('jsonld-structured-data');
      if (ldJsonScript && ldJsonScript.parentNode) {
        ldJsonScript.parentNode.removeChild(ldJsonScript);
      }
    };
  }, [post]);

  // Parse Headings from rendered HTML blocks
  useEffect(() => {
    if (!post) return;
    const timer = setTimeout(() => {
      const contentEl = document.querySelector('.blog-content');
      if (contentEl) {
        const headingElements = contentEl.querySelectorAll('h2, h3');
        const list: { id: string; text: string; level: number }[] = [];
        headingElements.forEach((el, index) => {
          const id = el.id || `heading-${index}`;
          el.id = id;
          list.push({
            id,
            text: el.textContent || '',
            level: el.tagName === 'H2' ? 2 : 3
          });
        });
        setHeadings(list);
      }
    }, 200); // Small timeout to allow DOM node rendering
    return () => clearTimeout(timer);
  }, [post]);

  // Track scroll and highlight heading
  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          setActiveId(visibleEntry.target.id);
        }
      },
      { rootMargin: '-100px 0px -50% 0px', threshold: 0.1 }
    );

    const contentEl = document.querySelector('.blog-content');
    if (contentEl) {
      const headingElements = contentEl.querySelectorAll('h2, h3');
      headingElements.forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  }, [headings]);

  if (loading) return <div className="py-20 text-center text-primary font-medium">Carregando artigo...</div>;
  if (!post) return <div className="py-20 text-center text-primary font-medium">Artigo não encontrado.</div>;

  return (
    <article className="bg-secondary py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Go Back */}
        <div className="max-w-4xl mx-auto mb-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-accent-gold font-bold hover:underline hover:text-primary transition-all duration-200">
            <ArrowLeft size={18} /> Voltar para o blog
          </Link>
        </div>

        {/* Two-Column Grid: Main Content & Sticky TOC */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-7xl mx-auto">
          
          {/* Main Article Content */}
          <div className="lg:col-span-8 bg-white border border-light-gray rounded-3xl p-6 md:p-10 shadow-sm">
            
            {/* SEO Tags Badge */}
            {post.tags && post.tags.length > 0 && (
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

            {/* Article Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-primary mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Metadata (Author, Date, Read Time) */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-dark-gray/80 mb-8 border-b border-light-gray pb-6">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-accent-gold" />
                {new Date(post.createdAt).toLocaleDateString('pt-BR')}
              </div>
              {(post.authorName || post.author) && (
                <div className="flex items-center gap-2">
                  <User size={16} className="text-accent-gold" />
                  {post.authorName || post.author?.fullName}
                </div>
              )}
              {post.readTimeMinutes > 0 && (
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-accent-gold" />
                  {post.readTimeMinutes} min de leitura
                </div>
              )}
            </div>

            {/* Featured Image */}
            {post.featuredImageUrl && (
              <div className="w-full h-96 md:h-[450px] overflow-hidden rounded-3xl mb-10 shadow-md">
                <img src={post.featuredImageUrl} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Rendered Content Blocks */}
            <BlockRenderer blocks={post.contentBlocks} />
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
                        const element = document.getElementById(heading.id);
                        if (element) {
                          const yOffset = -90; // Adjust offset to account for sticky navbar
                          const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
                          window.scrollTo({ top: y, behavior: 'smooth' });
                        }
                      }}
                      className={`block py-2 text-sm leading-relaxed pl-3 border-l-2 transition-all duration-200 hover:text-accent-gold hover:pl-4 ${
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
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-300">
                <AlignLeft size={160} />
              </div>
              <h4 className="text-xl font-bold mb-2">Dúvidas sobre o visto?</h4>
              <p className="text-sm text-blue-100 mb-6">
                Fale com nossos especialistas agora mesmo e aumente as chances de aprovação do seu visto americano.
              </p>
              <Link
                to="/ds-160"
                className="inline-block w-full py-3 bg-accent-gold hover:bg-opacity-95 text-white font-bold text-center rounded-2xl shadow-md transition-all duration-200"
              >
                Simular DS-160
              </Link>
            </div>
          </aside>

        </div>
      </div>
      
      {/* Dynamic Styling Overrides for Rich Text Headers Inside Article Body */}
      <style>{`
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
