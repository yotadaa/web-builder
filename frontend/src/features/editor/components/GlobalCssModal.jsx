import React, { useState, useEffect } from 'react';
import { X, Check, Code } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-css';

const GlobalCssModal = ({ isOpen, onClose, initialCss, onSave, accentColor = '#10b981' }) => {
    const [css, setCss] = useState('');

    useEffect(() => {
        if (isOpen) {
            setCss(initialCss || '');
        }
    }, [isOpen, initialCss]);

    if (!isOpen) return null;

    const editorStyle = {
        width: '100%',
        height: '100%',
        background: 'transparent',
        color: '#d4d4d4',
        border: 'none',
        resize: 'none',
        outline: 'none',
        fontFamily: 'monospace',
        fontSize: '14px',
        lineHeight: '1.5',
        whiteSpace: 'pre',
        overflowY: 'auto'
    };

    const handleSave = () => {
        onSave(css);
        onClose();
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
            <div style={{ width: '70vw', height: '70vh', maxWidth: '900px', background: '#1e1e1e', borderRadius: '12px', border: '1px solid #333', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                {/* Top Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#252526', padding: '0 1rem', height: '40px', borderBottom: '1px solid #333' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#ccc', fontFamily: 'monospace' }}>
                        <Code size={16} color={accentColor} /> Global CSS Config
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
                </div>

                {/* Editor Area */}
                <div style={{ flex: 1, position: 'relative', display: 'flex', minHeight: 0 }}>
                    {/* Line numbers mock for visual */}
                    <div style={{ width: '40px', background: '#1e1e1e', borderRight: '1px solid #333', color: '#858585', padding: '1rem 0', textAlign: 'right', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.5', userSelect: 'none', overflow: 'hidden' }}>
                        {[...Array(50)].map((_, i) => <div key={i} style={{ paddingRight: '10px' }}>{i + 1}</div>)}
                    </div>
                    {/* Active Editor */}
                    <div style={{ flex: 1, padding: '1rem', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '11px', color: '#858585', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>Project-Wide CSS Styles</div>
                        <div style={{ ...editorStyle, flex: 1, background: '#1e1e1e', overflowY: 'auto', border: '1px solid #333', borderRadius: '4px' }}>
                            <Editor
                                value={css || ''}
                                onValueChange={code => setCss(code)}
                                highlight={code => Prism.highlight(code, Prism.languages.css, 'css')}
                                padding={15}
                                style={{ fontFamily: 'monospace', fontSize: 13, minHeight: '100%' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', background: '#007acc', padding: '0.5rem 1rem', height: '40px', flexShrink: 0 }}>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
                    <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', color: '#007acc', border: 'none', padding: '0.25rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                        <Check size={14} /> Apply Global CSS
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GlobalCssModal;
