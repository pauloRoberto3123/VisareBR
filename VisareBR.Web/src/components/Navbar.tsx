import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Menu, X, Search, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { getArticles } from '../api/blogService';
import type { Article } from '../api/blogService';

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg 
    height={size} 
    viewBox="0 0 24 24" 
    width={size} 
    xmlns="http://www.w3.org/2000/svg" 
    style={{ display: "block" }}
  > 
    <path d="m20.52 3.449c-2.28-2.204-5.28-3.449-8.475-3.449-9.17 0-14.928 9.935-10.349 17.838l-1.696 6.162 6.335-1.652c2.76 1.491 5.021 1.359 5.716 1.447 10.633 0 15.926-12.864 8.454-20.307z" fill="#eceff1"></path> 
    <path d="m12.067 21.751-.006-.001h-.016c-3.182 0-5.215-1.507-5.415-1.594l-3.75.975 1.005-3.645-.239-.375c-.99-1.576-1.516-3.391-1.516-5.26 0-8.793 10.745-13.19 16.963-6.975 6.203 6.15 1.848 16.875-7.026 16.875z" fill="#4caf50"></path> 
    <path d="m17.507 14.307-.009.075c-.301-.15-1.767-.867-2.04-.966-.613-.227-.44-.036-1.617 1.312-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.293-.506.32-.578.878-1.634.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.576-.05-.997-.042-1.368.344-1.614 1.774-1.207 3.604.174 5.55 2.714 3.552 4.16 4.206 6.804 5.114.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345z" fill="#fafafa"></path> 
  </svg>
);


