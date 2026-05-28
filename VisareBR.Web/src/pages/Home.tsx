import { ShieldCheck, CheckCircle2, MessageSquare, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-blue-50 py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:w-2/3">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Sua aprovação do <span className="text-blue-600">Visto Americano</span> começa aqui.
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl">
              Assessoria especializada para vistos de turismo, negócios e renovação. 
              Processo simplificado, seguro e com acompanhamento completo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="https://wa.me/your-number" className="bg-green-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-600 transition-all text-center flex items-center justify-center gap-2">
                Solicitar via WhatsApp
              </a>
              <Link to="/vistos" className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all text-center">
                Ver tipos de vistos
              </Link>
            </div>
          </div>
        </div>
        {/* Abstract shapes to mimic the reference site */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600 opacity-5 -skew-x-12 translate-x-20"></div>
      </section>

      {/* Features/Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-4 rounded-2xl mb-6">
                <CheckCircle2 className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">+5000</h3>
              <p className="text-gray-500">Vistos Aprovados</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-4 rounded-2xl mb-6">
                <ShieldCheck className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">98%</h3>
              <p className="text-gray-500">Índice de Sucesso</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-4 rounded-2xl mb-6">
                <MessageSquare className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Suporte 24/7</h3>
              <p className="text-gray-500">Atendimento Especializado</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Preview (Emulating the reference) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">O que dizem nossos clientes</h2>
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />)}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* We'll make this dynamic later with the API */}
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <p className="text-gray-600 italic mb-6">"Experiência excelente com a VisareBR! Renovei meu visto com total tranquilidade. Atendimento claro e rápido."</p>
              <div className="font-bold">Ana Paula Moreira</div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border-t-4 border-blue-600">
              <p className="text-gray-600 italic mb-6">"Tive meu visto aprovado sem transtorno. Os meninos foram incríveis e prestativos em todo o processo."</p>
              <div className="font-bold">Carolina Reese</div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <p className="text-gray-600 italic mb-6">"A assessoria foi impecável do início ao fim. Me orientaram em cada etapa, não tive nenhuma preocupação."</p>
              <div className="font-bold">Isabela Clebis</div>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link to="/avaliacoes" className="text-blue-600 font-bold hover:underline">Ver todas as avaliações →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
