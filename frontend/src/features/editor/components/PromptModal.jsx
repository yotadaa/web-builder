import React, { useState, useEffect, useRef } from 'react';
import Modal from '../../../components/ui/Modal';

const PromptModal = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    label,
    defaultValue = '',
    placeholder = '',
    confirmText = 'Confirm',
    cancelText = 'Cancel'
}) => {
    const [value, setValue] = useState(defaultValue);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            // Autofocus input
            const timer = setTimeout(() => {
                inputRef.current?.focus();
                inputRef.current?.select();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleConfirm = () => {
        onSubmit(value);
        onClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleConfirm();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidth="400px"
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {label && (
                        <label style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: 'var(--text-muted)'
                        }}>
                            {label}
                        </label>
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        className="premium-input"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        autoComplete="off"
                    />
                </div>

                <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    justifyContent: 'flex-end',
                    marginTop: '0.5rem'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.625rem 1.25rem',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--border)',
                            background: 'transparent',
                            color: 'var(--text)',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="premium-button"
                        style={{
                            padding: '0.625rem 1.25rem',
                            fontSize: '0.875rem',
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default PromptModal;
