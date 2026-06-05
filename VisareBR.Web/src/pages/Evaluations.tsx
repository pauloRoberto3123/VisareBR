import { useEffect, useState } from 'react';
import { getEvaluations, submitEvaluation } from '../api/blogService';
import type { Evaluation } from '../api/blogService';
import { Star, MessageSquarePlus, CheckCircle } from 'lucide-react';

export default function Evaluations() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ userName: '', comment: '', rating: 5 });

  useEffect(() => {
    fetchEvals();
  }, []);

  const fetchEvals = () => {
    getEvaluations()
      .then((res: any) => setEvaluations(res.data))
      .catch((err: any) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitEvaluation(formData);
      setSubmitted(true);
      setShowForm(false);
      setFormData({ userName: '', comment: '', rating: 5 });
    } catch (err) {
      alert('Erro ao enviar avaliação.');
    }
  };

  return (
    <div className="bg-secondary py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-primary mb-4">Depoimentos dos Clientes</h1>
          <p className="text-xl text-dark-gray mb-8">Veja a experiência de quem já conquistou o visto com a VisareBR.</p>
          
          <button 
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-primary text-secondary px-6 py-3 rounded-full font-bold hover:bg-dark-gray transition-all"
          >
            <MessageSquarePlus size={20} />
            Deixar meu depoimento
          </button>
        </div>

        {/* Submission Form */}
        {showForm && (
          <div className="max-w-2xl mx-auto mb-20 bg-light-gray p-8 rounded-3xl border border-dark-gray">
            <h2 className="text-2xl font-bold text-primary mb-6">Compartilhe sua experiência</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-gray mb-1">Seu Nome</label>
                <input 
                  required
                  className="w-full p-3 border border-gray-200 rounded-xl"
                  value={formData.userName}
                  onChange={e => setFormData({...formData, userName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-gray mb-1">Sua Avaliação</label>
                <select 
                  className="w-full p-3 border border-gray-200 rounded-xl"
                  value={formData.rating}
                  onChange={e => setFormData({...formData, rating: parseInt(e.target.value)})}
                >
                  <option value="5">5 Estrelas - Excelente</option>
                  <option value="4">4 Estrelas - Muito Bom</option>
                  <option value="3">3 Estrelas - Bom</option>
                  <option value="2">2 Estrelas - Regular</option>
                  <option value="1">1 Estrela - Ruim</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-gray mb-1">Seu Comentário</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full p-3 border border-gray-200 rounded-xl"
                  value={formData.comment}
                  onChange={e => setFormData({...formData, comment: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full bg-accent-gold text-primary py-3 rounded-xl font-bold">
                Enviar Depoimento
              </button>
            </form>
          </div>
        )}

        {/* Success Message */}
        {submitted && (
          <div className="max-w-2xl mx-auto mb-20 bg-secondary p-8 rounded-3xl border border-accent-gold text-center">
            <CheckCircle className="mx-auto text-accent-gold mb-4" size={48} />
            <h2 className="text-2xl font-bold text-primary mb-2">Depoimento Enviado!</h2>
            <p className="text-dark-gray">Obrigado por compartilhar! Sua avaliação passará por uma breve moderação antes de aparecer no site.</p>
            <button onClick={() => setSubmitted(false)} className="mt-6 text-accent-gold font-bold underline">Fechar</button>
          </div>
        )}

        {/* Evaluations Grid */}
        {loading ? (
          <div className="text-center py-20 text-primary">Carregando depoimentos...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {evaluations.map((ev) => (
              <div key={ev.id} className="bg-secondary p-8 rounded-2xl border border-light-gray shadow-sm flex flex-col">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={18} 
                      className={i < ev.rating ? "fill-accent-gold text-accent-gold" : "text-gray-300"} 
                    />
                  ))}
                </div>
                <p className="text-dark-gray italic mb-6 flex-grow">"{ev.comment}"</p>
                <div className="border-t border-light-gray pt-4">
                  <span className="font-bold text-primary">{ev.userName}</span>
                  <p className="text-xs text-dark-gray mt-1">{new Date(ev.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
