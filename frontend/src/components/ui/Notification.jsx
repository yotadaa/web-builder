import React, { useEffect, useState } from 'react';
import { Info, X } from 'lucide-react';

const Notification = ({ message, onClose, duration = 3000 }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const showTimeout = setTimeout(() => setIsVisible(true), 10);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);

        return () => {
            clearTimeout(showTimeout);
            clearTimeout(timer);
        };
    }, [duration, onClose]);

    return (
        <div
            style={{
                position: 'fixed',
                top: isVisible ? '24px' : '-100px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                color: 'white',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: isVisible ? 1 : 0,
                pointerEvents: 'auto'
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8'
            }}>
                <Info size={18} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', letterSpacing: '0.01em' }}>
                    Notification
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    {message}
                </span>
            </div>

            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                style={{
                    marginLeft: '12px',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)'}
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default Notification;
