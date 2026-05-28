import { MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function WhatsAppButton() {
  const { whatsappUrl, settings } = useSettings();

  if (!settings?.whatsappNumber) return null;

  return (
    <a 
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-110 flex items-center justify-center"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle size={32} />
    </a>
  );
}
