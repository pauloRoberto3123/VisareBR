import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, setAuthToken } from '../api/authService';
import { ShieldAlert } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login({ email, password });
      setAuthToken(res.data.accessToken);
      navigate('/admin');
    } catch (err) {
      setError('Credenciais inválidas. Verifique seu email e senha.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-light-gray py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-secondary p-10 rounded-2xl shadow-sm">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-accent-gold" />
          <h2 className="mt-6 text-3xl font-extrabold text-primary">Acesso Restrito</h2>
          <p className="mt-2 text-sm text-dark-gray">Painel Administrativo VisareBR</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg text-center">{error}</div>}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-primary rounded-t-md focus:outline-none focus:ring-accent-gold focus:border-accent-gold focus:z-10 sm:text-sm"
                placeholder="Endereço de Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-primary rounded-b-md focus:outline-none focus:ring-accent-gold focus:border-accent-gold focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-primary bg-accent-red hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-gold transition-colors disabled:bg-gray-300"
            >
              {loading ? 'Entrando...' : 'Entrar no Painel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
