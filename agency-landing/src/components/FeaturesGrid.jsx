import { Zap, Palette, BarChart3, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import BlurText from './BlurText';

const CARDS = [
  {
    icon: Zap,
    title: 'Days, Not Months',
    body: 'Concept to launch at a pace that redefines fast. Because waiting isn\'t a strategy.',
  },
  {
    icon: Palette,
    title: 'Obsessively Crafted',
    body: 'Every detail considered. Every element refined. Design so precise, it feels inevitable.',
  },
  {
    icon: BarChart3,
    title: 'Built to Convert',
    body: 'Layouts informed by data. Decisions backed by performance. Results you can measure.',
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    body: 'Enterprise-grade protection comes standard. SSL, DDoS mitigation, compliance. All included.',
  },
];

export default function FeaturesGrid() {
  return (
    <section id="process" className="py-24 px-6 lg:px-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-16">
        <span className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white mb-6" style={{ fontFamily: "'Barlow', sans-serif" }}>
          Why Us
        </span>
        <h2
          className="text-4xl md:text-5xl lg:text-6xl italic text-white tracking-tight leading-[0.9]"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          <BlurText text="The difference is everything." delay={130} />
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
              className="liquid-glass rounded-2xl p-6 flex flex-col gap-4 hover:bg-white/5 transition-colors"
            >
              <div className="liquid-glass-strong rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-white" />
              </div>
              <h3
                className="text-white font-semibold text-base leading-snug"
                style={{ fontFamily: "'Barlow', sans-serif" }}
              >
                {card.title}
              </h3>
              <p
                className="text-white/60 text-sm leading-relaxed"
                style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300 }}
              >
                {card.body}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
