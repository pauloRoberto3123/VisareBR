import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Evaluations from './pages/Evaluations';
import Services from './pages/Services';
import StepByStep from './pages/StepByStep';
import Ds160Form from './pages/Ds160Form';
import PricingSection from './pages/PricingSection';
import ServicesList from './pages/ServicesList';
import FaqList from './pages/FaqList';
import Contact from './pages/Contact';
import './App.css';
import api from './api/blogService';

// Interceptor Global do Axios para tratar 401 Unauthorized (Token JWT Expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
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

function App() {
  return (
    <BrowserRouter>
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
                    <Route path="admin" 
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

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
