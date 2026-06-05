import { useState, useEffect } from 'react';
import api from '../api/blogService';
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'blog' | 'evaluations' | 'settings'>('blog'); // Added 'settings' to activeTab type
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

  const fetchData = async () => {
    try {
      if (activeTab === 'blog') {
        const res = await api.get('/blog');
        setPosts(res.data);
      } else if (activeTab === 'evaluations') {
        const res = await api.get('/evaluations/admin');
        setEvals(res.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      setSettings(res.data);
    } catch (err) {
        console.error("Error fetching settings:", err);
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

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/settings', settings);
      alert('Configurações atualizadas!');
    } catch (err) {
      alert('Erro ao atualizar configurações.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-secondary min-h-[80vh]">
      <h1 className="text-3xl font-bold mb-8 text-primary">Painel de Controle</h1>
      
      <div className="flex gap-4 mb-10 border-b border-light-gray">
        <button 
          onClick={() => setActiveTab('blog')}
          className={`pb-4 px-4 font-bold transition-colors ${activeTab === 'blog' ? 'border-b-4 border-accent-gold text-accent-gold' : 'text-dark-gray hover:text-primary'}`}
        >
          Gerenciar Blog
        </button>
        <button 
          onClick={() => setActiveTab('evaluations')}
          className={`pb-4 px-4 font-bold transition-colors ${activeTab === 'evaluations' ? 'border-b-4 border-accent-gold text-accent-gold' : 'text-dark-gray hover:text-primary'}`}
        >
          Aprovar Avaliações
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`pb-4 px-4 font-bold transition-colors ${activeTab === 'settings' ? 'border-b-4 border-accent-gold text-accent-gold' : 'text-dark-gray hover:text-primary'}`}
        >
          Configurações do Site
        </button>
      </div>

      {activeTab === 'blog' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Create Post Form */}
          <div className="lg:col-span-1 bg-secondary p-6 rounded-2xl shadow-sm border border-light-gray">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary"><Plus size={20}/> Novo Artigo</h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <input 
                placeholder="Título" 
                className="w-full p-3 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-gold text-primary"
                value={newPost.title}
                onChange={e => setNewPost({...newPost, title: e.target.value})}
                required
              />
              <input 
                placeholder="Resumo (descrição curta)" 
                className="w-full p-3 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-gold text-primary"
                value={newPost.summary}
                onChange={e => setNewPost({...newPost, summary: e.target.value})}
                required
              />
              <input 
                placeholder="URL da Imagem" 
                className="w-full p-3 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-gold text-primary"
                value={newPost.imageUrl}
                onChange={e => setNewPost({...newPost, imageUrl: e.target.value})}
              />
              <textarea 
                placeholder="Conteúdo completo" 
                rows={10}
                className="w-full p-3 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-gold text-primary"
                value={newPost.content}
                onChange={e => setNewPost({...newPost, content: e.target.value})}
                required
              />
              <button className="w-full bg-accent-gold text-primary py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors">
                Publicar Artigo
              </button>
            </form>
          </div>

          {/* Post List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold mb-6 text-primary">Artigos Publicados</h2>
            {posts.map(post => (
              <div key={post.id} className="flex justify-between items-center p-4 bg-secondary border border-light-gray rounded-xl shadow-sm">
                <div>
                  <h3 className="font-bold text-primary">{post.title}</h3>
                  <p className="text-sm text-dark-gray">{new Date(post.createdAt).toLocaleDateString('pt-BR')}</p>
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
          <h2 className="text-xl font-bold mb-6 text-primary">Moderação de Depoimentos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {evals.map(ev => (
              <div key={ev.id} className={`p-6 rounded-2xl border ${ev.isApproved ? 'border-accent-gold bg-accent-gold/[0.1]' : 'border-dark-gray bg-light-gray'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-primary">{ev.userName}</h3>
                    <div className="flex gap-1 text-accent-gold mt-1">
                      {[...Array(ev.rating)].map((_, i) => <span key={i}>★</span>)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApproveEval(ev.id, true)}
                      className={`p-2 rounded-lg transition-colors ${ev.isApproved ? 'text-secondary bg-accent-gold' : 'text-dark-gray bg-light-gray hover:text-accent-gold hover:bg-light-gray'}`}
                    >
                      <CheckCircle size={20}/>
                    </button>
                    <button 
                      onClick={() => handleApproveEval(ev.id, false)}
                      className={`p-2 rounded-lg transition-colors ${!ev.isApproved ? 'text-red-500 bg-red-100' : 'text-dark-gray bg-light-gray hover:text-red-500 hover:bg-red-100'}`}
                    >
                      <XCircle size={20}/>
                    </button>
                  </div>
                </div>
                <p className="text-dark-gray italic">"{ev.comment}"</p>
                <p className="text-xs text-gray-500 mt-4">{new Date(ev.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-secondary p-8 rounded-2xl shadow-sm border border-light-gray">
          <h2 className="text-xl font-bold mb-6 text-primary">Informações Gerais e WhatsApp</h2>
          <form onSubmit={handleUpdateSettings} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-primary">Número do WhatsApp (Ex: 5511999999999)</label>
              <input 
                className="w-full p-3 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-gold text-primary"
                value={settings.whatsappNumber}
                onChange={e => setSettings({...settings, whatsappNumber: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-primary">Mensagem Padrão do WhatsApp</label>
              <input 
                className="w-full p-3 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-gold text-primary"
                value={settings.whatsappDefaultMessage}
                onChange={e => setSettings({...settings, whatsappDefaultMessage: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-primary">CNPJ</label>
                <input 
                  className="w-full p-3 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-gold text-primary"
                  value={settings.cnpj}
                  onChange={e => setSettings({...settings, cnpj: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-primary">Email da Empresa</label>
                <input 
                  className="w-full p-3 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-gold text-primary"
                  value={settings.companyEmail}
                  onChange={e => setSettings({...settings, companyEmail: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-primary">Endereço</label>
              <input 
                className="w-full p-3 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-gold text-primary"
                value={settings.address}
                onChange={e => setSettings({...settings, address: e.target.value})}
              />
            </div>
            <button className="w-full bg-accent-gold text-primary py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors">
              Salvar Configurações
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
