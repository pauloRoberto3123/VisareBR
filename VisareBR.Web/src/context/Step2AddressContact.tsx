import { useDs160 } from './Ds160Context';
import type { SocialMediaProfile } from './Ds160Context';
import { Plus, Trash2 } from 'lucide-react';

export default function Step2AddressContact() {
  const { data, updateStepData } = useDs160();
  const { step2 } = data;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    updateStepData('step2', { [e.target.name]: e.target.value });
  };

  const addSocialMedia = () => {
    if (step2.socialMediaProfiles.length >= 5) return; // Prevent spam
    const updated = [...step2.socialMediaProfiles, { platform: '', identifier: '' }];
    updateStepData('step2', { socialMediaProfiles: updated });
  };

  const updateSocialMedia = (index: number, field: string, value: string) => {
    const updated = [...step2.socialMediaProfiles];
    updated[index] = { ...updated[index], [field]: value };
    updateStepData('step2', { socialMediaProfiles: updated });
  };

  const removeSocialMedia = (index: number) => {
    const updated = step2.socialMediaProfiles.filter((_: SocialMediaProfile, i: number) => i !== index);
    updateStepData('step2', { socialMediaProfiles: updated });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-primary border-b border-light-gray pb-4">Seção 2: Endereço e Contato</h2>
      
      <div>
        <label htmlFor="homeAddress" className="block text-sm font-medium text-primary mb-1">Endereço Residencial Completo *</label>
        <input id="homeAddress" name="homeAddress" required type="text" value={step2.homeAddress} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" placeholder="Rua, Número, Bairro, Cidade, Estado, CEP" />
      </div>

      <div className="bg-light-gray p-5 rounded-2xl space-y-4">
        <div>
          <span className="block text-sm font-medium text-primary mb-2">O endereço de correspondência é o mesmo que o residencial? *</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="sameMailingAddress" value="Yes" checked={step2.sameMailingAddress === 'Yes'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Sim
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="sameMailingAddress" value="No" checked={step2.sameMailingAddress === 'No'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Não
            </label>
          </div>
        </div>
        {/* CONDITIONAL RENDER: Mailing Address */}
        {step2.sameMailingAddress === 'No' && (
          <div className="animate-fade-in mt-4">
            <label htmlFor="mailingAddress" className="block text-sm font-medium text-primary mb-1">Endereço de Correspondência Completo *</label>
            <input id="mailingAddress" name="mailingAddress" required type="text" value={step2.mailingAddress} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><label htmlFor="primaryPhone" className="block text-sm font-medium text-primary mb-1">Celular Principal (com DDI e DDD) *</label><input id="primaryPhone" name="primaryPhone" required type="tel" value={step2.primaryPhone} onChange={handleChange} placeholder="+55 11 99999-9999" className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" /></div>
        <div><label htmlFor="primaryEmail" className="block text-sm font-medium text-primary mb-1">E-mail Principal *</label><input id="primaryEmail" name="primaryEmail" required type="email" value={step2.primaryEmail} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red" /></div>
      </div>

      {/* DYNAMIC ARRAY: Social Media */}
      <div className="bg-light-gray p-5 rounded-2xl space-y-4">
        <div>
          <span className="block text-sm font-medium text-primary mb-2">Possui perfis em redes sociais? (Facebook, Instagram, LinkedIn, etc.) *</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="hasSocialMedia" value="Yes" checked={step2.hasSocialMedia === 'Yes'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Sim
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="hasSocialMedia" value="No" checked={step2.hasSocialMedia === 'No'} onChange={handleChange} className="text-accent-red focus:ring-accent-red" /> Não
            </label>
          </div>
        </div>
        
        {step2.hasSocialMedia === 'Yes' && step2.socialMediaProfiles && (
          <div className="animate-fade-in mt-6 space-y-4">
            {step2.socialMediaProfiles.map((profile: SocialMediaProfile, index: number) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-dark-gray shadow-sm">
                <div className="w-full md:w-1/3">
                  <label className="block text-xs font-medium text-dark-gray mb-1">Plataforma</label>
                  <select required value={profile.platform} onChange={(e) => updateSocialMedia(index, 'platform', e.target.value)} className="w-full p-2 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-red bg-white">
                    <option value="">Selecione...</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Twitter">Twitter/X</option>
                    <option value="Other">Outra</option>
                  </select>
                </div>
                <div className="w-full md:flex-1">
                  <label className="block text-xs font-medium text-dark-gray mb-1">Nome de Usuário / Link</label>
                  <input required type="text" value={profile.identifier} onChange={(e) => updateSocialMedia(index, 'identifier', e.target.value)} className="w-full p-2 border border-dark-gray rounded-lg focus:ring-2 focus:ring-accent-red" placeholder="@seuusuario" />
                </div>
                <button type="button" onClick={() => removeSocialMedia(index)} className="p-2 mt-4 md:mt-5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" aria-label="Remover rede social">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            
            {step2.socialMediaProfiles.length < 3 && (
              <button type="button" onClick={addSocialMedia} className="flex items-center gap-2 text-sm font-bold text-accent-red hover:underline">
                <Plus size={16} /> Adicionar Rede Social
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}