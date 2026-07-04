import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import type { ArticleBlock } from '../api/blogService';
import 'react-quill-new/dist/quill.snow.css';

interface BlockRendererProps {
  blocks: ArticleBlock[];
}

export default function BlockRenderer({ blocks }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="space-y-8 blog-content">
      {blocks.map((block) => {
        switch (block.type) {
          case 'text':
            if (!block.content) return null;
            // Clean up non-breaking spaces to ensure text wraps correctly at word boundaries
            const cleanedContent = block.content.replace(/\u00a0/g, ' ').replace(/&nbsp;/g, ' ');
            return (
              <div
                key={block.id || block.order}
                className="ql-snow"
              >
                <div
                  className="ql-editor prose prose-lg max-w-none text-dark-gray leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(cleanedContent, {
                      ADD_TAGS: ['iframe'],
                      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target', 'rel', 'id']
                    })
                  }}
                />
              </div>
            );

          case 'image':
            if (!block.imageUrl) return null;
            return (
              <div key={block.id || block.order} className="my-6">
                <img
                  src={block.imageUrl}
                  alt={block.altText || 'Imagem do artigo'}
                  className="w-full h-auto rounded-3xl shadow-md object-cover hover:shadow-lg transition-shadow duration-300"
                />
                {block.altText && (
                  <p className="text-center text-xs text-dark-gray/60 italic mt-2">
                    {block.altText}
                  </p>
                )}
              </div>
            );

          case 'video':
            if (!block.sourceUrl && !block.embedData) return null;
            const rawUrl = block.embedData || block.sourceUrl;
            const embedUrl = parseVideoEmbedUrl(rawUrl || '');
            return (
              <div key={block.id || block.order} className="my-8">
                <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-lg border border-light-gray">
                  <iframe
                    src={embedUrl}
                    title="Vídeo do artigo"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full"
                  />
                </div>
              </div>
            );

          case 'button':
            if (!block.label || !block.targetUrl) return null;
            const isLocal = block.targetUrl.startsWith('/') && !block.targetUrl.startsWith('//');
            const buttonStyle = {
              backgroundColor: block.hexColorCode || '#0A3161',
            };

            return (
              <div key={block.id || block.order} className="flex justify-center my-8">
                {isLocal ? (
                  <Link
                    to={block.targetUrl}
                    style={buttonStyle}
                    className="inline-block px-8 py-3.5 rounded-2xl font-bold text-white text-center shadow-md hover:shadow-xl hover:translate-y-[-2px] active:translate-y-0 transition-all duration-200 cursor-pointer"
                  >
                    {block.label}
                  </Link>
                ) : (
                  <a
                    href={block.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={buttonStyle}
                    className="inline-block px-8 py-3.5 rounded-2xl font-bold text-white text-center shadow-md hover:shadow-xl hover:translate-y-[-2px] active:translate-y-0 transition-all duration-200 cursor-pointer"
                  >
                    {block.label}
                  </a>
                )}
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

function parseVideoEmbedUrl(url: string): string {
  if (!url) return '';
  url = url.trim();

  // YouTube RegExp (handles watch URLs, share links, embeds, shorts)
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const ytMatch = url.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  // Instagram
  if (url.includes('instagram.com')) {
    const cleanUrl = url.split('?')[0].replace(/\/$/, '');
    return `${cleanUrl}/embed`;
  }

  // TikTok
  if (url.includes('tiktok.com')) {
    const ttMatch = url.match(/video\/(\d+)/);
    if (ttMatch && ttMatch[1]) {
      return `https://www.tiktok.com/embed/v2/${ttMatch[1]}`;
    }
  }

  return url;
}
