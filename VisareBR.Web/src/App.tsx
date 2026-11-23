import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import './App.css';
import api from './api/blogService';
import { useSettings } from './context/SettingsContext';

// Lazy-loaded pages for optimal Mobile PageSpeed bundle splitting
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Evaluations = lazy(() => import('./pages/Evaluations'));
const Services = lazy(() => import('./pages/Services'));
const StepByStep = lazy(() => import('./pages/StepByStep'));
const Ds160Form = lazy(() => import('./pages/Ds160Form'));
const PricingSection = lazy(() => import('./pages/PricingSection'));
const ServicesList = lazy(() => import('./pages/ServicesList'));
const FaqList = lazy(() => import('./pages/FaqList'));
const Contact = lazy(() => import('./pages/Contact'));
const ProfileEvaluation = lazy(() => import('./pages/ProfileEvaluation'));
const VisaMatcher = lazy(() => import('./pages/VisaMatcher'));

// Declarations for Google Analytics global window variables
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

// Dynamic Google Analytics Tag manager loader and route tracker (reuses SettingsContext and defers GTM load)
function GoogleAnalyticsTracker() {
  const location = useLocation();
  const { settings } = useSettings();
  const gaId = settings?.googleAnalyticsId || null;

  useEffect(() => {
    if (!gaId) return;

    const timer = setTimeout(() => {
      const scriptId = 'google-analytics-script';
      const existingScript = document.getElementById(scriptId);

      if (!existingScript) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function (...args: unknown[]) {
          window.dataLayer.push(args);
        };
        window.gtag('js', new Date());
        window.gtag('config', gaId, {
          page_path: window.location.pathname + window.location.search,
        });

        const script = document.createElement('script');
        script.id = scriptId;
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [gaId]);

  useEffect(() => {
    if (gaId && typeof window.gtag === 'function') {
      window.gtag('config', gaId, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location, gaId]);

  return null;
}

// Interceptor Global do Axios para tratar 401 Unauthorized (Token JWT Expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isLoginRequest = error.config && error.config.url && error.config.url.includes('/identity/login');
      const isLoginPage = window.location.pathname === '/login';

      if (!isLoginRequest && !isLoginPage) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Simple guard to check for token
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Guard to prevent logged-in users from seeing the login page
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (token) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

const PageLoader = () => (
  <div className="py-20 text-center text-primary font-medium">Carregando...</div>
);

function App() {
  return (
    <BrowserRouter>
      <GoogleAnalyticsTracker />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="artigos" element={<BlogList />} />
            <Route path="artigos/:slug" element={<BlogPost />} />
            <Route
              path="login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route
              path="admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="vistos" element={<Services />} />
            <Route path="quem-somos" element={<StepByStep />} />
            <Route path="nossos-clientes" element={<Evaluations />} />
            <Route path="ds-160" element={<Ds160Form />} />
            <Route path="precos" element={<PricingSection />} />
            <Route path="servicos" element={<ServicesList />} />
            <Route path="duvidas" element={<FaqList />} />
            <Route path="contato" element={<Contact />} />
            <Route path="avaliacao-de-perfil" element={<ProfileEvaluation />} />
            <Route path="avaliacao-de-perfil.html" element={<ProfileEvaluation />} />
            <Route path="qual-visto-combina" element={<VisaMatcher />} />
            <Route path="qual-visto-combina.html" element={<VisaMatcher />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
