import { useDs160 } from './Ds160Context';

export default function Step3Passport() {
  const { data, updateStepData } = useDs160();
  const { step3 } = data;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    updateStepData('step3', { [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-primary border-b border-light-gray pb-4">Seção 3: Passaporte</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="passportType" className="block text-sm font-medium text-primary mb-1">Tipo de Passaporte *</label>
          <select id="passportType" name="passportType" required value={step3.passportType} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white">
            <option value="">Selecione...</option>
            <option value="Regular">Regular (Comum)</option>
            <option value="Official">Oficial</option>
            <option value="Diplomatic">Diplomático</option>
            <option value="Other">Outro</option>
          </select>
        </div>
        <div>
          <label htmlFor="passportNumber" className="block text-sm font-medium text-primary mb-1">Número do Passaporte *</label>
          <input id="passportNumber" name="passportNumber" required type="text" value={step3.passportNumber} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="passportIssuerCountry" className="block text-sm font-medium text-primary mb-1">País Emissor *</label>
          <input id="passportIssuerCountry" name="passportIssuerCountry" required type="text" value={step3.passportIssuerCountry} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" />
        </div>
        <div>
          <label htmlFor="passportIssuerState" className="block text-sm font-medium text-primary mb-1">Estado Emissor *</label>
          <input id="passportIssuerState" name="passportIssuerState" required type="text" value={step3.passportIssuerState} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" />
        </div>
        <div>
          <label htmlFor="passportIssuerCity" className="block text-sm font-medium text-primary mb-1">Cidade Emissora *</label>
          <input id="passportIssuerCity" name="passportIssuerCity" required type="text" value={step3.passportIssuerCity} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><label htmlFor="passportIssueDate" className="block text-sm font-medium text-primary mb-1">Data de Emissão *</label><input id="passportIssueDate" name="passportIssueDate" required type="date" value={step3.passportIssueDate} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" /></div>
        <div><label htmlFor="passportExpiryDate" className="block text-sm font-medium text-primary mb-1">Data de Expiração *</label><input id="passportExpiryDate" name="passportExpiryDate" required type="date" value={step3.passportExpiryDate} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" /></div>
      </div>

      {/* CONDITIONAL: Previous Passport */}
      <div className="bg-light-gray p-5 rounded-2xl space-y-4">
        <div>
          <span className="block text-sm font-medium text-primary mb-2">Você possui algum passaporte anterior? *</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasPreviousPassport" value="Yes" checked={step3.hasPreviousPassport === 'Yes'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Sim</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasPreviousPassport" value="No" checked={step3.hasPreviousPassport === 'No'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Não</label>
          </div>
        </div>
        
        {step3.hasPreviousPassport === 'Yes' && (
          <div className="animate-fade-in mt-4 space-y-4 pt-4 border-t border-gray-300">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label htmlFor="previousPassportNumber" className="block text-sm font-medium text-primary mb-1">Número do Passaporte Anterior *</label>
                 <input id="previousPassportNumber" name="previousPassportNumber" required type="text" value={step3.previousPassportNumber} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" />
               </div>
               <div>
                 <label htmlFor="previousPassportIssuerCountry" className="block text-sm font-medium text-primary mb-1">País Emissor Anterior *</label>
                 <input id="previousPassportIssuerCountry" name="previousPassportIssuerCountry" required type="text" value={step3.previousPassportIssuerCountry} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" />
               </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="previousPassportIssueDate" className="block text-sm font-medium text-primary mb-1">Data de Emissão *</label>
                  <input id="previousPassportIssueDate" name="previousPassportIssueDate" required type="date" value={step3.previousPassportIssueDate} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" />
                </div>
                <div>
                  <label htmlFor="previousPassportExpiryDate" className="block text-sm font-medium text-primary mb-1">Data de Expiração *</label>
                  <input id="previousPassportExpiryDate" name="previousPassportExpiryDate" required type="date" value={step3.previousPassportExpiryDate} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" />
                </div>
             </div>
          </div>
        )}
      </div>

      {/* CONDITIONAL: Lost/Stolen */}
      <div className="bg-red-50 p-5 rounded-2xl border border-red-100 space-y-4">
        <div>
          <span className="block text-sm font-medium text-primary mb-2">Você já teve um passaporte perdido ou roubado? *</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasLostPassport" value="Yes" checked={step3.hasLostPassport === 'Yes'} onChange={handleChange} className="text-red-600 focus:ring-red-600" /> Sim</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasLostPassport" value="No" checked={step3.hasLostPassport === 'No'} onChange={handleChange} className="text-red-600 focus:ring-red-600" /> Não</label>
          </div>
        </div>
        {step3.hasLostPassport === 'Yes' && (
          <div className="animate-fade-in mt-4">
            <label htmlFor="lostPassportExplanation" className="block text-sm font-medium text-red-800 mb-1">
               Por favor, explique em detalhes (datas, locais, motivos) *
            </label>
            <textarea id="lostPassportExplanation" name="lostPassportExplanation" required rows={3} value={step3.lostPassportExplanation} onChange={handleChange} 
              className="w-full p-3 border border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 bg-white" 
              placeholder="Descreva as circunstâncias..."
            ></textarea>
          </div>
        )}
      </div>

    </div>
  );
}