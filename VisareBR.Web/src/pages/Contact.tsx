import { useState } from 'react';
import { Mail, Phone, Clock, MessageSquare, ShieldCheck, Send } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function Contact() {
  const { settings, whatsappUrl } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Primeiro Visto Americano',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build formatted message
    const formattedMsg = `*Nova Mensagem de Contato - VisareBR*\n\n` +
      `*Nome:* ${formData.name}\n` +
      `*E-mail:* ${formData.email}\n` +
      `*Telefone:* ${formData.phone}\n` +
      `*Assunto:* ${formData.subject}\n\n` +
      `*Mensagem:*\n${formData.message}`;

    // Target WhatsApp URL
    const whatsappNum = settings?.whatsappNumber ? settings.whatsappNumber.replace(/\D/g, '') : '551999999999';
    const waLink = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(formattedMsg)}`;

    // Open WhatsApp
    window.open(waLink, '_blank', 'noopener,noreferrer');

    setSubmitted(true);
    // Reset form fields
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'Primeiro Visto Americano',
      message: ''
    });

    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="bg-secondary min-h-screen">
      {/* Page Header */}
      <section className="bg-primary py-20 text-secondary text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-accent-gold/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-white">
            Fale Conosco
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            Estamos prontos para tirar suas dúvidas e iniciar o processo do seu visto americano ou de outros países.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* Left Column: Info Cards */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <h2 className="text-3xl font-extrabold text-primary tracking-tight mb-2">Canais de Atendimento</h2>
              <p className="text-dark-gray text-sm leading-relaxed mb-6">
                Escolha a forma mais confortável para falar com nossos assessores. Se preferir um atendimento ágil, envie o formulário para iniciar uma conversa estruturada no WhatsApp.
              </p>

              {/* WhatsApp Call to Action Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold py-4 px-6 rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg w-full text-center text-base uppercase tracking-wider mb-4"
              >
                <Phone size={20} />
                Falar Conosco no WhatsApp
              </a>

              {/* Info blocks */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="bg-accent-gold/10 p-3 rounded-xl text-accent-gold shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-primary text-base">E-mail Corporativo</h3>
                  <p className="text-slate-500 text-sm mt-1">Para assuntos burocráticos, parcerias ou contatos formais.</p>
                  <a href={`mailto:${settings?.companyEmail || 'contato@visarebr.com.br'}`} className="text-accent-gold font-bold hover:underline text-sm block mt-2 break-all">
                    {settings?.companyEmail || 'contato@visarebr.com.br'}
                  </a>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="bg-accent-gold/10 p-3 rounded-xl text-accent-gold shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-primary text-base">Horário de Atendimento</h3>
                  <p className="text-slate-500 text-sm mt-1">Nosso time de suporte está ativo durante a semana:</p>
                  <span className="text-primary font-bold text-sm block mt-2">Segunda a Sexta: 09h às 18h</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-xl relative text-left">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                  <MessageSquare className="text-accent-gold" />
                  <h2 className="text-2xl font-bold text-primary">Envie uma Mensagem</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider block">Nome Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Seu Nome..."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-gold focus:outline-none text-primary"
                    />
                  </div>

                  {/* Email & Phone grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-primary uppercase tracking-wider block">E-mail</label>
                      <input
                        type="email"
                        required
                        placeholder="seuemail@provedor.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-gold focus:outline-none text-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-primary uppercase tracking-wider block">WhatsApp</label>
                      <input
                        type="tel"
                        required
                        placeholder="(19) 99999-9999"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-gold focus:outline-none text-primary"
                      />
                    </div>
                  </div>

                  {/* Subject Dropdown */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider block">Qual serviço você precisa?</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-gold focus:outline-none text-primary bg-white"
                    >
                      <option value="Primeiro Visto Americano">Primeiro Visto Americano</option>
                      <option value="Renovação de Visto Americano">Renovação de Visto Americano</option>
                      <option value="Visto Recusado / Reaplicação">Visto Recusado / Reaplicação</option>
                      <option value="Visto de Estudante (F1)">Visto de Estudante (F1)</option>
                      <option value="Vistos de Outros Países">Vistos de Outros Países</option>
                      <option value="Serviços Avulsos / Consultas">Serviços Avulsos / Consultas</option>
                      <option value="Outros Assuntos">Outros Assuntos</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider block">Mensagem / Observações</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Descreva brevemente suas necessidades ou dúvidas..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-gold focus:outline-none text-primary"
                    />
                  </div>

                  {/* Success Alert */}
                  {submitted && (
                    <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm font-semibold rounded-xl animate-fade-in">
                      <ShieldCheck className="text-emerald-600" />
                      <span>Mensagem formatada com sucesso! Redirecionando para o WhatsApp...</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-primary text-secondary py-4 rounded-xl font-bold hover:bg-opacity-95 transition-all text-sm uppercase tracking-widest shadow-md hover:shadow-lg cursor-pointer"
                  >
                    <Send size={16} /> Enviar no WhatsApp
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
