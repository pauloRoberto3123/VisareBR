import { useState, useEffect } from 'react';
import api from '../api/blogService';
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'blog' | 'evaluations'>('blog');
  const [posts, setPosts] = useState<any[]>([]);
  const [evals, setEvals] = useState<any[]>([]);
  
  // Blog Form State
  const [newPost, setNewPost] = useState({ title: '', summary: '', content: '', imageUrl: '' });

  // Settings State
  const [settings, setSettings] = useState({ whatsappNumber: '', whatsappDefaultMessage: '', cnpj: '', address: '', companyEmail: '' });

  useEffect(() => {
    fetchData();
    fetchSettings();
  }, [activeTab]);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      setSettings(res.data);
    } catch (err) {}
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/settings', settings);
      alert('Configurações atualizadas!');
    } catch (err) {
      alert('Erro ao atualizar configurações.');
    }
  };

  const fetchData = async () => {
    try {
      if (activeTab === 'blog') {
        const res = await api.get('/blog');
        setPosts(res.data);
      } else {
        const res = await api.get('/evaluations/admin');
        setEvals(res.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/blog', newPost);
      setNewPost({ title: '', summary: '', content: '', imageUrl: '' });
      fetchData();
      alert('Post criado com sucesso!');
    } catch (err) {
      alert('Erro ao criar post.');
    }
  };

  const handleDeletePost = async (id: number) => {
    if (confirm('Deseja excluir este post?')) {
      await api.delete(`/blog/${id}`);
      fetchData();
    }
  };

  const handleApproveEval = async (id: number, approve: boolean) => {
    await api.put(`/evaluations/${id}/approve?approve=${approve}`);
    fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Painel de Controle</h1>
      
      <div className="flex gap-4 mb-10 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('blog')}
          className={`pb-4 px-4 font-bold transition-colors ${activeTab === 'blog' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Gerenciar Blog
        </button>
        <button 
          onClick={() => setActiveTab('evaluations')}
          className={`pb-4 px-4 font-bold transition-colors ${activeTab === 'evaluations' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Aprovar Avaliações
        </button>
        <button 
          onClick={() => setActiveTab('settings' as any)}
          className={`pb-4 px-4 font-bold transition-colors ${activeTab === ('settings' as any) ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Configurações do Site
        </button>
      </div>

      {activeTab === ('settings' as any) && (
        <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Informações Gerais e WhatsApp</h2>
          <form onSubmit={handleUpdateSettings} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Número do WhatsApp (Ex: 5511999999999)</label>
              <input 
                className="w-full p-3 border border-gray-200 rounded-lg"
                value={settings.whatsappNumber}
                onChange={e => setSettings({...settings, whatsappNumber: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mensagem Padrão do WhatsApp</label>
              <input 
                className="w-full p-3 border border-gray-200 rounded-lg"
                value={settings.whatsappDefaultMessage}
                onChange={e => setSettings({...settings, whatsappDefaultMessage: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">CNPJ</label>
                <input 
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  value={settings.cnpj}
                  onChange={e => setSettings({...settings, cnpj: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email da Empresa</label>
                <input 
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  value={settings.companyEmail}
                  onChange={e => setSettings({...settings, companyEmail: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Endereço</label>
              <input 
                className="w-full p-3 border border-gray-200 rounded-lg"
                value={settings.address}
                onChange={e => setSettings({...settings, address: e.target.value})}
              />
            </div>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">
              Salvar Configurações
            </button>
          </form>
        </div>
      )}

      {activeTab === 'blog' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Create Post Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus size={20}/> Novo Artigo</h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <input 
                placeholder="Título" 
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newPost.title}
                onChange={e => setNewPost({...newPost, title: e.target.value})}
                required
              />
              <input 
                placeholder="Resumo (descrição curta)" 
                className="w-full p-3 border border-gray-200 rounded-lg"
                value={newPost.summary}
                onChange={e => setNewPost({...newPost, summary: e.target.value})}
                required
              />
              <input 
                placeholder="URL da Imagem" 
                className="w-full p-3 border border-gray-200 rounded-lg"
                value={newPost.imageUrl}
                onChange={e => setNewPost({...newPost, imageUrl: e.target.value})}
              />
              <textarea 
                placeholder="Conteúdo completo" 
                rows={10}
                className="w-full p-3 border border-gray-200 rounded-lg"
                value={newPost.content}
                onChange={e => setNewPost({...newPost, content: e.target.value})}
                required
              />
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                Publicar Artigo
              </button>
            </form>
          </div>

          {/* Post List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold mb-6">Artigos Publicados</h2>
            {posts.map(post => (
              <div key={post.id} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                <div>
                  <h3 className="font-bold text-gray-900">{post.title}</h3>
                  <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <button onClick={() => handleDeletePost(post.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                  <Trash2 size={20}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'evaluations' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-6">Moderação de Depoimentos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {evals.map(ev => (
              <div key={ev.id} className={`p-6 rounded-2xl border ${ev.isApproved ? 'border-green-100 bg-green-50/30' : 'border-yellow-100 bg-yellow-50/30'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{ev.userName}</h3>
                    <div className="flex gap-1 text-yellow-500 mt-1">
                      {[...Array(ev.rating)].map((_, i) => <span key={i}>★</span>)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApproveEval(ev.id, true)}
                      className={`p-2 rounded-lg transition-colors ${ev.isApproved ? 'text-green-600 bg-green-100' : 'text-gray-400 bg-white hover:text-green-600 hover:bg-green-100'}`}
                    >
                      <CheckCircle size={20}/>
                    </button>
                    <button 
                      onClick={() => handleApproveEval(ev.id, false)}
                      className={`p-2 rounded-lg transition-colors ${!ev.isApproved ? 'text-red-600 bg-red-100' : 'text-gray-400 bg-white hover:text-red-600 hover:bg-red-100'}`}
                    >
                      <XCircle size={20}/>
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{ev.comment}"</p>
                <p className="text-xs text-gray-400 mt-4">{new Date(ev.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
