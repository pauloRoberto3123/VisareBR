import { useState, useEffect } from 'react';
import api from '../api/blogService';
import type { BlogPost, Evaluation, Ds160Submission } from '../api/blogService';
import type { Plan } from './PricingSection';
import { Plus, Trash2, CheckCircle, XCircle, DollarSign, LogOut, BarChart3, FileText, MessageSquare, TrendingUp, Edit } from 'lucide-react';
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

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.content || newPost.content === '<p><br></p>') {
      alert('O conteúdo do post é obrigatório.');
      return;
    }
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
              <style>{`
                .admin-editor .ql-container {
                  font-family: inherit;
                }
                .admin-editor .ql-editor {
                  min-height: 500px;
                  font-size: 1.125rem;
                  line-height: 1.625;
                  padding: 2.5rem;
                }
                .admin-editor .ql-editor h1 { font-size: 2.25em; font-weight: 700; margin-bottom: 0.8em; }
                .admin-editor .ql-editor h2 { font-size: 1.5em; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.8em; }
                .admin-editor .ql-editor h3 { font-size: 1.25em; font-weight: 600; margin-top: 1.5em; margin-bottom: 0.6em; }
                .admin-editor .ql-editor p { margin-bottom: 1.2em; }
                .admin-editor iframe.ql-video {
                  width: 100%;
                  height: 400px;
                  border-radius: 0.75rem;
                  margin: 2rem 0;
                }
              `}</style>
              <div className="bg-white rounded-lg border border-dark-gray overflow-hidden admin-editor text-dark-gray">
                <ReactQuill 
                  theme="snow"
                  modules={quillModules}
                  value={newPost.content}
                  onChange={(content: string) => setNewPost({...newPost, content})}
                  placeholder="Conteúdo completo"
                />
              </div>
              <button className="w-full bg-accent-red text-secondary py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors">
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
