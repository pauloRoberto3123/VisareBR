import { useState } from 'react';
import { ChevronRight, ChevronLeft, ShieldCheck, CheckCircle } from 'lucide-react';
import api from '../api/blogService';

const STEPS = [
  'Dados Pessoais',
  'Passaporte e Viagem',
  'Contato',
  'Revisão e Envio'
];

export default function Ds160Form() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    maritalStatus: '',
    birthDate: '',
    passportNumber: '',
    passportIssueDate: '',
    passportExpiryDate: '',
    tripPurpose: 'B2',
    email: '',
    phone: '',
    address: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  // Check if all fields in formData have a value
  const isFormValid = Object.values(formData).every(val => val.trim() !== '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep !== STEPS.length - 1) {
      nextStep();
      return;
    }
    if (!isFormValid) return;

    setIsSubmitting(true);
    
    try {
      await api.post('/ds160', formData);
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
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-accent-gold -z-10 transition-all duration-500"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            ></div>
            
            {STEPS.map((step, index) => (
              <div key={index} className="flex flex-col items-center cursor-pointer group" onClick={() => setCurrentStep(index)}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors duration-300 ${
                  index <= currentStep ? 'bg-accent-gold border-accent-gold text-white' : 'bg-white border-light-gray text-dark-gray group-hover:border-accent-gold/[0.5]'
                }`}>
                  {index + 1}
                </div>
                <span className="text-xs font-medium mt-2 text-dark-gray hidden sm:block">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white shadow-xl border border-light-gray rounded-3xl p-8 md:p-10">
          <form onSubmit={handleSubmit}>
            
            {/* STEP 1: Personal Data */}
            {currentStep === 0 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-primary border-b border-light-gray pb-4">Dados Pessoais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">Nome(s) (First Name)</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-gold" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">Sobrenome(s) (Surnames)</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-gold" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">Data de Nascimento</label>
                    <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-gold" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">Estado Civil</label>
                    <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-gold bg-white">
                      <option value="">Selecione...</option>
                      <option value="single">Solteiro(a)</option>
                      <option value="married">Casado(a)</option>
                      <option value="divorced">Divorciado(a)</option>
                      <option value="widowed">Viúvo(a)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Passport & Travel */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-primary border-b border-light-gray pb-4">Passaporte e Viagem</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">Número do Passaporte</label>
                    <input type="text" name="passportNumber" value={formData.passportNumber} onChange={handleInputChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-gold" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">Propósito da Viagem</label>
                    <select name="tripPurpose" value={formData.tripPurpose} onChange={handleInputChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-gold bg-white">
                      <option value="B2">Turismo / Férias (B2)</option>
                      <option value="B1">Negócios (B1)</option>
                      <option value="F1">Estudante (F1)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">Data de Emissão</label>
                    <input type="date" name="passportIssueDate" value={formData.passportIssueDate} onChange={handleInputChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-gold" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">Data de Expiração</label>
                    <input type="date" name="passportExpiryDate" value={formData.passportExpiryDate} onChange={handleInputChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-gold" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Contact Info */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-primary border-b border-light-gray pb-4">Informações de Contato</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">E-mail</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-gold" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">Telefone / WhatsApp</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-gold" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary mb-1">Endereço Completo</label>
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full p-3 border border-dark-gray rounded-xl focus:ring-2 focus:ring-accent-gold" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Review */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
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
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-10 pt-6 border-t border-light-gray flex justify-between">
              <button 
                type="button" 
                onClick={prevStep} 
                disabled={currentStep === 0}
                className="px-6 py-3 rounded-xl font-bold text-dark-gray hover:bg-light-gray transition-colors disabled:opacity-0 flex items-center gap-2"
              >
                <ChevronLeft size={20} /> Anterior
              </button>
              
              {currentStep < STEPS.length - 1 ? (
                <button type="button" onClick={nextStep} className="px-8 py-3 rounded-xl font-bold bg-primary text-secondary hover:bg-opacity-90 transition-colors flex items-center gap-2">
                  Próximo <ChevronRight size={20} />
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting || !isFormValid} className="px-8 py-3 rounded-xl font-bold bg-accent-gold text-primary hover:bg-opacity-90 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
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