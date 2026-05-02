import { ArrowUpRight } from 'lucide-react';

const LINKS = ['Home', 'Services', 'Work', 'Process', 'Pricing'];

export default function Navbar() {
  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-8 lg:px-16">
      <nav className="flex items-center justify-between py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
            <span className="text-white font-bold text-lg" style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' }}>S</span>
          </div>
          <span className="text-white font-semibold text-sm tracking-wide" style={{ fontFamily: "'Barlow', sans-serif" }}>Studio</span>
        </div>

        {/* Center Nav */}
        <div className="hidden md:flex items-center liquid-glass rounded-full px-1.5 py-1 gap-1">
          {LINKS.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="px-3 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors rounded-full hover:bg-white/5"
              style={{ fontFamily: "'Barlow', sans-serif" }}
            >
              {link}
            </a>
          ))}
          <a
            href="#contact"
            className="flex items-center gap-1 bg-white text-black rounded-full px-3.5 py-1.5 text-sm font-semibold hover:bg-white/90 transition-colors"
            style={{ fontFamily: "'Barlow', sans-serif" }}
          >
            Get Started <ArrowUpRight size={14} />
          </a>
        </div>

        {/* Mobile CTA */}
        <a
          href="#contact"
          className="md:hidden flex items-center gap-1 liquid-glass-strong rounded-full px-4 py-2 text-sm text-white font-medium"
          style={{ fontFamily: "'Barlow', sans-serif" }}
        >
          Get Started <ArrowUpRight size={14} />
        </a>
      </nav>
    </header>
  );
}
