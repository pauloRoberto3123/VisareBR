import { useState, useEffect } from 'react';
import { Check, X, Clock, Users, Crown } from 'lucide-react';
import api from '../api/blogService';
import { useSettings } from '../context/SettingsContext';

export interface PlanBenefit {
  id: number;
  description: string;
  isIncluded: boolean;
}

export interface PlanPricingTier {
  id: number;
  applicantCount: number;
  totalPrice: number;
}

export interface Plan {
  id: number;
  name: string;
  processingTime: string;
  benefits: PlanBenefit[];
  pricingTiers: PlanPricingTier[];
}

export default function PricingSection() {
  const { whatsappUrl } = useSettings();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [applicantCount, setApplicantCount] = useState<number>(1);

  useEffect(() => {
    api.get('/pricing')
      .then((res) => {
        setPlans(res.data);
      })
      .catch((err) => console.error("Error loading plans:", err))
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const handleApplicantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setApplicantCount(parseInt(e.target.value, 10));
  };

  return (
    <div className="bg-secondary py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-6">Investimento Transparente</h1>
          <p className="text-xl text-dark-gray max-w-2xl mx-auto mb-10">
            Escolha o plano ideal para a sua necessidade. Assessoria completa e sem surpresas.
          </p>

          {/* Applicant Selector */}
          <div className="inline-flex flex-col items-center bg-light-gray p-6 rounded-3xl border border-dark-gray/20 shadow-sm">
            <label htmlFor="applicantCount" className="flex items-center gap-2 text-lg font-bold text-primary mb-3">
              <Users size={24} className="text-accent-red" />
              Número de Solicitantes:
            </label>
            <select
              id="applicantCount"
              value={applicantCount}
              onChange={handleApplicantChange}
              className="bg-white border border-dark-gray text-primary text-lg font-bold rounded-xl px-6 py-3 focus:ring-2 focus:ring-accent-gold outline-none w-48 text-center cursor-pointer shadow-sm"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i + 1 === 1 ? 'Pessoa' : 'Pessoas'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-primary font-bold text-xl">Carregando planos...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan) => {
              const isVip = plan.name.toLowerCase() === 'vip';
              const matchingTier = plan.pricingTiers.find(t => t.applicantCount === applicantCount);

              return (
                <div 
                  key={plan.id} 
                  className={`relative flex flex-col bg-white rounded-3xl overflow-hidden transition-all duration-300 ${
                    isVip 
                      ? 'border-2 border-accent-gold shadow-2xl scale-105 z-10' 
                      : 'border border-light-gray shadow-md hover:shadow-xl hover:-translate-y-1'
                  }`}
                >
                  {isVip && (
                    <div className="bg-accent-gold text-primary text-center py-2 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2">
                      <Crown size={16} /> O Mais Escolhido
                    </div>
                  )}
                  
                  <div className="p-8 flex-grow">
                    <h3 className={`text-2xl font-extrabold mb-2 ${isVip ? 'text-accent-gold' : 'text-primary'}`}>
                      {plan.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-dark-gray text-sm mb-6 font-medium">
                      <Clock size={16} className="text-accent-red" />
                      Tempo de resposta: {plan.processingTime}
                    </div>

                    <div className="mb-8 border-b border-light-gray pb-8">
                      {matchingTier ? (
                        <div className="text-4xl font-black text-primary">
                          {formatPrice(matchingTier.totalPrice)}
                        </div>
                      ) : (
                        <div className="text-2xl font-bold text-accent-red">
                          Preço sob consulta
                        </div>
                      )}
                      <p className="text-dark-gray text-sm mt-2">Para {applicantCount} {applicantCount === 1 ? 'pessoa' : 'pessoas'}</p>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.benefits.map((benefit) => (
                        <li key={benefit.id} className="flex items-start gap-3">
                          {benefit.isIncluded ? <Check size={20} className="text-green-500 shrink-0 mt-0.5" /> : <X size={20} className="text-gray-300 shrink-0 mt-0.5" />}
                          <span className={`${benefit.isIncluded ? 'text-primary font-medium' : 'text-gray-400'}`}>{benefit.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="p-8 pt-0 mt-auto">
                    <a href={whatsappUrl} className={`block w-full py-4 text-center rounded-xl font-bold transition-all ${isVip ? 'bg-accent-gold text-primary hover:bg-opacity-90' : 'bg-primary text-secondary hover:bg-dark-gray'}`}>
                      Contratar Plano
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}