import React, { useEffect, useRef } from 'react';

const StarBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    window.addEventListener('resize', resize);
    resize();

    // Star properties
    const stars: { x: number; y: number; z: number; o: number; vx: number; vy: number; vz: number }[] = [];
    const starCount = 1500; // Increased count for better visibility
    
    // Initialize stars
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width * 2 - width,
        y: Math.random() * height * 2 - height,
        z: Math.random() * width,
        o: Math.random(), // opacity base
        vx: (Math.random() - 0.5) * 0.2, // Random velocity X
        vy: (Math.random() - 0.5) * 0.2, // Random velocity Y
        vz: Math.random() * 0.5 + 0.1  // Random velocity Z (always moving forward slightly)
      });
    }

    let animationFrameId: number;
    let rotation = 0;

    const animate = () => {
      ctx.fillStyle = '#000000'; // Black background
      ctx.fillRect(0, 0, width, height);
      
      rotation -= 0.0005; // Rotate from left to right (clockwise) slowly

      const cx = width / 2;
      const cy = height / 2;
      
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);

      for (let i = 0; i < starCount; i++) {
        const star = stars[i];
        
        // Update star position (free 3D movement)
        star.x += star.vx;
        star.y += star.vy;
        star.z -= star.vz;

        // Reset star if it passes the screen or goes too far
        if (star.z <= 0) {
          star.z = width;
          star.x = Math.random() * width * 2 - width;
          star.y = Math.random() * height * 2 - height;
        }
        
        // Wrap X and Y to keep them in view
        if (star.x > width) star.x = -width;
        if (star.x < -width) star.x = width;
        if (star.y > height) star.y = -height;
        if (star.y < -height) star.y = height;

        // Apply rotation
        const rx = star.x * cos - star.y * sin;
        const ry = star.x * sin + star.y * cos;

        // Calculate 2D position
        const k = 128.0 / star.z;
        const px = rx * k + cx;
        const py = ry * k + cy;

        // Draw star if within bounds
        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const size = Math.max(0, (1 - star.z / width) * 3.0);
        const shade = Math.max(0, Math.floor((1 - star.z / width) * 255));
          
        ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
        ctx.beginPath();
        if (size > 0) {
          ctx.arc(px, py, size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ background: 'black' }}
    />
  );
};

export default StarBackground;
