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
