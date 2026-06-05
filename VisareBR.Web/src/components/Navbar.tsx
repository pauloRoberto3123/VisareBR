import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; // Removed ShieldCheck from here
import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { whatsappUrl } = useSettings();

  return (
    <nav className="bg-secondary shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              {/* Updated Logo: Using image directly */}

              <img src="/logo.png" alt="VisareBR Logo" className="h-2 w-auto" />
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-primary hover:text-accent-gold font-medium">Início</Link>
            <Link to="/vistos" className="text-primary hover:text-accent-gold font-medium">Vistos</Link>
            <Link to="/como-funciona" className="text-primary hover:text-accent-gold font-medium">Passo a Passo</Link>
            <Link to="/blog" className="text-primary hover:text-accent-gold font-medium">Blog</Link>
            <Link to="/avaliacoes" className="text-primary hover:text-accent-gold font-medium">Depoimentos</Link>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="bg-primary text-secondary px-6 py-2 rounded-full hover:bg-dark-gray transition-colors">Falar com Especialista</a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-primary">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-secondary border-t border-gray-100 pb-4">
          <div className="px-2 pt-2 space-y-1">
            <Link to="/" className="block px-3 py-2 text-primary hover:bg-light-gray rounded-md">Início</Link>
            <Link to="/vistos" className="block px-3 py-2 text-primary hover:bg-light-gray rounded-md">Vistos</Link>
            <Link to="/como-funciona" className="block px-3 py-2 text-primary hover:bg-light-gray rounded-md">Passo a Passo</Link>
            <Link to="/blog" className="block px-3 py-2 text-primary hover:bg-light-gray rounded-md">Blog</Link>
            <Link to="/avaliacoes" className="block px-3 py-2 text-primary hover:bg-light-gray rounded-md">Depoimentos</Link>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block px-3 py-2 text-accent-gold font-bold">Falar com Especialista</a>
          </div>
        </div>
      )}
    </nav>
  );
}



