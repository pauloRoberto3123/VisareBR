import { Plane, RefreshCw, GraduationCap, Briefcase, ChevronRight, CheckCircle2 } from 'lucide-react';

const services = [
  {
    id: 'turismo',
    title: 'Visto de Turismo (B2)',
    icon: <Plane className="w-12 h-12 text-blue-600" />,
    description: 'Para quem deseja visitar os EUA a lazer, férias ou tratamento médico.',
    features: ['Preenchimento do DS-160', 'Agendamento de entrevista', 'Orientação para documentos', 'Simulado de entrevista']
  },
  {
    id: 'negocios',
    title: 'Visto de Negócios (B1)',
    icon: <Briefcase className="w-12 h-12 text-blue-600" />,
    description: 'Para participação em reuniões, conferências ou negociações comerciais.',
    features: ['Foco em perfil profissional', 'Análise de vínculos', 'Suporte com convites corporativos']
  },
  {
    id: 'renovacao',
    title: 'Renovação de Visto',
    icon: <RefreshCw className="w-12 h-12 text-blue-600" />,
    description: 'Seu visto venceu ou está para vencer? O processo de renovação costuma dispensar a entrevista.',
    features: ['Processo simplificado', 'Sem necessidade de entrevista (na maioria dos casos)', 'Envio de passaporte seguro']
  },
  {
    id: 'estudante',
    title: 'Visto de Estudante (F1)',
    icon: <GraduationCap className="w-12 h-12 text-blue-600" />,
    description: 'Para quem foi aceito em uma instituição de ensino americana.',
    features: ['Auxílio com formulário I-20', 'Taxa SEVIS', 'Preparação para entrevista acadêmica']
  }
];

export default function Services() {
  return (
    <div className="bg-white">
      {/* Header Section */}
      <section className="bg-blue-600 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">Nossos Serviços de Assessoria</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Oferecemos suporte completo para garantir que sua solicitação de visto americano seja feita de forma correta, segura e com as maiores chances de aprovação.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {services.map((service) => (
              <div key={service.id} className="bg-gray-50 rounded-3xl p-8 hover:shadow-xl transition-all border border-transparent hover:border-blue-100 group">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="bg-white p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                    
                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-700 font-medium">
                          <CheckCircle2 className="text-green-500 w-5 h-5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <a 
                      href="https://wa.me/your-number" 
                      className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all"
                    >
                      Solicitar este visto <ChevronRight size={20} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Não sabe qual visto solicitar?</h2>
          <p className="text-gray-600 text-lg mb-10">
            Nossos especialistas podem analisar seu perfil e indicar a melhor categoria para o seu caso específico.
          </p>
          <button className="bg-blue-600 text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            Falar com um Consultor Grátis
          </button>
        </div>
      </section>
    </div>
  );
}
