import React, { useState, useEffect, useRef } from 'react';
import Modal from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

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
                    <Input
                        ref={inputRef}
                        type="text"
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
                    <Button variant="ghost" onClick={onClose} style={{ border: '1px solid var(--border)' }}>
                        {cancelText}
                    </Button>
                    <Button onClick={handleConfirm}>
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default PromptModal;
