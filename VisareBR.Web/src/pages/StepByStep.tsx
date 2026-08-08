import {
  MessageSquare,
  FileText,
  CreditCard,
  Calendar,
  UserCheck,
  ShieldCheck,
  Star,
  Compass,
  Target,
  Award,
  Users,
  Briefcase,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Lock,
  Heart,
  TrendingUp
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const steps = [
  {
    title: '1. Atendimento Inicial',
    description: 'Você entra em contato conosco via WhatsApp ou formulário. Entendemos seu objetivo de viagem e tiramos suas primeiras dúvidas.',
    icon: <MessageSquare className="w-10 h-10 text-primary" />,
    color: 'bg-accent-red'
  },
  {
    title: '2. Análise de Perfil',
    description: 'Nossos especialistas analisam sua situação (vínculos, renda, histórico) para identificar a melhor estratégia para o seu visto.',
    icon: <UserCheck className="w-10 h-10 text-secondary" />,
    color: 'bg-dark-gray'
  },
  {
    title: '3. Preenchimento do DS-160',
    description: 'Realizamos o preenchimento técnico e detalhado do formulário oficial. Evitamos erros que são os maiores motivos de negativa.',
    icon: <FileText className="w-10 h-10 text-secondary" />,
    color: 'bg-gray-700'
  },
  {
    title: '4. Pagamento da Taxa MRV',
    description: 'Orientamos sobre a emissão e o pagamento da taxa consular obrigatória para o agendamento.',
    icon: <CreditCard className="w-10 h-10 text-secondary" />,
    color: 'bg-gray-600'
  },
  {
    title: '5. Agendamento Estratégico',
    description: 'Agendamos sua coleta de dados no CASV e a entrevista no Consulado, buscando as datas mais próximas disponíveis.',
    icon: <Calendar className="w-10 h-10 text-secondary" />,
    color: 'bg-gray-500'
  },
  {
    title: '6. Simulado de Entrevista',
    description: 'Preparamos você com um treinamento personalizado, simulando as perguntas que o oficial consular poderá fazer.',
    icon: <ShieldCheck className="w-10 h-10 text-primary" />,
    color: 'bg-accent-red'
  }
];

export default function StepByStep() {
  const { whatsappUrl } = useSettings();

  return (
    <div className="bg-secondary pb-24 text-left">

      {/* Hero Header */}
      <section className="bg-primary py-24 text-secondary text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-accent-gold/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-white tracking-tight leading-tight">
            Quem Somos
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
            A VisareBR nasceu com um propósito claro: tirar o peso e a insegurança de quem quer conquistar o visto americano.
          </p>
        </div>
      </section>

      {/* Intro & Google Review Banner */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Text description */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-3xl font-extrabold text-primary tracking-tight">
                Referência em Assessoria de Visto Americano
              </h2>
              <p className="text-dark-gray text-base leading-relaxed">
                Somos uma assessoria especializada em vistos para os Estados Unidos, referência na Região Metropolitana de Campinas (RMC) e em Jundiaí, com mais de cinco anos de experiência ajudando pessoas a realizarem esse sonho.
              </p>
              <p className="text-dark-gray text-base leading-relaxed">
                Somos reconhecidos no Google como referência no setor, com avaliação de cinco estrelas, e seguidos por outras assessorias de vistos. Um sinal de que fazemos o que fazemos com seriedade e excelência.
              </p>
            </div>

            {/* Google review box (glassmorphism/premium look) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-primary to-[#0f2a54] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-gold/10 rounded-full blur-2xl group-hover:scale-120 transition-transform duration-500"></div>

              <div className="flex items-center gap-1 text-accent-gold mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-current" />
                ))}
              </div>
              <h3 className="text-2xl font-bold mb-2">5.0 Estrelas no Google</h3>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                Confira a opinião de quem já utilizou nossos serviços e conquistou o passaporte carimbado com nossa assessoria.
              </p>

              <a
                href="https://share.google/rimCEdAf69SSwudWG"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-accent-gold hover:bg-[#d5b991] text-white font-bold px-6 py-3 rounded-2xl transition-all duration-300 shadow-md text-sm uppercase tracking-wider"
              >
                Ver avaliações no Google <ExternalLink size={16} />
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* Como Trabalhamos Section */}
      <section className="py-20 bg-light-gray border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight mb-4">
              Como Trabalhamos
            </h2>
            <p className="text-lg text-dark-gray leading-relaxed font-light">
              Na VisareBR, acreditamos que um processo bem feito começa muito antes da entrevista. Por isso, trabalhamos do início ao fim, com estratégia em cada etapa:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Avaliação de Perfil',
                desc: 'Análise aprofundada de vínculos econômicos, sociais e mapeamento dos pontos fortes e frágeis do solicitante.'
              },
              {
                title: 'Preenchimento Estratégico',
                desc: 'Preenchimento técnico e minucioso do formulário DS-160, evitando erros comuns que geram negativas.'
              },
              {
                title: 'Checklist de Documentação',
                desc: 'Organização rigorosa e direcionada de todos os documentos de apoio com base no perfil individual.'
              },
              {
                title: 'Criação e Agendamento',
                desc: 'Geração da taxa consular, monitoramento de vagas e agendamento da melhor data disponível nos postos e consulados.'
              },
              {
                title: 'Preparação Personalizada',
                desc: 'Treinamento completo para o dia do CASV e simulação de entrevista consular focada nas possíveis perguntas do oficial.'
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex gap-4">
                <CheckCircle2 className="w-8 h-8 text-accent-gold shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-primary text-lg mb-2">{item.title}</h3>
                  <p className="text-dark-gray text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos de Serviço Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight mb-4">
              Planos de Serviço para Cada Perfil
            </h2>
            <p className="text-lg text-dark-gray leading-relaxed font-light">
              Oferecemos planos de serviço pensados para cada perfil e momento, do suporte essencial ao atendimento exclusivo com representação.
            </p>
            <p className="text-sm text-dark-gray mt-2 italic">
              O que muda entre eles é o nível de suporte, a velocidade e os benefícios extras. O que não muda é o compromisso com um processo seguro, personalizado e de alta qualidade.
            </p>
          </div>

          {/* Cards wrapper */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[
              {
                title: 'Plano Padrão',
                desc: 'O suporte essencial para quem quer um processo completo e seguro do início ao fim.'
              },
              {
                title: 'Plano Intermediário',
                desc: 'Inclui defesa de negativa. Ideal para quem já teve um "não" e quer tentar de novo com total segurança.'
              },
              {
                title: 'Plano Premium',
                desc: 'Mais abrangente, com cobertura estendida para renovação do visto, mesmo após o vencimento.'
              },
              {
                title: 'Plano VIP',
                desc: 'Nosso atendimento mais completo, com representação e a comodidade de renovar o visto sem sair de casa.'
              }
            ].map((plano, idx) => (
              <div key={idx} className="bg-light-gray p-8 rounded-3xl border border-gray-100 flex flex-col justify-between hover:border-accent-gold/40 transition-colors shadow-sm">
                <div>
                  <h3 className="font-extrabold text-primary text-xl mb-3">{plano.title}</h3>
                  <p className="text-dark-gray text-sm leading-relaxed mb-6">{plano.desc}</p>
                </div>
                <span className="text-xs font-bold text-accent-gold uppercase tracking-wider">Pessoa Física</span>
              </div>
            ))}
          </div>

          {/* Extra profiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#0B1E3F]/5 p-8 rounded-3xl border border-[#0B1E3F]/10 flex items-center gap-6">
              <Users className="w-12 h-12 text-primary shrink-0" />
              <div>
                <h4 className="font-extrabold text-primary text-lg mb-1">Familiares e Grupos</h4>
                <p className="text-dark-gray text-sm leading-relaxed">Oferecemos desconto progressivo de acordo com a quantidade de solicitantes em cada plano ofertado.</p>
              </div>
            </div>
            <div className="bg-[#0B1E3F]/5 p-8 rounded-3xl border border-[#0B1E3F]/10 flex items-center gap-6">
              <Briefcase className="w-12 h-12 text-primary shrink-0" />
              <div>
                <h4 className="font-extrabold text-primary text-lg mb-1">Empresas e Negócios</h4>
                <p className="text-dark-gray text-sm leading-relaxed">Soluções corporativas completas com planos empresariais sob consulta com nossa gerência.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Standalone Services Banner */}
      <section className="py-16 bg-[#0B1E3F] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-accent-gold/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
                Precisa de um suporte pontual? Conheça nossos Serviços Avulsos
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                Nem todo projeto de viagem exige um plano completo. Se você já começou o processo sozinho e precisa de ajuda específica, oferecemos serviços avulsos como defesa de negativa, simulação de entrevista, antecipação de agendamento e vistos específicos (estudante, trabalho, religioso, etc.).
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-accent-red hover:bg-[#a01639] text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-md text-base"
              >
                Falar com Especialistas <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* O que entregamos Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-extrabold text-primary tracking-tight">
                Entregamos Preparo e Estratégia
              </h2>
              <p className="text-dark-gray text-base leading-relaxed">
                Entregamos mais do que um formulário preenchido. Entregamos preparo. Nosso papel é fazer sua solicitação chegar completa, bem embasada e com as maiores chances de aprovação.
              </p>
              <p className="text-dark-gray text-base leading-relaxed">
                Do primeiro contato até o passaporte aprovado, cada passo tem um propósito: aumentar suas chances de sair do consulado com o visto na mão. Sem rodeios, sem burocracia.
              </p>
            </div>
            <div className="bg-light-gray p-8 rounded-3xl border border-gray-100 grid grid-cols-1 gap-6">
              <div className="flex gap-4">
                <Compass className="w-10 h-10 text-accent-gold shrink-0 mt-1" />
                <div>
                  <h4 className="font-extrabold text-primary text-lg mb-1">Nossa Missão</h4>
                  <p className="text-dark-gray text-sm leading-relaxed">Oferecer a nossos clientes um processo seguro na solicitação do visto, facilitando cada etapa e entregando estratégias de qualidade para aumentar as chances de aprovação.</p>
                </div>
              </div>
              <div className="flex gap-4 border-t border-gray-200/60 pt-6">
                <Target className="w-10 h-10 text-accent-gold shrink-0 mt-1" />
                <div>
                  <h4 className="font-extrabold text-primary text-lg mb-1">Nossa Visão</h4>
                  <p className="text-dark-gray text-sm leading-relaxed">Ser a assessoria de vistos referência no Brasil, reconhecida pela excelência, pela confiança que inspiramos e pelo alto índice de aprovação de nossos clientes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nossos Valores Grid */}
      <section className="py-20 bg-light-gray border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-primary tracking-tight mb-2">
              Nossos Valores
            </h2>
            <p className="text-lg text-dark-gray leading-relaxed font-light">
              Princípios que regem nosso atendimento diário e orientam cada processo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Verdade',
                desc: 'Informação clara, honesta e sem promessas falsas. O que você pode esperar, você recebe.',
                icon: <CheckCircle2 className="w-6 h-6 text-accent-gold" />
              },
              {
                title: 'Competência',
                desc: 'Domínio técnico de cada etapa do processo, desde o preenchimento do formulário DS-160 até a entrevista.',
                icon: <Award className="w-6 h-6 text-accent-gold" />
              },
              {
                title: 'Eficiência',
                desc: 'Agilidade e organização de ponta, respeitando integralmente o seu tempo.',
                icon: <TrendingUp className="w-6 h-6 text-accent-gold" />
              },
              {
                title: 'Compromisso',
                desc: 'Acompanhamos você do início ao fim do processo, cuidando de cada detalhe como se fosse nosso.',
                icon: <Heart className="w-6 h-6 text-accent-gold" />
              },
              {
                title: 'Confiança e Respeito',
                desc: 'Tratamos cada cliente de forma única, com o cuidado, humanidade e atenção que seu perfil merece.',
                icon: <UserCheck className="w-6 h-6 text-accent-gold" />
              },
              {
                title: 'Profissionalismo',
                desc: 'Seriedade, ética profissional e compromisso com o sigilo de seus dados em cada decisão.',
                icon: <Lock className="w-6 h-6 text-accent-gold" />
              }
            ].map((valor, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    {valor.icon}
                    <h3 className="font-extrabold text-primary text-lg">{valor.title}</h3>
                  </div>
                  <p className="text-dark-gray text-sm leading-relaxed">{valor.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ORIGINAL TIMELINE: Como Funciona Nossa Assessoria (Placed at the end) */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight mb-4">
              Passo a Passo de Como Funciona
            </h2>
            <p className="text-lg text-dark-gray leading-relaxed font-light">
              Entenda a dinâmica de trabalho desde o seu contato inicial até a data final das suas entrevistas.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
              {steps.map((step, index) => (
                <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Icon Circle */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-secondary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${step.color}`}>
                    <div className="scale-75 invert flex items-center justify-center">
                      {step.icon}
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-secondary p-6 rounded-2xl border border-light-gray shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between space-x-2 mb-2">
                      <h3 className="font-bold text-primary text-xl">{step.title}</h3>
                    </div>
                    <p className="text-dark-gray leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mt-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="bg-primary rounded-3xl p-12 text-secondary shadow-2xl shadow-dark-gray">
            <h2 className="text-3xl font-bold mb-4 text-white">Pronto para tirar o peso do seu vir à América?</h2>
            <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
              Garanta sua assessoria agora e aumente suas chances de aprovação. Nossa equipe está pronta para te atender.
            </p>
            <a href={whatsappUrl} className="bg-accent-red text-secondary px-10 py-4 rounded-full font-bold text-lg hover:bg-opacity-90 transition-all inline-block">
              Iniciar meu Processo Agora
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
