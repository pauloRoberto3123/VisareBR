import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface SocialMediaProfile {
  platform: string;
  identifier: string;
}

export interface TravelCompanion {
  fullName: string;
  relationship: string;
}

export interface USRelative {
  fullName: string;
  relationship: string;
  status: string;
}

export interface PreviousEmployer {
  employerName: string;
  employerAddress: string;
  supervisorName: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  duties: string;
}

export interface Education {
  schoolName: string; schoolAddress: string; courseOfStudy: string; startDate: string; endDate: string;
}

export interface Ds160Data {
  step1: {
    fullName: string;
    nativeName: string;
    usedOtherNames: string; // 'Yes' | 'No' | ''
    otherNames: string;
    telecodeName: string;
    gender: string;
    maritalStatus: string;
    maritalStatusExplain: string;
    birthDate: string;
    birthCity: string;
    birthState: string;
    birthCountry: string;
    otherNationality: string;
    otherNationalityCountry: string;
    otherPassportNumber: string;
    cpf: string;
    rg: string;
    rgIssuer: string;
  };
  step2: {
    homeAddress: string;
    homeCity: string;
    homeState: string;
    homeZip: string;
    homeCountry: string;
    sameMailingAddress: string; // 'Yes' | 'No' | ''
    mailingAddress: string;
    primaryPhone: string;
    workPhone: string;
    hasAdditionalPhone: string;
    additionalPhones: string;
    primaryEmail: string;
    hasSocialMedia: string;
    socialMediaProfiles: SocialMediaProfile[];
  };
  step3: {
    passportType: string;
    passportNumber: string;
    passportIssuerCountry: string;
    passportIssuerCity: string;
    passportIssuerState: string;
    passportIssueDate: string;
    passportExpiryDate: string;
    hasPreviousPassport: string;
    previousPassportNumber: string;
    previousPassportIssuerCountry: string;
    previousPassportIssueDate: string;
    previousPassportExpiryDate: string;
    hasLostPassport: string;
    lostPassportExplanation: string;
    passportPhotoBase64?: string;
  };
  step4: {
    consularPost: string;
    tripPurpose: string;
    hasSpecificTravelPlans: string;
    intendedArrivalDate: string;
    intendedStayLength: string;
    usAddressStreet: string;
    usAddressCity: string;
    usAddressState: string;
    usAddressZip: string;
    payingParty: string; // 'Self' | 'Other' | 'Company'
    payingPartyName: string;
    payingPartyPhone: string;
    payingPartyEmail: string;
    payingPartyRelationship: string;
    payingPartySameAddress: string;
    hasTravelCompanions: string;
    travelCompanionsGroup: string;
    travelCompanions: TravelCompanion[];
  };
  step5: {
    hasBeenToUS: string;
    lastUSVisitDate: string;
    lastUSVisitLength: string;
    hasUSVisa: string;
    usVisaNumber: string;
    usVisaIssueDate: string;
    usVisaExpiryDate: string;
    hasRefusedUSVisa: string;
    refusedUSVisaExplanation: string;
    hasImmigrationPetition: string;
    immigrationPetitionExplanation: string;
    hasTraveledInternationally: string;
    countriesVisited: string[];
    hasUSContact: string;
    usContactName: string;
    usContactAddress: string;
    usContactPhone: string;
    usContactEmail: string;
    usContactRelationship: string;
  };
  step6: {
    fatherFullName: string; fatherBirthDate: string; isFatherInUS: string; fatherUSStatus: string;
    motherFullName: string; motherBirthDate: string; isMotherInUS: string; motherUSStatus: string;
    hasImmediateRelativesInUS: string; immediateRelatives: USRelative[]; hasOtherRelativesInUS: string;
  };
  step7: {
    primaryOccupation: string;
    currentEmployerSchoolName: string; currentEmployerSchoolAddress: string; currentEmployerSchoolPhone: string;
    currentStartDate: string; currentMonthlySalary: string; currentDuties: string;
    hasPreviousEmployment: string;
    previousEmployers: PreviousEmployer[];
    hasHigherEducation: string;
    educationHistory: Education[];
    languagesSpoken: string[];
    professionalOrganizations: string;
    hasSpecialSkills: string;
    specialSkillsExplanation: string;
    hasMilitaryService: string;
    militaryCountry: string; militaryBranch: string; militaryRank: string; militarySpecialty: string; militaryStartDate: string; militaryEndDate: string;
  };
  step8: {
    disease: string; diseaseExplain: string;
    criminal: string; criminalExplain: string;
    terrorism: string; terrorismExplain: string;
    fraud: string; fraudExplain: string;
    deported: string; deportedExplain: string;
    declarationAccepted: boolean;
    signature: string;
  };
}

