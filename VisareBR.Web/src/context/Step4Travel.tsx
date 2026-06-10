import { useDs160 } from './Ds160Context';
import type { TravelCompanion } from './Ds160Context';
import { Plus, Trash2 } from 'lucide-react';

export default function Step4Travel() {
  const { data, updateStepData } = useDs160();
  const { step4 } = data;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    updateStepData('step4', { [e.target.name]: e.target.value });
  };

  const addCompanion = () => {
    updateStepData('step4', { travelCompanions: [...step4.travelCompanions, { fullName: '', relationship: '' }] });
  };

  const updateCompanion = (index: number, field: string, value: string) => {
    const updated = [...step4.travelCompanions];
    updated[index] = { ...updated[index], [field]: value };
    updateStepData('step4', { travelCompanions: updated });
  };

  const removeCompanion = (index: number) => {
    const updated = step4.travelCompanions.filter((_: TravelCompanion, i: number) => i !== index);
    updateStepData('step4', { travelCompanions: updated });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-primary border-b border-light-gray pb-4">Seção 4: Viagem e Acompanhantes</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="consularPost" className="block text-sm font-medium text-primary mb-1">Local da Entrevista (Consulado) *</label>
          <select id="consularPost" name="consularPost" required value={step4.consularPost} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white">
            <option value="">Selecione...</option>
            <option value="Brasilia">Brasília, DF</option>
            <option value="Sao Paulo">São Paulo, SP</option>
            <option value="Rio de Janeiro">Rio de Janeiro, RJ</option>
            <option value="Recife">Recife, PE</option>
            <option value="Porto Alegre">Porto Alegre, RS</option>
          </select>
        </div>
        <div>
          <label htmlFor="tripPurpose" className="block text-sm font-medium text-primary mb-1">Propósito da Viagem *</label>
          <select id="tripPurpose" name="tripPurpose" required value={step4.tripPurpose} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white">
            <option value="B2">Turismo / Férias (B2)</option>
            <option value="B1">Negócios (B1)</option>
            <option value="F1">Estudante (F1)</option>
            <option value="Other">Outro</option>
          </select>
        </div>
      </div>

      <div className="bg-light-gray p-5 rounded-2xl space-y-4">
        <div>
          <span className="block text-sm font-medium text-primary mb-2">Você tem planos de viagem específicos? (Passagens compradas) *</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasSpecificTravelPlans" value="Yes" checked={step4.hasSpecificTravelPlans === 'Yes'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Sim</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasSpecificTravelPlans" value="No" checked={step4.hasSpecificTravelPlans === 'No'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Não</label>
          </div>
        </div>
        
        {step4.hasSpecificTravelPlans === 'No' && (
          <div className="animate-fade-in mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 text-sm text-dark-gray italic">Como não há planos específicos, por favor, insira uma data e período pretendidos/ideais:</div>
             <div>
               <label htmlFor="intendedArrivalDate" className="block text-sm font-medium text-primary mb-1">Data Pretendida de Chegada *</label>
               <input id="intendedArrivalDate" name="intendedArrivalDate" required type="date" value={step4.intendedArrivalDate} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" />
             </div>
             <div>
               <label htmlFor="intendedStayLength" className="block text-sm font-medium text-primary mb-1">Tempo Pretendido de Estadia (em dias) *</label>
               <input id="intendedStayLength" name="intendedStayLength" required type="number" value={step4.intendedStayLength} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" />
             </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-primary">Onde você vai ficar nos EUA?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="usAddressStreet" className="block text-sm font-medium text-primary mb-1">Nome do Hotel ou Residência e Rua *</label>
            <input id="usAddressStreet" name="usAddressStreet" required type="text" value={step4.usAddressStreet} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" />
          </div>
          <div>
            <label htmlFor="usAddressCity" className="block text-sm font-medium text-primary mb-1">Cidade *</label>
            <input id="usAddressCity" name="usAddressCity" required type="text" value={step4.usAddressCity} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label htmlFor="usAddressState" className="block text-sm font-medium text-primary mb-1">Estado *</label>
               <input id="usAddressState" name="usAddressState" required type="text" value={step4.usAddressState} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" />
             </div>
             <div>
               <label htmlFor="usAddressZip" className="block text-sm font-medium text-primary mb-1">ZIP Code</label>
               <input id="usAddressZip" name="usAddressZip" type="text" value={step4.usAddressZip} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" />
             </div>
          </div>
        </div>
      </div>

      <div className="bg-light-gray p-5 rounded-2xl space-y-4">
        <div>
          <label htmlFor="payingParty" className="block text-sm font-medium text-primary mb-1">Quem está pagando pela sua viagem? *</label>
          <select id="payingParty" name="payingParty" required value={step4.payingParty} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white">
            <option value="">Selecione...</option>
            <option value="Self">Eu Mesmo (Self)</option>
            <option value="Other">Outra Pessoa (Familiar/Amigo)</option>
            <option value="Company">Minha Empresa / Organização</option>
          </select>
        </div>
        {/* CONDITIONAL: If someone else is paying */}
        {(step4.payingParty === 'Other' || step4.payingParty === 'Company') && (
          <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-300">
             <div className="md:col-span-2"><label className="block text-sm font-medium text-primary mb-1">Nome da Pessoa / Organização que pagará *</label><input name="payingPartyName" required type="text" value={step4.payingPartyName} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" /></div>
             <div><label className="block text-sm font-medium text-primary mb-1">Telefone do Pagante *</label><input name="payingPartyPhone" required type="text" value={step4.payingPartyPhone} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" /></div>
             <div><label className="block text-sm font-medium text-primary mb-1">Email do Pagante *</label><input name="payingPartyEmail" required type="email" value={step4.payingPartyEmail} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" /></div>
             <div className="md:col-span-2"><label className="block text-sm font-medium text-primary mb-1">Relação com você *</label><input name="payingPartyRelationship" required type="text" value={step4.payingPartyRelationship} onChange={handleChange} placeholder="Ex: Pai, Mãe, Empregador" className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" /></div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <span className="block text-sm font-medium text-primary mb-2">Existem outras pessoas viajando com você? *</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasTravelCompanions" value="Yes" checked={step4.hasTravelCompanions === 'Yes'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Sim</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasTravelCompanions" value="No" checked={step4.hasTravelCompanions === 'No'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Não</label>
          </div>
        </div>
        
        {/* DYNAMIC ARRAY: Travel Companions */}
        {step4.hasTravelCompanions === 'Yes' && step4.travelCompanions && (
          <div className="animate-fade-in mt-4 space-y-4 bg-light-gray p-5 rounded-2xl">
            <p className="text-sm font-bold text-primary">Por favor, liste as pessoas que viajarão com você:</p>
            {step4.travelCompanions.map((companion: TravelCompanion, index: number) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-dark-gray shadow-sm">
                <div className="flex-1"><label className="block text-xs font-medium text-dark-gray mb-1">Nome Completo</label><input required type="text" value={companion.fullName} onChange={(e) => updateCompanion(index, 'fullName', e.target.value)} className="w-full p-2 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-red" /></div>
                <div className="flex-1"><label className="block text-xs font-medium text-dark-gray mb-1">Parentesco / Relação</label><input required type="text" value={companion.relationship} onChange={(e) => updateCompanion(index, 'relationship', e.target.value)} placeholder="Ex: Esposa, Filho, Amigo" className="w-full p-2 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-red" /></div>
                <button type="button" onClick={() => removeCompanion(index)} className="p-2 mt-4 md:mt-5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={20} /></button>
              </div>
            ))}
            <button type="button" onClick={addCompanion} className="flex items-center gap-2 text-sm font-bold text-accent-red hover:underline">
              <Plus size={16} /> Adicionar Acompanhante
            </button>
          </div>
        )}
      </div>

    </div>
  );
}