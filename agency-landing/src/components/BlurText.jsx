import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

export default function BlurText({
  text,
  className = '',
  delay = 200,
  direction = 'bottom',
}) {
  const ref = useRef(null);
  const words = text.split(' ');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.visible = 'true';
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hidden = {
    filter: 'blur(10px)',
    opacity: 0,
    y: direction === 'bottom' ? 50 : -50,
  };
  const mid = { filter: 'blur(5px)', opacity: 0.5, y: direction === 'bottom' ? -5 : 5 };
  const visible = { filter: 'blur(0px)', opacity: 1, y: 0 };

  return (
    <span ref={ref} className={`inline ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          style={{ marginRight: '0.25em' }}
          initial={hidden}
          whileInView={[mid, visible]}
          transition={{
            duration: 0.35,
            delay: (i * delay) / 1000,
            ease: 'easeOut',
          }}
          viewport={{ once: true, amount: 0.1 }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
