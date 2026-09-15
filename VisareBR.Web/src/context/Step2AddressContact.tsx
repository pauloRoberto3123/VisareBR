import { useState, useEffect } from 'react';
import { useDs160 } from './Ds160Context';
import type { SocialMediaProfile } from './Ds160Context';
import { Plus, Trash2, Loader2, Lock } from 'lucide-react';

export default function Step2AddressContact() {
  const { data, updateStepData } = useDs160();
  const { step2 } = data;

  const [isSearchingHomeCep, setIsSearchingHomeCep] = useState(false);
  const [homeAddressAutoFilled, setHomeAddressAutoFilled] = useState(false);

  const [isSearchingMailingCep, setIsSearchingMailingCep] = useState(false);
  const [mailingAddressAutoFilled, setMailingAddressAutoFilled] = useState(false);

  useEffect(() => {
    const cleanHome = (step2.homeZip || '').replace(/\D/g, '');
    if (cleanHome.length === 8 && step2.homeCity && step2.homeState) {
      setHomeAddressAutoFilled(true);
    }
    const cleanMailing = (step2.mailingZip || '').replace(/\D/g, '');
    if (cleanMailing.length === 8 && step2.mailingCity && step2.mailingState) {
      setMailingAddressAutoFilled(true);
    }
  }, []);

  const fetchCepData = async (rawCep: string, isMailing: boolean = false) => {
    const cleanCep = rawCep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      if (isMailing) setMailingAddressAutoFilled(false);
      else setHomeAddressAutoFilled(false);
      return;
    }

    if (isMailing) setIsSearchingMailingCep(true);
    else setIsSearchingHomeCep(true);

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const cepData = await res.json();

      if (!cepData.erro) {
        if (isMailing) {
          updateStepData('step2', {
            mailingStreet: cepData.logradouro || step2.mailingStreet,
            mailingNeighborhood: cepData.bairro || step2.mailingNeighborhood,
            mailingCity: cepData.localidade || step2.mailingCity,
            mailingState: cepData.uf || step2.mailingState,
            mailingCountry: 'Brasil'
          });
          setMailingAddressAutoFilled(true);
        } else {
          updateStepData('step2', {
            homeStreet: cepData.logradouro || step2.homeStreet,
            homeNeighborhood: cepData.bairro || step2.homeNeighborhood,
            homeCity: cepData.localidade || step2.homeCity,
            homeState: cepData.uf || step2.homeState,
            homeCountry: 'Brasil'
          });
          setHomeAddressAutoFilled(true);
        }
      } else {
        if (isMailing) setMailingAddressAutoFilled(false);
        else setHomeAddressAutoFilled(false);
      }
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
      if (isMailing) setMailingAddressAutoFilled(false);
      else setHomeAddressAutoFilled(false);
    } finally {
      if (isMailing) setIsSearchingMailingCep(false);
      else setIsSearchingHomeCep(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    updateStepData('step2', { [e.target.name]: e.target.value });
  };

  const handleHomeZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    const formatted = val.length > 5 ? `${val.slice(0, 5)}-${val.slice(5)}` : val;

    updateStepData('step2', { homeZip: formatted });
    if (val.length === 8) {
      fetchCepData(val, false);
    } else {
      setHomeAddressAutoFilled(false);
    }
  };

  const handleMailingZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    const formatted = val.length > 5 ? `${val.slice(0, 5)}-${val.slice(5)}` : val;

    updateStepData('step2', { mailingZip: formatted });
    if (val.length === 8) {
      fetchCepData(val, true);
    } else {
      setMailingAddressAutoFilled(false);
    }
  };

  const addSocialMedia = () => {
    if (step2.socialMediaProfiles.length >= 5) return;
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
      
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-primary border-b border-light-gray pb-2">Endereço Residencial</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="homeZip" className="block text-sm font-medium text-primary mb-1">CEP *</label>
            <div className="relative">
              <input
                id="homeZip"
                name="homeZip"
                required
                type="text"
                value={step2.homeZip}
                onChange={handleHomeZipChange}
                className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red pr-10"
                placeholder="00000-000"
              />
              {isSearchingHomeCep && (
                <Loader2 className="animate-spin text-accent-red absolute right-3 top-3.5" size={20} />
              )}
            </div>
            <span className="text-[11px] text-dark-gray/60 mt-1 block">Digite o CEP para buscar rua, bairro, cidade e estado</span>
          </div>
          <div>
            <label htmlFor="homeCountry" className="block text-sm font-medium text-primary mb-1">País *</label>
            <input
              id="homeCountry"
              name="homeCountry"
              required
              type="text"
              value={step2.homeCountry}
              onChange={handleChange}
              className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red"
              placeholder="Ex: Brasil"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="homeStreet" className="block text-sm font-medium text-primary mb-1">Rua / Logradouro *</label>
            <input
              id="homeStreet"
              name="homeStreet"
              required
              type="text"
              value={step2.homeStreet}
              onChange={handleChange}
              className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red"
              placeholder="Ex: Av. Paulista"
            />
          </div>
          <div>
            <label htmlFor="homeNumber" className="block text-sm font-medium text-primary mb-1">Número *</label>
            <input
              id="homeNumber"
              name="homeNumber"
              required
              type="text"
              value={step2.homeNumber}
              onChange={handleChange}
              className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red"
              placeholder="Ex: 1000 ou S/N"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="homeNeighborhood" className="block text-sm font-medium text-primary mb-1">Bairro *</label>
            <input
              id="homeNeighborhood"
              name="homeNeighborhood"
              required
              type="text"
              value={step2.homeNeighborhood}
              onChange={handleChange}
              className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red"
              placeholder="Ex: Bela Vista"
            />
          </div>
          <div>
            <label htmlFor="homeComplement" className="block text-sm font-medium text-primary mb-1">Complemento *</label>
            <input
              id="homeComplement"
              name="homeComplement"
              required
              type="text"
              value={step2.homeComplement}
              onChange={handleChange}
              className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red"
              placeholder="Ex: Apt 42, Bloco B (ou 'Sem complemento')"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="homeCity" className="block text-sm font-medium text-primary mb-1 flex items-center justify-between">
              <span>Cidade *</span>
              {homeAddressAutoFilled && (
                <span className="text-[11px] text-green-700 bg-green-50 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 border border-green-200">
                  <Lock size={12} /> Auto-preenchido pelo CEP
                </span>
              )}
            </label>
            <input
              id="homeCity"
              name="homeCity"
              required
              type="text"
              readOnly={homeAddressAutoFilled}
              value={step2.homeCity}
              onChange={handleChange}
              className={`w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red ${
                homeAddressAutoFilled ? 'bg-gray-100 text-gray-700 cursor-not-allowed border-gray-300' : ''
              }`}
              placeholder="Ex: São Paulo"
            />
          </div>
          <div>
            <label htmlFor="homeState" className="block text-sm font-medium text-primary mb-1 flex items-center justify-between">
              <span>Estado / UF *</span>
              {homeAddressAutoFilled && (
                <span className="text-[11px] text-green-700 bg-green-50 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 border border-green-200">
                  <Lock size={12} /> Auto-preenchido pelo CEP
                </span>
              )}
            </label>
            <input
              id="homeState"
              name="homeState"
              required
              type="text"
              readOnly={homeAddressAutoFilled}
              value={step2.homeState}
              onChange={handleChange}
              className={`w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red ${
                homeAddressAutoFilled ? 'bg-gray-100 text-gray-700 cursor-not-allowed border-gray-300' : ''
              }`}
              placeholder="Ex: SP"
            />
          </div>
        </div>
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
          <div className="animate-fade-in mt-4 space-y-4 pt-4 border-t border-gray-300">
            <h4 className="font-bold text-primary text-sm">Endereço de Correspondência</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="mailingZip" className="block text-sm font-medium text-primary mb-1">CEP *</label>
                <div className="relative">
                  <input
                    id="mailingZip"
                    name="mailingZip"
                    required
                    type="text"
                    value={step2.mailingZip}
                    onChange={handleMailingZipChange}
                    className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red pr-10 bg-white"
                    placeholder="00000-000"
                  />
                  {isSearchingMailingCep && (
                    <Loader2 className="animate-spin text-accent-red absolute right-3 top-3.5" size={20} />
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="mailingCountry" className="block text-sm font-medium text-primary mb-1">País *</label>
                <input id="mailingCountry" name="mailingCountry" required type="text" value={step2.mailingCountry} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white" placeholder="Ex: Brasil" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="mailingStreet" className="block text-sm font-medium text-primary mb-1">Rua / Logradouro *</label>
                <input id="mailingStreet" name="mailingStreet" required type="text" value={step2.mailingStreet} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white" placeholder="Ex: Rua das Flores" />
              </div>
              <div>
                <label htmlFor="mailingNumber" className="block text-sm font-medium text-primary mb-1">Número *</label>
                <input id="mailingNumber" name="mailingNumber" required type="text" value={step2.mailingNumber} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white" placeholder="Ex: 123 ou S/N" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="mailingNeighborhood" className="block text-sm font-medium text-primary mb-1">Bairro *</label>
                <input id="mailingNeighborhood" name="mailingNeighborhood" required type="text" value={step2.mailingNeighborhood} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white" placeholder="Ex: Centro" />
              </div>
              <div>
                <label htmlFor="mailingComplement" className="block text-sm font-medium text-primary mb-1">Complemento *</label>
                <input id="mailingComplement" name="mailingComplement" required type="text" value={step2.mailingComplement} onChange={handleChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red bg-white" placeholder="Ex: Sala 12 (ou 'Sem complemento')" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="mailingCity" className="block text-sm font-medium text-primary mb-1 flex items-center justify-between">
                  <span>Cidade *</span>
                  {mailingAddressAutoFilled && (
                    <span className="text-[11px] text-green-700 bg-green-50 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 border border-green-200">
                      <Lock size={12} /> Auto-preenchido pelo CEP
                    </span>
                  )}
                </label>
                <input
                  id="mailingCity"
                  name="mailingCity"
                  required
                  type="text"
                  readOnly={mailingAddressAutoFilled}
                  value={step2.mailingCity}
                  onChange={handleChange}
                  className={`w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red ${
                    mailingAddressAutoFilled ? 'bg-gray-100 text-gray-700 cursor-not-allowed border-gray-300' : 'bg-white'
                  }`}
                  placeholder="Ex: São Paulo"
                />
              </div>
              <div>
                <label htmlFor="mailingState" className="block text-sm font-medium text-primary mb-1 flex items-center justify-between">
                  <span>Estado / UF *</span>
                  {mailingAddressAutoFilled && (
                    <span className="text-[11px] text-green-700 bg-green-50 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 border border-green-200">
                      <Lock size={12} /> Auto-preenchido pelo CEP
                    </span>
                  )}
                </label>
                <input
                  id="mailingState"
                  name="mailingState"
                  required
                  type="text"
                  readOnly={mailingAddressAutoFilled}
                  value={step2.mailingState}
                  onChange={handleChange}
                  className={`w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-red ${
                    mailingAddressAutoFilled ? 'bg-gray-100 text-gray-700 cursor-not-allowed border-gray-300' : 'bg-white'
                  }`}
                  placeholder="Ex: SP"
                />
              </div>
            </div>

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