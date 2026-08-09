import { useState, useEffect } from 'react';
import { Settings2, ArrowRight } from 'lucide-react';
import api from '../api/blogService';
import { useSettings } from '../context/SettingsContext';

export interface StandaloneService {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  description?: string;
  features?: string;
  iconName?: string;
  order?: number;
  whatsappCustomMessage?: string;
}

export default function StandaloneServices() {
  const { whatsappUrl } = useSettings();
  const [services, setServices] = useState<StandaloneService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/services/standalone')
      .then((res) => setServices(res.data))
      .catch((err) => console.error("Error loading standalone services:", err))
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  return (
    <section className="bg-light-gray py-20 border-t border-dark-gray/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Settings2 className="w-12 h-12 text-accent-gold" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-6">Serviços Avulsos</h2>
          <p className="text-lg text-dark-gray leading-relaxed max-w-3xl mx-auto">
            Nem todo mundo precisa de um plano completo. Às vezes você só quer resolver uma etapa do processo sem burocracia. Por isso oferecemos serviços avulsos com preço fixo.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-primary font-bold">Carregando serviços...</div>
        ) : (
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-md border border-dark-gray/10">
            <ul className="space-y-6 mb-10">
              {services.map((service) => (
                <li key={service.id} className="flex items-center text-lg md:text-xl font-medium text-primary">
                  <span className="shrink-0 max-w-[65%] md:max-w-none">{service.name}</span>
                  <div className="flex-1 border-b-2 border-dotted border-gray-300 mx-4 mt-2"></div>
                  <span className="shrink-0 font-bold text-accent-red">{formatPrice(service.price)}</span>
                </li>
              ))}
            </ul>

            <div className="text-center mt-10">
              <a href={whatsappUrl} className="inline-flex items-center gap-3 bg-primary text-secondary px-8 py-4 rounded-xl text-lg font-bold hover:bg-dark-gray transition-colors shadow-lg">
                Quero um serviço avulso <ArrowRight size={20} />
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}