import { useDs160 } from './Ds160Context';
import { Plus, Trash2 } from 'lucide-react';

export default function Step5History() {
  const { data, updateStepData } = useDs160();
  const { step5 } = data;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    updateStepData('step5', { [e.target.name]: e.target.value });
  };

  const addCountry = () => {
    if (step5.countriesVisited.length >= 10) return;
    updateStepData('step5', { countriesVisited: [...step5.countriesVisited, ''] });
  };

  const updateCountry = (index: number, value: string) => {
    const updated = [...step5.countriesVisited];
    updated[index] = value;
    updateStepData('step5', { countriesVisited: updated });
  };

  const removeCountry = (index: number) => {
    const updated = step5.countriesVisited.filter((_, i) => i !== index);
    updateStepData('step5', { countriesVisited: updated });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-primary border-b border-light-gray pb-4">Seção 5: Histórico de Viagens e Contatos</h2>
      
      {/* US Travel History */}
      <div className="bg-light-gray p-5 rounded-2xl space-y-4">
        <div>
          <span className="block text-sm font-medium text-primary mb-2">Você já esteve nos Estados Unidos antes? *</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasBeenToUS" value="Yes" checked={step5.hasBeenToUS === 'Yes'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Sim</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasBeenToUS" value="No" checked={step5.hasBeenToUS === 'No'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Não</label>
          </div>
        </div>
        {step5.hasBeenToUS === 'Yes' && (
          <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
             <div><label className="block text-sm font-medium text-primary mb-1">Data da última chegada *</label><input type="date" name="lastUSVisitDate" required value={step5.lastUSVisitDate} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" /></div>
             <div><label className="block text-sm font-medium text-primary mb-1">Tempo de permanência (em dias) *</label><input type="number" name="lastUSVisitLength" required value={step5.lastUSVisitLength} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" /></div>
          </div>
        )}
      </div>

      {/* US Visa History */}
      <div className="bg-light-gray p-5 rounded-2xl space-y-4">
        <div>
          <span className="block text-sm font-medium text-primary mb-2">Você já teve um visto americano emitido? *</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasUSVisa" value="Yes" checked={step5.hasUSVisa === 'Yes'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Sim</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasUSVisa" value="No" checked={step5.hasUSVisa === 'No'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Não</label>
          </div>
        </div>
        {step5.hasUSVisa === 'Yes' && (
          <div className="animate-fade-in grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
             <div><label className="block text-sm font-medium text-primary mb-1">Número do Visto (Folio) *</label><input type="text" name="usVisaNumber" required value={step5.usVisaNumber} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" /></div>
             <div><label className="block text-sm font-medium text-primary mb-1">Data de Emissão *</label><input type="date" name="usVisaIssueDate" required value={step5.usVisaIssueDate} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" /></div>
             <div><label className="block text-sm font-medium text-primary mb-1">Data de Expiração *</label><input type="date" name="usVisaExpiryDate" required value={step5.usVisaExpiryDate} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" /></div>
          </div>
        )}
      </div>

      {/* Denials and Petitions (CRITICAL) */}
      <div className="bg-red-50 border border-red-100 p-5 rounded-2xl space-y-6">
        <div>
          <span className="block text-sm font-medium text-primary mb-2">Você já teve um visto americano recusado, negado entrada ou retirado seu pedido de admissão nos EUA? *</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasRefusedUSVisa" value="Yes" checked={step5.hasRefusedUSVisa === 'Yes'} onChange={handleChange} className="text-red-600 focus:ring-red-600" /> Sim</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasRefusedUSVisa" value="No" checked={step5.hasRefusedUSVisa === 'No'} onChange={handleChange} className="text-red-600 focus:ring-red-600" /> Não</label>
          </div>
          {step5.hasRefusedUSVisa === 'Yes' && (
            <div className="animate-fade-in mt-4">
              <label className="block text-sm font-medium text-red-800 mb-1">Por favor, explique em detalhes (data, local e motivo) *</label>
              <textarea name="refusedUSVisaExplanation" required rows={3} value={step5.refusedUSVisaExplanation} onChange={handleChange} className="w-full p-3 border border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 bg-white" placeholder="Descreva as circunstâncias..."></textarea>
            </div>
          )}
        </div>
        
        <div className="border-t border-red-200 pt-4">
          <span className="block text-sm font-medium text-primary mb-2">Alguém já apresentou uma petição de imigração em seu nome para o Serviço de Cidadania e Imigração dos EUA (USCIS)? *</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasImmigrationPetition" value="Yes" checked={step5.hasImmigrationPetition === 'Yes'} onChange={handleChange} className="text-red-600 focus:ring-red-600" /> Sim</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasImmigrationPetition" value="No" checked={step5.hasImmigrationPetition === 'No'} onChange={handleChange} className="text-red-600 focus:ring-red-600" /> Não</label>
          </div>
          {step5.hasImmigrationPetition === 'Yes' && (
            <div className="animate-fade-in mt-4">
              <label className="block text-sm font-medium text-red-800 mb-1">Por favor, explique em detalhes *</label>
              <textarea name="immigrationPetitionExplanation" required rows={3} value={step5.immigrationPetitionExplanation} onChange={handleChange} className="w-full p-3 border border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 bg-white"></textarea>
            </div>
          )}
        </div>
      </div>

      {/* International Travel */}
      <div className="bg-light-gray p-5 rounded-2xl space-y-4">
        <div>
          <span className="block text-sm font-medium text-primary mb-2">Você viajou para outros países nos últimos 5 anos? *</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasTraveledInternationally" value="Yes" checked={step5.hasTraveledInternationally === 'Yes'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Sim</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasTraveledInternationally" value="No" checked={step5.hasTraveledInternationally === 'No'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Não</label>
          </div>
        </div>
        {step5.hasTraveledInternationally === 'Yes' && step5.countriesVisited && (
          <div className="animate-fade-in mt-4 space-y-3">
             <label className="block text-sm font-medium text-primary mb-1">Liste os países que visitou:</label>
             {step5.countriesVisited.map((country: string, index: number) => (
               <div key={index} className="flex gap-3">
                 <input type="text" required value={country} onChange={(e) => updateCountry(index, e.target.value)} placeholder={`País ${index + 1}`} className="flex-1 p-2 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-red bg-white" />
                 <button type="button" onClick={() => removeCountry(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={20} /></button>
               </div>
             ))}
             <button type="button" onClick={addCountry} className="flex items-center gap-2 text-sm font-bold text-accent-red hover:underline mt-2">
               <Plus size={16} /> Adicionar País
             </button>
          </div>
        )}
      </div>

      {/* US Point of Contact */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-primary border-b border-light-gray pb-2">Ponto de Contato nos EUA</h3>
        <div>
          <span className="block text-sm font-medium text-primary mb-2">Você tem um contato, amigo ou familiar nos EUA? (Ou organização/hotel) *</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasUSContact" value="Yes" checked={step5.hasUSContact === 'Yes'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Sim</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasUSContact" value="No" checked={step5.hasUSContact === 'No'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Não</label>
          </div>
        </div>
        {step5.hasUSContact === 'Yes' && (
          <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6 bg-light-gray p-5 rounded-2xl mt-4">
            <div className="md:col-span-2"><label className="block text-sm font-medium text-primary mb-1">Nome Completo do Contato ou Organização *</label><input type="text" name="usContactName" required value={step5.usContactName} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-primary mb-1">Endereço Completo do Contato nos EUA *</label><input type="text" name="usContactAddress" required value={step5.usContactAddress} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white" /></div>
            <div><label className="block text-sm font-medium text-primary mb-1">Telefone *</label><input type="tel" name="usContactPhone" required value={step5.usContactPhone} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white" /></div>
            <div><label className="block text-sm font-medium text-primary mb-1">Email *</label><input type="email" name="usContactEmail" required value={step5.usContactEmail} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-primary mb-1">Relacionamento com você *</label><input type="text" name="usContactRelationship" required value={step5.usContactRelationship} onChange={handleChange} placeholder="Ex: Amigo, Tio, Hotel, Escola" className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white" /></div>
          </div>
        )}
      </div>

    </div>
  );
}