import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const Button = ({ children, variant = 'primary', loading = false, icon: Icon, className = '', style = {}, ...props }) => {
    const baseStyle = {
        padding: '0.75rem 1.5rem',
        borderRadius: '0.5rem',
        fontWeight: '600',
        cursor: props.disabled || loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        border: 'none',
        outline: 'none',
        position: 'relative',
        overflow: 'hidden',
        opacity: props.disabled ? 0.6 : 1,
        ...style
    };

    const variants = {
        primary: {
            background: 'var(--primary)',
            color: 'white',
            boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
        },
        secondary: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'var(--text-main)',
        },
        ghost: {
            background: 'transparent',
            color: 'var(--text-muted)',
        },
        danger: {
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--error)',
            color: 'var(--error)',
        }
    };

    return (
        <motion.button
            className={className}
            style={{ ...baseStyle, ...variants[variant] }}
            whileHover={!props.disabled && !loading ? { scale: 1.02, filter: 'brightness(1.1)' } : {}}
            whileTap={!props.disabled && !loading ? { scale: 0.98 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            {...props}
        >
            {loading ? (
                <Loader2 className="animate-spin" size={20} />
            ) : (
                <>
                    {Icon && <Icon size={18} />}
                    {children}
                </>
            )}
        </motion.button>
    );
};
