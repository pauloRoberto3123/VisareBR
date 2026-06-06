import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', 
});

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  summary: string;
  imageUrl?: string;
  createdAt: string;
  author?: {
    fullName: string;
  };
}

export interface Evaluation {
  id: number;
  userName: string;
  comment: string;
  rating: number;
  createdAt: string;
  isApproved: boolean;
}

export const getPosts = () => api.get<BlogPost[]>('/blog');
export const getPost = (id: number) => api.get<BlogPost>(`/blog/${id}`);
export const getEvaluations = () => api.get<Evaluation[]>('/evaluations');
export const submitEvaluation = (evaluation: { userName: string; comment: string; rating: number }) => 
  api.post('/evaluations', evaluation);

export default api;
