import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import BlurText from './BlurText';

const GIF_1 = 'https://motionsites.ai/assets/hero-finlytic-preview-CV9g0FHP.gif';
const GIF_2 = 'https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif';

const ROWS = [
  {
    title: 'Designed to convert. Built to perform.',
    body: 'Every pixel is intentional. Our AI studies what works across thousands of top sites—then builds yours to outperform them all.',
    cta: 'Learn more',
    gif: GIF_1,
    reverse: false,
  },
  {
    title: 'It gets smarter. Automatically.',
    body: 'Your site evolves on its own. AI monitors every click, scroll, and conversion—then optimizes in real time. No manual updates. Ever.',
    cta: 'See how it works',
    gif: GIF_2,
    reverse: true,
  },
];

export default function FeaturesChess() {
  return (
    <section id="work" className="py-24 px-6 lg:px-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-20">
        <span className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white mb-6" style={{ fontFamily: "'Barlow', sans-serif" }}>
          Capabilities
        </span>
        <h2
          className="text-4xl md:text-5xl lg:text-6xl italic text-white tracking-tight leading-[0.9]"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          <BlurText text="Pro features. Zero complexity." delay={120} />
        </h2>
      </div>

      {/* Alternating rows */}
      <div className="flex flex-col gap-24">
        {ROWS.map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className={`flex flex-col md:flex-row ${row.reverse ? 'md:flex-row-reverse' : ''} items-center gap-12`}
          >
            {/* Text */}
            <div className="flex-1 flex flex-col gap-6">
              <h3
                className="text-3xl md:text-4xl italic text-white leading-tight tracking-tight"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {row.title}
              </h3>
              <p className="text-white/60 text-sm md:text-base leading-relaxed" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300 }}>
                {row.body}
              </p>
              <button className="liquid-glass-strong self-start rounded-full px-5 py-2.5 text-white text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-colors" style={{ fontFamily: "'Barlow', sans-serif" }}>
                {row.cta} <ArrowUpRight size={14} />
              </button>
            </div>

            {/* GIF */}
            <div className="flex-1 liquid-glass rounded-2xl overflow-hidden">
              <img
                src={row.gif}
                alt={row.title}
                className="w-full h-full object-cover"
                style={{ minHeight: '280px', maxHeight: '380px' }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
