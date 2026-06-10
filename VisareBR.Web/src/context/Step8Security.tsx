import { useDs160 } from './Ds160Context';

export default function Step8Security() {
  const { data, updateStepData } = useDs160();
  const { step8 } = data;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      updateStepData('step8', { [name]: (e.target as HTMLInputElement).checked });
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
      <h2 className="text-2xl font-bold text-primary border-b border-light-gray pb-4">Seção 8: Segurança e Histórico</h2>
      
      <div className="space-y-6">
        {securityQuestions.map((q) => (
          <div key={q.id} className="bg-light-gray p-5 rounded-2xl border border-dark-gray/20">
            <span className="block text-sm font-medium text-primary mb-3">{q.label} *</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name={q.id} value="Yes" checked={step8[q.id as keyof typeof step8] === 'Yes'} onChange={handleChange} className="text-red-600 focus:ring-red-600" /> Sim</label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name={q.id} value="No" checked={step8[q.id as keyof typeof step8] === 'No'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Não</label>
            </div>
            {step8[q.id as keyof typeof step8] === 'Yes' && (
              <div className="animate-fade-in mt-4">
                <label className="block text-sm font-medium text-red-800 mb-1">Por favor, explique em detalhes (datas, locais, motivos) *</label>
                <textarea name={`${q.id}Explain`} required rows={3} value={step8[`${q.id}Explain` as keyof typeof step8] as string} onChange={handleChange} className="w-full p-3 border border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 bg-white"></textarea>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-light-gray p-6 rounded-2xl text-dark-gray text-sm space-y-4 mt-6">
        <label className="flex items-start gap-3 mt-4 pt-4 border-t border-gray-300 cursor-pointer">
          <input type="checkbox" name="declarationAccepted" checked={step8.declarationAccepted} onChange={handleChange} className="mt-1 w-5 h-5 text-accent-red focus:ring-accent-red" required />
          <span className="text-sm font-medium text-primary">Eu declaro sob pena de perjúrio que li e entendi as informações fornecidas e que todas as respostas são verdadeiras e corretas.</span>
        </label>
        
        {step8.declarationAccepted && (
          <div className="animate-fade-in mt-4">
            <label className="block text-sm font-medium text-primary mb-1">Assinatura Eletrônica (Digite seu nome completo) *</label>
            <input type="text" name="signature" required value={step8.signature} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white" placeholder="Seu Nome Completo" />
          </div>
        )}
      </div>
    </div>
  );
}