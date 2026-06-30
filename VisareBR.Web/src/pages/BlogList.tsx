import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Article } from '../api/blogService';
import { getArticles } from '../api/blogService';
import { Calendar, User } from 'lucide-react';

export default function BlogList() {
  const [posts, setPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArticles()
      .then((res: any) => setPosts(res.data))
      .catch((err: any) => console.error("Error fetching posts:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 text-center text-primary">Carregando artigos...</div>;

  return (
    <div className="bg-secondary py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Blog VisareBR</h1>
          <p className="text-xl text-dark-gray">Dicas, notícias e guias completos sobre vistos americanos.</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 bg-light-gray rounded-2xl">
            <p className="text-dark-gray">Nenhum artigo publicado ainda. Em breve novidades!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article key={post.id} className="flex flex-col bg-secondary border border-light-gray rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 bg-light-gray flex items-center justify-center text-dark-gray overflow-hidden">
                  {post.featuredImageUrl ? (
                    <img src={post.featuredImageUrl} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg">Sem imagem</span>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-sm text-dark-gray mb-3">
                    <span className="flex items-center gap-1"><Calendar size={14} className="text-gray-500" /> {new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                    {(post.authorName || post.author) && <span className="flex items-center gap-1"><User size={14} className="text-gray-500" /> {post.authorName || post.author?.fullName}</span>}
                  </div>
                  <h2 className="text-xl font-bold text-primary mb-3 line-clamp-2 hover:text-accent-gold transition-colors duration-200">{post.title}</h2>
                  <p className="text-dark-gray mb-6 line-clamp-3">{post.summary}</p>
                  <Link to={`/blog/${post.slug}`} className="mt-auto text-accent-gold font-bold hover:underline">
                    Ler mais →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

