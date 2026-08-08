import { ShieldCheck, CheckCircle2, MessageSquare, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { getCarouselItems } from '../api/carouselService';
import type { CarouselItem } from '../api/carouselService';
import { getEvaluations } from '../api/blogService';
import type { Evaluation } from '../api/blogService';
import YoutubeSection from '../components/YoutubeSection';

export default function Home() {
  const { whatsappUrl, settings } = useSettings();
  const [slides, setSlides] = useState<CarouselItem[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    getCarouselItems()
      .then(res => {
        setSlides(res.data);
      })
      .catch(err => console.error("Error fetching slides:", err));

    getEvaluations()
      .then((res: any) => {
        setEvaluations(res.data);
      })
      .catch(err => console.error("Error fetching evaluations:", err));
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides]);

  return (
    <div className="flex flex-col">
      {/* Carousel or Hero Section */}
      {slides.length > 0 ? (
        <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-primary group">
          <div className="w-full h-full relative">
            {slides.map((slide, index) => {
              const isActive = index === currentSlide;
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                >
                  {/* Background Image */}
                  <img
                    src={slide.imageUrl}
                    alt={slide.title || 'Slide Image'}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay layer to ensure text readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/60 to-transparent"></div>

                  {/* Overlay Text Content */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                      <div className="max-w-2xl text-left text-white space-y-4 md:space-y-6">
                        {slide.title && (
                          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight animate-fade-in">
                            {slide.title}
                          </h1>
                        )}
                        {slide.subtitle && (
                          <p className="text-base md:text-xl text-secondary/90 max-w-lg leading-relaxed">
                            {slide.subtitle}
                          </p>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                          {slide.linkUrl ? (
                            slide.linkUrl.startsWith('http') ? (
                              <a
                                href={slide.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-accent-red text-secondary px-8 py-3.5 rounded-lg font-bold text-base hover:bg-opacity-95 transition-all text-center flex items-center justify-center gap-2 shadow-lg"
                              >
                                Solicitar Agora
                              </a>
                            ) : (
                              <Link
                                to={slide.linkUrl}
                                className="bg-accent-red text-secondary px-8 py-3.5 rounded-lg font-bold text-base hover:bg-opacity-95 transition-all text-center flex items-center justify-center gap-2 shadow-lg"
                              >
                                Solicitar Agora
                              </Link>
                            )
                          ) : (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-accent-red text-secondary px-8 py-3.5 rounded-lg font-bold text-base hover:bg-opacity-95 transition-all text-center flex items-center justify-center gap-2 shadow-lg"
                            >
                              Solicitar via WhatsApp
                            </a>
                          )}
                          <Link
                            to="/servicos"
                            className="bg-transparent text-white border-2 border-white/80 px-8 py-3.5 rounded-lg font-bold text-base hover:bg-white hover:text-primary transition-all text-center"
                          >
                            Ver tipos de vistos
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slider Controls (Chevron Left / Right) */}
          {slides.length > 1 && (
            <>
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 p-2.5 rounded-full transition duration-300 opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
                title="Slide Anterior"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 p-2.5 rounded-full transition duration-300 opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
                title="Próximo Slide"
              >
                <ChevronRight size={24} />
              </button>

              {/* Slider Dots indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${idx === currentSlide ? 'bg-accent-gold w-6' : 'bg-white/50 hover:bg-white'
                      }`}
                    title={`Ir para Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      ) : (
        <section className="relative bg-light-gray py-20 lg:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="lg:w-2/3">
              <h1 className="text-4xl md:text-6xl font-extrabold text-primary leading-tight mb-6">
                Sua aprovação do <span className="text-accent-gold">Visto Americano</span> começa aqui.
              </h1>
              <p className="text-xl text-dark-gray mb-10 max-w-2xl">
                Assessoria especializada para vistos de turismo, negócios e renovação.
                Processo simplificado, seguro e com acompanhamento completo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href={whatsappUrl} className="bg-accent-red text-secondary px-8 py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all text-center flex items-center justify-center gap-2">
                  Solicitar via WhatsApp
                </a>
                <Link to="/servicos" className="bg-secondary text-primary border-2 border-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-light-gray transition-all text-center">
                  Ver tipos de vistos
                </Link>
              </div>
            </div>
          </div>
          {/* Abstract shapes to mimic the reference site */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary opacity-5 -skew-x-12 translate-x-20"></div>
        </section>
      )}

      {/* Features/Stats Section */}
      <section className="py-20 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-light-gray p-4 rounded-2xl mb-6">
                <CheckCircle2 className="w-10 h-10 text-accent-gold" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-primary">{settings?.metric1Value || '+5000'}</h3>
              <p className="text-dark-gray">{settings?.metric1Label || 'Vistos Aprovados'}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-light-gray p-4 rounded-2xl mb-6">
                <ShieldCheck className="w-10 h-10 text-accent-gold" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-primary">{settings?.metric2Value || '98%'}</h3>
              <p className="text-dark-gray">{settings?.metric2Label || 'Índice de Sucesso'}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-light-gray p-4 rounded-2xl mb-6">
                <MessageSquare className="w-10 h-10 text-accent-gold" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-primary">{settings?.metric3Value || 'Suporte 24/7'}</h3>
              <p className="text-dark-gray">{settings?.metric3Label || 'Atendimento Especializado'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* YouTube Channel Videos Section */}
      <YoutubeSection />

      {/* Testimonials Preview (Emulating the reference) */}
      <section className="py-20 bg-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">O que dizem nossos clientes</h2>
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 fill-accent-gold text-accent-gold" />)}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(evaluations.length > 0 ? evaluations.slice(0, 3) : [
              { userName: 'Ana Paula Moreira', comment: 'Experiência excelente com a VisareBR! Renovei meu visto com total tranquilidade. Atendimento claro e rápido.' },
              { userName: 'Carolina Reese', comment: 'Tive meu visto aprovado sem transtorno. Os meninos foram incríveis e prestativos em todo o processo.' },
              { userName: 'Isabela Clebis', comment: 'A assessoria foi impecável do início ao fim. Me orientaram em cada etapa, não tive nenhuma preocupação.' }
            ]).map((ev: any, idx: number) => (
              <div 
                key={idx} 
                className={`bg-secondary p-8 rounded-2xl shadow-sm border ${
                  idx === 1 ? 'border-t-4 border-accent-gold border-x-light-gray border-b-light-gray' : 'border-light-gray'
                }`}
              >
                <p className="text-dark-gray italic mb-6">"{ev.comment}"</p>
                <div className="font-bold text-primary">{ev.userName}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/nossos-clientes" className="text-accent-gold font-bold hover:underline">Ver todas as avaliações →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}


