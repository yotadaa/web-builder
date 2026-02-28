import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Premium Tooltip component using Framer Motion.
 * Replaces native 'title' attribute with a styled, animated tooltip.
 * 
 * @param {React.ReactNode} children - The element to hover over.
 * @param {string} content - The text content of the tooltip.
 * @param {string} position - 'top', 'bottom', 'left', or 'right'.
 */
const Tooltip = ({ children, content, position = 'top' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef(null);

    const getPositionStyles = () => {
        switch (position) {
            case 'bottom':
                return { top: 'calc(100% + 8px)', left: '50%', x: '-50%' };
            case 'left':
                return { right: 'calc(100% + 8px)', top: '50%', y: '-50%' };
            case 'right':
                return { left: 'calc(100% + 8px)', top: '50%', y: '-50%' };
            case 'top':
            default:
                return { bottom: 'calc(100% + 8px)', left: '50%', x: '-50%' };
        }
    };

    return (
        <div
            ref={containerRef}
            style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 4 : position === 'bottom' ? -4 : 0, x: position === 'left' ? 4 : position === 'right' ? -4 : '-50%' }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: position === 'left' || position === 'right' ? 0 : '-50%' }}
                        exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 4 : position === 'bottom' ? -4 : 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        style={{
                            position: 'absolute',
                            zIndex: 9999,
                            padding: '6px 12px',
                            background: 'rgba(15, 23, 42, 0.9)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                            ...getPositionStyles()
                        }}
                    >
                        {content}
                        {/* Arrow */}
                        <div style={{
                            position: 'absolute',
                            width: '0',
                            height: '0',
                            borderStyle: 'solid',
                            ...(position === 'top' ? {
                                borderWidth: '6px 6px 0 6px',
                                borderColor: 'rgba(15, 23, 42, 0.9) transparent transparent transparent',
                                bottom: '-6px',
                                left: '50%',
                                transform: 'translateX(-50%)'
                            } : position === 'bottom' ? {
                                borderWidth: '0 6px 6px 6px',
                                borderColor: 'transparent transparent rgba(15, 23, 42, 0.9) transparent',
                                top: '-6px',
                                left: '50%',
                                transform: 'translateX(-50%)'
                            } : position === 'left' ? {
                                borderWidth: '6px 0 6px 6px',
                                borderColor: 'transparent transparent transparent rgba(15, 23, 42, 0.9)',
                                right: '-6px',
                                top: '50%',
                                transform: 'translateY(-50%)'
                            } : {
                                borderWidth: '6px 6px 6px 0',
                                borderColor: 'transparent rgba(15, 23, 42, 0.9) transparent transparent',
                                left: '-6px',
                                top: '50%',
                                transform: 'translateY(-50%)'
                            })
                        }} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tooltip;
