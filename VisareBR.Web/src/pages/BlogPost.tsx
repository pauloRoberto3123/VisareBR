import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPost } from '../api/blogService';
import type { BlogPost } from '../api/blogService';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import DOMPurify from 'dompurify';
import 'react-quill-new/dist/quill.snow.css';

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getPost(parseInt(id))
        .then((res: any) => setPost(res.data))
        .catch((err: any) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (!post) return;

    // Update Page Title
    const originalTitle = document.title;
    document.title = `${post.title} | VisareBR`;

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
    updateMetaTag('name', 'description', post.summary);

    // Open Graph Meta Tags (Facebook / WhatsApp / etc.)
    updateMetaTag('property', 'og:title', post.title);
    updateMetaTag('property', 'og:description', post.summary);
    updateMetaTag('property', 'og:type', 'article');
    if (post.imageUrl) {
      updateMetaTag('property', 'og:image', post.imageUrl);
    }
    updateMetaTag('property', 'og:url', window.location.href);

    // Twitter Card Meta Tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', post.title);
    updateMetaTag('name', 'twitter:description', post.summary);
    if (post.imageUrl) {
      updateMetaTag('name', 'twitter:image', post.imageUrl);
    }

    // JSON-LD Structured Data (Google Rich Snippets)
    const jsonLdData = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      },
      "headline": post.title,
      "description": post.summary,
      "image": post.imageUrl || "",
      "datePublished": post.createdAt,
      "author": {
        "@type": "Person",
        "name": post.author?.fullName || "VisareBR"
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
      
      // Clean up dynamic meta tags
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

  if (loading) return <div className="py-20 text-center text-primary">Carregando...</div>;
  if (!post) return <div className="py-20 text-center text-primary">Artigo não encontrado.</div>;

  return (
    <article className="bg-secondary py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/blog" className="inline-flex items-center gap-2 text-accent-gold font-medium mb-8 hover:underline hover:text-primary transition-colors duration-200">
          <ArrowLeft size={18} className="text-accent-gold" /> Voltar para o blog
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center gap-6 text-dark-gray mb-10 border-b border-light-gray pb-6">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-dark-gray" />
            {new Date(post.createdAt).toLocaleDateString('pt-BR')}
          </div>
          {post.author && (
            <div className="flex items-center gap-2">
              <User size={18} className="text-dark-gray" />
              {post.author.fullName}
            </div>
          )}
        </div>

        {post.imageUrl && (
          <img src={post.imageUrl} alt={post.title} className="w-full h-auto rounded-3xl mb-10 shadow-lg" />
        )}

        <style>{`
          .blog-content iframe.ql-video {
            width: 100%;
            height: 400px;
            border-radius: 0.75rem;
            margin: 2rem 0;
          }
          /* Removes the default padding added by Quill to align perfectly with your layout */
          .blog-content.ql-editor {
            padding: 0;
          }
          .blog-content h1 { font-size: 2.25em; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.8em; color: var(--color-primary, #0A3161); }
          .blog-content h2 { font-size: 1.5em; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.8em; color: var(--color-primary, #0A3161); }
          .blog-content h3 { font-size: 1.25em; font-weight: 600; margin-top: 1.5em; margin-bottom: 0.6em; color: var(--color-primary, #0A3161); }
          .blog-content p { margin-bottom: 1.2em; line-height: 1.75; }
          .blog-content ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1.2em; }
          .blog-content ol { list-style-type: decimal; margin-left: 1.5rem; margin-bottom: 1.2em; }
          .blog-content li { margin-bottom: 0.4em; }
          .blog-content a { color: var(--color-accent-gold, #C5A880); text-decoration: underline; }
          .blog-content strong, .blog-content b { font-weight: 700; }
        `}</style>
        <div className="ql-snow">
          <div 
            className="ql-editor prose prose-lg max-w-none text-dark-gray leading-relaxed blog-content"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(post.content, { 
                ADD_TAGS: ['iframe'], 
                ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target', 'rel'] 
              }) 
            }}
          />
        </div>
      </div>
    </article>
  );
}
