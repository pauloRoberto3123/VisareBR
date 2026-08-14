import { useEffect, useState } from 'react';
import { Play, X, RotateCw } from 'lucide-react';
import api from '../api/blogService';
import { useSettings } from '../context/SettingsContext';

const YoutubeIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25a29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
  </svg>
);

interface YoutubeVideo {
  videoId: string;
  title: string;
  published: string;
  videoUrl: string;
  thumbnailUrl: string;
}

export default function YoutubeSection() {
  const { settings } = useSettings();
  const [videos, setVideos] = useState<YoutubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<YoutubeVideo | null>(null);
  const [isModalVertical, setIsModalVertical] = useState(false);

  useEffect(() => {
    if (activeVideo) {
      const isShort = activeVideo.title.toLowerCase().includes('#shorts') || 
                      activeVideo.title.toLowerCase().includes('#short') || 
                      activeVideo.videoUrl.includes('/shorts/');
      setIsModalVertical(isShort);
    }
  }, [activeVideo]);

  useEffect(() => {
    api.get<YoutubeVideo[]>('/youtube/videos')
      .then((res) => {
        setVideos(res.data);
      })
      .catch((err) => {
        console.error('Error fetching YouTube videos:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="w-10 h-10 border-4 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-primary font-bold">Carregando vídeos do YouTube...</span>
        </div>
      </section>
    );
  }

  // If no videos are returned (i.e. channel ID is not configured or error occurred), hide the section
  if (videos.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-gradient-to-b from-primary to-primary-dark text-secondary relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-xs uppercase tracking-widest mb-4">
            <YoutubeIcon size={16} /> Canal Oficial
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
            Dicas & Conteúdos no <span className="text-red-500">YouTube</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            Assista aos nossos vídeos mais recentes com dicas práticas, passo a passo e atualizações importantes sobre vistos americanos.
          </p>
        </div>

        {/* Video Grid optimized for YouTube Shorts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
          {videos.map((video) => {
            const isShort = video.title.toLowerCase().includes('#shorts') || video.title.toLowerCase().includes('#short') || video.videoUrl.includes('/shorts/');
            return (
              <button
                key={video.videoId}
                onClick={() => setActiveVideo(video)}
                className="group text-left bg-[#1e293b]/40 backdrop-blur-sm rounded-2xl border border-[#334155]/30 overflow-hidden hover:border-red-500/30 transition-all duration-300 flex flex-col shadow-lg hover:shadow-2xl hover:-translate-y-1 w-full cursor-pointer"
              >
                {/* Dynamic Aspect Ratio Thumbnail Container */}
                <div className={`relative w-full overflow-hidden bg-black ${isShort ? 'aspect-[9/16]' : 'aspect-[16/9]'}`}>
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className={`w-full h-full object-cover transition-transform duration-500 ${isShort ? 'scale-[1.35] group-hover:scale-[1.42]' : 'scale-100 group-hover:scale-105'}`}
                    loading="lazy"
                  />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-90 group-hover:bg-black/25 transition-colors">
                    <div className="w-12 h-12 bg-red-600 group-hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                      <Play size={20} className="fill-current translate-x-0.5" />
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4 flex flex-col flex-1 bg-slate-900/50 w-full">
                  <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug group-hover:text-red-400 transition-colors flex-1 mb-2">
                    {video.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(video.published).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Link to Channel */}
        <div className="text-center mt-12">
          <a
            href={
              settings?.youtubeChannelId 
                ? (settings.youtubeChannelId.trim().startsWith('@') 
                    ? `https://www.youtube.com/${settings.youtubeChannelId.trim()}` 
                    : `https://www.youtube.com/channel/${settings.youtubeChannelId.trim()}`)
                : 'https://www.youtube.com'
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-3.5 rounded-2xl transition-all duration-300 shadow-md uppercase tracking-wider text-xs"
          >
            <YoutubeIcon size={16} /> Ir para o Canal do YouTube
          </a>
        </div>

      </div>

      {/* Lightbox Modal */}
      {activeVideo && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveVideo(null)}
        >
          {/* Modal Container */}
          <div 
            className={`relative bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-300 ${
              isModalVertical
                ? 'max-w-[360px] aspect-[9/16] w-full'
                : 'max-w-4xl aspect-[16/9] w-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-50 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full transition-colors cursor-pointer border border-white/10 flex items-center justify-center"
              title="Fechar"
            >
              <X size={20} />
            </button>

            {/* Toggle Aspect Ratio Button */}
            <button 
              onClick={() => setIsModalVertical(!isModalVertical)}
              className="absolute top-4 left-4 z-50 bg-black/60 hover:bg-black/90 text-white p-2.5 rounded-full transition-colors cursor-pointer border border-white/10 flex items-center justify-center"
              title="Girar / Mudar Orientação do Vídeo"
            >
              <RotateCw size={16} />
            </button>

            {/* Iframe */}
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1&rel=0`}
              title={activeVideo.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </section>
  );
}
