import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import api from '../api/blogService';

export default function WhatsAppButton() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    api.get('/settings')
      .then(res => setSettings(res.data))
      .catch(() => {});
  }, []);

  if (!settings?.whatsappNumber) return null;

  const url = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(settings.whatsappDefaultMessage)}`;

  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-110 flex items-center justify-center"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle size={32} />
    </a>
  );
}
