import { useDs160 } from './Ds160Context';

export default function Step1PersonalInfo() {
  const { data, updateStepData } = useDs160();
  const { step1 } = data;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    updateStepData('step1', { [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-primary border-b border-light-gray pb-4">Seção 1: Informações Pessoais</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-primary mb-1">Nome Completo (como no passaporte) *</label>
          <input id="fullName" name="fullName" required type="text" value={step1.fullName} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" />
        </div>
        <div>
          <label htmlFor="nativeName" className="block text-sm font-medium text-primary mb-1">Nome no Alfabeto Nativo *</label>
          <input id="nativeName" name="nativeName" required type="text" value={step1.nativeName} onChange={handleChange} placeholder="Ou 'Does Not Apply'" className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" />
        </div>
      </div>

      <div className="bg-light-gray p-5 rounded-2xl space-y-4">
        <div>
          <span className="block text-sm font-medium text-primary mb-2">Já usou outros nomes? (solteiro, religioso, etc.) *</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="usedOtherNames" value="Yes" checked={step1.usedOtherNames === 'Yes'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Sim
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="usedOtherNames" value="No" checked={step1.usedOtherNames === 'No'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Não
            </label>
          </div>
        </div>
        {/* CONDITIONAL RENDER: Other Names */}
        {step1.usedOtherNames === 'Yes' && (
          <div className="animate-fade-in mt-4">
            <label htmlFor="otherNames" className="block text-sm font-medium text-primary mb-1">Quais outros nomes? *</label>
            <textarea id="otherNames" name="otherNames" required rows={2} value={step1.otherNames} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" placeholder="Liste todos os outros nomes utilizados..."></textarea>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-primary mb-1">Gênero *</label>
          <select id="gender" name="gender" required value={step1.gender} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white">
            <option value="">Selecione...</option>
            <option value="Male">Masculino (Male)</option>
            <option value="Female">Feminino (Female)</option>
            <option value="Other">Outro</option>
          </select>
        </div>
        <div>
          <label htmlFor="maritalStatus" className="block text-sm font-medium text-primary mb-1">Estado Civil *</label>
          <select id="maritalStatus" name="maritalStatus" required value={step1.maritalStatus} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white">
            <option value="">Selecione...</option>
            <option value="Single">Solteiro(a)</option>
            <option value="Married">Casado(a)</option>
            <option value="Divorced">Divorciado(a)</option>
            <option value="Other">Outro</option>
          </select>
        </div>
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-primary mb-1">Data de Nascimento *</label>
          <input id="birthDate" name="birthDate" required type="date" value={step1.birthDate} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" />
        </div>
      </div>

      {/* CONDITIONAL RENDER: Marital Status Explanation */}
      {step1.maritalStatus === 'Other' && (
        <div className="animate-fade-in">
          <label htmlFor="maritalStatusExplain" className="block text-sm font-medium text-primary mb-1">Explique o Estado Civil *</label>
          <input id="maritalStatusExplain" name="maritalStatusExplain" required type="text" value={step1.maritalStatusExplain} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" />
        </div>
      )}

      <div className="bg-light-gray p-5 rounded-2xl space-y-4">
        <div>
          <span className="block text-sm font-medium text-primary mb-2">Possui ou já possuiu outra nacionalidade? *</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="otherNationality" value="Yes" checked={step1.otherNationality === 'Yes'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Sim
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="otherNationality" value="No" checked={step1.otherNationality === 'No'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Não
            </label>
          </div>
        </div>
        {/* CONDITIONAL RENDER: Other Nationality Details */}
        {step1.otherNationality === 'Yes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in mt-4">
             <div>
                <label htmlFor="otherNationalityCountry" className="block text-sm font-medium text-primary mb-1">País da outra nacionalidade *</label>
                <input id="otherNationalityCountry" name="otherNationalityCountry" required type="text" value={step1.otherNationalityCountry} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" />
             </div>
             <div>
                <label htmlFor="otherPassportNumber" className="block text-sm font-medium text-primary mb-1">Número do Passaporte do outro país</label>
                <input id="otherPassportNumber" name="otherPassportNumber" type="text" value={step1.otherPassportNumber} onChange={handleChange} placeholder="Se aplicável" className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" />
             </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><label htmlFor="cpf" className="block text-sm font-medium text-primary mb-1">CPF *</label><input id="cpf" name="cpf" required type="text" value={step1.cpf} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" /></div>
        <div><label htmlFor="rg" className="block text-sm font-medium text-primary mb-1">RG (Identidade) *</label><input id="rg" name="rg" required type="text" value={step1.rg} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" /></div>
      </div>
    </div>
  );
}