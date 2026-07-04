import { useEffect, useRef, memo } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

interface ParticleBackgroundProps {
  theme?: 'light' | 'dark';
  particleSpeed?: 'none' | 'slow' | 'medium' | 'fast';
}

function ParticleBackground({ theme = 'dark', particleSpeed = 'medium' }: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = isLight ? 32 : 45; // slightly fewer particles on light theme for elegant minimalist layout

    // Theme dependent neon palette
    const colors = isLight 
      ? [
          'rgba(14, 165, 233, 0.45)', // Sky blue
          'rgba(147, 51, 234, 0.35)', // Purple
          'rgba(219, 39, 119, 0.35)', // Deep Pink
          'rgba(6, 182, 212, 0.45)',  // Cyan
        ]
      : [
          'rgba(56, 189, 248, 0.5)',  // Sky blue
          'rgba(168, 85, 247, 0.5)',  // Purple
          'rgba(236, 72, 153, 0.5)',  // Pink
          'rgba(34, 211, 238, 0.5)',  // Cyan
        ];

    // Map speed selection to speed factors
    const speedMultiply = {
      none: 0,
      slow: 0.35,
      medium: 0.85,
      fast: 1.85,
    }[particleSpeed] ?? 0.85;

    const initParticles = (width: number, height: number) => {
      particles = [];
      if (speedMultiply === 0) return; // don't load particles if speed is none (performance option)
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45 * speedMultiply,
          vy: (Math.random() - 0.5) * 0.45 * speedMultiply,
          radius: Math.random() * 3.5 + 1.2,
          alpha: Math.random() * 0.5 + 0.15,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    let mouse = { x: -2000, y: -2000 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -2000;
      mouse.y = -2000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('blur', handleMouseLeave);

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      initParticles(width, height);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    handleResize();

    const draw = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Only calculate movements and draw connections if speedMultiply > 0
      if (speedMultiply > 0 && particles.length > 0) {
        particles.forEach((p, idx) => {
          // Repulsion from mouse
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distToMouse = Math.hypot(dx, dy);
          if (distToMouse < 160) {
            const force = (160 - distToMouse) / 160;
            p.x += (dx / distToMouse) * force * 1.5;
            p.y += (dy / distToMouse) * force * 1.5;
          }

          p.x += p.vx;
          p.y += p.vy;

          // Boundaries
          if (p.x < -p.radius) p.x = width + p.radius;
          if (p.x > width + p.radius) p.x = -p.radius;
          if (p.y < -p.radius) p.y = height + p.radius;
          if (p.y > height + p.radius) p.y = -p.radius;

          // Draw particle
          ctx.beginPath();
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          grad.addColorStop(0, p.color);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = grad;
          ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
          ctx.fill();

          // Connect neighbor lines
          for (let j = idx + 1; j < particles.length; j++) {
            const other = particles[j];
            const dist = Math.hypot(p.x - other.x, p.y - other.y);
            if (dist < 105) {
              const opacity = (1 - dist / 105) * (isLight ? 0.08 : 0.12);
              ctx.beginPath();
              ctx.strokeStyle = isLight 
                ? `rgba(15, 23, 42, ${opacity})`
                : `rgba(147, 197, 253, ${opacity})`;
              ctx.lineWidth = 0.6;
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(other.x, other.y);
              ctx.stroke();
            }
          }

          // Thread connection to mouse cursor
          const mouseDist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (mouseDist < 140) {
            const opacity = (1 - mouseDist / 140) * (isLight ? 0.15 : 0.25);
            ctx.beginPath();
            ctx.strokeStyle = isLight
              ? `rgba(14, 165, 233, ${opacity})`
              : `rgba(56, 189, 248, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        });
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('blur', handleMouseLeave);
    };
  }, [theme, particleSpeed]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 -z-10 overflow-hidden pointer-events-none transition-colors duration-500 ${
        isLight ? 'bg-[#f4f7fa]' : 'bg-[#050508]'
      }`}
      id="particles-container"
    >
      <canvas ref={canvasRef} className="block w-full h-full opacity-60" id="particles-canvas" />
      {/* Dynamic Glowing backplate details */}
      <div className={`absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-colors duration-500 ${
        isLight ? 'bg-blue-300/10' : 'bg-blue-900/15'
      }`} />
      <div className={`absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-colors duration-500 ${
        isLight ? 'bg-indigo-300/10' : 'bg-purple-900/15'
      }`} />
    </div>
  );
}

export default memo(ParticleBackground);
