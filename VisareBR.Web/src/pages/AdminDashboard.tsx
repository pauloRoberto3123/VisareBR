import { useState, useEffect } from 'react';
import api from '../api/blogService';
import type { Article, ArticleBlock, Evaluation, Ds160Submission } from '../api/blogService';
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
  const [posts, setPosts] = useState<Article[]>([]);
  const [evals, setEvals] = useState<Evaluation[]>([]);
  const [ds160Forms, setDs160Forms] = useState<Ds160Submission[]>([]);
  const [selectedDs160, setSelectedDs160] = useState<Ds160Submission | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [standaloneServices, setStandaloneServices] = useState<StandaloneService[]>([]);
  const [editingStandaloneService, setEditingStandaloneService] = useState<StandaloneService | null>(null);
  
  // Blog Form State
  const [newPost, setNewPost] = useState({
    title: '',
    summary: '',
    readTimeMinutes: 3,
    featuredImageUrl: '',
    metaTitle: '',
    metaDescription: '',
    tags: '',
    contentBlocks: [] as ArticleBlock[],
    authorName: ''
  });
  const [editorMode, setEditorMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  const addBlock = (type: 'text' | 'image' | 'video' | 'button') => {
    const newBlock: ArticleBlock = {
      type,
      order: newPost.contentBlocks.length,
      content: type === 'text' ? '' : undefined,
      imageUrl: type === 'image' ? '' : undefined,
      altText: type === 'image' ? '' : undefined,
      sourceUrl: type === 'video' ? '' : undefined,
      label: type === 'button' ? '' : undefined,
      targetUrl: type === 'button' ? '' : undefined,
      hexColorCode: type === 'button' ? '#0A3161' : undefined
    };
    setNewPost({
      ...newPost,
      contentBlocks: [...newPost.contentBlocks, newBlock]
    });
  };

  const removeBlock = (index: number) => {
    const updatedBlocks = newPost.contentBlocks.filter((_, idx) => idx !== index);
    setNewPost({
      ...newPost,
      contentBlocks: updatedBlocks.map((b, idx) => ({ ...b, order: idx }))
    });
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const blocks = [...newPost.contentBlocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const temp = blocks[index];
    blocks[index] = blocks[targetIndex];
    blocks[targetIndex] = temp;

    setNewPost({
      ...newPost,
      contentBlocks: blocks.map((b, idx) => ({ ...b, order: idx }))
    });
  };

  const updateBlock = (index: number, updatedBlock: ArticleBlock) => {
    const updatedBlocks = [...newPost.contentBlocks];
    updatedBlocks[index] = updatedBlock;
    setNewPost({
      ...newPost,
      contentBlocks: updatedBlocks
    });
  };

  // Video Embed State
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoEmbedUrl, setVideoEmbedUrl] = useState('');
  const [videoCaption, setVideoCaption] = useState('');
  const [videoPreviewId, setVideoPreviewId] = useState<string | null>(null);

  useEffect(() => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = videoEmbedUrl.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    setVideoPreviewId(id);
  }, [videoEmbedUrl]);

  // Settings State
  const [settings, setSettings] = useState({ whatsappNumber: '', whatsappDefaultMessage: '', cnpj: '', address: '', companyEmail: '' });

  const quillModules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }, { 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        video: function() {
          const quill = (this as any).quill;
          (window as any).currentQuillInstance = quill;
          setIsVideoModalOpen(true);
        }
      }
    },
    clipboard: {
      matchVisual: false,
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
    if (newPost.contentBlocks.length === 0) {
      alert('O artigo precisa ter pelo menos um bloco de conteúdo.');
      return;
    }
    
    // Validate accessibility
    for (const block of newPost.contentBlocks) {
      if (block.type === 'image' && !block.altText) {
        alert('Todos os blocos de imagem precisam de um texto alternativo (alt text) para acessibilidade.');
        return;
      }
    }

    try {
      const tagsArray = newPost.tags
        ? newPost.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3)
        : [];

      const payload = {
        title: newPost.title,
        summary: newPost.summary,
        readTimeMinutes: Number(newPost.readTimeMinutes) || 3,
        featuredImageUrl: newPost.featuredImageUrl,
        metaTitle: newPost.metaTitle || newPost.title,
        metaDescription: newPost.metaDescription || newPost.summary,
        tags: tagsArray,
        contentBlocks: newPost.contentBlocks,
        authorName: newPost.authorName
      };

      if (editorMode === 'edit' && editingPostId !== null) {
        await api.put(`/blog/${editingPostId}`, payload);
        alert('Artigo atualizado com sucesso!');
      } else {
        await api.post('/blog', payload);
        alert('Artigo publicado com sucesso!');
      }
      setNewPost({
        title: '',
        summary: '',
        readTimeMinutes: 3,
        featuredImageUrl: '',
        metaTitle: '',
        metaDescription: '',
        tags: '',
        contentBlocks: [],
        authorName: ''
      });
      setEditingPostId(null);
      setEditorMode('list');
      fetchData();
    } catch (err) {
      alert('Erro ao salvar o artigo.');
    }
  };

  const handleEditClick = (post: any) => {
    setNewPost({
      title: post.title,
      summary: post.summary,
      readTimeMinutes: post.readTimeMinutes || 3,
      featuredImageUrl: post.featuredImageUrl || '',
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
      contentBlocks: post.contentBlocks || [],
      authorName: post.authorName || ''
    });
    setEditingPostId(post.id);
    setEditorMode('edit');
  };

  const handleNewPostClick = () => {
    setNewPost({
      title: '',
      summary: '',
      readTimeMinutes: 3,
      featuredImageUrl: '',
      metaTitle: '',
      metaDescription: '',
      tags: '',
      contentBlocks: [],
      authorName: ''
    });
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
        setNewPost({ ...newPost, featuredImageUrl: reader.result });
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
        setNewPost({
          title: '',
          summary: '',
          readTimeMinutes: 3,
          featuredImageUrl: '',
          metaTitle: '',
          metaDescription: '',
          tags: '',
          contentBlocks: [],
          authorName: ''
        });
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
          Gerenciar Artigos
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
                  {post.featuredImageUrl ? (
                    <img
                      src={post.featuredImageUrl}
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
                        {(post.authorName || post.author) && (
                          <>
                            <span className="text-dark-gray/30">•</span>
                            <span className="text-xs text-dark-gray/60 font-semibold">
                              Por {post.authorName || post.author?.fullName}
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
                <div className="space-y-3 text-left">
                  <label className="block text-sm font-bold text-primary">Imagem de Capa do Artigo</label>
                  {newPost.featuredImageUrl ? (
                    <div className="relative w-full h-64 bg-slate-100 rounded-2xl overflow-hidden group shadow-inner">
                      <img
                        src={newPost.featuredImageUrl}
                        alt="Capa do artigo"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => setNewPost({ ...newPost, featuredImageUrl: '' })}
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
                      value={newPost.featuredImageUrl.startsWith('data:image') ? 'Imagem carregada localmente (Base64)' : newPost.featuredImageUrl}
                      onChange={e => setNewPost({ ...newPost, featuredImageUrl: e.target.value })}
                      disabled={newPost.featuredImageUrl.startsWith('data:image')}
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
                <div className="border-b border-gray-100 focus-within:border-accent-gold/40 pb-2 transition-colors space-y-1">
                  <input
                    type="text"
                    placeholder="Título do Artigo..."
                    className="w-full text-3xl md:text-4xl font-extrabold text-primary placeholder:text-gray-200 focus:outline-none bg-transparent"
                    value={newPost.title}
                    onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                    required
                  />
                  <div className="text-right text-xs text-dark-gray/40">
                    {newPost.title.length} caracteres
                  </div>
                </div>

                {/* Article Summary */}
                <div className="border-b border-gray-100 focus-within:border-accent-gold/40 pb-2 transition-colors space-y-1">
                  <textarea
                    placeholder="Resumo ou descrição curta (aparece nos cards da listagem)..."
                    rows={2}
                    className="w-full text-base text-dark-gray/80 placeholder:text-gray-300 focus:outline-none bg-transparent resize-none italic"
                    value={newPost.summary}
                    onChange={e => setNewPost({ ...newPost, summary: e.target.value })}
                    required
                  />
                  <div className="text-right text-xs text-dark-gray/40">
                    {newPost.summary.length} caracteres (Ideal: 150-160)
                  </div>
                </div>

                {/* Read Time Input */}
                <div className="border-b border-gray-100 focus-within:border-accent-gold/40 pb-2 transition-colors space-y-1 text-left">
                  <label className="block text-xs font-bold text-gray-500">Tempo de Leitura Estimado (Minutos)</label>
                  <input
                    type="number"
                    placeholder="Tempo estimado em minutos..."
                    className="w-full text-base text-primary focus:outline-none bg-transparent font-medium"
                    value={newPost.readTimeMinutes}
                    onChange={e => setNewPost({ ...newPost, readTimeMinutes: parseInt(e.target.value) || 3 })}
                    min="1"
                  />
                </div>

                {/* Author/Editor Override */}
                <div className="border-b border-gray-100 focus-within:border-accent-gold/40 pb-2 transition-colors space-y-1">
                  <input
                    type="text"
                    placeholder="Nome do Autor / Editor (Ex: VisareBR)..."
                    className="w-full text-base text-primary placeholder:text-gray-300 focus:outline-none bg-transparent font-medium"
                    value={newPost.authorName}
                    onChange={e => setNewPost({ ...newPost, authorName: e.target.value })}
                  />
                  <div className="text-right text-xs text-dark-gray/40">
                    Opcional (deixe em branco para usar seu nome de usuário atual)
                  </div>
                </div>

                {/* Styles override for rich text */}
                <style>{`
                  .admin-editor {
                    margin-top: 0.5rem;
                  }
                  .admin-editor .quill {
                    display: flex;
                    flex-direction: column;
                  }
                  .admin-editor .ql-toolbar.ql-snow {
                    border: 1px solid #e2e8f0;
                    border-radius: 0.75rem;
                    background-color: #f8fafc;
                    padding: 0.5rem;
                  }
                  .admin-editor .ql-container.ql-snow {
                    border: 1px solid #e2e8f0;
                    border-radius: 0.75rem;
                    margin-top: 0.5rem;
                    min-height: 200px;
                  }
                  .admin-editor .ql-editor {
                    min-height: 200px;
                    font-family: Inter, system-ui, sans-serif;
                    font-size: 1rem;
                  }
                `}</style>
                
                {/* Dynamic Blocks Container */}
                <div className="space-y-6 text-left my-8">
                  <label className="block text-lg font-black text-primary border-b border-gray-100 pb-2">
                    Blocos de Conteúdo ({newPost.contentBlocks.length})
                  </label>
                  
                  {newPost.contentBlocks.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 bg-slate-50 text-center text-dark-gray/60 italic">
                      Nenhum bloco de conteúdo adicionado ainda. Use os botões abaixo para montar seu artigo.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {newPost.contentBlocks.map((block, index) => (
                        <div key={index} className="bg-slate-50 border border-gray-200 rounded-2xl p-4 md:p-6 space-y-4 shadow-sm relative text-left">
                          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                            <span className="text-xs font-black uppercase text-accent-gold tracking-widest">
                              #{index + 1} - Bloco de {block.type === 'text' ? 'Texto' : block.type === 'image' ? 'Imagem' : block.type === 'video' ? 'Vídeo' : 'Botão CTA'}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => moveBlock(index, 'up')}
                                disabled={index === 0}
                                className="p-1 px-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 cursor-pointer text-sm font-bold"
                                title="Mover para cima"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                onClick={() => moveBlock(index, 'down')}
                                disabled={index === newPost.contentBlocks.length - 1}
                                className="p-1 px-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 cursor-pointer text-sm font-bold"
                                title="Mover para baixo"
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                onClick={() => removeBlock(index)}
                                className="p-1 px-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 cursor-pointer text-sm font-bold"
                                title="Excluir bloco"
                              >
                                ×
                              </button>
                            </div>
                          </div>

                          {block.type === 'text' && (
                            <div className="admin-editor ql-snow">
                              <ReactQuill
                                theme="snow"
                                modules={quillModules}
                                value={block.content || ''}
                                onChange={(content: string) => updateBlock(index, { ...block, content })}
                                placeholder="Digite o conteúdo textual (rich text) do bloco..."
                              />
                            </div>
                          )}

                          {block.type === 'image' && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-xs font-bold text-gray-500">URL da Imagem</label>
                                  <input
                                    type="text"
                                    value={block.imageUrl || ''}
                                    onChange={(e) => updateBlock(index, { ...block, imageUrl: e.target.value })}
                                    placeholder="https://exemplo.com/imagem.jpg"
                                    className="w-full p-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-gold focus:outline-none text-primary"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                                    Texto Alternativo <span className="text-red-500">*</span> (Alt Text)
                                  </label>
                                  <input
                                    type="text"
                                    value={block.altText || ''}
                                    onChange={(e) => updateBlock(index, { ...block, altText: e.target.value })}
                                    placeholder="Alt text obrigatório para acessibilidade..."
                                    className="w-full p-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-gold focus:outline-none text-primary"
                                    required
                                  />
                                </div>
                              </div>
                              {block.imageUrl && (
                                <div className="w-48 h-32 overflow-hidden rounded-xl border border-gray-200 shadow-sm mt-2">
                                  <img src={block.imageUrl} alt={block.altText} className="w-full h-full object-cover" />
                                </div>
                              )}
                            </div>
                          )}

                          {block.type === 'video' && (
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 block">URL de Origem do Vídeo</label>
                              <input
                                  type="text"
                                  value={block.sourceUrl || ''}
                                  onChange={(e) => updateBlock(index, { ...block, sourceUrl: e.target.value })}
                                  placeholder="Ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                                  className="w-full p-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-gold focus:outline-none text-primary"
                              />
                              <p className="text-xs text-dark-gray/50 italic">Insira links do YouTube, Instagram ou TikTok. O sistema converterá automaticamente para o player nativo.</p>
                            </div>
                          )}

                          {block.type === 'button' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500">Texto do Botão (Label)</label>
                                <input
                                  type="text"
                                  value={block.label || ''}
                                  onChange={(e) => updateBlock(index, { ...block, label: e.target.value })}
                                  placeholder="Ex: Contratar Assessoria"
                                  className="w-full p-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-gold focus:outline-none text-primary"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500">URL de Destino</label>
                                <input
                                  type="text"
                                  value={block.targetUrl || ''}
                                  onChange={(e) => updateBlock(index, { ...block, targetUrl: e.target.value })}
                                  placeholder="Ex: /ds-160 ou https://..."
                                  className="w-full p-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-gold focus:outline-none text-primary"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500">Cor de Fundo (Hex)</label>
                                <div className="flex gap-2">
                                  <input
                                    type="color"
                                    value={block.hexColorCode || '#0A3161'}
                                    onChange={(e) => updateBlock(index, { ...block, hexColorCode: e.target.value })}
                                    className="w-10 h-10 border border-gray-200 rounded-lg cursor-pointer"
                                  />
                                  <input
                                    type="text"
                                    value={block.hexColorCode || '#0A3161'}
                                    onChange={(e) => updateBlock(index, { ...block, hexColorCode: e.target.value })}
                                    placeholder="#0A3161"
                                    className="flex-1 p-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-gold focus:outline-none text-primary"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                      ))}
                    </div>
                  )}

                  {/* Block Add Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2 justify-start">
                    <button
                      type="button"
                      onClick={() => addBlock('text')}
                      className="bg-white border border-primary/20 hover:bg-slate-50 text-primary px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                    >
                      + Bloco de Texto
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlock('image')}
                      className="bg-white border border-primary/20 hover:bg-slate-50 text-primary px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                    >
                      + Bloco de Imagem
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlock('video')}
                      className="bg-white border border-primary/20 hover:bg-slate-50 text-primary px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                    >
                      + Bloco de Vídeo
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlock('button')}
                      className="bg-white border border-primary/20 hover:bg-slate-50 text-primary px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                    >
                      + Bloco de Botão
                    </button>
                  </div>
                </div>

                {/* Bloco de SEO e Otimização */}
                <div className="mt-16 pt-12 border-t border-gray-100 space-y-8 text-left">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-6">
                    <span className="text-xl font-bold text-primary">Painel de Otimização de SEO</span>
                    <span className="bg-primary/5 text-primary text-xs font-bold px-2 py-0.5 rounded">Google & Social</span>
                  </div>

                  {/* Google Snippet Preview */}
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-dark-gray/60 uppercase tracking-wider">
                      <span className="text-emerald-600 font-extrabold">G</span> Exibição na Busca (Google Snippet)
                    </div>
                    
                    <div className="bg-white p-5 rounded-xl border border-gray-200/50 shadow-sm space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-dark-gray/70">
                        <span className="bg-gray-100 p-0.5 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">V</span>
                        <span>visarebr.com.br</span>
                        <span className="text-gray-400">›</span>
                        <span>blog</span>
                      </div>
                      <h4 className="text-[#1a0dab] text-xl font-sans hover:underline cursor-pointer leading-tight font-medium break-words">
                        {newPost.metaTitle || newPost.title || 'Título do seu artigo'}
                      </h4>
                      <p className="text-[#4d5156] text-[14px] leading-relaxed break-words font-sans">
                        {newPost.metaDescription || newPost.summary || 'Resumo do artigo para resultados de pesquisa...'}
                      </p>
                    </div>
                  </div>

                  {/* SEO Inputs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Meta Title */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-bold text-primary">Meta Title (SEO)</label>
                        <span className={`text-xs font-bold ${newPost.metaTitle.length >= 50 && newPost.metaTitle.length <= 60 ? 'text-green-600' : 'text-dark-gray/50'}`}>
                          {newPost.metaTitle.length} carac.
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="Meta título para indexação (deixe vazio para usar o Título principal)..."
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-gold focus:outline-none text-primary"
                        value={newPost.metaTitle}
                        onChange={e => setNewPost({ ...newPost, metaTitle: e.target.value })}
                      />
                    </div>

                    {/* Meta Description */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-bold text-primary">Meta Description (SEO)</label>
                        <span className={`text-xs font-bold ${newPost.metaDescription.length >= 120 && newPost.metaDescription.length <= 160 ? 'text-green-600' : 'text-dark-gray/50'}`}>
                          {newPost.metaDescription.length} carac.
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="Descrição SEO (deixe vazio para usar o resumo principal)..."
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-gold focus:outline-none text-primary"
                        value={newPost.metaDescription}
                        onChange={e => setNewPost({ ...newPost, metaDescription: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Tags section (up to 3 tags) */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <label className="block text-sm font-bold text-primary">Otimização de Tags (Max: 3)</label>
                    <p className="text-xs text-dark-gray/60 -mt-2">
                      Pressione Enter ou clique em "+" para adicionar tags relevantes. Limite de 3 tags.
                    </p>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="tag-input"
                        placeholder="Digite uma tag (ex: vistoamericano) e pressione Enter..."
                        className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-gold focus:outline-none text-primary"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.currentTarget;
                            const tagValue = input.value.trim().toLowerCase().replace('#', '').replace(/\s+/g, '');
                            if (tagValue) {
                              const currentTagsList = newPost.tags ? newPost.tags.split(',').filter(Boolean) : [];
                              if (currentTagsList.length >= 3) {
                                alert('Você pode cadastrar no máximo 3 tags por artigo.');
                                return;
                              }
                              if (!currentTagsList.includes(tagValue)) {
                                const newTagsList = [...currentTagsList, tagValue];
                                setNewPost({ ...newPost, tags: newTagsList.join(',') });
                              }
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('tag-input') as HTMLInputElement;
                          const tagValue = input?.value.trim().toLowerCase().replace('#', '').replace(/\s+/g, '');
                          if (tagValue) {
                            const currentTagsList = newPost.tags ? newPost.tags.split(',').filter(Boolean) : [];
                            if (currentTagsList.length >= 3) {
                              alert('Você pode cadastrar no máximo 3 tags por artigo.');
                              return;
                            }
                            if (!currentTagsList.includes(tagValue)) {
                              const newTagsList = [...currentTagsList, tagValue];
                              setNewPost({ ...newPost, tags: newTagsList.join(',') });
                            }
                            input.value = '';
                          }
                        }}
                        className="bg-primary text-secondary px-5 rounded-xl font-bold hover:bg-opacity-95 transition-all text-sm flex items-center justify-center cursor-pointer"
                      >
                        + Adicionar
                      </button>
                    </div>

                    {/* Tag pills list */}
                    <div className="flex flex-wrap gap-2.5 pt-2">
                      {newPost.tags ? (
                        newPost.tags.split(',').filter(Boolean).map((tag, idx) => (
                          <span 
                            key={idx} 
                            className="px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold border bg-light-gray text-dark-gray border-gray-200"
                          >
                            #{tag}
                            <button
                              type="button"
                              onClick={() => {
                                const newTagsList = newPost.tags.split(',').filter(Boolean).filter((_, i) => i !== idx);
                                setNewPost({ ...newPost, tags: newTagsList.join(',') });
                              }}
                              className="text-dark-gray/50 hover:text-red-600 transition cursor-pointer font-bold ml-1 text-sm"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-dark-gray/40 italic">Nenhuma tag cadastrada para este artigo.</p>
                      )}
                    </div>
                  </div>

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
                  <div className="md:col-span-2 text-left">
                    <label className="block text-sm font-medium text-primary mb-1">Nome do Serviço</label>
                    <input
                      type="text"
                      required
                      value={editingStandaloneService.name}
                      onChange={(e) => setEditingStandaloneService({ ...editingStandaloneService, name: e.target.value })}
                      className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-gold"
                    />
                  </div>
                  <div className="text-left">
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
                  <div className="md:col-span-3 flex gap-4 mt-2">
                    <button type="submit" className="bg-primary text-secondary px-6 py-2 rounded-lg font-bold hover:bg-opacity-90">
                      Salvar
                    </button>
                    <button type="button" onClick={() => setEditingStandaloneService(null)} className="text-dark-gray font-bold hover:underline">
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-secondary rounded-2xl border border-light-gray shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-light-gray text-primary text-sm border-b border-gray-200">
                  <tr className="bg-light-gray text-primary text-sm border-b border-gray-200">
                    <th className="p-4 font-bold">Nome do Serviço</th>
                    <th className="p-4 font-bold">Preço</th>
                    <th className="p-4 font-bold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {standaloneServices.map(service => (
                    <tr key={service.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-primary">{service.name}</td>
                      <td className="p-4 text-dark-gray">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                      </td>
                      <td className="p-4 text-right flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingStandaloneService(JSON.parse(JSON.stringify(service)))}
                          className="p-2 text-dark-gray hover:text-accent-gold hover:bg-light-gray rounded-lg"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteStandaloneService(service.id)}
                          className="p-2 text-dark-gray hover:text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Visual YouTube Video Embed Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bg-[#18181b] text-white border border-[#27272a] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in p-6 relative">
            
            {/* Modal Header controls style as in image: small top-left controls */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-1.5 items-center bg-[#27272a]/50 p-1.5 rounded-lg border border-[#3f3f46]/30">
                <button
                  type="button"
                  onClick={() => { setIsVideoModalOpen(false); setVideoEmbedUrl(''); setVideoCaption(''); }}
                  className="w-5 h-5 flex items-center justify-center rounded bg-red-500/80 text-white font-bold hover:bg-red-600 transition text-[9px] cursor-pointer"
                  title="Fechar"
                >
                  ✕
                </button>
                <button
                  type="button"
                  className="w-5 h-5 flex items-center justify-center rounded bg-[#3f3f46]/60 text-gray-300 font-bold hover:bg-[#3f3f46] transition text-[10px] cursor-not-allowed"
                  disabled
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="w-5 h-5 flex items-center justify-center rounded bg-[#3f3f46]/60 text-gray-300 font-bold hover:bg-[#3f3f46] transition text-[10px] cursor-not-allowed"
                  disabled
                >
                  ↓
                </button>
              </div>
              <h3 className="font-bold text-sm tracking-wide text-gray-200 uppercase flex items-center gap-2">
                <span className="text-red-500">▶</span> Bloco de Vídeo YouTube
              </h3>
            </div>

            {/* Modal Form */}
            <div className="space-y-5">
              {/* Input for Link */}
              <div className="space-y-2 text-left">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Insira o link do vídeo:
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=et6zYWwycjk"
                  className="w-full p-3 bg-[#27272a] border border-[#3f3f46] focus:border-accent-gold rounded-xl focus:ring-1 focus:ring-accent-gold focus:outline-none text-white text-sm placeholder-gray-500 shadow-inner"
                  value={videoEmbedUrl}
                  onChange={e => setVideoEmbedUrl(e.target.value)}
                />
              </div>

              {/* YouTube Video Player Preview */}
              {videoPreviewId ? (
                <div className="space-y-2 text-left">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Visualização:</span>
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-[#27272a]">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoPreviewId}?modestbranding=1&rel=0`}
                      title="YouTube video player"
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-[#3f3f46] rounded-xl p-8 bg-[#202024] flex flex-col items-center justify-center text-center text-gray-500">
                  <span className="text-4xl mb-2">📺</span>
                  <p className="text-xs font-bold text-gray-300">Sem pré-visualização</p>
                  <p className="text-[11px] text-gray-500 mt-1">Cole um link de vídeo válido do YouTube</p>
                </div>
              )}

              {/* Legend/Caption Input */}
              <div className="space-y-2 text-left">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Insira uma legenda para o vídeo:
                </label>
                <input
                  type="text"
                  placeholder="Insira uma legenda para o vídeo"
                  className="w-full p-3 bg-[#27272a] border border-[#3f3f46] focus:border-accent-gold rounded-xl focus:ring-1 focus:ring-accent-gold focus:outline-none text-white text-sm placeholder-gray-500 shadow-inner"
                  value={videoCaption}
                  onChange={e => setVideoCaption(e.target.value)}
                />
              </div>
            </div>

            {/* Modal Footer - exactly matching blue rounded pill buttons from image */}
            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-[#27272a]">
              <button
                type="button"
                onClick={() => { setIsVideoModalOpen(false); setVideoEmbedUrl(''); setVideoCaption(''); }}
                className="px-6 py-2 bg-[#27272a] text-gray-300 rounded-full font-bold hover:bg-[#3f3f46] hover:text-white transition text-xs cursor-pointer border border-[#3f3f46]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!videoPreviewId) {
                    alert("Por favor, insira um link de vídeo do YouTube válido.");
                    return;
                  }
                  
                  const quill = (window as any).currentQuillInstance;
                  if (!quill) {
                    alert("Erro ao acessar o editor.");
                    return;
                  }
                  
                  const range = quill.getSelection(true);
                  
                  const embedHtml = `
                    <iframe class="ql-video" src="https://www.youtube.com/embed/${videoPreviewId}" allowfullscreen="true"></iframe>
                    ${videoCaption ? `<p class="video-caption text-center text-sm text-dark-gray italic my-2">${videoCaption}</p>` : ''}
                  `;
                  
                  quill.clipboard.dangerouslyPasteHTML(range.index, embedHtml);
                  
                  setIsVideoModalOpen(false);
                  setVideoEmbedUrl('');
                  setVideoCaption('');
                }}
                disabled={!videoPreviewId}
                className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition text-xs shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