export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileVistosOpen, setIsMobileVistosOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownArticles, setDropdownArticles] = useState<Article[]>([]);
  const [othersDropdownArticles, setOthersDropdownArticles] = useState<Article[]>([]);
  const [isMobileOthersOpen, setIsMobileOthersOpen] = useState(false);

  const { settings, whatsappUrl } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();

  useEffect(() => {
    getArticles()
      .then((res: any) => {
        const featured = res.data.filter((art: any) => art.showInVisaDropdown);
        const others = res.data.filter((art: any) => art.showInOthersDropdown);
        setDropdownArticles(featured);
        setOthersDropdownArticles(others);
      })
      .catch((err: any) => console.error("Error loading dropdown articles:", err));
  }, []);





  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (location.pathname === '/artigos') {
      setSearchParams({ search: searchQuery });
    } else {
      navigate(`/artigos?search=${encodeURIComponent(searchQuery)}`);
    }
    setIsMobileSearchOpen(false);
  };

  return (
    <div className="w-full">
      {/* STICKY CONTAINER FOR MAIN NAVIGATION & ACTIONS */}
      <nav className="sticky top-0 z-50 shadow-md bg-primary border-b border-white/10">
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-8">

            {/* Logo (Left) */}
            <Link to="/" className="flex items-center shrink-0">
              <img src="/logo.png" alt="VisareBR Logo" className="h-12 md:h-14 w-auto brightness-0 invert" />
            </Link>

            {/* Navigation links (Center - Desktop only) */}
            <div className="hidden lg:flex items-center lg:gap-3 xl:gap-6">
              {/* Home */}
              <Link to="/" className="text-slate-100 hover:text-accent-gold font-bold uppercase tracking-wider lg:text-[11px] xl:text-xs whitespace-nowrap transition-colors">Início</Link>

              {/* Serviços */}
              <Link to="/servicos" className="text-slate-100 hover:text-accent-gold font-bold uppercase tracking-wider lg:text-[11px] xl:text-xs whitespace-nowrap transition-colors">Serviços</Link>

              {/* Quem Somos */}
              <Link to="/quem-somos" className="text-slate-100 hover:text-accent-gold font-bold uppercase tracking-wider lg:text-[11px] xl:text-xs whitespace-nowrap transition-colors">Quem Somos</Link>

              {/* Tipos de Vistos Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-1 text-slate-100 hover:text-accent-gold font-bold uppercase tracking-wider lg:text-[11px] xl:text-xs whitespace-nowrap h-20 transition-colors cursor-pointer">
                  Tipos de Vistos Americano <ChevronDown size={12} className="text-slate-200 group-hover:text-accent-gold transition-colors" />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 top-[80%] hidden group-hover:block bg-primary border border-white/10 rounded-b-xl shadow-lg py-2 w-64 z-50">
                  {dropdownArticles.length > 0 ? (
                    dropdownArticles.map((art) => (
                      <Link
                        key={art.id}
                        to={`/artigos/${art.slug}`}
                        className="block px-4 py-2.5 text-slate-100 hover:bg-white/5 hover:text-accent-gold transition-colors text-xs font-semibold uppercase tracking-wider border-b border-white/5 last:border-b-0"
                      >
                        {art.title}
                      </Link>
                    ))
                  ) : (
                    <>
                      <Link to="/vistos#turismo" className="block px-4 py-2.5 text-slate-100 hover:bg-white/5 hover:text-accent-gold transition-colors text-xs font-semibold uppercase tracking-wider border-b border-white/5">Visto de Turismo (B2)</Link>
                      <Link to="/vistos#negocios" className="block px-4 py-2.5 text-slate-100 hover:bg-white/5 hover:text-accent-gold transition-colors text-xs font-semibold uppercase tracking-wider border-b border-white/5">Visto de Negócios (B1)</Link>
                      <Link to="/vistos#renovacao" className="block px-4 py-2.5 text-slate-100 hover:bg-white/5 hover:text-accent-gold transition-colors text-xs font-semibold uppercase tracking-wider border-b border-white/5">Renovação de Visto</Link>
                      <Link to="/vistos#estudante" className="block px-4 py-2.5 text-slate-100 hover:bg-white/5 hover:text-accent-gold transition-colors text-xs font-semibold uppercase tracking-wider">Visto de Estudante (F1)</Link>
                    </>
                  )}
                </div>
              </div>

              {/* Vistos de Outros Países Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-1 text-slate-100 hover:text-accent-gold font-bold uppercase tracking-wider lg:text-[11px] xl:text-xs whitespace-nowrap h-20 transition-colors cursor-pointer">
                  Vistos de Outros Países <ChevronDown size={12} className="text-slate-200 group-hover:text-accent-gold transition-colors" />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 top-[80%] hidden group-hover:block bg-primary border border-white/10 rounded-b-xl shadow-lg py-2 w-64 z-50">
                  {othersDropdownArticles.length > 0 ? (
                    othersDropdownArticles.map((art) => (
                      <Link
                        key={art.id}
                        to={`/artigos/${art.slug}`}
                        className="block px-4 py-2.5 text-slate-100 hover:bg-white/5 hover:text-accent-gold transition-colors text-xs font-semibold uppercase tracking-wider border-b border-white/5 last:border-b-0"
                      >
                        {art.title}
                      </Link>
                    ))
                  ) : (
                    <>
                      <Link to="/vistos#canada" className="block px-4 py-2.5 text-slate-100 hover:bg-white/5 hover:text-accent-gold transition-colors text-xs font-semibold uppercase tracking-wider border-b border-white/5 animate-fade-in">Visto Canadense</Link>
                      <Link to="/vistos#europa" className="block px-4 py-2.5 text-slate-100 hover:bg-white/5 hover:text-accent-gold transition-colors text-xs font-semibold uppercase tracking-wider border-b border-white/5">Visto Europeu (Schengen)</Link>
                      <Link to="/vistos#australia" className="block px-4 py-2.5 text-slate-100 hover:bg-white/5 hover:text-accent-gold transition-colors text-xs font-semibold uppercase tracking-wider border-b border-white/5">Visto Australiano</Link>
                      <Link to="/vistos#japao" className="block px-4 py-2.5 text-slate-100 hover:bg-white/5 hover:text-accent-gold transition-colors text-xs font-semibold uppercase tracking-wider">Visto Japonês</Link>
                    </>
                  )}
                </div>
              </div>

              {/* Nossos Clientes */}
              <Link to="/nossos-clientes" className="text-slate-100 hover:text-accent-gold font-bold uppercase tracking-wider lg:text-[11px] xl:text-xs whitespace-nowrap transition-colors">Nossos Clientes</Link>

              {/* Artigos */}
              <Link to="/artigos" className="text-slate-100 hover:text-accent-gold font-bold uppercase tracking-wider lg:text-[11px] xl:text-xs whitespace-nowrap transition-colors">Artigos</Link>

              {/* Dúvidas */}
              <Link to="/duvidas" className="text-slate-100 hover:text-accent-gold font-bold uppercase tracking-wider lg:text-[11px] xl:text-xs whitespace-nowrap transition-colors">Dúvidas</Link>

              {/* Contato */}
              <Link to="/contato" className="text-slate-100 hover:text-accent-gold font-bold uppercase tracking-wider lg:text-[11px] xl:text-xs whitespace-nowrap transition-colors">Contato</Link>
            </div>

            {/* Desktop Action: WhatsApp Button (Right - Desktop only) */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Search Bar Pill */}
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Busque sobre vistos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border border-white/20 rounded-full pl-4 pr-10 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-accent-gold lg:w-28 xl:w-40 transition-all bg-white/10 hover:bg-white/15"
                />
                <button type="submit" className="absolute right-3 text-slate-300 hover:text-accent-gold cursor-pointer">
                  <Search size={14} />
                </button>
              </form>

              {settings?.whatsappNumber && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-5 py-2.5 rounded-full transition-colors text-xs shadow-sm uppercase tracking-wider"
                >
                  <WhatsAppIcon size={14} />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>

            {/* Mobile Actions Right */}
            <div className="flex lg:hidden items-center gap-2">
              {/* WhatsApp Circle */}
              {settings?.whatsappNumber && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#25D366] text-white rounded-full hover:bg-[#20ba5a] transition-colors shadow-sm"
                  title="WhatsApp"
                >
                  <WhatsAppIcon size={16} />
                </a>
              )}

              {/* Search Toggle */}
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className={`p-2 rounded-full border transition-colors shadow-sm cursor-pointer ${isMobileSearchOpen ? 'bg-accent-gold border-accent-gold text-primary' : 'bg-white/10 border-white/10 text-white'
                  }`}
                title="Buscar"
              >
                <Search size={16} />
              </button>

              {/* Burger Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-white hover:text-accent-gold transition-colors cursor-pointer"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        {isMobileSearchOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-slate-50 border-b border-gray-200 px-4 py-3 z-40 shadow-inner">
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

        {/* Mobile Menu Panel */}
        {isOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 py-4 absolute top-full left-0 w-full z-50 shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="px-4 space-y-2">
              <Link to="/" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-slate-800 hover:bg-slate-50 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors">Início</Link>

              {/* Mobile Dropdown Collapsible for Vistos */}
              {/* Tipos de Vistos Americano Dropdown */}
              <div className="space-y-1">
                <button
                  onClick={() => setIsMobileVistosOpen(!isMobileVistosOpen)}
                  className="w-full flex items-center justify-between px-4 py-2 text-slate-800 hover:bg-slate-50 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <span>Tipos de Vistos Americano</span>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${isMobileVistosOpen ? 'rotate-180 text-accent-gold' : 'text-slate-800'}`} />
                </button>

                {isMobileVistosOpen && (
                  <div className="pl-6 space-y-1 bg-slate-50 py-2 rounded-lg">
                    {dropdownArticles.length > 0 ? (
                      dropdownArticles.map((art) => (
                        <Link
                          key={art.id}
                          to={`/artigos/${art.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="block px-4 py-2 text-slate-700 hover:text-accent-gold text-xs font-semibold uppercase tracking-wider transition-colors"
                        >
                          {art.title}
                        </Link>
                      ))
                    ) : (
                      <>
                        <Link to="/vistos#turismo" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-slate-700 hover:text-accent-gold text-xs font-semibold uppercase tracking-wider transition-colors">Visto de Turismo (B2)</Link>
                        <Link to="/vistos#negocios" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-slate-700 hover:text-accent-gold text-xs font-semibold uppercase tracking-wider transition-colors">Visto de Negócios (B1)</Link>
                        <Link to="/vistos#renovacao" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-slate-700 hover:text-accent-gold text-xs font-semibold uppercase tracking-wider transition-colors">Renovação de Visto</Link>
                        <Link to="/vistos#estudante" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-slate-700 hover:text-accent-gold text-xs font-semibold uppercase tracking-wider transition-colors">Visto de Estudante (F1)</Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Vistos de Outros Países Dropdown */}
              <div className="space-y-1">
                <button
                  onClick={() => setIsMobileOthersOpen(!isMobileOthersOpen)}
                  className="w-full flex items-center justify-between px-4 py-2 text-slate-800 hover:bg-slate-50 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <span>Vistos de Outros Países</span>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${isMobileOthersOpen ? 'rotate-180 text-accent-gold' : 'text-slate-800'}`} />
                </button>

                {isMobileOthersOpen && (
                  <div className="pl-6 space-y-1 bg-slate-50 py-2 rounded-lg">
                    {othersDropdownArticles.length > 0 ? (
                      othersDropdownArticles.map((art) => (
                        <Link
                          key={art.id}
                          to={`/artigos/${art.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="block px-4 py-2 text-slate-700 hover:text-accent-gold text-xs font-semibold uppercase tracking-wider transition-colors"
                        >
                          {art.title}
                        </Link>
                      ))
                    ) : (
                      <>
                        <Link to="/vistos#canada" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-slate-700 hover:text-accent-gold text-xs font-semibold uppercase tracking-wider transition-colors">Visto Canadense</Link>
                        <Link to="/vistos#europa" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-slate-700 hover:text-accent-gold text-xs font-semibold uppercase tracking-wider transition-colors">Visto Europeu (Schengen)</Link>
                        <Link to="/vistos#australia" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-slate-700 hover:text-accent-gold text-xs font-semibold uppercase tracking-wider transition-colors">Visto Australiano</Link>
                        <Link to="/vistos#japao" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-slate-700 hover:text-accent-gold text-xs font-semibold uppercase tracking-wider transition-colors">Visto Japonês</Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Link to="/servicos" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-slate-800 hover:bg-slate-50 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors">Serviços</Link>
              <Link to="/quem-somos" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-slate-800 hover:bg-slate-50 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors">Quem Somos</Link>
              <Link to="/nossos-clientes" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-slate-800 hover:bg-slate-50 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors">Nossos Clientes</Link>
              <Link to="/duvidas" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-slate-800 hover:bg-slate-50 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors">Dúvidas</Link>
              <Link to="/artigos" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-slate-800 hover:bg-slate-50 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors">Artigos</Link>
              <Link to="/contato" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-accent-gold hover:bg-slate-50 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors">Contato</Link>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
