import { useEffect, useRef, useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

const LazyImage = ({ src, alt, className, placeholder, onError }: LazyImageProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!imageRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(imageRef.current);

    return () => observer.disconnect();
  }, [src]);

  const handleLoad = () => setIsLoaded(true);

  return (
    <img
      ref={imageRef}
      src={isVisible ? src : placeholder || ''}
      alt={alt}
      className={`${className ?? ''} lazy-image ${isLoaded ? 'loaded' : 'loading'}`.trim()}
      loading="lazy"
      decoding="async"
      onLoad={handleLoad}
      onError={onError}
    />
  );
};

export default LazyImage;
