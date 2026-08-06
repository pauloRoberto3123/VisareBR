import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, MessageCircle, HelpCircle } from 'lucide-react';
import { getFaqs } from '../api/blogService';
import type { FaqItem } from '../api/blogService';
import { useSettings } from '../context/SettingsContext';

export default function FaqList() {
  const { whatsappUrl } = useSettings();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  useEffect(() => {
    getFaqs()
      .then((res) => {
        setFaqs(res.data);
      })
      .catch((err) => console.error('Erro ao buscar dúvidas:', err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Todas', ...Array.from(new Set(faqs.map((f) => f.category)))];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Todas' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id: number) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="bg-secondary min-h-screen">
      {/* Header Section */}
      <section className="bg-primary py-24 text-secondary text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-accent-gold/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-white">
            Central de Dúvidas
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
            Encontre respostas rápidas para as principais perguntas sobre a solicitação, renovação e entrevista do visto americano.
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 -mt-8 relative z-20">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Search Box */}
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-lg mb-10 flex items-center gap-3">
            <Search className="text-gray-400 shrink-0" size={24} />
            <input
              type="text"
              placeholder="Digite sua dúvida ou palavra-chave (ex: passaporte, taxas)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-primary focus:outline-none placeholder-gray-400 font-medium bg-transparent"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-xs text-dark-gray hover:underline font-bold px-2"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2.5 justify-center mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setOpenFaqId(null);
                }}
                className={`px-5 py-2.5 rounded-full text-sm font-bold border transition-all duration-300 cursor-pointer ${
                  activeCategory === category
                    ? 'bg-accent-gold border-accent-gold text-primary shadow-md'
                    : 'bg-white border-gray-100 hover:border-accent-gold/40 text-primary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-accent-gold border-t-transparent rounded-full animate-spin mb-4"></div>
              <span className="text-primary font-bold text-lg">Carregando dúvidas...</span>
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm px-6">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-primary mb-2">Nenhuma dúvida encontrada</h3>
              <p className="text-dark-gray">Não encontramos resultados para a sua busca. Tente buscar por outros termos ou fale conosco.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-6 text-left flex justify-between items-center gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-bold text-primary text-base md:text-lg">
                        {faq.question}
                      </span>
                      <span className="text-accent-gold shrink-0">
                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </span>
                    </button>

                    {/* Collapsible Answer */}
                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        isOpen ? 'max-h-[1000px] border-t border-gray-100' : 'max-h-0'
                      } overflow-hidden`}
                    >
                      <div className="p-6 text-dark-gray leading-relaxed text-sm md:text-base bg-slate-50/50">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CTA Banner */}
          <div className="mt-16 bg-primary rounded-3xl p-8 md:p-12 text-center text-secondary relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 w-full h-full bg-accent-gold/5 pointer-events-none"></div>
            <HelpCircle className="w-12 h-12 text-accent-gold mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4 text-white">Não encontrou sua resposta?</h3>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto font-light leading-relaxed">
              Nosso time está pronto para tirar todas as suas dúvidas sobre vistos americanos, taxas e agendamentos.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-md uppercase tracking-wider text-sm"
            >
              <MessageCircle size={18} /> Falar com Especialista
            </a>
          </div>

        </div>
      </section>
    </div>
  );
}
