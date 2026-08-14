import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', 
});

export interface ArticleBlock {
  id?: number;
  articleId?: number;
  order: number;
  type: 'text' | 'image' | 'video' | 'button' | 'recommendation';
  // Text block
  content?: string;
  // Image block
  imageUrl?: string;
  altText?: string;
  // Video block
  sourceUrl?: string;
  embedData?: string;
  // Button block
  label?: string;
  targetUrl?: string;
  hexColorCode?: string;
  // Recommendation block
  recommendedArticleIds?: number[];
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  readTimeMinutes: number;
  featuredImageUrl: string;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  contentBlocks: ArticleBlock[];
  createdAt: string;
  updatedAt?: string;
  author?: {
    fullName: string;
  };
  authorName?: string;
  showInVisaDropdown?: boolean;
  showInOthersDropdown?: boolean;
}

export interface Evaluation {
  id: number;
  userName: string;
  comment: string;
  rating: number;
  createdAt: string;
  isApproved: boolean;
}

export interface Ds160Submission {
  id: number;
  applicantName: string;
  email: string;
  passportNumber: string;
  jsonData: string;
  createdAt: string;
  isReviewed: boolean;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
  category: string;
}

export const getArticles = () => api.get<Article[]>('/blog');
export const getArticleBySlug = (slug: string) => api.get<Article>(`/blog/${slug}`);
export const getEvaluations = () => api.get<Evaluation[]>('/evaluations');
export const submitEvaluation = (evaluation: { userName: string; comment: string; rating: number }) => 
  api.post('/evaluations', evaluation);

export const getFaqs = () => api.get<FaqItem[]>('/faqs');
export const getAdminFaqs = () => api.get<FaqItem[]>('/faqs/admin-all');

export default api;
