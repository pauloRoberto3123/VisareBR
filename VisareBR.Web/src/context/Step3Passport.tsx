import { useState } from 'react';
import { useDs160 } from './Ds160Context';
import { Trash2, CheckCircle } from 'lucide-react';

export default function Step3Passport() {
  const { data, updateStepData } = useDs160();
  const { step3 } = data;
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const showSuccessToast = () => {
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    updateStepData('step3', { [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) { // Limite de 15MB
        alert('A foto deve ter no máximo 15MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        
        // Se o arquivo for maior que 1MB, realiza compressão
        if (file.size > 1024 * 1024) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const MAX_DIMENSION = 1200; // Limita a resolução máxima

            if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
              if (width > height) {
                height = Math.round((height * MAX_DIMENSION) / width);
                width = MAX_DIMENSION;
              } else {
                width = Math.round((width * MAX_DIMENSION) / height);
                height = MAX_DIMENSION;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              // Preenche fundo branco caso o usuário envie um PNG transparente
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
              
              // Comprime em JPEG com qualidade de 70%
              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
              updateStepData('step3', { passportPhotoBase64: compressedBase64 });
              showSuccessToast();
            } else {
              updateStepData('step3', { passportPhotoBase64: result });
              showSuccessToast();
            }
          };
          img.src = result;
        } else {
          updateStepData('step3', { passportPhotoBase64: result });
          showSuccessToast();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-primary border-b border-light-gray pb-4">Seção 3: Passaporte</h2>
      
      <div className="bg-light-gray p-5 rounded-2xl space-y-4">
        <label className="block text-sm font-medium text-primary mb-1">Cópia do Passaporte (Foto ou Scan) *</label>
        {!step3.passportPhotoBase64 ? (
          <input type="file" accept="image/*" required onChange={handlePhotoUpload} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white" />
        ) : (
          <div className="mt-4 relative inline-block">
            <img src={step3.passportPhotoBase64} alt="Passaporte" className="w-48 h-auto rounded-xl border-2 border-accent-gold shadow-md" />
            <button
              type="button"
              onClick={() => updateStepData('step3', { passportPhotoBase64: '' })}
              className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-md transition-colors"
              title="Remover foto"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

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

      {/* Toast de Sucesso */}
      {uploadSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in z-50 border border-green-600">
          <CheckCircle size={24} />
          <span className="font-bold">Foto processada com sucesso!</span>
        </div>
      )}
    </div>
  );
}