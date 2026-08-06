import api from './blogService';

export interface CarouselItem {
  id: number;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  linkUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export const getCarouselItems = () => api.get<CarouselItem[]>('/carousel');
export const getAllCarouselItems = () => api.get<CarouselItem[]>('/carousel/all');
export const createCarouselItem = (data: Partial<CarouselItem>) => api.post<CarouselItem>('/carousel', data);
export const updateCarouselItem = (id: number, data: Partial<CarouselItem>) => api.put(`/carousel/${id}`, data);
export const deleteCarouselItem = (id: number) => api.delete(`/carousel/${id}`);
export const toggleCarouselItem = (id: number, isActive: boolean) => api.put(`/carousel/${id}/toggle?isActive=${isActive}`);
export const reorderCarouselItems = (ids: number[]) => api.put('/carousel/reorder', ids);
