
import React, { useEffect, useRef } from 'react';

const ModernTechnicalBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;

        canvas.width = width;
        canvas.height = height;

        // Configuration
        const COLUMN_WIDTH = 20; // Thin columns
        const columns = Math.ceil(width / COLUMN_WIDTH);
        const drops: number[] = [];

        // Initialize drops at random heights for organic feel
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.random() * -100;
        }

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', resize);

        const draw = () => {
            // Semi-transparent black to create trail effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#03FC3B'; // RevGreen
            ctx.font = '10px monospace'; // Very small, almost abstract

            for (let i = 0; i < drops.length; i++) {
                // Randomly skip drawing columns to reduce density (Optimization + Aesthetic)
                if (Math.random() > 0.975) {
                    const text = Math.random() > 0.5 ? '1' : '0'; // Binary
                    // const text = '|'; // Abstract line (Alternative)

                    // Vary opacity for depth
                    const opacity = Math.random() * 0.5;
                    ctx.fillStyle = `rgba(3, 252, 59, ${opacity})`;

                    ctx.fillText(text, i * COLUMN_WIDTH, drops[i] * 12);
                }

                // Reset drop or move it down
                if (drops[i] * 12 > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 33); // ~30FPS

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none opacity-30 mix-blend-screen"
            style={{ zIndex: 0 }}
        />
    );
};

export default ModernTechnicalBackground;
