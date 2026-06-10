import { ShieldCheck, CheckCircle2, MessageSquare, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

export default function Home() {
  const { whatsappUrl } = useSettings();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-light-gray py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:w-2/3">
            <h1 className="text-4xl md:text-6xl font-extrabold text-primary leading-tight mb-6">
              Sua aprovação do <span className="text-accent-gold">Visto Americano</span> começa aqui.
            </h1>
            <p className="text-xl text-dark-gray mb-10 max-w-2xl">
              Assessoria especializada para vistos de turismo, negócios e renovação. 
              Processo simplificado, seguro e com acompanhamento completo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href={whatsappUrl} className="bg-accent-red text-secondary px-8 py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all text-center flex items-center justify-center gap-2">
                Solicitar via WhatsApp
              </a>
              <Link to="/vistos" className="bg-secondary text-primary border-2 border-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-light-gray transition-all text-center">
                Ver tipos de vistos
              </Link>
            </div>
          </div>
        </div>
        {/* Abstract shapes to mimic the reference site */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary opacity-5 -skew-x-12 translate-x-20"></div>
      </section>

      {/* Features/Stats Section */}
      <section className="py-20 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-light-gray p-4 rounded-2xl mb-6">
                <CheckCircle2 className="w-10 h-10 text-accent-gold" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-primary">+5000</h3>
              <p className="text-dark-gray">Vistos Aprovados</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-light-gray p-4 rounded-2xl mb-6">
                <ShieldCheck className="w-10 h-10 text-accent-gold" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-primary">98%</h3>
              <p className="text-dark-gray">Índice de Sucesso</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-light-gray p-4 rounded-2xl mb-6">
                <MessageSquare className="w-10 h-10 text-accent-gold" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-primary">Suporte 24/7</h3>
              <p className="text-dark-gray">Atendimento Especializado</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Preview (Emulating the reference) */}
      <section className="py-20 bg-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">O que dizem nossos clientes</h2>
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 fill-accent-gold text-accent-gold" />)}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* We'll make this dynamic later with the API */}
            <div className="bg-secondary p-8 rounded-2xl shadow-sm border border-light-gray">
              <p className="text-dark-gray italic mb-6">"Experiência excelente com a VisareBR! Renovei meu visto com total tranquilidade. Atendimento claro e rápido."</p>
              <div className="font-bold text-primary">Ana Paula Moreira</div>
            </div>
            <div className="bg-secondary p-8 rounded-2xl shadow-sm border-t-4 border-accent-gold">
              <p className="text-dark-gray italic mb-6">"Tive meu visto aprovado sem transtorno. Os meninos foram incríveis e prestativos em todo o processo."</p>
              <div className="font-bold text-primary">Carolina Reese</div>
            </div>
            <div className="bg-secondary p-8 rounded-2xl shadow-sm border border-light-gray">
              <p className="text-dark-gray italic mb-6">"A assessoria foi impecável do início ao fim. Me orientaram em cada etapa, não tive nenhuma preocupação."</p>
              <div className="font-bold text-primary">Isabela Clebis</div>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link to="/avaliacoes" className="text-accent-gold font-bold hover:underline">Ver todas as avaliações →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}


