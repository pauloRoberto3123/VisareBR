import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import api from '../api/blogService';
import { useSettings } from '../context/SettingsContext';
import type { StandaloneService } from '../components/StandaloneServices';

export default function ServicesList() {
  const { settings, whatsappUrl } = useSettings();
  const [services, setServices] = useState<StandaloneService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/services/standalone')
      .then((res) => {
        // Filtrar apenas serviços ativos
        const activeServices = res.data.filter((s: StandaloneService) => s.isActive);
        setServices(activeServices);
      })
      .catch((err) => console.error('Erro ao buscar serviços:', err))
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const getIcon = (iconName?: string) => {
    if (iconName && (iconName.startsWith('data:') || iconName.startsWith('http'))) {
      return <img src={iconName} alt="Service Icon" className="w-10 h-10 object-contain mx-auto" />;
    }
    const IconComponent = (Icons as any)[iconName || 'Briefcase'] || Icons.Briefcase;
    return <IconComponent className="w-10 h-10 text-accent-gold" />;
  };

  const getWhatsAppLinkForService = (serviceName: string) => {
    if (!settings?.whatsappNumber) return whatsappUrl;
    const defaultMsg = `Olá! Gostaria de contratar o serviço avulso: ${serviceName}`;
    return `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(defaultMsg)}`;
  };

  return (
    <div className="bg-secondary min-h-screen">
      {/* Header Section */}
      <section className="bg-primary py-24 text-secondary text-center relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-accent-gold/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-white">
            Nossos Serviços Avulsos
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
            Soluções ágeis e pontuais para cada etapa da sua solicitação de visto. Contrate apenas o que você precisa, com a segurança e expertise da VisareBR.
          </p>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="py-20 -mt-8 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Icons.Loader2 className="w-10 h-10 text-accent-gold animate-spin mb-4" />
              <span className="text-primary font-bold text-lg">Carregando serviços...</span>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-lg mx-auto">
              <Icons.Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-primary mb-2">Nenhum serviço disponível</h3>
              <p className="text-dark-gray px-6">No momento não há serviços avulsos cadastrados. Por favor, volte mais tarde ou fale diretamente conosco.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => {
                // Parse features separated by semicolon
                const featureList = service.features
                  ? service.features.split(';').map((f) => f.trim()).filter(Boolean)
                  : [];

                return (
                  <a 
                    key={service.id} 
                    href={getWhatsAppLinkForService(service.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col justify-between text-center group cursor-pointer"
                  >
                    <div>
                      {/* Icon */}
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100 group-hover:bg-accent-gold/10 transition-colors">
                        {getIcon(service.iconName)}
                      </div>

                      {/* Header Info */}
                      <h2 className="text-xl font-bold text-primary mb-3 text-center group-hover:text-accent-gold transition-colors line-clamp-2">
                        {service.name}
                      </h2>
                      
                      {service.description && (
                        <p className="text-dark-gray text-sm mb-6 text-center leading-relaxed line-clamp-3">
                          {service.description}
                        </p>
                      )}

                      {/* Features List */}
                      {featureList.length > 0 && (
                        <ul className="space-y-2 mb-2 pt-4 border-t border-gray-100 flex flex-col items-center">
                          {featureList.map((feature, idx) => (
                            <li key={idx} className="text-dark-gray text-sm font-semibold flex items-center gap-1.5 justify-center">
                              <span className="text-accent-gold font-bold text-lg leading-none">•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-light-gray py-20 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold mb-6 text-primary tracking-tight">Precisa de assessoria personalizada?</h2>
          <p className="text-dark-gray text-lg mb-8 leading-relaxed">
            Fale conosco diretamente via WhatsApp. Nós respondemos suas dúvidas e ajudamos você a escolher a melhor opção para a conquista do seu visto.
          </p>
          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-md shadow-[#25D366]/20"
          >
            <Icons.MessageCircle className="w-5 h-5" />
            <span>Falar Conosco no WhatsApp</span>
          </a>
        </div>
      </section>
    </div>
  );
}
