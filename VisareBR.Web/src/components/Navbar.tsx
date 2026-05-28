import { Link } from 'react-router-dom';
import { Menu, X, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">VISARE<span className="text-blue-600">BR</span></span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">Início</Link>
            <Link to="/vistos" className="text-gray-700 hover:text-blue-600 font-medium">Vistos</Link>
            <Link to="/como-funciona" className="text-gray-700 hover:text-blue-600 font-medium">Passo a Passo</Link>
            <Link to="/blog" className="text-gray-700 hover:text-blue-600 font-medium">Blog</Link>
            <Link to="/avaliacoes" className="text-gray-700 hover:text-blue-600 font-medium">Depoimentos</Link>
            <Link to="/contato" className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors">Falar com Especialista</Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 pb-4">
          <div className="px-2 pt-2 space-y-1">
            <Link to="/" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md">Início</Link>
            <Link to="/vistos" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md">Vistos</Link>
            <Link to="/como-funciona" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md">Passo a Passo</Link>
            <Link to="/blog" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md">Blog</Link>
            <Link to="/avaliacoes" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md">Depoimentos</Link>
            <Link to="/contato" className="block px-3 py-2 text-blue-600 font-bold">Falar com Especialista</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
