import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/blogService';

interface SiteSettings {
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  companyEmail: string;
  address: string;
  cnpj: string;
  youtubeChannelId?: string;
  metric1Value?: string;
  metric1Label?: string;
  metric2Value?: string;
  metric2Label?: string;
  metric3Value?: string;
  metric3Label?: string;
}

interface SettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
  whatsappUrl: string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/settings')
      .then(res => setSettings(res.data))
      .catch(err => console.error("Error loading settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const whatsappUrl = settings 
    ? `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(settings.whatsappDefaultMessage)}`
    : '#';

  return (
    <SettingsContext.Provider value={{ settings, loading, whatsappUrl }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
