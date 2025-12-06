'use client';
import { useEffect, useState } from 'react';

export default function HalvingCountdown() {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        // Target: April 17, 2028 12:00 UTC
        const targetDate = new Date('2028-04-17T12:00:00Z').getTime();

        const update = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                setTimeLeft("Halving Concluído!");
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div id="halving-countdown" className="highlight-box" style={{ textAlign: 'center' }}>
            <h3 style={{ marginTop: 0, color: 'var(--bitcoin-orange)' }}>Próximo Halving (Estimado):</h3>
            <div id="halving-timer" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-green)' }}>
                {timeLeft || 'Carregando...'}
            </div>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Previsto para abril de 2028</p>
        </div>
    );
}
