import { useDs160 } from './Ds160Context';
import type { USRelative } from './Ds160Context';
import { Plus, Trash2 } from 'lucide-react';

export default function Step6Family() {
  const { data, updateStepData } = useDs160();
  const { step6 } = data;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    updateStepData('step6', { [e.target.name]: e.target.value });
  };

  const addRelative = () => {
    updateStepData('step6', { immediateRelatives: [...step6.immediateRelatives, { fullName: '', relationship: '', status: '' }] });
  };

  const updateRelative = (index: number, field: string, value: string) => {
    const updated = [...step6.immediateRelatives];
    updated[index] = { ...updated[index], [field]: value };
    updateStepData('step6', { immediateRelatives: updated });
  };

  const removeRelative = (index: number) => {
    const updated = step6.immediateRelatives.filter((_: USRelative, i: number) => i !== index);
    updateStepData('step6', { immediateRelatives: updated });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-primary border-b border-light-gray pb-4">Seção 6: Informações Familiares</h2>
      
      {/* Father */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-primary">Pai (Biológico ou Adotivo)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-light-gray p-5 rounded-2xl">
          <div className="md:col-span-2"><label className="block text-sm font-medium text-primary mb-1">Nome Completo do Pai (Ou 'Desconhecido') *</label><input type="text" name="fatherFullName" required value={step6.fatherFullName} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white" /></div>
          <div><label className="block text-sm font-medium text-primary mb-1">Data de Nascimento do Pai *</label><input type="date" name="fatherBirthDate" required value={step6.fatherBirthDate} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white" /></div>
          <div>
             <label className="block text-sm font-medium text-primary mb-2">Ele está nos EUA atualmente? *</label>
             <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="isFatherInUS" value="Yes" checked={step6.isFatherInUS === 'Yes'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Sim</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="isFatherInUS" value="No" checked={step6.isFatherInUS === 'No'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Não</label>
             </div>
          </div>
          {step6.isFatherInUS === 'Yes' && (
            <div className="md:col-span-2 animate-fade-in">
              <label className="block text-sm font-medium text-primary mb-1">Qual o status dele nos EUA? *</label>
              <select name="fatherUSStatus" required value={step6.fatherUSStatus} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white">
                <option value="">Selecione...</option>
                <option value="Citizen">Cidadão Americano</option>
                <option value="LPR">Residente Permanente (Green Card)</option>
                <option value="Nonimmigrant">Não-Imigrante (Turista, Estudante, Trabalho)</option>
                <option value="Other">Outro / Não sei</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Mother */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-primary">Mãe (Biológica ou Adotiva)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-light-gray p-5 rounded-2xl">
          <div className="md:col-span-2"><label className="block text-sm font-medium text-primary mb-1">Nome Completo da Mãe (Ou 'Desconhecida') *</label><input type="text" name="motherFullName" required value={step6.motherFullName} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white" /></div>
          <div><label className="block text-sm font-medium text-primary mb-1">Data de Nascimento da Mãe *</label><input type="date" name="motherBirthDate" required value={step6.motherBirthDate} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white" /></div>
          <div>
             <label className="block text-sm font-medium text-primary mb-2">Ela está nos EUA atualmente? *</label>
             <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="isMotherInUS" value="Yes" checked={step6.isMotherInUS === 'Yes'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Sim</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="isMotherInUS" value="No" checked={step6.isMotherInUS === 'No'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Não</label>
             </div>
          </div>
          {step6.isMotherInUS === 'Yes' && (
            <div className="md:col-span-2 animate-fade-in">
              <label className="block text-sm font-medium text-primary mb-1">Qual o status dela nos EUA? *</label>
              <select name="motherUSStatus" required value={step6.motherUSStatus} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white">
                <option value="">Selecione...</option>
                <option value="Citizen">Cidadã Americana</option>
                <option value="LPR">Residente Permanente (Green Card)</option>
                <option value="Nonimmigrant">Não-Imigrante (Turista, Estudante, Trabalho)</option>
                <option value="Other">Outro / Não sei</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Immediate Relatives */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-primary">Outros Parentes Imediatos</h3>
        <div>
          <span className="block text-sm font-medium text-primary mb-2">Você tem algum parente imediato (excluindo os pais) atualmente nos EUA? (Ex: Cônjuge, Noivo(a), Filhos, Irmãos) *</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasImmediateRelativesInUS" value="Yes" checked={step6.hasImmediateRelativesInUS === 'Yes'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Sim</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasImmediateRelativesInUS" value="No" checked={step6.hasImmediateRelativesInUS === 'No'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Não</label>
          </div>
        </div>
        
        {step6.hasImmediateRelativesInUS === 'Yes' && step6.immediateRelatives && (
          <div className="animate-fade-in mt-4 space-y-4 bg-light-gray p-5 rounded-2xl">
            {step6.immediateRelatives.map((relative: USRelative, index: number) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-dark-gray shadow-sm">
                <div className="flex-1"><label className="block text-xs font-medium text-dark-gray mb-1">Nome Completo</label><input required type="text" value={relative.fullName} onChange={(e) => updateRelative(index, 'fullName', e.target.value)} className="w-full p-2 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-red" /></div>
                <div className="w-full md:w-1/4"><label className="block text-xs font-medium text-dark-gray mb-1">Parentesco</label><input required type="text" value={relative.relationship} onChange={(e) => updateRelative(index, 'relationship', e.target.value)} placeholder="Ex: Irmão" className="w-full p-2 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-red" /></div>
                <div className="w-full md:w-1/4"><label className="block text-xs font-medium text-dark-gray mb-1">Status nos EUA</label><select required value={relative.status} onChange={(e) => updateRelative(index, 'status', e.target.value)} className="w-full p-2 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-red bg-white"><option value="">Selecione...</option><option value="Citizen">Cidadão</option><option value="LPR">Residente</option><option value="Nonimmigrant">Não-Imigrante</option><option value="Other">Outro</option></select></div>
                <button type="button" onClick={() => removeRelative(index)} className="p-2 mt-4 md:mt-5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={20} /></button>
              </div>
            ))}
            <button type="button" onClick={addRelative} className="flex items-center gap-2 text-sm font-bold text-accent-red hover:underline">
              <Plus size={16} /> Adicionar Parente
            </button>
          </div>
        )}
      </div>

    </div>
  );
}