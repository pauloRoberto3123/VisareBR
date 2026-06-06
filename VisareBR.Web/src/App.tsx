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
import './App.css';

// Simple guard to check for token
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="blog" element={<BlogList />} />
          <Route path="blog/:id" element={<BlogPost />} />
          <Route path="login" element={<Login />} />
                    <Route path="admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="vistos" element={<Services />} />
          <Route path="como-funciona" element={<StepByStep />} />
          <Route path="avaliacoes" element={<Evaluations />} />
          <Route path="ds-160" element={<Ds160Form />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
