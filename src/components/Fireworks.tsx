"use client";

import React, { useEffect, useRef } from 'react';

type FireworksProps = { enabled?: boolean };

const Fireworks: React.FC<FireworksProps> = ({ enabled = true }) => {
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    const canvas = document.getElementById('fireworks') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // 如果关闭烟花，清空画布并移除事件后提前返回
    if (!enabled) {
      cancelledRef.current = true;
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return () => {
        window.removeEventListener('resize', setCanvasSize);
      };
    }

    const POOL_SIZE = 500;
    const particlePool: Particle[] = [];
    let poolIndex = 0;

    class Particle {
      x: number = 0;
      y: number = 0;
      vx: number = 0;
      vy: number = 0;
      alpha: number = 1;
      color: string = '#fff';
      active: boolean = false;
      size: number = 2;

      init(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.color = color;
        this.active = true;
        this.size = Math.random() * 1.5 + 0.5;
      }

      update() {
        if (!this.active) return;
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.02;
        this.alpha -= 0.018;
        if (this.alpha <= 0 || this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.active = false;
        }
      }

      draw() {
        if (!this.active) return;
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < POOL_SIZE; i++) {
      particlePool.push(new Particle());
    }

    const colors = ['#ff0', '#f0f', '#0ff', '#ff4444', '#44ff44'];
    let lastTime = 0;
    const FPS = 60;
    const frameInterval = 1000 / FPS;
    let lastFireworkTime = 0;
    const FIREWORK_INTERVAL = 1500; // 稍微降低频率

    // 轨迹相关参数：加大淡出力度并周期性全清理
    const TRAIL_ALPHA = 0.3; // 更强淡出，进一步减少残影
    const CLEAR_INTERVAL = 36; // 每 ~0.6s 全清一次
    let frameCount = 0;

    const getParticle = () => {
      const particle = particlePool[poolIndex];
      poolIndex = (poolIndex + 1) % POOL_SIZE;
      return particle;
    };

    const isMobile = () => window.innerWidth <= 768;

    // 存储所有上升阶段的 rAF id，便于在关闭时全部取消
    const riseIds = new Set<number>();

    const createFirework = (currentTime: number) => {
      if (currentTime - lastFireworkTime < FIREWORK_INTERVAL) return;
      lastFireworkTime = currentTime;

      const x = Math.random() * canvas.width;
      const y = canvas.height;
      const targetY = Math.random() * (canvas.height * 0.6);
      const color = colors[Math.floor(Math.random() * colors.length)];

      const explode = (x: number, y: number) => {
        const particleCount = isMobile() ? 12 : 22; // 更少的粒子
        for (let i = 0; i < particleCount; i++) {
          const particle = getParticle();
          particle.init(x, y, color);
        }
      };

      let currentY = y;
      const riseStep = () => {
        if (cancelledRef.current) return;
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, currentY, 2, 0, Math.PI * 2);
        ctx.fill();
        currentY -= 5;
        if (currentY > targetY) {
          const id = requestAnimationFrame(riseStep);
          riseIds.add(id);
        } else {
          explode(x, currentY);
        }
      };

      const firstId = requestAnimationFrame(riseStep);
      riseIds.add(firstId);
    };

    // 记录并可取消的 rAF id
    let animationId = 0;

    const animate = (currentTime: number) => {
      if (cancelledRef.current) return;
      if (currentTime - lastTime >= frameInterval) {
        frameCount++;
        ctx.globalAlpha = 1;
        if (frameCount % CLEAR_INTERVAL === 0) {
          ctx.globalCompositeOperation = 'source-over';
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.fillStyle = `rgba(0, 0, 0, ${TRAIL_ALPHA})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.globalCompositeOperation = 'lighter';

        let activeCount = 0;
        particlePool.forEach((particle) => {
          if (particle.active) {
            particle.update();
            particle.draw();
            activeCount++;
          }
        });

        const maxActiveParticles = isMobile() ? 28 : 75;
        if (activeCount < maxActiveParticles) {
          createFirework(currentTime);
        }
        lastTime = currentTime;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => {
      cancelledRef.current = true;
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationId);
      // 取消所有上升阶段的 rAF
      riseIds.forEach((id) => cancelAnimationFrame(id));
      riseIds.clear();
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [enabled]);

  return (
    <canvas
      id="fireworks"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 2,
        display: enabled ? 'block' : 'none',
      }}
    />
  );
};

export default Fireworks;