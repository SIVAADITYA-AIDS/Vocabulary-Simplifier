import { motion } from 'motion/react';
import BlurText from './BlurText';

const TESTIMONIALS = [
  {
    quote: 'A complete rebuild in five days. The result outperformed everything we\'d spent months building before.',
    name: 'Sarah Chen',
    role: 'CEO, Luminary',
  },
  {
    quote: 'Conversions up 4x. That\'s not a typo. The design just works differently when it\'s built on real data.',
    name: 'Marcus Webb',
    role: 'Head of Growth, Arcline',
  },
  {
    quote: 'They didn\'t just design our site. They defined our brand. World-class doesn\'t begin to cover it.',
    name: 'Elena Voss',
    role: 'Brand Director, Helix',
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-6 lg:px-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-16">
        <span className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white mb-6" style={{ fontFamily: "'Barlow', sans-serif" }}>
          What They Say
        </span>
        <h2
          className="text-4xl md:text-5xl lg:text-6xl italic text-white tracking-tight leading-[0.9]"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          <BlurText text="Don't take our word for it." delay={130} />
        </h2>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: i * 0.12, ease: 'easeOut' }}
            className="liquid-glass rounded-2xl p-8 flex flex-col gap-6 hover:bg-white/5 transition-colors"
          >
            <p
              className="text-white/80 text-sm italic leading-relaxed flex-1"
              style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300 }}
            >
              "{t.quote}"
            </p>
            <div>
              <p
                className="text-white text-sm font-medium"
                style={{ fontFamily: "'Barlow', sans-serif" }}
              >
                {t.name}
              </p>
              <p
                className="text-white/50 text-xs"
                style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300 }}
              >
                {t.role}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
