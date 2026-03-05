import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const Textarea = ({ icon: Icon, className = '', containerStyle = {}, inputStyle = {}, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <motion.div
            style={{ position: 'relative', width: '100%', ...containerStyle }}
            animate={{
                scale: isFocused ? 1.01 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {Icon && (
                <Icon
                    size={18}
                    style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '1rem',
                        color: isFocused ? 'var(--primary)' : 'var(--text-muted)',
                        transition: 'color 0.3s ease',
                        pointerEvents: 'none'
                    }}
                />
            )}
            <textarea
                className={`premium-input ${className}`}
                style={{
                    paddingLeft: Icon ? '3rem' : '1rem',
                    background: 'rgba(30, 41, 59, 0.4)',
                    // backdropFilter: 'blur(12px)',
                    border: `1px solid ${isFocused ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
                    transition: 'all 0.3s ease',
                    resize: 'vertical',
                    minHeight: '100px',
                    fontFamily: 'inherit',
                    ...inputStyle
                }}
                onFocus={(e) => {
                    setIsFocused(true);
                    if (props.onFocus) props.onFocus(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    if (props.onBlur) props.onBlur(e);
                }}
                {...props}
            />
        </motion.div>
    );
};
