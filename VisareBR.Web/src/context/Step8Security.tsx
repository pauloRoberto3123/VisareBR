import { Link } from 'react-router-dom';
import { useDs160, DS160_TERMO_VERSAO, buildDs160TermoText } from './Ds160Context';

export default function Step8Security() {
  const { data, updateStepData } = useDs160();
  const { step1, step8 } = data;

  const applicantName = (step1.fullName || '').trim() || '________________________________';
  const applicantCpf = (step1.cpf || '').trim() || '___.___.___-__';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      updateStepData('step8', {
        [name]: checked,
        termo_versao: DS160_TERMO_VERSAO,
        termo_texto: checked ? buildDs160TermoText(step1.fullName, step1.cpf) : '',
      });
    } else {
      updateStepData('step8', { [name]: value });
    }
  };

  const securityQuestions = [
    { id: 'disease', label: 'Você tem alguma doença transmissível de importância para a saúde pública?' },
    { id: 'criminal', label: 'Você já foi preso ou condenado por qualquer crime ou delito?' },
    { id: 'terrorism', label: 'Você já se envolveu em atividades terroristas, espionagem, sabotagem ou genocídio?' },
    { id: 'fraud', label: 'Você já cometeu fraude ou falsificação para obter um visto ou entrada nos EUA?' },
    { id: 'deported', label: 'Você já foi deportado ou removido dos Estados Unidos?' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-primary border-b border-light-gray pb-4">
        Seção 8: Segurança e Histórico
      </h2>

      <div className="space-y-6">
        {securityQuestions.map((q) => (
          <div key={q.id} className="bg-light-gray p-5 rounded-2xl border border-dark-gray/20">
            <span className="block text-sm font-medium text-primary mb-3">{q.label} *</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={q.id}
                  value="Yes"
                  checked={step8[q.id as keyof typeof step8] === 'Yes'}
                  onChange={handleChange}
                  className="text-red-600 focus:ring-red-600"
                />{' '}
                Sim
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={q.id}
                  value="No"
                  checked={step8[q.id as keyof typeof step8] === 'No'}
                  onChange={handleChange}
                  className="text-accent-red focus:ring-accent-red"
                />{' '}
                Não
              </label>
            </div>
            {step8[q.id as keyof typeof step8] === 'Yes' && (
              <div className="animate-fade-in mt-4">
                <label className="block text-sm font-medium text-red-800 mb-1">
                  Por favor, explique em detalhes (datas, locais, motivos) *
                </label>
                <textarea
                  name={`${q.id}Explain`}
                  required
                  rows={3}
                  value={(step8[`${q.id}Explain` as keyof typeof step8] as string) || ''}
                  onChange={handleChange}
                  className="w-full p-3 border border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 bg-white"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Termo de revisão, veracidade e autorização de preparo — DS-160 (Versão 1.1) */}
      <div className="bg-light-gray p-6 md:p-8 rounded-2xl border border-primary/15 text-dark-gray text-sm space-y-4 mt-8">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-gray-300 pb-3">
          <h3 className="text-base md:text-lg font-extrabold text-primary">
            Termo de revisão, veracidade e autorização de preparo — DS-160
          </h3>
          <span className="text-xs font-bold text-gray-500 bg-white px-2.5 py-1 rounded-full border border-gray-200">
            Versão {DS160_TERMO_VERSAO}
          </span>
        </div>

        <p className="text-primary font-semibold leading-relaxed">
          Eu, <strong className="font-extrabold underline decoration-accent-gold/60">{applicantName}</strong>, CPF{' '}
          <strong className="font-extrabold underline decoration-accent-gold/60">{applicantCpf}</strong>, declaro que:
        </p>

        <ol className="list-decimal pl-5 space-y-2.5 text-dark-gray leading-relaxed">
          <li>
            Forneci pessoalmente todas as informações deste formulário e elas são verdadeiras, completas e corretas.
          </li>
          <li>
            Li e entendi todas as perguntas, inclusive as perguntas de segurança, e respondi com sinceridade.
          </li>
          <li>
            Sei que a DS-160 é um formulário oficial do Departamento de Estado dos EUA e que informações falsas ou enganosas podem levar à recusa permanente do visto ou à proibição de entrada nos Estados Unidos.
          </li>
          <li>
            Autorizo a VisareBR a usar estas informações para preparar, digitar e enviar a minha DS-160 no site oficial (CEAC), traduzindo-as para o inglês quando necessário, e a constar como preparadora do formulário.
          </li>
          <li>
            Antes do envio, vou receber o PDF da minha DS-160, revisar todas as respostas, inclusive as perguntas de segurança, e avisar a VisareBR sobre qualquer erro.
          </li>
          <li>
            Depois de revisar o PDF, autorizo a VisareBR a enviar o meu formulário DS-160, sabendo que o envio certifica perante o governo americano que li e entendi as perguntas e que as respostas são verdadeiras.
          </li>
          <li>
            Sei que a responsabilidade pelo conteúdo das respostas é exclusivamente minha e que a VisareBR não garante a emissão do visto, que é decisão exclusiva do oficial consular.
          </li>
          <li>
            Autorizo a VisareBR a tratar os meus dados pessoais, inclusive os dados de saúde informados nas perguntas de segurança, somente para preparar o meu processo de visto, conforme a Lei 13.709/2018 (LGPD) e a{' '}
            <Link
              to="/privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-bold underline hover:text-accent-gold transition-colors"
            >
              Política de Privacidade da VisareBR
            </Link>
            . Posso pedir acesso, correção ou exclusão dos meus dados a qualquer momento.
          </li>
        </ol>

        <div className="pt-4 border-t border-gray-300">
          <label className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-primary/20 cursor-pointer hover:border-primary/50 transition-colors">
            <input
              type="checkbox"
              name="declarationAccepted"
              checked={Boolean(step8.declarationAccepted)}
              onChange={handleChange}
              className="mt-0.5 w-5 h-5 text-accent-red focus:ring-accent-red shrink-0 cursor-pointer"
              required
            />
            <span className="text-sm font-bold text-primary select-none">
              Li, revisei e autorizo a VisareBR a enviar o meu formulário DS-160.
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
