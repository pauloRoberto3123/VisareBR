import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WhatsAppButton from '../components/WhatsAppButton';
import { useSettings } from '../context/SettingsContext';

export default function MainLayout() {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50"> 
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <WhatsAppButton />
      
      <footer className="bg-black text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Brand column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-8 w-8 text-gray-400" /> 
                <span className="text-2xl font-bold text-white">VISARE<span className="text-gray-400">BR</span></span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Assessoria especializada em vistos americanos. Segurança, agilidade e alta taxa de aprovação para sua viagem aos Estados Unidos.
              </p>
            </div>

            {/* Links column */}
            <div>
              <h3 className="text-lg font-bold mb-6">Navegação</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-gray-400 hover:text-gray-200 transition-colors">Início</Link></li>
                <li><Link to="/vistos" className="text-gray-400 hover:text-gray-200 transition-colors">Tipos de Vistos</Link></li>
                <li><Link to="/como-funciona" className="text-gray-400 hover:text-gray-200 transition-colors">Passo a Passo</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-gray-200 transition-colors">Blog</Link></li>
                <li><Link to="/avaliacoes" className="text-gray-400 hover:text-gray-200 transition-colors">Depoimentos</Link></li>
              </ul>
            </div>

            {/* Services column */}
            <div>
              <h3 className="text-lg font-bold mb-6">Serviços</h3>
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
              <h3 className="text-lg font-bold mb-6">Contato</h3>
              <ul className="space-y-4">
                {settings?.whatsappNumber && (
                  <li className="flex items-center gap-3 text-gray-400">
                    <Phone size={18} className="text-gray-400" />
                    <span>{settings.whatsappNumber}</span>
                  </li>
                )}
                {settings?.companyEmail && (
                  <li className="flex items-center gap-3 text-gray-400">
                    <Mail size={18} className="text-gray-400" />
                    <span>{settings.companyEmail}</span>
                  </li>
                )}
                {settings?.address && (
                  <li className="flex items-start gap-3 text-gray-400">
                    <MapPin size={18} className="text-gray-400 mt-1" />
                    <span>{settings.address}</span>
                  </li>
                )}
              </ul>
            </div>

          </div>

          {/* Bottom strip */}
          <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <p>© {new Date().getFullYear()} VisareBR Assessoria de Vistos. Todos os direitos reservados.</p>
              {settings?.cnpj && <p className="mt-1">CNPJ: {settings.cnpj}</p>}
            </div>
            <div className="flex gap-6">
              <Link to="/login" className="hover:text-gray-200 transition-colors">Área Restrita</Link>
              <a href="#" className="hover:text-gray-200 transition-colors">Política de Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
