import { ArrowUpRight } from 'lucide-react';
import BlurText from './BlurText';
import HLSVideo from './HLSVideo';

const SRC = 'https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8';

export default function StartSection() {
  return (
    <section id="services" className="relative overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* HLS Background */}
      <HLSVideo src={SRC} className="absolute inset-0 w-full h-full object-cover" />

      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none z-10" style={{ height: '200px', background: 'linear-gradient(to bottom, black, transparent)' }} />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-10" style={{ height: '200px', background: 'linear-gradient(to top, black, transparent)' }} />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-6 py-32" style={{ minHeight: '500px' }}>
        <span className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white mb-6" style={{ fontFamily: "'Barlow', sans-serif" }}>
          How It Works
        </span>

        <h2
          className="text-4xl md:text-5xl lg:text-6xl italic text-white tracking-tight leading-[0.9] max-w-2xl mb-6"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          <BlurText text="You dream it. We ship it." delay={150} />
        </h2>

        <p className="text-white/60 text-sm md:text-base max-w-md mb-10 leading-relaxed" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300 }}>
          Share your vision. Our AI handles the rest—wireframes, design, code, launch.
          All in days, not quarters.
        </p>

        <button className="liquid-glass-strong rounded-full px-6 py-3 text-white text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-colors" style={{ fontFamily: "'Barlow', sans-serif" }}>
          Get Started <ArrowUpRight size={16} />
        </button>
      </div>
    </section>
  );
}
