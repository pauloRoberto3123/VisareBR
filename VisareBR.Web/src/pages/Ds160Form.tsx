import { useState } from 'react';
import { ChevronRight, ChevronLeft, ShieldCheck, CheckCircle } from 'lucide-react';
import api from '../api/blogService';
import { Ds160Provider, useDs160 } from '../context/Ds160Context';
import type { Ds160Data } from '../context/Ds160Context';
import Step1PersonalInfo from '../context/Step1PersonalInfo';
import Step2AddressContact from '../context/Step2AddressContact';
import Step3Passport from '../context/Step3Passport';
import Step4Travel from '../context/Step4Travel';
import Step5History from '../context/Step5History';
import Step6Family from '../context/Step6Family';
import Step7WorkEducation from '../context/Step7WorkEducation';
import Step8Security from '../context/Step8Security';

const STEPS = [
  'Informações Pessoais',
  'Endereço e Contato',
  'Passaporte',
  'Viagem',
  'Histórico',
  'Família',
  'Trabalho & Estudo',
  'Segurança'
];

const isStepValid = (data: Ds160Data, stepIndex: number): boolean => {
  switch (stepIndex) {
    case 0: {
      const s1 = data.step1;
      if (!s1.fullName || !s1.nativeName || !s1.usedOtherNames || !s1.gender || !s1.maritalStatus || !s1.birthDate || !s1.otherNationality || !s1.cpf || !s1.rg) return false;
      if (s1.usedOtherNames === 'Yes' && !s1.otherNames) return false;
      if (s1.maritalStatus === 'Other' && !s1.maritalStatusExplain) return false;
      if (s1.otherNationality === 'Yes' && !s1.otherNationalityCountry) return false;
      return true;
    }
    case 1: {
      const s2 = data.step2;
      if (!s2.homeAddress || !s2.sameMailingAddress || !s2.primaryPhone || !s2.primaryEmail || !s2.hasSocialMedia) return false;
      if (s2.sameMailingAddress === 'No' && !s2.mailingAddress) return false;
      if (s2.hasSocialMedia === 'Yes' && (!s2.socialMediaProfiles.length || s2.socialMediaProfiles.some(p => !p.platform || !p.identifier))) return false;
      return true;
    }
    case 2: {
      const s3 = data.step3;
      if (!s3.passportType || !s3.passportNumber || !s3.passportIssuerCountry || !s3.passportIssuerState || !s3.passportIssuerCity || !s3.passportIssueDate || !s3.passportExpiryDate || !s3.hasPreviousPassport || !s3.hasLostPassport) return false;
      if (s3.hasPreviousPassport === 'Yes' && (!s3.previousPassportNumber || !s3.previousPassportIssuerCountry || !s3.previousPassportIssueDate || !s3.previousPassportExpiryDate)) return false;
      if (s3.hasLostPassport === 'Yes' && !s3.lostPassportExplanation) return false;
      return true;
    }
    case 3: {
      const s4 = data.step4;
      if (!s4.consularPost || !s4.tripPurpose || !s4.hasSpecificTravelPlans || !s4.usAddressStreet || !s4.usAddressCity || !s4.usAddressState || !s4.payingParty || !s4.hasTravelCompanions) return false;
      if (s4.hasSpecificTravelPlans === 'No' && (!s4.intendedArrivalDate || !s4.intendedStayLength)) return false;
      if ((s4.payingParty === 'Other' || s4.payingParty === 'Company') && (!s4.payingPartyName || !s4.payingPartyPhone || !s4.payingPartyEmail || !s4.payingPartyRelationship)) return false;
      if (s4.hasTravelCompanions === 'Yes' && (!s4.travelCompanions.length || s4.travelCompanions.some(c => !c.fullName || !c.relationship))) return false;
      return true;
    }
    case 4: {
      const s5 = data.step5;
      if (!s5.hasBeenToUS || !s5.hasUSVisa || !s5.hasRefusedUSVisa || !s5.hasImmigrationPetition || !s5.hasTraveledInternationally || !s5.hasUSContact) return false;
      if (s5.hasBeenToUS === 'Yes' && (!s5.lastUSVisitDate || !s5.lastUSVisitLength)) return false;
      if (s5.hasUSVisa === 'Yes' && (!s5.usVisaNumber || !s5.usVisaIssueDate || !s5.usVisaExpiryDate)) return false;
      if (s5.hasRefusedUSVisa === 'Yes' && !s5.refusedUSVisaExplanation) return false;
      if (s5.hasImmigrationPetition === 'Yes' && !s5.immigrationPetitionExplanation) return false;
      if (s5.hasTraveledInternationally === 'Yes' && (!s5.countriesVisited.length || s5.countriesVisited.some(c => !c))) return false;
      if (s5.hasUSContact === 'Yes' && (!s5.usContactName || !s5.usContactAddress || !s5.usContactPhone || !s5.usContactEmail || !s5.usContactRelationship)) return false;
      return true;
    }
    case 5: {
      const s6 = data.step6;
      if (!s6.fatherFullName || !s6.fatherBirthDate || !s6.isFatherInUS || !s6.motherFullName || !s6.motherBirthDate || !s6.isMotherInUS || !s6.hasImmediateRelativesInUS) return false;
      if (s6.isFatherInUS === 'Yes' && !s6.fatherUSStatus) return false;
      if (s6.isMotherInUS === 'Yes' && !s6.motherUSStatus) return false;
      if (s6.hasImmediateRelativesInUS === 'Yes' && (!s6.immediateRelatives.length || s6.immediateRelatives.some(r => !r.fullName || !r.relationship || !r.status))) return false;
      return true;
    }
    case 6: {
      const s7 = data.step7;
      if (!s7.primaryOccupation || !s7.hasPreviousEmployment || !s7.hasHigherEducation) return false;
      if (['Employed', 'Student', 'Self-employed'].includes(s7.primaryOccupation) && (!s7.currentEmployerSchoolName || !s7.currentEmployerSchoolAddress || !s7.currentEmployerSchoolPhone || !s7.currentStartDate || !s7.currentDuties)) return false;
      if (['Employed', 'Self-employed'].includes(s7.primaryOccupation) && !s7.currentMonthlySalary) return false;
      if (s7.hasPreviousEmployment === 'Yes' && (!s7.previousEmployers.length || s7.previousEmployers.some(e => !e.employerName || !e.employerAddress || !e.supervisorName || !e.jobTitle || !e.startDate || !e.endDate || !e.duties))) return false;
      if (s7.hasHigherEducation === 'Yes' && (!s7.educationHistory.length || s7.educationHistory.some(e => !e.schoolName || !e.schoolAddress || !e.courseOfStudy || !e.startDate || !e.endDate))) return false;
      return true;
    }
    case 7: {
      const s8 = data.step8;
      if (!s8.disease || !s8.criminal || !s8.terrorism || !s8.fraud || !s8.deported) return false;
      if (s8.disease === 'Yes' && !s8.diseaseExplain) return false;
      if (s8.criminal === 'Yes' && !s8.criminalExplain) return false;
      if (s8.terrorism === 'Yes' && !s8.terrorismExplain) return false;
      if (s8.fraud === 'Yes' && !s8.fraudExplain) return false;
      if (s8.deported === 'Yes' && !s8.deportedExplain) return false;
      if (!s8.declarationAccepted || !s8.signature) return false;
      return true;
    }
    default:
      return false;
  }
};

