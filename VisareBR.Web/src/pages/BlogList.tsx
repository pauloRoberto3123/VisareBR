import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Article } from '../api/blogService';
import { getArticles } from '../api/blogService';
import { Calendar, User } from 'lucide-react';

export default function BlogList() {
  const [posts, setPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    getArticles()
      .then((res: any) => setPosts(res.data))
      .catch((err: any) => console.error("Error fetching posts:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="py-20 text-center text-primary">Carregando artigos...</div>;

  return (
    <div className="bg-secondary py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">
            {searchQuery ? 'Resultados da Pesquisa' : 'Artigos VisareBR'}
          </h1>
          <p className="text-xl text-dark-gray">
            {searchQuery 
              ? `Mostrando resultados para "${searchQuery}"` 
              : 'Dicas, notícias e guias completos sobre vistos americanos.'}
          </p>
          {searchQuery && (
            <button 
              onClick={() => setSearchParams({})} 
              className="mt-4 inline-flex items-center gap-1.5 text-accent-gold font-bold hover:underline cursor-pointer"
            >
              Limpar busca / Ver todos
            </button>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 bg-light-gray rounded-2xl">
            <p className="text-dark-gray">Nenhum artigo publicado ainda. Em breve novidades!</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-light-gray rounded-2xl">
            <p className="text-dark-gray">Nenhum artigo encontrado para "{searchQuery}".</p>
            <button 
              onClick={() => setSearchParams({})} 
              className="mt-4 bg-primary text-secondary px-6 py-2.5 rounded-xl font-bold hover:bg-opacity-95 transition-all text-sm cursor-pointer shadow-md"
            >
              Ver todos os artigos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Link 
                key={post.id} 
                to={`/blog/${post.slug}`} 
                className="flex flex-col bg-secondary border border-light-gray rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-accent-gold/40 transition-all duration-300 group"
              >
                <div className="h-48 bg-light-gray flex items-center justify-center text-dark-gray overflow-hidden">
                  {post.featuredImageUrl ? (
                    <img src={post.featuredImageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-lg">Sem imagem</span>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-sm text-dark-gray mb-3">
                    <span className="flex items-center gap-1"><Calendar size={14} className="text-gray-500" /> {new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                    {(post.authorName || post.author) && <span className="flex items-center gap-1"><User size={14} className="text-gray-500" /> {post.authorName || post.author?.fullName}</span>}
                  </div>
                  <h2 className="text-xl font-bold text-primary mb-3 line-clamp-2 group-hover:text-accent-gold transition-colors duration-200">{post.title}</h2>
                  <p className="text-dark-gray mb-6 line-clamp-3">{post.summary}</p>
                  <span className="mt-auto text-accent-gold font-bold group-hover:underline">
                    Ler mais →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

