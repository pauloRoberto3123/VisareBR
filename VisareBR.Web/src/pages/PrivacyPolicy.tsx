import { useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function PrivacyPolicy() {
  const { settings } = useSettings();

  useEffect(() => {
    document.title = 'Política de Privacidade (LGPD) | VisareBR';
  }, []);

  return (
    <div className="bg-secondary min-h-screen pb-20">
      <section className="bg-primary py-16 text-secondary text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 text-accent-gold font-bold text-xs uppercase tracking-widest mb-3">
            <ShieldCheck size={16} /> Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white">Política de Privacidade</h1>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-3xl border border-light-gray shadow-sm p-6 md:p-10 space-y-6 text-dark-gray text-sm md:text-base leading-relaxed text-left">
          <p>
            A <strong>VisareBR Assessoria de Vistos</strong>{settings?.cnpj ? ` (CNPJ ${settings.cnpj})` : ''} compromete-se com a privacidade, a segurança e a transparência no tratamento dos dados pessoais de seus clientes e usuários, em estrita conformidade com a <strong>Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais — LGPD)</strong>.
          </p>

          <h2 className="text-xl font-extrabold text-primary pt-2">1. Finalidade do Tratamento de Dados</h2>
          <p>
            Os dados pessoais, familiares, profissionais, de viagem e eventuais dados sensíveis (como informações de saúde e antecedentes exigidas nas perguntas de segurança do formulário DS-160) fornecidos pelo titular são coletados e tratados <strong>exclusivamente</strong> para:
          </p>
          <ul className="list-disc pl-6 space-y-1.5">
            <li>Análise de perfil e orientação consular personalizada;</li>
            <li>Preparação, tradução, digitação e envio do formulário oficial DS-160 no sistema CEAC do Departamento de Estado dos EUA;</li>
            <li>Criação de conta, emissão de guia da taxa MRV e agendamento no CASV e Consulado Americano;</li>
            <li>Comunicação direta com o solicitante para revisão do PDF da DS-160 e acompanhamento do processo.</li>
          </ul>

          <h2 className="text-xl font-extrabold text-primary pt-2">2. Segurança e Criptografia</h2>
          <p>
            Adotamos medidas técnicas e administrativas aptas a proteger os dados pessoais contra acessos não autorizados, incluindo tráfego criptografado via HTTPS/TLS, controle restrito de acesso administrativo e criptografia simétrica <strong>AES-256</strong> para documentos sensíveis de viagem armazenados em banco de dados.
          </p>

          <h2 className="text-xl font-extrabold text-primary pt-2">3. Compartilhamento de Dados</h2>
          <p>
            A VisareBR <strong>não comercializa nem compartilha</strong> dados pessoais com terceiros para fins publicitários. Os dados do formulário DS-160 são transmitidos unicamente aos sistemas oficiais do Governo dos Estados Unidos (CEAC / Departamento de Estado e sistema oficial de agendamento consular) mediante autorização expressa do titular.
          </p>

          <h2 className="text-xl font-extrabold text-primary pt-2">4. Direitos do Titular (Art. 18 da LGPD)</h2>
          <p>
            O titular dos dados pode, a qualquer momento e mediante requisição, solicitar a confirmação da existência de tratamento, o acesso aos seus dados, a correção de dados incompletos ou desatualizados e a eliminação dos dados pessoais tratados com o seu consentimento.
          </p>

          <h2 className="text-xl font-extrabold text-primary pt-2">5. Canal de Atendimento e Encarregado (DPO)</h2>
          <p>
            Para exercer seus direitos previstos na LGPD ou esclarecer dúvidas sobre esta Política de Privacidade, entre em contato pelos nossos canais oficiais:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>E-mail:</strong> {settings?.companyEmail || 'contato@visarebr.com.br'}</li>
            <li><strong>WhatsApp:</strong> {settings?.whatsappNumber || '(19) 99844-8417'}</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

