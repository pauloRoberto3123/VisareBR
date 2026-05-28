import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPosts, type BlogPost } from '../api/blogService';
import { Calendar, User } from 'lucide-react';

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts()
      .then((res) => setPosts(res.data))
      .catch((err) => console.error("Error fetching posts:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 text-center">Carregando artigos...</div>;

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog VisareBR</h1>
          <p className="text-xl text-gray-600">Dicas, notícias e guias completos sobre vistos americanos.</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <p className="text-gray-500">Nenhum artigo publicado ainda. Em breve novidades!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article key={post.id} className="flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-200">
                  {post.imageUrl ? (
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">Sem imagem</div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                    {post.author && <span className="flex items-center gap-1"><User size={14} /> {post.author.fullName}</span>}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{post.title}</h2>
                  <p className="text-gray-600 mb-6 line-clamp-3">{post.summary}</p>
                  <Link to={`/blog/${post.id}`} className="mt-auto text-blue-600 font-bold hover:text-blue-700">
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
