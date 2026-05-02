import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import HLSVideo from './HLSVideo';
import BlurText from './BlurText';

const SRC = 'https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8';

export default function CtaFooter() {
  return (
    <section id="contact" className="relative overflow-hidden">
      {/* HLS BG */}
      <HLSVideo src={SRC} className="absolute inset-0 w-full h-full object-cover" />

      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none z-10" style={{ height: '200px', background: 'linear-gradient(to bottom, black, transparent)' }} />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-10" style={{ height: '200px', background: 'linear-gradient(to top, black, transparent)' }} />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-6 py-40">
        <h2
          className="text-5xl md:text-6xl lg:text-7xl italic text-white leading-[0.85] max-w-3xl mb-6"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          <BlurText text="Your next website starts here." delay={130} />
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-white/60 text-sm md:text-base max-w-md mb-10 leading-relaxed"
          style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300 }}
        >
          Book a free strategy call. See what AI-powered design can do.
          No commitment, no pressure. Just possibilities.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex items-center gap-4"
        >
          <button className="liquid-glass-strong rounded-full px-6 py-3 text-white text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-colors" style={{ fontFamily: "'Barlow', sans-serif" }}>
            Book a Call <ArrowUpRight size={16} />
          </button>
          <button className="bg-white text-black rounded-full px-6 py-3 text-sm font-semibold hover:bg-white/90 transition-colors" style={{ fontFamily: "'Barlow', sans-serif" }}>
            View Pricing
          </button>
        </motion.div>

        {/* Footer */}
        <div className="mt-32 pt-8 border-t border-white/10 w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-white/40 text-xs" style={{ fontFamily: "'Barlow', sans-serif" }}>
            © 2026 Studio. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Contact'].map((link) => (
              <a
                key={link}
                href="#"
                className="text-white/40 text-xs hover:text-white/70 transition-colors"
                style={{ fontFamily: "'Barlow', sans-serif" }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
