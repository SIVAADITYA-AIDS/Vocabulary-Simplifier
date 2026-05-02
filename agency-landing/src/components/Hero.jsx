import { motion } from 'motion/react';
import { ArrowUpRight, Play } from 'lucide-react';
import BlurText from './BlurText';

const PARTNERS = ['Stripe', 'Vercel', 'Linear', 'Notion', 'Figma'];

const blurIn = {
  hidden: { filter: 'blur(10px)', opacity: 0, y: 20 },
  visible: { filter: 'blur(0px)', opacity: 1, y: 0 },
};

export default function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden"
      style={{ height: '1000px' }}
    >
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/images/hero_bg.jpeg"
        className="absolute left-0 w-full h-auto object-contain z-0"
        style={{ top: '20%' }}
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/5 z-0" />

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
        style={{ height: '300px', background: 'linear-gradient(to bottom, transparent, black)' }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-6"
        style={{ paddingTop: '150px' }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="liquid-glass rounded-full px-1 py-1 flex items-center gap-2 mb-8"
        >
          <span className="bg-white text-black rounded-full px-3 py-1 text-xs font-semibold" style={{ fontFamily: "'Barlow', sans-serif" }}>
            New
          </span>
          <span className="text-white/80 text-sm pr-3" style={{ fontFamily: "'Barlow', sans-serif" }}>
            Introducing AI-powered web design.
          </span>
        </motion.div>

        {/* Heading */}
        <h1
          className="text-6xl md:text-7xl lg:text-[5.5rem] italic text-white leading-[0.8] max-w-3xl tracking-[-4px] mb-6"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          <BlurText
            text="The Website Your Brand Deserves"
            delay={100}
            direction="bottom"
          />
        </h1>

        {/* Subtext */}
        <motion.p
          variants={blurIn}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-sm md:text-base text-white/70 max-w-md leading-relaxed mb-8"
          style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300 }}
        >
          Stunning design. Blazing performance. Built by AI, refined by experts.
          This is web design, wildly reimagined.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={blurIn}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 1.1 }}
          className="flex items-center gap-4 mb-16"
        >
          <button className="liquid-glass-strong rounded-full px-5 py-2.5 text-white text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-colors" style={{ fontFamily: "'Barlow', sans-serif" }}>
            Get Started <ArrowUpRight size={16} />
          </button>
          <button className="text-white/80 text-sm font-light flex items-center gap-2 hover:text-white transition-colors" style={{ fontFamily: "'Barlow', sans-serif" }}>
            <Play size={16} fill="currentColor" /> Watch the Film
          </button>
        </motion.div>

        {/* Partners */}
        <motion.div
          variants={blurIn}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 1.4 }}
          className="flex flex-col items-center gap-6"
        >
          <span className="liquid-glass rounded-full px-4 py-2 text-xs text-white/60" style={{ fontFamily: "'Barlow', sans-serif" }}>
            Trusted by the teams behind
          </span>
          <div className="flex items-center gap-12 md:gap-16 flex-wrap justify-center">
            {PARTNERS.map((p) => (
              <span
                key={p}
                className="text-2xl md:text-3xl italic text-white/80"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {p}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
