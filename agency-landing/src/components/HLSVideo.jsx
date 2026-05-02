import { useEffect, useRef } from 'react';

export default function HLSVideo({ src, className = '', style = {}, desaturate = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryLoad = async () => {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.play().catch(() => {});
      } else {
        const Hls = (await import('hls.js')).default;
        if (Hls.isSupported()) {
          const hls = new Hls({ enableWorker: false, lowLatencyMode: true });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
          return () => hls.destroy();
        }
      }
    };
    tryLoad();
  }, [src]);

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      className={className}
      style={{ filter: desaturate ? 'saturate(0)' : undefined, ...style }}
    />
  );
}
