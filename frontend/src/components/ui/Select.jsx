import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export const Select = ({ options, value, onChange, placeholder = 'Select an option', icon: Icon, className = '', containerStyle = {}, ...props }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%', ...containerStyle }} className={className} {...props}>
            <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'rgba(30, 41, 59, 0.2)',
                    backdropFilter: 'blur(4px)',
                    border: `1px solid ${isOpen ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    color: selectedOption ? 'var(--text-main)' : 'var(--text-muted)',
                    boxShadow: isOpen ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
                    transition: 'all 0.3s ease'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {Icon && <Icon size={18} color={isOpen ? 'var(--primary)' : 'var(--text-muted)'} />}
                    <span style={{ fontSize: '0.875rem' }}>{selectedOption ? selectedOption.label : placeholder}</span>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                    <ChevronDown size={18} color="var(--text-muted)" />
                </motion.div>
            </motion.div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 0.5rem)',
                            left: 0,
                            right: 0,
                            background: 'rgba(15, 23, 42, 0.85)',
                            backdropFilter: 'blur(8px) saturate(120%)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '0.5rem',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                            zIndex: 60,
                            maxHeight: '250px',
                            overflowY: 'auto'
                        }}
                    >
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                style={{
                                    padding: '0.75rem 1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    background: value === opt.value ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                    color: value === opt.value ? 'var(--primary)' : 'var(--text-main)',
                                    transition: 'background 0.2s',
                                    fontSize: '0.875rem'
                                }}
                                onMouseEnter={(e) => {
                                    if (value !== opt.value) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                }}
                                onMouseLeave={(e) => {
                                    if (value !== opt.value) e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {opt.icon && <opt.icon size={16} />}
                                    {opt.label}
                                </span>
                                {value === opt.value && <Check size={16} />}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
