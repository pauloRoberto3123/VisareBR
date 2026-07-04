import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { whatsappUrl } = useSettings();

  return (
    <nav className="bg-primary shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="VisareBR Logo" className="h-10 w-auto" />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-secondary hover:text-accent-gold font-medium transition-colors">Início</Link>
            <Link to="/vistos" className="text-secondary hover:text-accent-gold font-medium transition-colors">Vistos</Link>
            <Link to="/como-funciona" className="text-secondary hover:text-accent-gold font-medium transition-colors">Passo a Passo</Link>
            <Link to="/precos" className="text-secondary hover:text-accent-gold font-medium transition-colors">Preços</Link>
            <Link to="/blog" className="text-secondary hover:text-accent-gold font-medium transition-colors">Artigos</Link>
            <Link to="/ds-160" className="text-secondary hover:text-accent-gold font-medium transition-colors">DS-160</Link>
            <Link to="/avaliacoes" className="text-secondary hover:text-accent-gold font-medium transition-colors">Depoimentos</Link>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="bg-accent-red text-secondary font-bold px-6 py-2 rounded-full hover:bg-opacity-90 transition-colors">Falar com Especialista</a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-secondary">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-primary border-t border-dark-gray pb-4">
          <div className="px-2 pt-2 space-y-1">
            <Link to="/" className="block px-3 py-2 text-secondary hover:bg-dark-gray rounded-md">Início</Link>
            <Link to="/vistos" className="block px-3 py-2 text-secondary hover:bg-dark-gray rounded-md">Vistos</Link>
            <Link to="/como-funciona" className="block px-3 py-2 text-secondary hover:bg-dark-gray rounded-md">Passo a Passo</Link>
            <Link to="/precos" className="block px-3 py-2 text-secondary hover:bg-dark-gray rounded-md">Preços</Link>
            <Link to="/blog" className="block px-3 py-2 text-secondary hover:bg-dark-gray rounded-md">Artigos</Link>
            <Link to="/ds-160" className="block px-3 py-2 text-secondary hover:bg-dark-gray rounded-md">DS-160</Link>
            <Link to="/avaliacoes" className="block px-3 py-2 text-secondary hover:bg-dark-gray rounded-md">Depoimentos</Link>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block px-3 py-2 text-accent-gold font-bold">Falar com Especialista</a>
          </div>
        </div>
      )}
    </nav>
  );
}
