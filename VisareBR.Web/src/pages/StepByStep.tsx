import { MessageSquare, FileText, CreditCard, Calendar, UserCheck, ShieldCheck } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const steps = [
  {
    title: '1. Atendimento Inicial',
    description: 'Você entra em contato conosco via WhatsApp ou formulário. Entendemos seu objetivo de viagem e tiramos suas primeiras dúvidas.',
    icon: <MessageSquare className="w-10 h-10 text-white" />,
    color: 'bg-black'
  },
  {
    title: '2. Análise de Perfil',
    description: 'Nossos especialistas analisam sua situação (vínculos, renda, histórico) para identificar a melhor estratégia para o seu visto.',
    icon: <UserCheck className="w-10 h-10 text-white" />,
    color: 'bg-gray-800'
  },
  {
    title: '3. Preenchimento do DS-160',
    description: 'Realizamos o preenchimento técnico e detalhado do formulário oficial. Evitamos erros que são os maiores motivos de negativa.',
    icon: <FileText className="w-10 h-10 text-white" />,
    color: 'bg-gray-700'
  },
  {
    title: '4. Pagamento da Taxa MRV',
    description: 'Orientamos sobre a emissão e o pagamento da taxa consular obrigatória para o agendamento.',
    icon: <CreditCard className="w-10 h-10 text-white" />,
    color: 'bg-gray-600'
  },
  {
    title: '5. Agendamento Estratégico',
    description: 'Agendamos sua coleta de dados no CASV e a entrevista no Consulado, buscando as datas mais próximas disponíveis.',
    icon: <Calendar className="w-10 h-10 text-white" />,
    color: 'bg-gray-500'
  },
  {
    title: '6. Simulado de Entrevista',
    description: 'Preparamos você com um treinamento personalizado, simulando as perguntas que o oficial consular poderá fazer.',
    icon: <ShieldCheck className="w-10 h-10 text-white" />,
    color: 'bg-gray-400'
  }
];

export default function StepByStep() {
  const { whatsappUrl } = useSettings();

  return (
    <div className="bg-white pb-20">
      {/* Hero Header */}
      <section className="bg-black py-20 text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">Como Funciona Nossa Assessoria</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Acompanhamos você do início ao fim do processo. Transparência, agilidade e segurança em cada etapa.
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
            
            {steps.map((step, index) => (
              <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Icon Circle */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${step.color}`}>
                  {step.icon}
                </div>
                
                {/* Content Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between space-x-2 mb-2">
                    <h3 className="font-bold text-gray-900 text-xl">{step.title}</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mt-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="bg-black rounded-3xl p-12 text-white shadow-2xl shadow-gray-200">
            <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
            <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
              Garanta sua assessoria agora e aumente suas chances de aprovação. Nossa equipe está pronta para te atender.
            </p>
            <a href={whatsappUrl} className="bg-white text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all inline-block">
              Iniciar meu Processo Agora
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
