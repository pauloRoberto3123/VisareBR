import { useEffect, useState } from 'react';
import { getEvaluations, submitEvaluation, type Evaluation } from '../api/blogService';
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
      .then(res => setEvaluations(res.data))
      .catch(err => console.error(err))
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
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Depoimentos dos Clientes</h1>
          <p className="text-xl text-gray-600 mb-8">Veja a experiência de quem já conquistou o visto com a VisareBR.</p>
          
          <button 
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition-all"
          >
            <MessageSquarePlus size={20} />
            Deixar meu depoimento
          </button>
        </div>

        {/* Submission Form */}
        {showForm && (
          <div className="max-w-2xl mx-auto mb-20 bg-blue-50 p-8 rounded-3xl border border-blue-100">
            <h2 className="text-2xl font-bold mb-6">Compartilhe sua experiência</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seu Nome</label>
                <input 
                  required
                  className="w-full p-3 border border-gray-200 rounded-xl"
                  value={formData.userName}
                  onChange={e => setFormData({...formData, userName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sua Avaliação</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Seu Comentário</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full p-3 border border-gray-200 rounded-xl"
                  value={formData.comment}
                  onChange={e => setFormData({...formData, comment: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">
                Enviar Depoimento
              </button>
            </form>
          </div>
        )}

        {/* Success Message */}
        {submitted && (
          <div className="max-w-2xl mx-auto mb-20 bg-green-50 p-8 rounded-3xl border border-green-100 text-center">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-green-900 mb-2">Depoimento Enviado!</h2>
            <p className="text-green-700">Obrigado por compartilhar! Sua avaliação passará por uma breve moderação antes de aparecer no site.</p>
            <button onClick={() => setSubmitted(false)} className="mt-6 text-green-600 font-bold underline">Fechar</button>
          </div>
        )}

        {/* Evaluations Grid */}
        {loading ? (
          <div className="text-center py-20">Carregando depoimentos...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {evaluations.map((ev) => (
              <div key={ev.id} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={18} 
                      className={i < ev.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} 
                    />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-6 flex-grow">"{ev.comment}"</p>
                <div className="border-t border-gray-50 pt-4">
                  <span className="font-bold text-gray-900">{ev.userName}</span>
                  <p className="text-xs text-gray-400 mt-1">{new Date(ev.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
