import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Trash2, Edit3, Settings } from 'lucide-react';
import Tooltip from '../../../components/ui/Tooltip';

/**
 * FloatingToolbox component that appears near the selected element.
 * Provides quick contextual actions.
 * 
 * @param {string} selectedElementId - ID of the selected element.
 * @param {React.RefObject} canvasRef - Reference to the canvas container.
 * @param {Object} actions - Callback functions for actions (delete, duplicate, rename).
 * @param {string} accentColor - Color to use for highlights.
 */
const FloatingToolbox = ({ selectedElementId, canvasRef, actions, accentColor = '#6366f1' }) => {
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [isVisible, setIsVisible] = useState(false);

    const updatePosition = useCallback(() => {
        if (!selectedElementId || selectedElementId === 'canvas' || !canvasRef.current) {
            setIsVisible(false);
            return;
        }

        const el = canvasRef.current.querySelector(`[data-id="${selectedElementId}"]`);
        if (el) {
            const rect = el.getBoundingClientRect();
            // Position above the element, centered
            // Ensure it doesn't go off screen
            const top = Math.max(80, rect.top - 54);
            const left = rect.left + rect.width / 2;

            setPosition({ top, left });
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [selectedElementId, canvasRef]);

    useEffect(() => {
        const handleUpdate = () => {
            requestAnimationFrame(() => updatePosition());
        };

        handleUpdate();

        // Update position on scroll/resize inside canvas
        const canvas = canvasRef.current;
        const handleWheel = () => handleUpdate();

        if (canvas) {
            canvas.addEventListener('scroll', handleUpdate);
            canvas.addEventListener('wheel', handleWheel);
            window.addEventListener('resize', handleUpdate);
        }

        return () => {
            if (canvas) {
                canvas.removeEventListener('scroll', handleUpdate);
                canvas.removeEventListener('wheel', handleWheel);
            }
            window.removeEventListener('resize', handleUpdate);
        };
    }, [updatePosition, canvasRef]);

    const handleAction = (e, callback) => {
        e.stopPropagation();
        callback?.();
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10, x: '-50%' }}
                    animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, scale: 0.9, y: 10, x: '-50%' }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    style={{
                        position: 'fixed',
                        top: position.top,
                        left: position.left,
                        transform: 'translateX(-50%)',
                        zIndex: 2800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px',
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
                        pointerEvents: 'auto'
                    }}
                >
                    <ActionButton
                        icon={<Copy size={16} />}
                        label="Duplicate"
                        onClick={(e) => handleAction(e, actions.duplicate)}
                        hoverColor={accentColor}
                    />
                    <ActionButton
                        icon={<Edit3 size={16} />}
                        label="Rename"
                        onClick={(e) => handleAction(e, actions.rename)}
                        hoverColor={accentColor}
                    />
                    <ActionButton
                        icon={<Settings size={16} />}
                        label="Detailed Config"
                        onClick={(e) => handleAction(e, actions.openConfig)}
                        hoverColor={accentColor}
                    />
                    <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
                    <ActionButton
                        icon={<Trash2 size={16} />}
                        label="Delete"
                        onClick={(e) => handleAction(e, actions.delete)}
                        hoverColor="#ef4444"
                        isDestructive
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const ActionButton = ({ icon, label, onClick, hoverColor, isDestructive }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Tooltip content={label} position="top">
            <button
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={onClick}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: 'none',
                    background: isHovered ? (isDestructive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)') : 'transparent',
                    color: isHovered ? hoverColor : 'rgba(255, 255, 255, 0.7)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                }}
            >
                {icon}
            </button>
        </Tooltip>
    );
};

export default FloatingToolbox;
