import { useState } from 'react';
import type { Ds160Submission } from '../api/blogService';
import type { Ds160Data, SocialMediaProfile, TravelCompanion, USRelative, PreviousEmployer, Education } from '../context/Ds160Context';
import { 
  User, 
  MapPin, 
  CreditCard, 
  Plane, 
  History, 
  Users, 
  Briefcase, 
  ShieldAlert, 
  FileText,
  Phone,
  Mail,
  Globe,
  Award,
  DollarSign,
  Heart,
  ChevronRight
} from 'lucide-react';

interface Ds160VisualizerProps {
  submission: Ds160Submission;
}

export default function Ds160Visualizer({ submission }: Ds160VisualizerProps) {
  const [activeTab, setActiveTab] = useState<number>(1);

  let formData: Ds160Data;
  try {
    formData = typeof submission.jsonData === 'string' 
      ? JSON.parse(submission.jsonData) 
      : submission.jsonData;
  } catch (e) {
    console.error("Erro ao fazer o parse dos dados do formulário DS-160:", e);
    return (
      <div className="bg-red-50 text-red-800 p-6 rounded-2xl border border-red-200">
        <h3 className="font-bold text-lg mb-2">Erro de Processamento</h3>
        <p className="text-sm">Não foi possível carregar as informações detalhadas por um erro na estrutura dos dados salvos.</p>
        <pre className="mt-4 p-4 bg-red-100 rounded-lg text-xs overflow-auto">{String(submission.jsonData)}</pre>
      </div>
    );
  }

  const stepsList = [
    { id: 1, name: 'Informações Pessoais', icon: User, desc: 'Dados civis, nascimento e identificação' },
    { id: 2, name: 'Endereço e Contato', icon: MapPin, desc: 'Residência, telefone, e-mail e redes sociais' },
    { id: 3, name: 'Documento de Viagem', icon: CreditCard, desc: 'Passaporte principal, anteriores e foto' },
    { id: 4, name: 'Detalhes da Viagem', icon: Plane, desc: 'Destino, custos e acompanhantes' },
    { id: 5, name: 'Histórico de Viagens', icon: History, desc: 'Viagens anteriores, vistos e contatos nos EUA' },
    { id: 6, name: 'Informações Familiares', icon: Users, desc: 'Dados dos pais e parentes nos EUA' },
    { id: 7, name: 'Trabalho e Educação', icon: Briefcase, desc: 'Ocupação atual, histórico profissional e militar' },
    { id: 8, name: 'Segurança e Declaração', icon: ShieldAlert, desc: 'Questionário de segurança e assinatura' },
  ];

  // Helper for displaying boolean values as badges
  const renderBooleanBadge = (val: string | boolean | undefined) => {
    if (val === undefined || val === '') return <span className="text-gray-300 italic">Não informado</span>;
    const isYes = val === 'Yes' || val === 'yes' || val === 'true' || val === true;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
        isYes ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
      }`}>
        {isYes ? 'Sim' : 'Não'}
      </span>
    );
  };

  // Helper for grid items
  const DetailField = ({ label, value, fullWidth = false, highlight = false }: { label: string; value: React.ReactNode; fullWidth?: boolean; highlight?: boolean }) => {
    return (
      <div className={`p-4 bg-white border border-gray-100 rounded-xl shadow-xs transition-shadow hover:shadow-sm ${
        fullWidth ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''
      } ${highlight ? 'ring-1 ring-accent-gold/30 bg-accent-gold/5' : ''}`}>
        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</span>
        <div className="text-sm font-semibold text-primary break-words">
          {value === null || value === undefined || value === '' ? <span className="text-gray-300 italic font-normal">Não informado</span> : value}
        </div>
      </div>
    );
  };

  // Helper for Section Headers
  const SectionHeader = ({ title, icon: Icon }: { title: string; icon: any }) => (
    <h3 className="text-base font-bold text-primary flex items-center gap-2 mb-4 border-b border-gray-100 pb-2 mt-6 first:mt-0">
      <Icon size={18} className="text-accent-gold" />
      {title}
    </h3>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Mobile step selector */}
      <div className="lg:hidden col-span-1 space-y-2">
        <label className="block text-xs font-bold text-primary uppercase tracking-wider">Passo do Formulário</label>
        <select 
          value={activeTab}
          onChange={(e) => setActiveTab(Number(e.target.value))}
          className="w-full p-3 bg-white border border-gray-200 rounded-xl font-bold text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold"
        >
          {stepsList.map(step => (
            <option key={step.id} value={step.id}>
              Passo {step.id}: {step.name}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop step selector */}
      <div className="hidden lg:block lg:col-span-3 space-y-2 sticky top-6">
        <div className="bg-white border border-gray-200/60 rounded-2xl p-4 shadow-sm space-y-1.5">
          <p className="text-xs font-black text-primary/50 uppercase tracking-widest px-3 mb-3">Passos do DS-160</p>
          {stepsList.map(step => {
            const Icon = step.icon;
            const isActive = activeTab === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveTab(step.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  isActive 
                    ? 'bg-primary text-secondary shadow-md font-bold' 
                    : 'text-dark-gray hover:bg-light-gray hover:text-primary'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-secondary/15 text-secondary' : 'bg-gray-100 text-gray-500'}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate leading-snug">{step.name}</p>
                  <p className={`text-[10px] truncate leading-none mt-0.5 ${isActive ? 'text-secondary/70' : 'text-gray-400'}`}>
                    {step.desc}
                  </p>
                </div>
                <ChevronRight size={14} className={`opacity-50 ${isActive ? 'block' : 'hidden group-hover:block'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Details Container */}
      <div className="col-span-1 lg:col-span-9 bg-light-gray/60 border border-gray-200/50 rounded-2xl p-6 md:p-8 min-h-[500px]">
        {/* Render Step 1 */}
        {activeTab === 1 && (
          <div className="space-y-6 animate-fade-in text-left">
            <SectionHeader title="Dados Pessoais" icon={User} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailField label="Nome Completo" value={formData.step1?.fullName} fullWidth />
              <DetailField label="Nome em Alfabeto Nativo" value={formData.step1?.nativeName} />
              <DetailField label="Gênero" value={formData.step1?.gender} />
              <DetailField label="Estado Civil" value={formData.step1?.maritalStatus} />
              {formData.step1?.maritalStatusExplain && (
                <DetailField label="Explicação do Estado Civil" value={formData.step1?.maritalStatusExplain} fullWidth />
              )}
            </div>

            <SectionHeader title="Outros Nomes Utilizados" icon={FileText} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailField label="Usou outros nomes?" value={renderBooleanBadge(formData.step1?.usedOtherNames)} />
              {formData.step1?.usedOtherNames === 'Yes' && (
                <DetailField label="Nomes Alternativos" value={formData.step1?.otherNames} fullWidth />
              )}
              <DetailField label="Nome em Telecódigo?" value={renderBooleanBadge(formData.step1?.telecodeName)} />
            </div>

            <SectionHeader title="Dados de Nascimento e Nacionalidade" icon={Globe} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailField label="Data de Nascimento" value={formData.step1?.birthDate} />
              <DetailField label="Cidade de Nascimento" value={formData.step1?.birthCity} />
              <DetailField label="Estado de Nascimento" value={formData.step1?.birthState} />
              <DetailField label="País de Nascimento" value={formData.step1?.birthCountry} />
              <DetailField label="Outra Nacionalidade?" value={renderBooleanBadge(formData.step1?.otherNationality)} />
              {formData.step1?.otherNationality === 'Yes' && (
                <>
                  <DetailField label="País da Outra Nacionalidade" value={formData.step1?.otherNationalityCountry} />
                  <DetailField label="Número do Outro Passaporte" value={formData.step1?.otherPassportNumber} />
                </>
              )}
            </div>

            <SectionHeader title="Documentos de Identificação" icon={CreditCard} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailField label="CPF" value={formData.step1?.cpf} highlight />
              <DetailField label="RG" value={formData.step1?.rg} />
              <DetailField label="Órgão Emissor do RG" value={formData.step1?.rgIssuer} />
            </div>
          </div>
        )}

        {/* Render Step 2 */}
        {activeTab === 2 && (
          <div className="space-y-6 animate-fade-in text-left">
            <SectionHeader title="Endereço Residencial" icon={MapPin} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailField label="Endereço" value={formData.step2?.homeAddress} fullWidth />
              <DetailField label="Cidade" value={formData.step2?.homeCity} />
              <DetailField label="Estado" value={formData.step2?.homeState} />
              <DetailField label="CEP" value={formData.step2?.homeZip} />
              <DetailField label="País" value={formData.step2?.homeCountry} />
            </div>

            <SectionHeader title="Endereço de Correspondência" icon={Mail} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailField label="Correspondência igual ao Residencial?" value={renderBooleanBadge(formData.step2?.sameMailingAddress)} />
              {formData.step2?.sameMailingAddress === 'No' && (
                <DetailField label="Endereço de Correspondência" value={formData.step2?.mailingAddress} fullWidth />
              )}
            </div>

            <SectionHeader title="Contatos Telefônicos e E-mail" icon={Phone} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailField label="Telefone Principal" value={formData.step2?.primaryPhone} highlight />
              <DetailField label="Telefone de Trabalho" value={formData.step2?.workPhone} />
              <DetailField label="E-mail Principal" value={formData.step2?.primaryEmail} highlight />
              <DetailField label="Possui Telefone Adicional?" value={renderBooleanBadge(formData.step2?.hasAdditionalPhone)} />
              {formData.step2?.hasAdditionalPhone === 'Yes' && (
                <DetailField label="Telefones Adicionais" value={formData.step2?.additionalPhones} fullWidth />
              )}
            </div>

            <SectionHeader title="Perfis em Redes Sociais (Últimos 5 Anos)" icon={Globe} />
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                <DetailField label="Possui redes sociais?" value={renderBooleanBadge(formData.step2?.hasSocialMedia)} />
              </div>
              
              {formData.step2?.hasSocialMedia === 'Yes' && formData.step2?.socialMediaProfiles && formData.step2.socialMediaProfiles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {formData.step2.socialMediaProfiles.map((profile: SocialMediaProfile, idx: number) => (
                    <div key={idx} className="flex items-center gap-2.5 p-3.5 bg-white border border-gray-150 rounded-xl shadow-xs">
                      <span className="bg-primary/5 text-primary text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        {profile.platform}
                      </span>
                      <span className="text-sm font-semibold text-dark-gray font-mono truncate">
                        {profile.identifier}
                      </span>
                    </div>
                  ))}
                </div>
              ) : formData.step2?.hasSocialMedia === 'Yes' ? (
                <p className="text-sm text-gray-400 italic">Marcado como Sim, mas nenhum perfil foi fornecido.</p>
              ) : null}
            </div>
          </div>
        )}

        {/* Render Step 3 */}
        {activeTab === 3 && (
          <div className="space-y-6 animate-fade-in text-left">
            <SectionHeader title="Dados do Passaporte / Documento de Viagem" icon={CreditCard} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailField label="Tipo do Documento" value={formData.step3?.passportType} />
              <DetailField label="Número do Passaporte" value={formData.step3?.passportNumber} highlight />
              <DetailField label="País Emissor" value={formData.step3?.passportIssuerCountry} />
              <DetailField label="Cidade de Emissão" value={formData.step3?.passportIssuerCity} />
              <DetailField label="Estado de Emissão" value={formData.step3?.passportIssuerState} />
              <div className="hidden lg:block"></div> {/* Spacer */}
              <DetailField label="Data de Emissão" value={formData.step3?.passportIssueDate} />
              <DetailField label="Data de Expiração" value={formData.step3?.passportExpiryDate} highlight />
            </div>

            <SectionHeader title="Passaportes Anteriores e Perdas" icon={History} />
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailField label="Possui passaporte anterior?" value={renderBooleanBadge(formData.step3?.hasPreviousPassport)} />
                <DetailField label="Já perdeu ou teve documento roubado?" value={renderBooleanBadge(formData.step3?.hasLostPassport)} />
              </div>

              {formData.step3?.hasPreviousPassport === 'Yes' && (
                <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-xs space-y-4">
                  <h4 className="font-bold text-sm text-primary">Informações do Passaporte Anterior</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Número</span>
                      <span className="text-sm font-semibold text-primary">{formData.step3?.previousPassportNumber || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">País Emissor</span>
                      <span className="text-sm font-semibold text-primary">{formData.step3?.previousPassportIssuerCountry || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Data Emissão</span>
                      <span className="text-sm font-semibold text-primary">{formData.step3?.previousPassportIssueDate || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Data Expiração</span>
                      <span className="text-sm font-semibold text-primary">{formData.step3?.previousPassportExpiryDate || '-'}</span>
                    </div>
                  </div>
                </div>
              )}

              {formData.step3?.hasLostPassport === 'Yes' && (
                <div className="p-4 bg-red-50 text-red-900 border border-red-100 text-xs font-semibold rounded-xl">
                  <strong className="block text-red-800 font-bold mb-1">Motivo do extravio informado:</strong>
                  {formData.step3?.lostPassportExplanation || <span className="italic">Nenhuma explicação fornecida</span>}
                </div>
              )}
            </div>

            {formData.step3?.passportPhotoBase64 && (
              <>
                <SectionHeader title="Foto do Passaporte" icon={FileText} />
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs max-w-sm">
                  <img 
                    src={formData.step3.passportPhotoBase64} 
                    alt="Passaporte do Requerente" 
                    className="w-full h-auto rounded-xl border border-gray-200"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Render Step 4 */}
        {activeTab === 4 && (
          <div className="space-y-6 animate-fade-in text-left">
            <SectionHeader title="Informações de Viagem" icon={Plane} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailField label="Posto Consular" value={formData.step4?.consularPost} />
              <DetailField label="Propósito da Viagem" value={formData.step4?.tripPurpose} />
              <DetailField label="Possui planos específicos de viagem?" value={renderBooleanBadge(formData.step4?.hasSpecificTravelPlans)} />
              <DetailField label="Data Prevista de Chegada" value={formData.step4?.intendedArrivalDate} />
              <DetailField label="Duração da Estadia Pretendida" value={formData.step4?.intendedStayLength} />
            </div>

            <SectionHeader title="Endereço de Estadia nos EUA" icon={MapPin} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DetailField label="Rua / Logradouro" value={formData.step4?.usAddressStreet} fullWidth />
              <DetailField label="Cidade" value={formData.step4?.usAddressCity} />
              <DetailField label="Estado" value={formData.step4?.usAddressState} />
              <DetailField label="CEP" value={formData.step4?.usAddressZip} />
            </div>

            <SectionHeader title="Responsável pelo Pagamento da Viagem" icon={DollarSign} />
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailField label="Quem pagará pela viagem?" value={
                  formData.step4?.payingParty === 'Self' ? 'O próprio solicitante' : 
                  formData.step4?.payingParty === 'Other' ? 'Outra pessoa' : 
                  formData.step4?.payingParty === 'Company' ? 'Empresa / Organização' : 
                  formData.step4?.payingParty
                } highlight />
                {formData.step4?.payingParty !== 'Self' && (
                  <DetailField label="Endereço do pagador é igual ao residencial?" value={renderBooleanBadge(formData.step4?.payingPartySameAddress)} />
                )}
              </div>

              {formData.step4?.payingParty !== 'Self' && (
                <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-xs space-y-3">
                  <h4 className="font-bold text-sm text-primary">Informações do Responsável Financeiro</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Nome / Empresa</span>
                      <span className="text-sm font-semibold text-primary">{formData.step4?.payingPartyName || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Telefone</span>
                      <span className="text-sm font-semibold text-primary">{formData.step4?.payingPartyPhone || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">E-mail</span>
                      <span className="text-sm font-semibold text-primary break-all">{formData.step4?.payingPartyEmail || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Relação / Vínculo</span>
                      <span className="text-sm font-semibold text-primary">{formData.step4?.payingPartyRelationship || '-'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <SectionHeader title="Companheiros de Viagem" icon={Users} />
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailField label="Viajará acompanhado?" value={renderBooleanBadge(formData.step4?.hasTravelCompanions)} />
                {formData.step4?.hasTravelCompanions === 'Yes' && formData.step4?.travelCompanionsGroup && (
                  <DetailField label="Grupo ou Organização" value={formData.step4?.travelCompanionsGroup} />
                )}
              </div>

              {formData.step4?.hasTravelCompanions === 'Yes' && formData.step4?.travelCompanions && formData.step4.travelCompanions.length > 0 ? (
                <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-150">
                        <th className="p-3.5 font-bold text-primary">Nome Completo</th>
                        <th className="p-3.5 font-bold text-primary">Grau de Parentesco / Relação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {formData.step4.travelCompanions.map((comp: TravelCompanion, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3.5 font-semibold text-primary">{comp.fullName}</td>
                          <td className="p-3.5 text-dark-gray">{comp.relationship}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : formData.step4?.hasTravelCompanions === 'Yes' ? (
                <p className="text-sm text-gray-400 italic">Viajará acompanhado, mas nenhum acompanhante foi listado.</p>
              ) : null}
            </div>
          </div>
        )}

        {/* Render Step 5 */}
        {activeTab === 5 && (
          <div className="space-y-6 animate-fade-in text-left">
            <SectionHeader title="Visitas Anteriores aos EUA" icon={History} />
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailField label="Já esteve nos EUA?" value={renderBooleanBadge(formData.step5?.hasBeenToUS)} />
                {formData.step5?.hasBeenToUS === 'Yes' && (
                  <>
                    <DetailField label="Data da Última Visita" value={formData.step5?.lastUSVisitDate} />
                    <DetailField label="Tempo de Permanência" value={formData.step5?.lastUSVisitLength} />
                  </>
                )}
              </div>
            </div>

            <SectionHeader title="Vistos Americanos Anteriores" icon={CreditCard} />
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailField label="Já teve visto americano?" value={renderBooleanBadge(formData.step5?.hasUSVisa)} />
                {formData.step5?.hasUSVisa === 'Yes' && (
                  <>
                    <DetailField label="Número do Visto" value={formData.step5?.usVisaNumber} highlight />
                    <DetailField label="Data de Emissão" value={formData.step5?.usVisaIssueDate} />
                    <DetailField label="Data de Expiração" value={formData.step5?.usVisaExpiryDate} />
                  </>
                )}
              </div>
            </div>

            <SectionHeader title="Recusas de Visto e Petições de Imigração" icon={ShieldAlert} />
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailField label="Já teve visto americano recusado?" value={renderBooleanBadge(formData.step5?.hasRefusedUSVisa)} />
                <DetailField label="Existe petição de imigração em seu nome?" value={renderBooleanBadge(formData.step5?.hasImmigrationPetition)} />
              </div>

              {formData.step5?.hasRefusedUSVisa === 'Yes' && (
                <div className="p-4 bg-red-50 text-red-900 border border-red-100 text-xs font-semibold rounded-xl">
                  <strong className="block text-red-800 font-bold mb-1">Motivo da recusa informado:</strong>
                  {formData.step5?.refusedUSVisaExplanation || <span className="italic">Nenhuma explicação fornecida</span>}
                </div>
              )}

              {formData.step5?.hasImmigrationPetition === 'Yes' && (
                <div className="p-4 bg-red-50 text-red-900 border border-red-100 text-xs font-semibold rounded-xl">
                  <strong className="block text-red-800 font-bold mb-1">Explicação da petição de imigração:</strong>
                  {formData.step5?.immigrationPetitionExplanation || <span className="italic">Nenhuma explicação fornecida</span>}
                </div>
              )}
            </div>

            <SectionHeader title="Viagens Internacionais (Últimos 5 Anos)" icon={Globe} />
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                <DetailField label="Viajou internacionalmente nos últimos 5 anos?" value={renderBooleanBadge(formData.step5?.hasTraveledInternationally)} />
              </div>
              
              {formData.step5?.hasTraveledInternationally === 'Yes' && formData.step5?.countriesVisited && formData.step5.countriesVisited.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {formData.step5.countriesVisited.map((country: string, idx: number) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-accent-gold/10 text-primary text-xs font-extrabold rounded-full border border-accent-gold/20">
                      ✈️ {country}
                    </span>
                  ))}
                </div>
              ) : formData.step5?.hasTraveledInternationally === 'Yes' ? (
                <p className="text-sm text-gray-400 italic">Marcado como Sim, mas nenhum país foi listado.</p>
              ) : null}
            </div>

            <SectionHeader title="Pessoa de Contato nos EUA" icon={User} />
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailField label="Possui contato nos EUA?" value={renderBooleanBadge(formData.step5?.hasUSContact)} />
              </div>

              {formData.step5?.hasUSContact === 'Yes' && (
                <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-xs space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Nome do Contato</span>
                      <span className="text-sm font-semibold text-primary">{formData.step5?.usContactName || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Relação / Vínculo</span>
                      <span className="text-sm font-semibold text-primary">{formData.step5?.usContactRelationship || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Telefone</span>
                      <span className="text-sm font-semibold text-primary">{formData.step5?.usContactPhone || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">E-mail</span>
                      <span className="text-sm font-semibold text-primary break-all">{formData.step5?.usContactEmail || '-'}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Endereço de Contato</span>
                      <span className="text-sm font-semibold text-primary">{formData.step5?.usContactAddress || '-'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Render Step 6 */}
        {activeTab === 6 && (
          <div className="space-y-6 animate-fade-in text-left">
            <SectionHeader title="Dados do Pai" icon={User} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DetailField label="Nome Completo do Pai" value={formData.step6?.fatherFullName} fullWidth />
              <DetailField label="Data de Nascimento" value={formData.step6?.fatherBirthDate} />
              <DetailField label="O Pai está nos EUA?" value={renderBooleanBadge(formData.step6?.isFatherInUS)} />
              {formData.step6?.isFatherInUS === 'Yes' && (
                <DetailField label="Status Legal nos EUA" value={formData.step6?.fatherUSStatus} />
              )}
            </div>

            <SectionHeader title="Dados da Mãe" icon={User} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DetailField label="Nome Completo da Mãe" value={formData.step6?.motherFullName} fullWidth />
              <DetailField label="Data de Nascimento" value={formData.step6?.motherBirthDate} />
              <DetailField label="A Mãe está nos EUA?" value={renderBooleanBadge(formData.step6?.isMotherInUS)} />
              {formData.step6?.isMotherInUS === 'Yes' && (
                <DetailField label="Status Legal nos EUA" value={formData.step6?.motherUSStatus} />
              )}
            </div>

            <SectionHeader title="Parentes nos EUA" icon={Users} />
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailField label="Possui parentes imediatos nos EUA? (Cônjuge, filhos, irmãos)" value={renderBooleanBadge(formData.step6?.hasImmediateRelativesInUS)} />
                <DetailField label="Possui outros parentes nos EUA?" value={renderBooleanBadge(formData.step6?.hasOtherRelativesInUS)} />
              </div>

              {formData.step6?.hasImmediateRelativesInUS === 'Yes' && formData.step6?.immediateRelatives && formData.step6.immediateRelatives.length > 0 ? (
                <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-150">
                        <th className="p-3.5 font-bold text-primary">Nome Completo</th>
                        <th className="p-3.5 font-bold text-primary">Grau de Parentesco</th>
                        <th className="p-3.5 font-bold text-primary">Status Legal nos EUA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {formData.step6.immediateRelatives.map((rel: USRelative, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3.5 font-semibold text-primary">{rel.fullName}</td>
                          <td className="p-3.5 text-dark-gray">{rel.relationship}</td>
                          <td className="p-3.5 text-dark-gray">
                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-800 text-xs font-bold rounded">
                              {rel.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : formData.step6?.hasImmediateRelativesInUS === 'Yes' ? (
                <p className="text-sm text-gray-400 italic">Marcado como Sim, mas nenhum parente imediato foi listado.</p>
              ) : null}
            </div>
          </div>
        )}

        {/* Render Step 7 */}
        {activeTab === 7 && (
          <div className="space-y-6 animate-fade-in text-left">
            <SectionHeader title="Trabalho Atual / Ocupação Principal" icon={Briefcase} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailField label="Ocupação Principal" value={formData.step7?.primaryOccupation} highlight />
              <DetailField label="Nome da Empresa / Instituição" value={formData.step7?.currentEmployerSchoolName} />
              <DetailField label="Telefone de Contato" value={formData.step7?.currentEmployerSchoolPhone} />
              <DetailField label="Data de Início" value={formData.step7?.currentStartDate} />
              <DetailField label="Salário Mensal (R$)" value={
                formData.step7?.currentMonthlySalary 
                  ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(formData.step7.currentMonthlySalary)) 
                  : '-'
              } />
              <div className="hidden lg:block"></div> {/* Spacer */}
              <DetailField label="Endereço da Ocupação" value={formData.step7?.currentEmployerSchoolAddress} fullWidth />
              <DetailField label="Funções / Deveres Principais" value={formData.step7?.currentDuties} fullWidth />
            </div>

            <SectionHeader title="Histórico de Trabalho Anterior (Últimos 5 Anos)" icon={History} />
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailField label="Possui empregos anteriores nos últimos 5 anos?" value={renderBooleanBadge(formData.step7?.hasPreviousEmployment)} />
              </div>

              {formData.step7?.hasPreviousEmployment === 'Yes' && formData.step7?.previousEmployers && formData.step7.previousEmployers.length > 0 ? (
                <div className="space-y-4">
                  {formData.step7.previousEmployers.map((emp: PreviousEmployer, idx: number) => (
                    <div key={idx} className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs space-y-3">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
                        <span className="font-extrabold text-primary text-base">{emp.employerName}</span>
                        <span className="text-xs font-bold text-gray-400 bg-slate-50 border px-2.5 py-1 rounded-full">
                          {emp.startDate} a {emp.endDate}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="md:col-span-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Cargo / Título</span>
                          <span className="font-semibold text-dark-gray">{emp.jobTitle || '-'}</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Nome do Supervisor</span>
                          <span className="font-semibold text-dark-gray">{emp.supervisorName || '-'}</span>
                        </div>
                        <div className="md:col-span-4">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Endereço Completo</span>
                          <span className="font-semibold text-dark-gray">{emp.employerAddress || '-'}</span>
                        </div>
                        <div className="md:col-span-4">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Atribuições e Funções</span>
                          <span className="font-semibold text-dark-gray block bg-slate-50/50 p-2.5 rounded-lg border border-gray-100">{emp.duties || '-'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : formData.step7?.hasPreviousEmployment === 'Yes' ? (
                <p className="text-sm text-gray-400 italic">Marcado como Sim, mas nenhum empregador anterior foi cadastrado.</p>
              ) : null}
            </div>

            <SectionHeader title="Histórico Educacional (Médio / Superior)" icon={Award} />
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailField label="Possui ensino superior ou técnico?" value={renderBooleanBadge(formData.step7?.hasHigherEducation)} />
              </div>

              {formData.step7?.hasHigherEducation === 'Yes' && formData.step7?.educationHistory && formData.step7.educationHistory.length > 0 ? (
                <div className="space-y-4">
                  {formData.step7.educationHistory.map((edu: Education, idx: number) => (
                    <div key={idx} className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs space-y-3">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
                        <span className="font-extrabold text-primary text-base">{edu.schoolName}</span>
                        <span className="text-xs font-bold text-gray-400 bg-slate-50 border px-2.5 py-1 rounded-full">
                          {edu.startDate} a {edu.endDate}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="md:col-span-3">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Curso / Especialidade</span>
                          <span className="font-semibold text-dark-gray">{edu.courseOfStudy || '-'}</span>
                        </div>
                        <div className="md:col-span-3">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Endereço Completo da Instituição</span>
                          <span className="font-semibold text-dark-gray">{edu.schoolAddress || '-'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : formData.step7?.hasHigherEducation === 'Yes' ? (
                <p className="text-sm text-gray-400 italic">Marcado como Sim, mas nenhuma instituição de ensino foi listada.</p>
              ) : null}
            </div>

            <SectionHeader title="Idiomas e Habilidades Adicionais" icon={Globe} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-xs col-span-1 md:col-span-2">
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Idiomas Falados</span>
                {formData.step7?.languagesSpoken && formData.step7.languagesSpoken.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.step7.languagesSpoken.map((lang: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 text-primary text-xs font-extrabold rounded-md border border-slate-200">
                        {lang}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-gray-300 italic">Nenhum idioma informado</span>
                )}
              </div>
              <DetailField label="Organizações Profissionais / Sociais" value={formData.step7?.professionalOrganizations} />
              
              <DetailField label="Possui Habilidades Especiais?" value={renderBooleanBadge(formData.step7?.hasSpecialSkills)} />
              {formData.step7?.hasSpecialSkills === 'Yes' && (
                <DetailField label="Explicação de Habilidades Especiais" value={formData.step7?.specialSkillsExplanation} fullWidth />
              )}
            </div>

            <SectionHeader title="Serviço Militar" icon={ShieldAlert} />
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailField label="Prestou serviço militar?" value={renderBooleanBadge(formData.step7?.hasMilitaryService)} />
              </div>

              {formData.step7?.hasMilitaryService === 'Yes' && (
                <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-xs space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">País</span>
                      <span className="text-sm font-semibold text-primary">{formData.step7?.militaryCountry || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Ramo do Serviço</span>
                      <span className="text-sm font-semibold text-primary">{formData.step7?.militaryBranch || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Patente / Rank</span>
                      <span className="text-sm font-semibold text-primary">{formData.step7?.militaryRank || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Especialidade</span>
                      <span className="text-sm font-semibold text-primary">{formData.step7?.militarySpecialty || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Data Início</span>
                      <span className="text-sm font-semibold text-primary">{formData.step7?.militaryStartDate || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Data Fim</span>
                      <span className="text-sm font-semibold text-primary">{formData.step7?.militaryEndDate || '-'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Render Step 8 */}
        {activeTab === 8 && (
          <div className="space-y-6 animate-fade-in text-left">
            <SectionHeader title="Questionário de Segurança e Antecedentes" icon={ShieldAlert} />
            
            <div className="space-y-4">
              {/* Disease */}
              <div className={`p-5 rounded-2xl border transition-all ${
                formData.step8?.disease === 'Yes' ? 'bg-red-50/50 border-red-200' : 'bg-white border-gray-100'
              }`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Parte 1: Saúde</span>
                    <p className="text-sm font-semibold text-primary">Possui alguma doença transmissível de relevância pública?</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-black rounded-full uppercase ${
                    formData.step8?.disease === 'Yes' ? 'bg-red-200 text-red-805' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {formData.step8?.disease === 'Yes' ? 'Sim' : 'Não'}
                  </span>
                </div>
                {formData.step8?.disease === 'Yes' && formData.step8?.diseaseExplain && (
                  <div className="mt-3.5 p-3 bg-red-50 text-red-900 border border-red-100 text-xs font-medium rounded-lg">
                    <strong className="block text-red-800 font-bold mb-1">Explicação:</strong>
                    {formData.step8.diseaseExplain}
                  </div>
                )}
              </div>

              {/* Criminal */}
              <div className={`p-5 rounded-2xl border transition-all ${
                formData.step8?.criminal === 'Yes' ? 'bg-red-50/50 border-red-200' : 'bg-white border-gray-100'
              }`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Parte 2: Histórico Criminal</span>
                    <p className="text-sm font-semibold text-primary">Já foi preso, condenado por algum crime ou delito?</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-black rounded-full uppercase ${
                    formData.step8?.criminal === 'Yes' ? 'bg-red-200 text-red-805' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {formData.step8?.criminal === 'Yes' ? 'Sim' : 'Não'}
                  </span>
                </div>
                {formData.step8?.criminal === 'Yes' && formData.step8?.criminalExplain && (
                  <div className="mt-3.5 p-3 bg-red-50 text-red-900 border border-red-100 text-xs font-medium rounded-lg">
                    <strong className="block text-red-800 font-bold mb-1">Explicação:</strong>
                    {formData.step8.criminalExplain}
                  </div>
                )}
              </div>

              {/* Terrorism */}
              <div className={`p-5 rounded-2xl border transition-all ${
                formData.step8?.terrorism === 'Yes' ? 'bg-red-50/50 border-red-200' : 'bg-white border-gray-100'
              }`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Parte 3: Segurança & Terrorismo</span>
                    <p className="text-sm font-semibold text-primary">Busca ou já se envolveu com atividades de espionagem, sabotagem ou terrorismo?</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-black rounded-full uppercase ${
                    formData.step8?.terrorism === 'Yes' ? 'bg-red-200 text-red-805' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {formData.step8?.terrorism === 'Yes' ? 'Sim' : 'Não'}
                  </span>
                </div>
                {formData.step8?.terrorism === 'Yes' && formData.step8?.terrorismExplain && (
                  <div className="mt-3.5 p-3 bg-red-50 text-red-900 border border-red-100 text-xs font-medium rounded-lg">
                    <strong className="block text-red-800 font-bold mb-1">Explicação:</strong>
                    {formData.step8.terrorismExplain}
                  </div>
                )}
              </div>

              {/* Fraud */}
              <div className={`p-5 rounded-2xl border transition-all ${
                formData.step8?.fraud === 'Yes' ? 'bg-red-50/50 border-red-200' : 'bg-white border-gray-100'
              }`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Parte 4: Fraude de Visto</span>
                    <p className="text-sm font-semibold text-primary">Já ajudou ou tentou obter vistos por meios fraudulentos ou declarações falsas?</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-black rounded-full uppercase ${
                    formData.step8?.fraud === 'Yes' ? 'bg-red-200 text-red-805' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {formData.step8?.fraud === 'Yes' ? 'Sim' : 'Não'}
                  </span>
                </div>
                {formData.step8?.fraud === 'Yes' && formData.step8?.fraudExplain && (
                  <div className="mt-3.5 p-3 bg-red-50 text-red-900 border border-red-100 text-xs font-medium rounded-lg">
                    <strong className="block text-red-800 font-bold mb-1">Explicação:</strong>
                    {formData.step8.fraudExplain}
                  </div>
                )}
              </div>

              {/* Deported */}
              <div className={`p-5 rounded-2xl border transition-all ${
                formData.step8?.deported === 'Yes' ? 'bg-red-50/50 border-red-200' : 'bg-white border-gray-100'
              }`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Parte 5: Deportações & Violações</span>
                    <p className="text-sm font-semibold text-primary">Já foi deportado ou expulso dos EUA ou violou os termos do visto?</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-black rounded-full uppercase ${
                    formData.step8?.deported === 'Yes' ? 'bg-red-200 text-red-805' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {formData.step8?.deported === 'Yes' ? 'Sim' : 'Não'}
                  </span>
                </div>
                {formData.step8?.deported === 'Yes' && formData.step8?.deportedExplain && (
                  <div className="mt-3.5 p-3 bg-red-50 text-red-900 border border-red-100 text-xs font-medium rounded-lg">
                    <strong className="block text-red-800 font-bold mb-1">Explicação:</strong>
                    {formData.step8.deportedExplain}
                  </div>
                )}
              </div>
            </div>

            <SectionHeader title="Termo de Declaração e Assinatura Digital" icon={Heart} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailField label="Termo Aceito pelo Requerente?" value={renderBooleanBadge(formData.step8?.declarationAccepted)} />
              <DetailField label="Assinatura Digital (Nome por Extenso)" value={formData.step8?.signature} highlight />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
