import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const HeroCarousel: React.FC = () => {
  const { banners } = useApp();
  const activeBanners = banners.filter(b => {
    if (!b.enabled) return false;
    const now = new Date();
    const start = new Date(b.startDate);
    const end = new Date(b.endDate);
    return now >= start && now <= end;
  }).sort((a, b) => a.order - b.order);

  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<any>(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (activeBanners.length === 0) return;

    const currentBanner = activeBanners[currentIndex];
    const duration = (currentBanner?.slideshowTimer || 5) * 1000;

    timerRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % activeBanners.length);
    }, duration);
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, activeBanners.length]);

  if (activeBanners.length === 0) {
    return null; // Don't show carousel if no active banners
  }

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % activeBanners.length);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        height: '420px',
        overflow: 'hidden',
        borderRadius: '20px',
        margin: '20px 0',
        boxShadow: 'var(--glass-shadow)'
      }}
      className="hero-carousel-container"
    >
      {/* Slides wrapper */}
      <div 
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {activeBanners.map((banner) => (
          <a
            key={banner.id}
            href={banner.redirectLink}
            style={{
              flex: '0 0 100%',
              width: '100%',
              height: '100%',
              position: 'relative',
              display: 'block',
              textDecoration: 'none'
            }}
          >
            {/* Dark background overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(8, 10, 16, 0.95) 10%, rgba(8, 10, 16, 0.2) 60%)',
              zIndex: 1
            }} />
            
            <img 
              src={banner.imageUrl} 
              alt={banner.title} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            
            {/* Banner description overlay */}
            <div 
              style={{
                position: 'absolute',
                bottom: '40px',
                left: '40px',
                right: '40px',
                zIndex: 2,
                color: 'white',
                maxWidth: '600px'
              }}
              className="animate-slide"
            >
              <h2 style={{
                fontSize: '32px',
                lineHeight: 1.2,
                marginBottom: '12px',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}>
                {banner.title}
              </h2>
              <div 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 16px',
                  borderRadius: '30px',
                  background: 'var(--gradient-blue)',
                  fontSize: '13px',
                  fontWeight: 600,
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
                }}
              >
                Shop Now &rarr;
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Manual Arrows */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            style={{
              position: 'absolute',
              top: '50%',
              left: '20px',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            className="carousel-control"
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <ChevronLeft size={24} />
          </button>
          
          <button
            onClick={handleNext}
            style={{
              position: 'absolute',
              top: '50%',
              right: '20px',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            className="carousel-control"
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {activeBanners.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          gap: '8px'
        }}>
          {activeBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              style={{
                border: 'none',
                width: index === currentIndex ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: index === currentIndex ? 'var(--primary)' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
