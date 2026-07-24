import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Menu, X, Phone, Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { getArticles } from '../api/blogService';
import type { Article } from '../api/blogService';

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg 
    className="fill-current" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const announcements = [
  { text: "ATENDEMOS TODO O BRASIL", highlight: "TIRE SEU VISTO DE TURISTA AQUI!" },
  { text: "AGILIDADE E SEGURANÇA", highlight: "ASSESSORIA COMPLETA!" },
  { text: "+5000 CLIENTES SATISFEITOS", highlight: "ALTA TAXA DE APROVAÇÃO!" }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileVistosOpen, setIsMobileVistosOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [annoIndex, setAnnoIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownArticles, setDropdownArticles] = useState<Article[]>([]);
  
  const { settings, whatsappUrl } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();

  useEffect(() => {
    getArticles()
      .then((res: any) => {
        const featured = res.data.filter((art: any) => art.showInVisaDropdown);
        setDropdownArticles(featured);
      })
      .catch((err: any) => console.error("Error loading dropdown articles:", err));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnnoIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const formatPhoneNumber = (numStr?: string) => {
    if (!numStr) return '';
    const digits = numStr.replace(/\D/g, '');
    if (digits.length === 13 && digits.startsWith('55')) {
      const area = digits.slice(2, 4);
      const first = digits.slice(4, 9);
      const second = digits.slice(9);
      return `(${area}) ${first}-${second}`;
    }
    if (digits.length === 11) {
      const area = digits.slice(0, 2);
      const first = digits.slice(2, 7);
      const second = digits.slice(7);
      return `(${area}) ${first}-${second}`;
    }
    return numStr;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (location.pathname === '/blog') {
      setSearchParams({ search: searchQuery });
    } else {
      navigate(`/blog?search=${encodeURIComponent(searchQuery)}`);
    }
    setIsMobileSearchOpen(false);
  };

  return (
    <div className="w-full">
      {/* 1. TOP ANNOUNCEMENT BAR (Non-sticky, scrolls away) */}
      <div className="bg-primary text-secondary text-xs font-semibold py-2.5 px-4 select-none h-10 border-b border-white/5 relative z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
          <button 
            onClick={() => setAnnoIndex((prev) => (prev - 1 + announcements.length) % announcements.length)}
            className="text-secondary hover:text-accent-gold transition-colors p-1 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="flex-1 text-center transition-opacity duration-300 flex items-center justify-center gap-1">
            <span>🇧🇷 {announcements[annoIndex].text}</span>
            <span className="text-accent-gold font-bold">•</span>
            <span className="text-accent-gold font-extrabold uppercase tracking-wider">{announcements[annoIndex].highlight}</span>
          </div>

          <button 
            onClick={() => setAnnoIndex((prev) => (prev + 1) % announcements.length)}
            className="text-secondary hover:text-accent-gold transition-colors p-1 cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* STICKY CONTAINER FOR MAIN NAVIGATION & ACTIONS */}
      <nav className="sticky top-0 z-50 shadow-md">
        {/* 2. MIDDLE BRANDING & ACTIONS BAR */}
        <div className="bg-white py-3.5 border-b border-gray-100 relative z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0">
              <img src="/logo.png" alt="VisareBR Logo" className="h-14 md:h-16 w-auto brightness-0" />
            </Link>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Telephone Pill */}
              {settings?.whatsappNumber && (
                <a 
                  href={`tel:${settings.whatsappNumber.replace(/\D/g, '')}`}
                  className="flex items-center gap-2 bg-primary hover:bg-[#08274d] text-white font-bold px-5 py-2.5 rounded-full transition-colors text-sm shadow-sm"
                >
                  <Phone size={15} className="text-accent-gold animate-pulse" />
                  <span>{formatPhoneNumber(settings.whatsappNumber)}</span>
                </a>
              )}

              {/* WhatsApp Pill */}
              {settings?.whatsappNumber && (
                <a 
                  href={whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-5 py-2.5 rounded-full transition-colors text-sm shadow-sm"
                >
                  <WhatsAppIcon size={16} />
                  <span>{formatPhoneNumber(settings.whatsappNumber)}</span>
                </a>
              )}

              {/* Search Bar Pill */}
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Busque sobre vistos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border border-gray-300 rounded-full pl-4 pr-10 py-2.5 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-accent-gold w-48 xl:w-56 transition-all bg-slate-50 hover:bg-white"
                />
                <button type="submit" className="absolute right-3.5 text-primary hover:text-accent-gold cursor-pointer">
                  <Search size={16} />
                </button>
              </form>
            </div>

            {/* Mobile Actions Right */}
            <div className="flex lg:hidden items-center gap-2.5">
              {/* Tel Circle */}
              {settings?.whatsappNumber && (
                <a 
                  href={`tel:${settings.whatsappNumber.replace(/\D/g, '')}`}
                  className="p-2.5 bg-primary text-white rounded-full hover:bg-opacity-95 transition-colors shadow-sm"
                  title="Telefone"
                >
                  <Phone size={16} className="text-accent-gold" />
                </a>
              )}

              {/* WhatsApp Circle */}
              {settings?.whatsappNumber && (
                <a 
                  href={whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 bg-[#25D366] text-white rounded-full hover:bg-[#20ba5a] transition-colors shadow-sm"
                  title="WhatsApp"
                >
                  <WhatsAppIcon size={16} />
                </a>
              )}

              {/* Search Toggle */}
              <button 
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className={`p-2.5 rounded-full border transition-colors shadow-sm cursor-pointer ${
                  isMobileSearchOpen ? 'bg-accent-gold border-accent-gold text-primary' : 'bg-slate-50 border-gray-200 text-primary'
                }`}
                title="Buscar"
              >
                <Search size={16} />
              </button>

              {/* Burger Button */}
              <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="p-2 text-primary hover:text-accent-gold transition-colors cursor-pointer"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar Expansion */}
          {isMobileSearchOpen && (
            <div className="lg:hidden absolute top-full left-0 w-full bg-slate-50 border-b border-gray-200 px-4 py-3 z-40 shadow-inner animate-fade-in">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
                <input
                  type="text"
                  placeholder="Busque sobre vistos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border border-gray-300 rounded-full pl-4 pr-10 py-2 w-full text-sm text-primary focus:outline-none focus:ring-1 focus:ring-accent-gold bg-white"
                  autoFocus
                />
                <button type="submit" className="absolute right-3.5 text-primary hover:text-accent-gold cursor-pointer">
                  <Search size={16} />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* 3. RED SEPARATOR LINE */}
        <div className="bg-accent-red h-[3px] w-full relative z-20"></div>

        {/* 4. BOTTOM NAVIGATION LINKS BAR (Desktop only) */}
        <div className="bg-primary shadow-md relative z-10 hidden lg:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-8 h-12">
              {/* Home */}
              <Link to="/" className="text-secondary hover:text-accent-gold font-bold uppercase tracking-wider text-xs transition-colors">Início</Link>

              {/* Tipos de Vistos Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-1 text-secondary hover:text-accent-gold font-bold uppercase tracking-wider text-xs h-12 transition-colors cursor-pointer">
                  Tipos de Vistos Americanos <ChevronDown size={12} className="text-accent-gold" />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover:block bg-primary border-t-2 border-accent-gold rounded-b-xl shadow-lg py-2 w-64 z-50">
                  {dropdownArticles.length > 0 ? (
                    dropdownArticles.map((art) => (
                      <Link 
                        key={art.id}
                        to={`/blog/${art.slug}`} 
                        className="block px-4 py-2.5 text-secondary hover:bg-slate-800 hover:text-accent-gold transition-colors text-xs font-semibold uppercase tracking-wider border-b border-slate-800/40 last:border-b-0"
                      >
                        {art.title}
                      </Link>
                    ))
                  ) : (
                    <>
                      <Link to="/vistos#turismo" className="block px-4 py-2.5 text-secondary hover:bg-slate-800 hover:text-accent-gold transition-colors text-xs font-semibold uppercase tracking-wider border-b border-slate-800/40">Visto de Turismo (B2)</Link>
                      <Link to="/vistos#negocios" className="block px-4 py-2.5 text-secondary hover:bg-slate-800 hover:text-accent-gold transition-colors text-xs font-semibold uppercase tracking-wider border-b border-slate-800/40">Visto de Negócios (B1)</Link>
                      <Link to="/vistos#renovacao" className="block px-4 py-2.5 text-secondary hover:bg-slate-800 hover:text-accent-gold transition-colors text-xs font-semibold uppercase tracking-wider border-b border-slate-800/40">Renovação de Visto</Link>
                      <Link to="/vistos#estudante" className="block px-4 py-2.5 text-secondary hover:bg-slate-800 hover:text-accent-gold transition-colors text-xs font-semibold uppercase tracking-wider">Visto de Estudante (F1)</Link>
                    </>
                  )}
                </div>
              </div>

              {/* Passo a Passo */}
              <Link to="/como-funciona" className="text-secondary hover:text-accent-gold font-bold uppercase tracking-wider text-xs transition-colors">Passo a Passo</Link>

              {/* Preços */}
              <Link to="/precos" className="text-secondary hover:text-accent-gold font-bold uppercase tracking-wider text-xs transition-colors">Preços</Link>

              {/* DS-160 */}
              <Link to="/ds-160" className="text-secondary hover:text-accent-gold font-bold uppercase tracking-wider text-xs transition-colors">DS-160</Link>

              {/* Depoimentos */}
              <Link to="/avaliacoes" className="text-secondary hover:text-accent-gold font-bold uppercase tracking-wider text-xs transition-colors">Depoimentos</Link>

              {/* Artigos */}
              <Link to="/blog" className="text-secondary hover:text-accent-gold font-bold uppercase tracking-wider text-xs transition-colors">Artigos</Link>

              {/* Contato (WhatsApp) */}
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-accent-gold font-bold uppercase tracking-wider text-xs transition-colors">Contato</a>
            </div>
          </div>
        </div>

        {/* 5. MOBILE EXPANDED MENU */}
        {isOpen && (
          <div className="lg:hidden bg-primary border-t border-dark-gray/30 py-4 relative z-20 shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="px-4 space-y-2">
              <Link to="/" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-secondary hover:bg-slate-800 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors">Início</Link>
              
              {/* Mobile Dropdown Collapsible for Vistos */}
              <div className="space-y-1">
                <button 
                  onClick={() => setIsMobileVistosOpen(!isMobileVistosOpen)}
                  className="w-full flex items-center justify-between px-4 py-2 text-secondary hover:bg-slate-800 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <span>Tipos de Vistos</span>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${isMobileVistosOpen ? 'rotate-180 text-accent-gold' : 'text-secondary'}`} />
                </button>
                
                {isMobileVistosOpen && (
                  <div className="pl-6 space-y-1 bg-slate-900/40 py-2 rounded-lg">
                    {dropdownArticles.length > 0 ? (
                      dropdownArticles.map((art) => (
                        <Link 
                          key={art.id}
                          to={`/blog/${art.slug}`}
                          onClick={() => setIsOpen(false)} 
                          className="block px-4 py-2 text-secondary hover:text-accent-gold text-xs font-semibold uppercase tracking-wider transition-colors"
                        >
                          {art.title}
                        </Link>
                      ))
                    ) : (
                      <>
                        <Link to="/vistos#turismo" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-secondary hover:text-accent-gold text-xs font-semibold uppercase tracking-wider transition-colors">Visto de Turismo (B2)</Link>
                        <Link to="/vistos#negocios" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-secondary hover:text-accent-gold text-xs font-semibold uppercase tracking-wider transition-colors">Visto de Negócios (B1)</Link>
                        <Link to="/vistos#renovacao" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-secondary hover:text-accent-gold text-xs font-semibold uppercase tracking-wider transition-colors">Renovação de Visto</Link>
                        <Link to="/vistos#estudante" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-secondary hover:text-accent-gold text-xs font-semibold uppercase tracking-wider transition-colors">Visto de Estudante (F1)</Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Link to="/como-funciona" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-secondary hover:bg-slate-800 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors">Passo a Passo</Link>
              <Link to="/precos" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-secondary hover:bg-slate-800 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors">Preços</Link>
              <Link to="/ds-160" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-secondary hover:bg-slate-800 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors">DS-160</Link>
              <Link to="/avaliacoes" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-secondary hover:bg-slate-800 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors">Depoimentos</Link>
              <Link to="/blog" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-secondary hover:bg-slate-800 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors">Artigos</Link>
              <a href={whatsappUrl} onClick={() => setIsOpen(false)} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-accent-gold hover:bg-slate-800 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors">Contato</a>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