const validateDs160Data = (data: Ds160Data): boolean => {
  for (let i = 0; i < 8; i++) {
    if (!isStepValid(data, i)) return false;
  }

  return true;
};

function Ds160FormContent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const { data } = useDs160();
  
  let maxAccessibleStep = 0;
  for (let i = 0; i < STEPS.length; i++) {
    if (isStepValid(data, i)) {
      maxAccessibleStep = i + 1;
    } else {
      break;
    }
  }
  maxAccessibleStep = Math.min(maxAccessibleStep, STEPS.length - 1);

  const prevStep = () => {
    setShowErrors(false);
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // Comprehensive validation across all conditional steps
  const isFormValid = validateDs160Data(data); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep !== STEPS.length - 1) {
      if (isStepValid(data, currentStep)) {
        setShowErrors(false);
        setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
      } else {
        setShowErrors(true);
      }
      return;
    }
    if (!isFormValid) {
      setShowErrors(true);
      return;
    }

    setIsSubmitting(true);
    
    try {
      await api.post('/ds160', data);
      setIsSuccess(true);
    } catch (error) {
      console.error("Erro ao enviar o formulário DS-160:", error);
      alert("Ocorreu um erro de comunicação ao enviar o formulário. Por favor, verifique sua conexão e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-secondary py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-light-gray p-10 rounded-3xl border border-accent-gold text-center shadow-lg">
          <CheckCircle className="mx-auto h-20 w-20 text-accent-gold" />
          <h2 className="mt-6 text-3xl font-extrabold text-primary">Formulário Recebido!</h2>
          <p className="mt-2 text-dark-gray">
            Seus dados foram enviados com segurança usando criptografia de ponta a ponta. 
            Nossos especialistas analisarão seu perfil e entrarão em contato em breve.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-primary mb-4">Formulário de Coleta DS-160</h1>
          <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 py-2 px-4 rounded-full inline-flex mx-auto">
            <ShieldCheck size={20} />
            <span className="text-sm font-medium">Ambiente Seguro & Criptografado de Ponta a Ponta</span>
          </div>
        </div>

        {/* Stepper Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-light-gray -z-10"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-accent-red -z-10 transition-all duration-500"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            ></div>
            
            {STEPS.map((step, index) => {
              const isAccessible = index <= maxAccessibleStep;
              return (
              <div 
                key={index} 
                className={`flex flex-col items-center ${isAccessible ? 'cursor-pointer group' : 'cursor-not-allowed opacity-50'}`} 
                onClick={() => {
                  if (isAccessible) {
                    setShowErrors(false);
                    setCurrentStep(index);
                  }
                }}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors duration-300 ${
                  index === currentStep ? 'bg-accent-red border-accent-gold text-white' : 
                  index < currentStep ? 'bg-accent-red border-accent-red text-white' :
                  isAccessible ? 'bg-white border-light-gray text-dark-gray group-hover:border-accent-gold/[0.5]' :
                  'bg-gray-100 border-gray-200 text-gray-400'
                }`}>
                  {index + 1}
                </div>
                <span className={`text-xs font-medium mt-2 hidden sm:block ${index === currentStep ? 'text-accent-red' : 'text-dark-gray'}`}>{step}</span>
              </div>
            )})}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white shadow-xl border border-light-gray rounded-3xl p-8 md:p-10">
          <form onSubmit={handleSubmit}>
            
            {currentStep === 0 && (
              <Step1PersonalInfo />
            )}

            {currentStep === 1 && (
              <Step2AddressContact />
            )}

            {currentStep === 2 && (
              <Step3Passport />
            )}

            {currentStep === 3 && (
              <Step4Travel />
            )}

            {currentStep === 4 && (
              <Step5History />
            )}

            {currentStep === 5 && (
              <Step6Family />
            )}

            {currentStep === 6 && (
              <Step7WorkEducation />
            )}

            {/* STEP 4: Review */}
            {currentStep === 7 && (
              <>
                <Step8Security />
                <h2 className="text-2xl font-bold text-primary border-b border-light-gray pb-4">Termos e Envio</h2>
                {!isFormValid && (
                  <div className="bg-red-50 p-4 rounded-xl text-red-600 text-sm font-medium border border-red-200">
                    ⚠️ Por favor, preencha todos os campos obrigatórios nas etapas anteriores para habilitar o envio.
                  </div>
                )}
                <div className="bg-light-gray p-6 rounded-2xl text-dark-gray text-sm space-y-4">
                  <p>
                    Ao enviar este formulário, você concorda que os dados fornecidos são verdadeiros e autoriza a <strong>VisareBR</strong> a utilizá-nos estritamente para o preenchimento da sua solicitação oficial consular (Formulário DS-160).
                  </p>
                  <p className="font-bold text-primary">
                    🔒 Suas informações são criptografadas e mantidas em sigilo absoluto de acordo com a LGPD.
                  </p>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            {showErrors && (
              <div className="mt-4 bg-red-50 p-4 rounded-xl text-red-600 text-sm font-medium border border-red-200">
                ⚠️ Por favor, preencha corretamente todos os campos obrigatórios desta etapa para continuar.
              </div>
            )}
            <div className="mt-6 pt-6 border-t border-light-gray flex justify-between">
              <button 
                type="button" 
                onClick={prevStep} 
                disabled={currentStep === 0}
                className="px-6 py-3 rounded-xl font-bold text-dark-gray hover:bg-light-gray transition-colors disabled:opacity-0 flex items-center gap-2"
              >
                <ChevronLeft size={20} /> Anterior
              </button>
              
              {currentStep < STEPS.length - 1 ? (
                <button type="submit" className="px-8 py-3 rounded-xl font-bold bg-primary text-secondary hover:bg-opacity-90 transition-colors flex items-center gap-2">
                  Próximo <ChevronRight size={20} />
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting || !isFormValid} className="px-8 py-3 rounded-xl font-bold bg-accent-red text-secondary hover:bg-opacity-90 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Enviando Seguro...' : 'Concluir e Enviar Seguro'} <ShieldCheck size={20} />
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default function Ds160Form() {
  // We wrap the form content in the Provider so the child steps can access the context
  return (
    <Ds160Provider>
      <Ds160FormContent />
    </Ds160Provider>
  );
}