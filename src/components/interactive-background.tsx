"use client";

import React, { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useColorTheme } from './color-theme-provider';
import { cn } from '@/lib/utils';

interface InteractiveBackgroundProps {
  className?: string;
}

const InteractiveBackground: React.FC<InteractiveBackgroundProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme: colorTheme } = useColorTheme();
  const { resolvedTheme: modeTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const mouse = { x: -200, y: -200, radius: 150 };

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles();
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -200;
      mouse.y = -200;
    };

    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    class Particle {
      x: number;
      y: number;
      size: number;
      baseSize: number;
      speedX: number;
      speedY: number;
      color: string;
      pulseAngle: number;
      pulseSpeed: number;

      constructor(x: number, y: number, size: number, speedX: number, speedY: number, color: string) {
        this.x = x;
        this.y = y;
        this.baseSize = size;
        this.size = size;
        this.speedX = speedX;
        this.speedY = speedY;
        this.color = color;
        this.pulseAngle = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }

      update() {
        if (this.x + this.size > canvas.width || this.x - this.size < 0) this.speedX = -this.speedX;
        if (this.y + this.size > canvas.height || this.y - this.size < 0) this.speedY = -this.speedY;

        this.x += this.speedX;
        this.y += this.speedY;
        
        this.pulseAngle += this.pulseSpeed;
        this.size = this.baseSize + Math.sin(this.pulseAngle) * (this.baseSize / 4);

        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouse.radius - distance) / mouse.radius;
          const pushStrength = 7;
          this.x += forceDirectionX * force * pushStrength;
          this.y += forceDirectionY * force * pushStrength;
        }
      }
    }

    const initParticles = () => {
      particles = [];
      const numberOfParticles = (canvas.width * canvas.height) / 4500;
      const primaryColorHsl = getComputedStyle(canvas).getPropertyValue('--primary').trim();
      const accentColorHsl = getComputedStyle(canvas).getPropertyValue('--accent').trim();
      
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 4 + 2;
        const x = Math.random() * (canvas.width - size * 2) + size;
        const y = Math.random() * (canvas.height - size * 2) + size;
        const speedX = Math.random() * 0.5 - 0.25;
        const speedY = Math.random() * 0.5 - 0.25;
        const particleColor = Math.random() < 0.7 ? `hsl(${accentColorHsl})` : `hsl(${primaryColorHsl})`;
        particles.push(new Particle(x, y, size, speedX, speedY, particleColor));
      }
    };
    
    const connectParticles = () => {
        const primaryColorHsl = getComputedStyle(canvas).getPropertyValue('--primary').trim();
        const connectionRadius = 160;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionRadius) {
                    if (!ctx) return;
                    const opacity = 1 - (distance / connectionRadius);
                    ctx.strokeStyle = `hsl(${primaryColorHsl} / ${opacity * 1.2})`;
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    setTimeout(() => {
        resizeCanvas();
        animate();
    }, 100);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [colorTheme, modeTheme]);

  return <canvas ref={canvasRef} className={cn("w-full h-full", className)} />;
};

export default InteractiveBackground;
