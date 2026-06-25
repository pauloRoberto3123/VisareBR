import { useState, useEffect } from 'react';
import api from '../api/blogService';
import type { BlogPost, Evaluation, Ds160Submission } from '../api/blogService';
import type { Plan } from './PricingSection';
import { Plus, Trash2, CheckCircle, XCircle, DollarSign, LogOut, BarChart3, FileText, MessageSquare, TrendingUp, Edit, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const Delta = Quill.import('delta') as any;
const ColorStyle = Quill.import('attributors/style/color') as any;
const BackgroundStyle = Quill.import('attributors/style/background') as any;
Quill.register(ColorStyle, true);
Quill.register(BackgroundStyle, true);

interface StandaloneService {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'blog' | 'evaluations' | 'settings' | 'ds160' | 'pricing'>('overview');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [evals, setEvals] = useState<Evaluation[]>([]);
  const [ds160Forms, setDs160Forms] = useState<Ds160Submission[]>([]);
  const [selectedDs160, setSelectedDs160] = useState<Ds160Submission | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [standaloneServices, setStandaloneServices] = useState<StandaloneService[]>([]);
  const [editingStandaloneService, setEditingStandaloneService] = useState<StandaloneService | null>(null);
  
  // Blog Form State
  const [newPost, setNewPost] = useState({ title: '', summary: '', content: '', imageUrl: '' });
  const [editorMode, setEditorMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  // Settings State
  const [settings, setSettings] = useState({ whatsappNumber: '', whatsappDefaultMessage: '', cnpj: '', address: '', companyEmail: '' });

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }, { 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false, // Improves pasting from Google Docs/Word by preventing weird margins
      matchers: [
        ['B', (node: any, delta: any) => {
          if (node.style && node.style.fontWeight === 'normal') {
            return delta;
          }
          return delta.compose(new Delta().retain(delta.length(), { bold: true }));
        }],
        ['SPAN', (node: any, delta: any) => {
          const styles = node.style;
          if (!styles) return delta;

          const attributes: Record<string, any> = {};

          if (styles.fontWeight === '700' || styles.fontWeight === 'bold') {
            attributes.bold = true;
          }
          if (styles.fontStyle === 'italic') {
            attributes.italic = true;
          }
          if (styles.textDecoration && styles.textDecoration.includes('underline')) {
            attributes.underline = true;
          }
          if (styles.textDecoration && styles.textDecoration.includes('line-through')) {
            attributes.strike = true;
          }
          if (styles.color) {
            attributes.color = styles.color;
          }
          if (styles.backgroundColor) {
            attributes.background = styles.backgroundColor;
          }

          if (Object.keys(attributes).length > 0) {
            return delta.compose(new Delta().retain(delta.length(), attributes));
          }
          return delta;
        }]
      ]
    }
  };

  useEffect(() => {
    fetchData();
    fetchSettings();
  }, [activeTab]);

  const handleManualLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Inactivity Logout Timer (15 minutos)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // 15 minutos = 900.000 milissegundos
      timeoutId = setTimeout(() => {
        alert('Sua sessão expirou por inatividade.');
        handleManualLogout();
      }, 900000);
    };

    resetTimer();
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimer));

    return () => {
      clearTimeout(timeoutId);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [navigate]);

  const fetchData = async () => {
    try {
      if (activeTab === 'overview') {
        const [postsRes, evalsRes, ds160Res] = await Promise.all([
          api.get('/blog'),
          api.get('/evaluations/admin'),
          api.get('/ds160/admin')
        ]);
        setPosts(postsRes.data);
        setEvals(evalsRes.data);
        setDs160Forms(ds160Res.data);
      } else if (activeTab === 'blog') {
        const res = await api.get('/blog');
        setPosts(res.data);
      } else if (activeTab === 'evaluations') {
        const res = await api.get('/evaluations/admin');
        setEvals(res.data);
      } else if (activeTab === 'ds160') {
        const res = await api.get('/ds160/admin');
        setDs160Forms(res.data);
      } else if (activeTab === 'pricing') {
        const [plansRes, servicesRes] = await Promise.all([
          api.get('/pricing'),
          api.get('/services/standalone')
        ]);
        setPlans(plansRes.data);
        setStandaloneServices(servicesRes.data);
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

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.content || newPost.content === '<p><br></p>') {
      alert('O conteúdo do post é obrigatório.');
      return;
    }
    try {
      if (editorMode === 'edit' && editingPostId !== null) {
        await api.put(`/blog/${editingPostId}`, newPost);
        alert('Artigo atualizado com sucesso!');
      } else {
        await api.post('/blog', newPost);
        alert('Artigo publicado com sucesso!');
      }
      setNewPost({ title: '', summary: '', content: '', imageUrl: '' });
      setEditingPostId(null);
      setEditorMode('list');
      fetchData();
    } catch (err) {
      alert('Erro ao salvar o artigo.');
    }
  };

  const handleEditClick = (post: BlogPost) => {
    setNewPost({
      title: post.title,
      summary: post.summary,
      content: post.content,
      imageUrl: post.imageUrl || ''
    });
    setEditingPostId(post.id);
    setEditorMode('edit');
  };

  const handleNewPostClick = () => {
    setNewPost({ title: '', summary: '', content: '', imageUrl: '' });
    setEditingPostId(null);
    setEditorMode('create');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("A imagem selecionada é muito grande. Escolha uma imagem de até 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setNewPost({ ...newPost, imageUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePost = async (id: number) => {
    if (confirm('Deseja excluir este post?')) {
      await api.delete(`/blog/${id}`);
      if (editingPostId === id) {
        setEditorMode('list');
        setEditingPostId(null);
        setNewPost({ title: '', summary: '', content: '', imageUrl: '' });
      }
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

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    
    try {
      await api.put(`/pricing/${selectedPlan.id}`, selectedPlan);
      alert('Valores do plano atualizados com sucesso!');
      setSelectedPlan(null);
      fetchData();
    } catch (err) {
      alert('Erro ao atualizar plano.');
    }
  };

  const handleTierChange = (applicantCount: number, price: string) => {
    if (!selectedPlan) return;
    const updatedTiers = [...selectedPlan.pricingTiers];
    const tierIndex = updatedTiers.findIndex(t => t.applicantCount === applicantCount);

    if (price === '') {
      if (tierIndex >= 0) updatedTiers.splice(tierIndex, 1);
    } else {
      const numPrice = parseFloat(price.replace(',', '.')) || 0;
      if (tierIndex >= 0) updatedTiers[tierIndex].totalPrice = numPrice;
      else updatedTiers.push({ id: 0, applicantCount: applicantCount, totalPrice: numPrice });
    }

    setSelectedPlan({ ...selectedPlan, pricingTiers: updatedTiers });
  };

  const handleSaveStandaloneService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStandaloneService) return;

    const serviceToSave = {
        ...editingStandaloneService,
        price: Number(editingStandaloneService.price) || 0
    };

    try {
      if (serviceToSave.id !== '00000000-0000-0000-0000-000000000000') {
        await api.put(`/services/standalone/${serviceToSave.id}`, serviceToSave);
      } else {
        const { id, ...newService } = serviceToSave;
        await api.post('/services/standalone', newService);
      }
      alert('Serviço salvo com sucesso!');
      setEditingStandaloneService(null);
      fetchData();
    } catch (err) {
      alert('Erro ao salvar serviço.');
      console.error(err);
    }
  };

  const handleDeleteStandaloneService = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço avulso?')) {
      try {
        await api.delete(`/services/standalone/${id}`);
        alert('Serviço excluído com sucesso!');
        fetchData();
      } catch (err) {
        alert('Erro ao excluir serviço.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-secondary min-h-[80vh]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-primary">Painel de Controle</h1>
        <button 
          onClick={handleManualLogout}
          className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-colors border border-red-200"
        >
          <LogOut size={20} /> Sair do Sistema
        </button>
      </div>
      
      <div className="flex gap-4 mb-10 border-b border-light-gray overflow-x-auto whitespace-nowrap pb-2 -mx-4 px-4">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-4 px-4 font-bold transition-colors ${activeTab === 'overview' ? 'border-b-4 border-accent-gold text-accent-gold' : 'text-dark-gray hover:text-primary'}`}
        >
          Visão Geral
        </button>
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
        <button 
          onClick={() => { setActiveTab('ds160'); setSelectedDs160(null); }}
          className={`pb-4 px-4 font-bold transition-colors ${activeTab === 'ds160' ? 'border-b-4 border-accent-gold text-accent-gold' : 'text-dark-gray hover:text-primary'}`}
        >
          Formulários DS-160
        </button>
        <button 
          onClick={() => { setActiveTab('pricing'); setSelectedPlan(null); setEditingStandaloneService(null); }}
          className={`pb-4 px-4 font-bold transition-colors ${activeTab === 'pricing' ? 'border-b-4 border-accent-gold text-accent-gold' : 'text-dark-gray hover:text-primary'}`}
        >
          Planos e Preços
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-primary">Dashboard de Desempenho</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-secondary p-6 rounded-2xl border border-light-gray shadow-sm flex items-center gap-4">
              <div className="p-4 bg-accent-gold/[0.2] text-accent-gold rounded-xl">
                <FileText size={32} />
              </div>
              <div>
                <p className="text-dark-gray text-sm font-bold uppercase tracking-wider">DS-160 Recebidos</p>
                <p className="text-3xl font-black text-primary">{ds160Forms.length}</p>
              </div>
            </div>
            
            <div className="bg-secondary p-6 rounded-2xl border border-light-gray shadow-sm flex items-center gap-4">
              <div className="p-4 bg-accent-red/[0.1] text-accent-red rounded-xl">
                <MessageSquare size={32} />
              </div>
              <div>
                <p className="text-dark-gray text-sm font-bold uppercase tracking-wider">Depoimentos Pendentes</p>
                <p className="text-3xl font-black text-primary">{evals.filter(e => !e.isApproved).length}</p>
              </div>
            </div>

            <div className="bg-secondary p-6 rounded-2xl border border-light-gray shadow-sm flex items-center gap-4">
              <div className="p-4 bg-green-500/10 text-green-500 rounded-xl">
                <TrendingUp size={32} />
              </div>
              <div>
                <p className="text-dark-gray text-sm font-bold uppercase tracking-wider">Artigos Publicados</p>
                <p className="text-3xl font-black text-primary">{posts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-secondary p-8 rounded-2xl border border-light-gray shadow-sm">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2 mb-6">
              <BarChart3 size={20} className="text-accent-gold" />
              Submissões de Visto (Últimos 7 dias)
            </h3>
            
            <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 mt-8 relative">
              {/* Linhas de fundo do gráfico */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                <div className="border-b border-dark-gray w-full h-0"></div>
                <div className="border-b border-dark-gray w-full h-0"></div>
                <div className="border-b border-dark-gray w-full h-0"></div>
                <div className="border-b border-dark-gray w-full h-0"></div>
              </div>

              {(() => {
                // Construindo o eixo X para os últimos 7 dias dinamicamente
                const last7Days = [...Array(7)].map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (6 - i));
                  return d.toISOString().split('T')[0];
                });
                
                const chartData = last7Days.map(date => {
                  const count = ds160Forms.filter(f => new Date(f.createdAt).toISOString().split('T')[0] === date).length;
                  const dateObj = new Date(date + 'T12:00:00Z');
                  return { 
                    date: dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), 
                    count 
                  };
                });
                
                const maxCount = Math.max(...chartData.map(d => d.count), 5); // Teto mínimo visual de 5
                
                return chartData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 z-10 h-full justify-end group">
                    <div className="text-xs font-bold text-dark-gray opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.count}
                    </div>
                    <div 
                      className="w-full bg-accent-gold rounded-t-md transition-all duration-1000 ease-out hover:bg-opacity-80" 
                      style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? '8px' : '2px' }}
                    ></div>
                    <span className="text-xs font-medium text-dark-gray">{d.date}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'blog' && editorMode === 'list' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-primary">Gerenciar Artigos</h2>
            <button
              onClick={handleNewPostClick}
              className="flex items-center gap-2 bg-primary text-secondary px-5 py-2.5 rounded-xl font-bold hover:bg-opacity-95 transition-all shadow-md cursor-pointer"
            >
              <Plus size={20} /> Novo Artigo
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {posts.length === 0 ? (
              <div className="bg-secondary p-12 text-center rounded-2xl border border-light-gray shadow-sm text-dark-gray">
                Nenhum artigo publicado ainda. Clique em "Novo Artigo" para começar.
              </div>
            ) : (
              posts.map(post => (
                <div key={post.id} className="bg-secondary border border-light-gray rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row hover:shadow-md transition-shadow">
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full md:w-56 h-40 md:h-auto object-cover"
                    />
                  ) : (
                    <div className="w-full md:w-56 h-40 md:h-auto bg-light-gray flex items-center justify-center text-dark-gray/30 border-r border-light-gray min-h-[160px]">
                      <FileText size={48} />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-dark-gray/60 font-semibold uppercase tracking-wider">
                          {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        {post.author && (
                          <>
                            <span className="text-dark-gray/30">•</span>
                            <span className="text-xs text-dark-gray/60 font-semibold">
                              Por {post.author.fullName}
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-primary mb-2">{post.title}</h3>
                      <p className="text-dark-gray text-sm line-clamp-2">{post.summary}</p>
                    </div>
                    <div className="flex gap-4 mt-6 pt-4 border-t border-light-gray justify-end">
                      <button
                        onClick={() => handleEditClick(post)}
                        className="flex items-center gap-1.5 text-primary hover:bg-primary/5 px-4 py-2 rounded-xl font-bold transition-colors text-sm cursor-pointer"
                      >
                        <Edit size={16} /> Editar
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="flex items-center gap-1.5 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl font-bold transition-colors text-sm cursor-pointer"
                      >
                        <Trash2 size={16} /> Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'blog' && (editorMode === 'create' || editorMode === 'edit') && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Bar */}
          <div className="flex justify-between items-center border-b border-light-gray pb-4">
            <button
              onClick={() => { setEditorMode('list'); setEditingPostId(null); }}
              className="text-primary font-bold hover:underline flex items-center gap-2 text-sm cursor-pointer"
            >
              ← Voltar para lista
            </button>
            <h2 className="text-xl font-extrabold text-primary">
              {editorMode === 'edit' ? 'Editar Artigo' : 'Novo Artigo'}
            </h2>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setEditorMode('list'); setEditingPostId(null); }}
                className="bg-light-gray text-dark-gray border border-dark-gray/20 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-100 transition-colors text-sm cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePost}
                className="bg-accent-red text-secondary px-6 py-2.5 rounded-xl font-bold hover:bg-opacity-90 transition-colors text-sm shadow-md cursor-pointer"
              >
                {editorMode === 'edit' ? 'Salvar Alterações' : 'Publicar Artigo'}
              </button>
            </div>
          </div>

          {/* Desktop/Workspace Canvas background for the sheet paper */}
          <div className="bg-slate-50 border border-gray-200/60 rounded-3xl p-4 md:p-8 lg:p-12 min-h-[90vh]">
            {/* Sheet of Paper */}
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-sm border border-gray-200/50 min-h-[297mm] flex flex-col p-8 md:p-16 relative">
              <form onSubmit={handleSavePost} className="space-y-6 flex-1 flex flex-col">
                
                {/* Image Cover URL & Preview */}
                <div className="space-y-3">
                  {newPost.imageUrl ? (
                    <div className="relative w-full h-64 bg-slate-100 rounded-2xl overflow-hidden group shadow-inner">
                      <img
                        src={newPost.imageUrl}
                        alt="Capa do artigo"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => setNewPost({ ...newPost, imageUrl: '' })}
                          className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-red-700 transition cursor-pointer"
                        >
                          Remover Imagem
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-slate-50 flex flex-col items-center justify-center text-center text-dark-gray hover:border-accent-gold/50 transition">
                      <FileText size={36} className="text-gray-400 mb-2" />
                      <p className="text-sm font-bold text-gray-500">Sem imagem de capa</p>
                      <p className="text-xs text-gray-400 mt-1 mb-4">Adicione uma URL abaixo ou selecione um arquivo local para a capa do artigo</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="URL da Imagem de Capa (ex: https://exemplo.com/capa.jpg)"
                      className="flex-1 p-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-gold focus:outline-none text-primary disabled:bg-gray-50 disabled:text-gray-400"
                      value={newPost.imageUrl.startsWith('data:image') ? 'Imagem carregada localmente (Base64)' : newPost.imageUrl}
                      onChange={e => setNewPost({ ...newPost, imageUrl: e.target.value })}
                      disabled={newPost.imageUrl.startsWith('data:image')}
                    />
                    <label className="bg-primary text-secondary px-5 py-2.5 rounded-xl font-bold hover:bg-opacity-95 transition-all text-sm cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shadow-sm">
                      <Upload size={16} /> Selecionar Arquivo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>

                {/* Article Title */}
                <div className="border-b border-gray-100 focus-within:border-accent-gold/40 pb-2 transition-colors">
                  <input
                    type="text"
                    placeholder="Título do Artigo..."
                    className="w-full text-3xl md:text-4xl font-extrabold text-primary placeholder:text-gray-200 focus:outline-none bg-transparent"
                    value={newPost.title}
                    onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                    required
                  />
                </div>

                {/* Article Summary */}
                <div className="border-b border-gray-100 focus-within:border-accent-gold/40 pb-2 transition-colors">
                  <textarea
                    placeholder="Resumo ou descrição curta (aparece nos cards da listagem)..."
                    rows={2}
                    className="w-full text-base text-dark-gray/80 placeholder:text-gray-300 focus:outline-none bg-transparent resize-none italic"
                    value={newPost.summary}
                    onChange={e => setNewPost({ ...newPost, summary: e.target.value })}
                    required
                  />
                </div>

                {/* Style override for Google Docs formatting toolbar and page contents */}
                <style>{`
                  /* Modern Editor Styling */
                  .admin-editor {
                    margin-top: 1rem;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                  }
                  .admin-editor .quill {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                  }
                  .admin-editor .ql-toolbar.ql-snow {
                    border: 1px solid #e2e8f0;
                    border-radius: 0.75rem;
                    background-color: #f8fafc;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    padding: 0.625rem 1rem;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.25rem;
                  }
                  .admin-editor .ql-container.ql-snow {
                    border: none;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    margin-top: 1rem;
                  }
                  .admin-editor .ql-editor {
                    min-height: 450px;
                    font-family: Inter, system-ui, sans-serif;
                    font-size: 1.05rem;
                    line-height: 1.7;
                    padding: 1.5rem 0;
                    color: #374151;
                    flex: 1;
                  }
                  .admin-editor .ql-editor.ql-blank::before {
                    left: 0;
                    font-style: italic;
                    color: #d1d5db;
                  }
                  .admin-editor .ql-editor h1 { font-size: 2.25em; font-weight: 800; margin-bottom: 0.8em; color: #0A3161; }
                  .admin-editor .ql-editor h2 { font-size: 1.6em; font-weight: 700; margin-top: 1.6em; margin-bottom: 0.8em; color: #0A3161; }
                  .admin-editor .ql-editor h3 { font-size: 1.3em; font-weight: 600; margin-top: 1.5em; margin-bottom: 0.6em; color: #0A3161; }
                  .admin-editor .ql-editor p { margin-bottom: 1.3em; }
                  .admin-editor .ql-editor ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1.3em; }
                  .admin-editor .ql-editor ol { list-style-type: decimal; margin-left: 1.5rem; margin-bottom: 1.3em; }
                  .admin-editor .ql-editor li { margin-bottom: 0.5em; }
                  .admin-editor .ql-editor a { color: #C5A880; text-decoration: underline; }
                  .admin-editor iframe.ql-video {
                    width: 100%;
                    height: 400px;
                    border-radius: 0.75rem;
                    margin: 2rem 0;
                  }
                `}</style>
                
                {/* Document Body Area */}
                <div className="admin-editor">
                  <ReactQuill
                    theme="snow"
                    modules={quillModules}
                    value={newPost.content}
                    onChange={(content: string) => setNewPost({ ...newPost, content })}
                    placeholder="Comece a digitar seu artigo aqui..."
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'evaluations' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-6 text-primary">Moderação de Depoimentos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {evals.map(ev => (
              <div key={ev.id} className={`p-6 rounded-2xl border ${ev.isApproved ? 'border-accent-gold bg-accent-red/[0.1]' : 'border-dark-gray bg-light-gray'}`}>
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
                      className={`p-2 rounded-lg transition-colors ${ev.isApproved ? 'text-secondary bg-accent-red' : 'text-dark-gray bg-light-gray hover:text-accent-gold hover:bg-light-gray'}`}
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
            <button className="w-full bg-accent-red text-secondary py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors">
              Salvar Configurações
            </button>
          </form>
        </div>
      )}

      {activeTab === 'ds160' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-6 text-primary">Formulários DS-160 Recebidos</h2>
          
          {selectedDs160 ? (
            <div className="bg-secondary p-8 rounded-2xl border border-light-gray shadow-sm">
              <button onClick={() => setSelectedDs160(null)} className="mb-6 flex items-center gap-2 text-accent-red font-bold hover:underline">
                ← Voltar para a lista
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 pb-8 border-b border-light-gray">
                <div>
                  <p className="text-sm text-dark-gray">Requerente</p>
                  <p className="font-bold text-primary text-lg">{selectedDs160.applicantName}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-gray">E-mail</p>
                  <p className="font-bold text-primary text-lg break-all">{selectedDs160.email}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-gray">Passaporte (Descriptografado)</p>
                  <p className="font-bold text-primary text-lg">{selectedDs160.passportNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-gray">Data de Envio</p>
                  <p className="font-bold text-primary text-lg">{new Date(selectedDs160.createdAt).toLocaleString('pt-BR')}</p>
                </div>
              </div>
              <div>
                {(() => {
                  const formData = JSON.parse(selectedDs160.jsonData);
                  const photoBase64 = formData.step3?.passportPhotoBase64;
                  if (photoBase64) formData.step3.passportPhotoBase64 = "[IMAGEM BASE64 OCULTA - VER ACIMA]";
                  
                  return (
                    <>
                      {photoBase64 && (
                        <div className="mb-6">
                          <h3 className="font-bold text-primary mb-4 text-lg">Foto do Passaporte</h3>
                          <img src={photoBase64} alt="Passaporte do Requerente" className="max-w-md w-full h-auto rounded-xl border border-light-gray shadow-md mb-8" />
                        </div>
                      )}
                      <h3 className="font-bold text-primary mb-4 text-lg">Dados Completos do Formulário</h3>
                      <pre className="bg-light-gray p-6 rounded-xl text-sm text-dark-gray overflow-auto max-h-[600px] border border-gray-200 shadow-inner">
                        {JSON.stringify(formData, null, 2)}
                      </pre>
                    </>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="bg-secondary rounded-2xl border border-light-gray shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-light-gray text-primary text-sm border-b border-gray-200">
                    <th className="p-4 font-bold">Requerente</th>
                    <th className="p-4 font-bold">Email</th>
                    <th className="p-4 font-bold">Passaporte</th>
                    <th className="p-4 font-bold">Data</th>
                    <th className="p-4 font-bold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {ds160Forms.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-dark-gray">Nenhum formulário recebido ainda.</td>
                    </tr>
                  ) : (
                    ds160Forms.map(form => (
                      <tr key={form.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-primary">{form.applicantName}</td>
                        <td className="p-4 text-dark-gray">{form.email}</td>
                        <td className="p-4 text-dark-gray font-mono text-xs">{form.passportNumber}</td>
                        <td className="p-4 text-dark-gray">{new Date(form.createdAt).toLocaleDateString('pt-BR')}</td>
                        <td className="p-4">
                          <button onClick={() => setSelectedDs160(form)} className="bg-primary text-secondary px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors text-sm">
                            Ver Completo
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-6 text-primary">Gerenciar Planos e Preços</h2>

          {selectedPlan ? (
            <div className="bg-secondary p-8 rounded-2xl border border-light-gray shadow-sm">
              <button onClick={() => setSelectedPlan(null)} className="mb-6 flex items-center gap-2 text-accent-red font-bold hover:underline">
                ← Voltar para a lista
              </button>

              <form onSubmit={handleUpdatePlan} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-primary">Nome do Plano</label>
                    <input
                      className="w-full p-3 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-gold text-primary"
                      value={selectedPlan.name}
                      onChange={e => setSelectedPlan({ ...selectedPlan, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-primary">Tempo de Processamento</label>
                    <input
                      className="w-full p-3 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-gold text-primary"
                      value={selectedPlan.processingTime}
                      onChange={e => setSelectedPlan({ ...selectedPlan, processingTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-primary mb-4 border-b border-light-gray pb-2 flex items-center gap-2"><DollarSign size={20} className="text-accent-gold"/> Preços por Quantidade de Solicitantes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(count => {
                      const tier = selectedPlan.pricingTiers.find(t => t.applicantCount === count);
                      return (
                        <div key={count} className="bg-light-gray p-4 rounded-xl border border-dark-gray/20">
                          <label className="block text-sm font-bold text-dark-gray mb-2">{count} {count === 1 ? 'Pessoa' : 'Pessoas'}</label>
                          <div className="flex items-center gap-2">
                            <span className="text-primary font-medium">R$</span>
                            <input
                              type="number"
                              step="0.01"
                              className="w-full p-2 border border-dark-gray rounded-md focus:ring-2 focus:ring-accent-gold"
                              value={tier ? tier.totalPrice : ''}
                              placeholder="0.00"
                              onChange={e => handleTierChange(count, e.target.value)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-dark-gray mt-2 italic">* Deixe o campo vazio para não exibir o plano para aquela quantidade de solicitantes.</p>
                </div>

                <button type="submit" className="bg-accent-red text-secondary px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-colors">
                  Salvar Valores
                </button>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map(plan => (
                <div key={plan.id} className="bg-secondary p-6 rounded-2xl border border-light-gray shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <h3 className="text-2xl font-bold text-primary mb-2">{plan.name}</h3>
                  <p className="text-dark-gray text-sm mb-6">Processamento: {plan.processingTime}</p>
                  
                  <div className="mb-6 space-y-2 flex-grow">
                    <p className="text-xs font-bold text-dark-gray uppercase tracking-wider">Tiers Cadastrados</p>
                    <div className="flex flex-wrap gap-2">
                      {plan.pricingTiers.map(t => (
                        <span key={t.id} className="bg-light-gray text-primary text-xs px-2 py-1 rounded-md font-medium border border-dark-gray/20">
                          {t.applicantCount}p: R$ {t.totalPrice}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPlan(JSON.parse(JSON.stringify(plan)))}
                    className="w-full bg-primary text-secondary py-2 rounded-lg font-bold hover:bg-opacity-90 transition-colors mt-auto"
                  >
                    Editar Valores
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Standalone Services Management */}
          <div className="mt-16 pt-12 border-t border-light-gray">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-primary">Gerenciar Serviços Avulsos</h2>
                <button
                    onClick={() => setEditingStandaloneService({ id: '00000000-0000-0000-0000-000000000000', name: '', price: 0, isActive: true })}
                    className="flex items-center gap-2 bg-accent-red text-secondary px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-colors"
                >
                    <Plus size={20} /> Adicionar Serviço
                </button>
            </div>

            {editingStandaloneService && (
                <div className="bg-light-gray p-6 rounded-2xl border border-dark-gray/20 mb-8">
                    <h3 className="text-lg font-bold text-primary mb-4">
                        {editingStandaloneService.id !== '00000000-0000-0000-0000-000000000000' ? 'Editando Serviço' : 'Novo Serviço Avulso'}
                    </h3>
                    <form onSubmit={handleSaveStandaloneService} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-primary mb-1">Nome do Serviço</label>
                            <input
                                type="text"
                                required
                                value={editingStandaloneService.name}
                                onChange={(e) => setEditingStandaloneService({ ...editingStandaloneService, name: e.target.value })}
                                className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-gold"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-primary mb-1">Preço (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={editingStandaloneService.price}
                                onChange={(e) => setEditingStandaloneService({ ...editingStandaloneService, price: parseFloat(e.target.value) || 0 })}
                                className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-gold"
                            />
                        </div>
                        <div className="md:col-span-3 flex gap-4">
                            <button type="submit" className="bg-primary text-secondary px-6 py-2 rounded-lg font-bold hover:bg-opacity-90">Salvar</button>
                            <button type="button" onClick={() => setEditingStandaloneService(null)} className="text-dark-gray font-bold hover:underline">Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-secondary rounded-2xl border border-light-gray shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-light-gray text-primary text-sm border-b border-gray-200"><tr className="bg-light-gray text-primary text-sm border-b border-gray-200"><th className="p-4 font-bold">Nome do Serviço</th><th className="p-4 font-bold">Preço</th><th className="p-4 font-bold text-right">Ações</th></tr></thead>
                    <tbody>
                        {standaloneServices.map(service => (
                            <tr key={service.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="p-4 font-medium text-primary">{service.name}</td>
                                <td className="p-4 text-dark-gray">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}</td>
                                <td className="p-4 text-right flex gap-2 justify-end"><button onClick={() => setEditingStandaloneService(JSON.parse(JSON.stringify(service)))} className="p-2 text-dark-gray hover:text-accent-gold hover:bg-light-gray rounded-lg"><Edit size={18} /></button><button onClick={() => handleDeleteStandaloneService(service.id)} className="p-2 text-dark-gray hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
