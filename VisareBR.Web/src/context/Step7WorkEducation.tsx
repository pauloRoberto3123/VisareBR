import { useDs160 } from './Ds160Context';
import type { PreviousEmployer, Education } from './Ds160Context';
import { Plus, Trash2 } from 'lucide-react';

export default function Step7WorkEducation() {
  const { data, updateStepData } = useDs160();
  const { step7 } = data;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    updateStepData('step7', { [e.target.name]: e.target.value });
  };

  const addEmployer = () => {
    if (step7.previousEmployers.length >= 2) return;
    updateStepData('step7', { previousEmployers: [...step7.previousEmployers, { employerName: '', employerAddress: '', supervisorName: '', jobTitle: '', startDate: '', endDate: '', duties: '' }] });
  };
  const updateEmployer = (index: number, field: keyof PreviousEmployer, value: string) => {
    const updated = [...step7.previousEmployers];
    updated[index] = { ...updated[index], [field]: value };
    updateStepData('step7', { previousEmployers: updated });
  };
  const removeEmployer = (index: number) => {
    const updated = step7.previousEmployers.filter((_, i) => i !== index);
    updateStepData('step7', { previousEmployers: updated });
  };

  const addEducation = () => {
    updateStepData('step7', { educationHistory: [...step7.educationHistory, { schoolName: '', schoolAddress: '', courseOfStudy: '', startDate: '', endDate: '' }] });
  };
  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...step7.educationHistory];
    updated[index] = { ...updated[index], [field]: value };
    updateStepData('step7', { educationHistory: updated });
  };
  const removeEducation = (index: number) => {
    const updated = step7.educationHistory.filter((_, i) => i !== index);
    updateStepData('step7', { educationHistory: updated });
  };

  const addLanguage = () => updateStepData('step7', { languagesSpoken: [...step7.languagesSpoken, ''] });
  const updateLanguage = (index: number, value: string) => {
    const updated = [...step7.languagesSpoken]; updated[index] = value; updateStepData('step7', { languagesSpoken: updated });
  };
  const removeLanguage = (index: number) => updateStepData('step7', { languagesSpoken: step7.languagesSpoken.filter((_, i) => i !== index) });

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-primary border-b border-light-gray pb-4">Seção 7: Trabalho e Estudo</h2>

      {/* Current Occupation */}
      <div className="bg-light-gray p-5 rounded-2xl space-y-4">
        <h3 className="text-lg font-bold text-primary">Ocupação Atual</h3>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">Ocupação Primária *</label>
          <select name="primaryOccupation" required value={step7.primaryOccupation} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white">
            <option value="">Selecione...</option>
            <option value="Employed">Empregado (Employed)</option>
            <option value="Self-employed">Autônomo (Self-employed)</option>
            <option value="Student">Estudante (Student)</option>
            <option value="Unemployed">Desempregado (Unemployed)</option>
            <option value="Retired">Aposentado (Retired)</option>
            <option value="Other">Outro (Other)</option>
          </select>
        </div>
        {(step7.primaryOccupation === 'Employed' || step7.primaryOccupation === 'Student' || step7.primaryOccupation === 'Self-employed') && (
          <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-300">
            <div className="md:col-span-2"><label className="block text-sm font-medium text-primary mb-1">Nome da Empresa / Escola *</label><input type="text" name="currentEmployerSchoolName" required value={step7.currentEmployerSchoolName} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-primary mb-1">Endereço Completo *</label><input type="text" name="currentEmployerSchoolAddress" required value={step7.currentEmployerSchoolAddress} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" /></div>
            <div><label className="block text-sm font-medium text-primary mb-1">Telefone *</label><input type="tel" name="currentEmployerSchoolPhone" required value={step7.currentEmployerSchoolPhone} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" /></div>
            <div><label className="block text-sm font-medium text-primary mb-1">Data de Início *</label><input type="date" name="currentStartDate" required value={step7.currentStartDate} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" /></div>
            {step7.primaryOccupation !== 'Student' && (
              <div><label className="block text-sm font-medium text-primary mb-1">Salário Mensal (Moeda Local) *</label><input type="text" name="currentMonthlySalary" required value={step7.currentMonthlySalary} onChange={handleChange} placeholder="Ex: 5000 BRL" className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" /></div>
            )}
            <div className="md:col-span-2"><label className="block text-sm font-medium text-primary mb-1">Descreva brevemente suas funções *</label><textarea name="currentDuties" required rows={3} value={step7.currentDuties} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red"></textarea></div>
          </div>
        )}
      </div>

      {/* Previous Employment */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-primary">Histórico de Emprego Anterior</h3>
        <div className="bg-light-gray p-5 rounded-2xl">
          <span className="block text-sm font-medium text-primary mb-2">Você foi empregado anteriormente? (Últimos 5 anos) *</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasPreviousEmployment" value="Yes" checked={step7.hasPreviousEmployment === 'Yes'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Sim</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasPreviousEmployment" value="No" checked={step7.hasPreviousEmployment === 'No'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Não</label>
          </div>
          {step7.hasPreviousEmployment === 'Yes' && step7.previousEmployers && (
            <div className="animate-fade-in mt-4 space-y-4 pt-4 border-t border-gray-300">
              {step7.previousEmployers.map((emp, index) => (
                <div key={index} className="bg-white p-4 rounded-xl border border-dark-gray shadow-sm space-y-4 relative">
                  <button type="button" onClick={() => removeEmployer(index)} className="absolute top-2 right-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={20} /></button>
                  <h4 className="font-bold text-primary">Empregador Anterior {index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-xs font-medium text-dark-gray mb-1">Nome da Empresa</label><input required type="text" value={emp.employerName} onChange={(e) => updateEmployer(index, 'employerName', e.target.value)} className="w-full p-2 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-red" /></div>
                    <div><label className="block text-xs font-medium text-dark-gray mb-1">Nome do Supervisor</label><input required type="text" value={emp.supervisorName} onChange={(e) => updateEmployer(index, 'supervisorName', e.target.value)} className="w-full p-2 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-red" /></div>
                    <div className="md:col-span-2"><label className="block text-xs font-medium text-dark-gray mb-1">Endereço</label><input required type="text" value={emp.employerAddress} onChange={(e) => updateEmployer(index, 'employerAddress', e.target.value)} className="w-full p-2 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-red" /></div>
                    <div><label className="block text-xs font-medium text-dark-gray mb-1">Cargo</label><input required type="text" value={emp.jobTitle} onChange={(e) => updateEmployer(index, 'jobTitle', e.target.value)} className="w-full p-2 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-red" /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className="block text-xs font-medium text-dark-gray mb-1">Data Início</label><input required type="date" value={emp.startDate} onChange={(e) => updateEmployer(index, 'startDate', e.target.value)} className="w-full p-2 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-red" /></div>
                      <div><label className="block text-xs font-medium text-dark-gray mb-1">Data Fim</label><input required type="date" value={emp.endDate} onChange={(e) => updateEmployer(index, 'endDate', e.target.value)} className="w-full p-2 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-red" /></div>
                    </div>
                    <div className="md:col-span-2"><label className="block text-xs font-medium text-dark-gray mb-1">Funções</label><textarea required rows={2} value={emp.duties} onChange={(e) => updateEmployer(index, 'duties', e.target.value)} className="w-full p-2 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-red"></textarea></div>
                  </div>
                </div>
              ))}
              {step7.previousEmployers.length < 2 && (
                <button type="button" onClick={addEmployer} className="flex items-center gap-2 text-sm font-bold text-accent-red hover:underline">
                  <Plus size={16} /> Adicionar Empregador Anterior
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Education */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-primary">Ensino Médio ou Superior</h3>
        <div className="bg-light-gray p-5 rounded-2xl">
          <span className="block text-sm font-medium text-primary mb-2">Você frequentou instituições de ensino médio ou superior? *</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasHigherEducation" value="Yes" checked={step7.hasHigherEducation === 'Yes'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Sim</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="hasHigherEducation" value="No" checked={step7.hasHigherEducation === 'No'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Não</label>
          </div>
          {step7.hasHigherEducation === 'Yes' && step7.educationHistory && (
            <div className="animate-fade-in mt-4 space-y-4 pt-4 border-t border-gray-300">
              {step7.educationHistory.map((edu, index) => (
                <div key={index} className="bg-white p-4 rounded-xl border border-dark-gray shadow-sm space-y-4 relative">
                  <button type="button" onClick={() => removeEducation(index)} className="absolute top-2 right-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={20} /></button>
                  <h4 className="font-bold text-primary">Instituição de Ensino {index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-xs font-medium text-dark-gray mb-1">Nome da Escola / Instituição</label><input required type="text" value={edu.schoolName} onChange={(e) => updateEducation(index, 'schoolName', e.target.value)} className="w-full p-2 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-red" /></div>
                    <div><label className="block text-xs font-medium text-dark-gray mb-1">Curso / Área de Estudo</label><input required type="text" value={edu.courseOfStudy} onChange={(e) => updateEducation(index, 'courseOfStudy', e.target.value)} className="w-full p-2 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-red" /></div>
                    <div className="md:col-span-2"><label className="block text-xs font-medium text-dark-gray mb-1">Endereço</label><input required type="text" value={edu.schoolAddress} onChange={(e) => updateEducation(index, 'schoolAddress', e.target.value)} className="w-full p-2 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-red" /></div>
                    <div><label className="block text-xs font-medium text-dark-gray mb-1">Data Início</label><input required type="date" value={edu.startDate} onChange={(e) => updateEducation(index, 'startDate', e.target.value)} className="w-full p-2 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-red" /></div>
                    <div><label className="block text-xs font-medium text-dark-gray mb-1">Data Formatura (Fim)</label><input required type="date" value={edu.endDate} onChange={(e) => updateEducation(index, 'endDate', e.target.value)} className="w-full p-2 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-red" /></div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addEducation} className="flex items-center gap-2 text-sm font-bold text-accent-red hover:underline">
                <Plus size={16} /> Adicionar Instituição
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-primary">Idiomas</h3>
        <div className="bg-light-gray p-5 rounded-2xl">
          <span className="block text-sm font-medium text-primary mb-2">Quais idiomas você fala? (Liste os idiomas)</span>
          <div className="animate-fade-in space-y-3">
            {step7.languagesSpoken.map((lang, index) => (
              <div key={index} className="flex gap-3">
                <input type="text" required value={lang} onChange={(e) => updateLanguage(index, e.target.value)} placeholder={`Idioma ${index + 1}`} className="flex-1 p-2 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-red bg-white" />
                <button type="button" onClick={() => removeLanguage(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={20} /></button>
              </div>
            ))}
            <button type="button" onClick={addLanguage} className="flex items-center gap-2 text-sm font-bold text-accent-red hover:underline mt-2">
              <Plus size={16} /> Adicionar Idioma
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}