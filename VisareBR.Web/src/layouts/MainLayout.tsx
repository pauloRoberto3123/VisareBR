import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WhatsAppButton from '../components/WhatsAppButton';
import { useSettings } from '../context/SettingsContext';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function MainLayout() {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <WhatsAppButton />
      
      <footer className="bg-primary text-secondary pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Brand column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="VisareBR Logo" className="h-20 w-auto filter invert brightness-0" />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Assessoria especializada em vistos americanos. Segurança, agilidade e alta taxa de aprovação para sua viagem aos Estados Unidos.
              </p>
            </div>

            {/* Links column */}
            <div>
              <h3 className="text-lg font-bold mb-6 text-accent-gold">Navegação</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-gray-400 hover:text-accent-gold transition-colors">Início</Link></li>
                <li><Link to="/vistos" className="text-gray-400 hover:text-accent-gold transition-colors">Tipos de Vistos</Link></li>
                <li><Link to="/como-funciona" className="text-gray-400 hover:text-accent-gold transition-colors">Passo a Passo</Link></li>
                <li><Link to="/precos" className="text-gray-400 hover:text-accent-gold transition-colors">Preços</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-accent-gold transition-colors">Blog</Link></li>
                <li><Link to="/avaliacoes" className="text-gray-400 hover:text-accent-gold transition-colors">Depoimentos</Link></li>
              </ul>
            </div>

            {/* Services column */}
            <div>
              <h3 className="text-lg font-bold mb-6 text-accent-gold">Serviços</h3>
              <ul className="space-y-3 text-gray-400">
                <li>Visto de Turismo (B2)</li>
                <li>Visto de Negócios (B1)</li>
                <li>Renovação de Visto</li>
                <li>Visto de Estudante (F1)</li>
                <li>Simulado de Entrevista</li>
              </ul>
            </div>

            {/* Contact column */}
            <div>
              <h3 className="text-lg font-bold mb-6 text-accent-gold">Contato</h3>
              <ul className="space-y-4">
                {settings?.whatsappNumber && (
                  <li className="flex items-center gap-3 text-gray-400">
                    <Phone size={18} className="text-accent-gold" />
                    <span>{settings.whatsappNumber}</span>
                  </li>
                )}
                {settings?.companyEmail && (
                  <li className="flex items-center gap-3 text-gray-400">
                    <Mail size={18} className="text-accent-gold" />
                    <span>{settings.companyEmail}</span>
                  </li>
                )}
                {settings?.address && (
                  <li className="flex items-start gap-3 text-gray-400">
                    <MapPin size={18} className="text-accent-gold mt-1" />
                    <span>{settings.address}</span>
                  </li>
                )}
              </ul>
            </div>

          </div>

          {/* Bottom strip */}
          <div className="border-t border-dark-gray pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <p>© {new Date().getFullYear()} VisareBR Assessoria de Vistos. Todos os direitos reservados.</p>
              {settings?.cnpj && <p className="mt-1">CNPJ: {settings.cnpj}</p>}
            </div>
            <div className="flex gap-6">
            <Link to="/admin" className="hover:text-accent-gold transition-colors">Área Restrita</Link>
              <Link to="/privacidade" className="hover:text-accent-gold transition-colors">Política de Privacidade</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