const initialState: Ds160Data = {
  step1: {
    fullName: '', nativeName: '', usedOtherNames: '', otherNames: '', telecodeName: '',
    gender: '', maritalStatus: '', maritalStatusExplain: '', birthDate: '', birthCity: '',
    birthState: '', birthCountry: '', otherNationality: '', otherNationalityCountry: '',
    otherPassportNumber: '', cpf: '', rg: '', rgIssuer: ''
  },
  step2: {
    homeAddress: '', homeCity: '', homeState: '', homeZip: '', homeCountry: '',
    sameMailingAddress: '', mailingAddress: '', primaryPhone: '', workPhone: '',
    hasAdditionalPhone: '', additionalPhones: '', primaryEmail: '', hasSocialMedia: '',
    socialMediaProfiles: []
  },
  step3: {
    passportType: '', passportNumber: '', passportIssuerCountry: '', passportIssuerCity: '', passportIssuerState: '',
    passportIssueDate: '', passportExpiryDate: '', hasPreviousPassport: '', previousPassportNumber: '', 
    previousPassportIssuerCountry: '', previousPassportIssueDate: '', previousPassportExpiryDate: '', hasLostPassport: '', lostPassportExplanation: '',
    passportPhotoBase64: ''
  },
  step4: {
    consularPost: '', tripPurpose: 'B2', hasSpecificTravelPlans: '', intendedArrivalDate: '', intendedStayLength: '', usAddressStreet: '',
    usAddressCity: '', usAddressState: '', usAddressZip: '', payingParty: '', payingPartyName: '', payingPartyPhone: '', payingPartyEmail: '',
    payingPartyRelationship: '', payingPartySameAddress: '', hasTravelCompanions: '', travelCompanionsGroup: '', travelCompanions: []
  },
  step5: {
    hasBeenToUS: '', lastUSVisitDate: '', lastUSVisitLength: '', hasUSVisa: '', usVisaNumber: '', usVisaIssueDate: '', usVisaExpiryDate: '',
    hasRefusedUSVisa: '', refusedUSVisaExplanation: '', hasImmigrationPetition: '', immigrationPetitionExplanation: '',
    hasTraveledInternationally: '', countriesVisited: [], hasUSContact: '', usContactName: '', usContactAddress: '', usContactPhone: '', usContactEmail: '', usContactRelationship: ''
  },
  step6: {
    fatherFullName: '', fatherBirthDate: '', isFatherInUS: '', fatherUSStatus: '', motherFullName: '', motherBirthDate: '', isMotherInUS: '', motherUSStatus: '', hasImmediateRelativesInUS: '', immediateRelatives: [], hasOtherRelativesInUS: ''
  },
  step7: {
    primaryOccupation: '', currentEmployerSchoolName: '', currentEmployerSchoolAddress: '', currentEmployerSchoolPhone: '', currentStartDate: '', currentMonthlySalary: '', currentDuties: '', hasPreviousEmployment: '', previousEmployers: [], hasHigherEducation: '', educationHistory: [], languagesSpoken: [], professionalOrganizations: '', hasSpecialSkills: '', specialSkillsExplanation: '', hasMilitaryService: '', militaryCountry: '', militaryBranch: '', militaryRank: '', militarySpecialty: '', militaryStartDate: '', militaryEndDate: ''
  },
  step8: {
    disease: '', diseaseExplain: '', criminal: '', criminalExplain: '', terrorism: '', terrorismExplain: '', fraud: '', fraudExplain: '', deported: '', deportedExplain: '', declarationAccepted: false, signature: ''
  }
};

interface Ds160ContextType {
  data: Ds160Data;
  updateStepData: <K extends keyof Ds160Data>(step: K, fields: Partial<Ds160Data[K]>) => void;
}

const Ds160Context = createContext<Ds160ContextType | undefined>(undefined);

export function Ds160Provider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Ds160Data>(initialState);

  const updateStepData = <K extends keyof Ds160Data>(step: K, fields: Partial<Ds160Data[K]>) => {
    setData((prev) => ({
      ...prev,
      [step]: { ...prev[step], ...fields }
    }));
  };

  return (
    <Ds160Context.Provider value={{ data, updateStepData }}>
      {children}
    </Ds160Context.Provider>
  );
}

export function useDs160() {
  const context = useContext(Ds160Context);
  if (!context) throw new Error("useDs160 must be used within a Ds160Provider");
  return context;
}