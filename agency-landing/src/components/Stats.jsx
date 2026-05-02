import { motion } from 'motion/react';
import HLSVideo from './HLSVideo';

const SRC = 'https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8';

const STATS = [
  { value: '200+', label: 'Sites launched' },
  { value: '98%', label: 'Client satisfaction' },
  { value: '3.2x', label: 'More conversions' },
  { value: '5 days', label: 'Average delivery' },
];

export default function Stats() {
  return (
    <section id="pricing" className="relative overflow-hidden py-32 px-6">
      {/* HLS BG (desaturated) */}
      <HLSVideo src={SRC} className="absolute inset-0 w-full h-full object-cover" desaturate />

      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none z-10" style={{ height: '200px', background: 'linear-gradient(to bottom, black, transparent)' }} />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-10" style={{ height: '200px', background: 'linear-gradient(to top, black, transparent)' }} />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-20 liquid-glass rounded-3xl p-12 md:p-16 max-w-5xl mx-auto"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 text-center">
          {STATS.map((stat, i) => (
            <div key={i} className="flex flex-col gap-2">
              <span
                className="text-4xl md:text-5xl lg:text-6xl italic text-white"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {stat.value}
              </span>
              <span
                className="text-white/60 text-sm"
                style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300 }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
