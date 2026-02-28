import React, { useState, useEffect } from 'react';
import { X, Code, Layers, FileJson, Check } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup';

const DetailedConfigModal = ({ isOpen, onClose, elementId, initialHtml, initialStyles, initialClasses, initialJs, onSave, accentColor = '#6366f1' }) => {
    const [activeTab, setActiveTab] = useState('html');
    const [html, setHtml] = useState('');
    const [styles, setStyles] = useState('');
    const [classes, setClasses] = useState('');
    const [js, setJs] = useState('');

    useEffect(() => {
        if (isOpen) {
            setHtml(initialHtml || '');
            setStyles(initialStyles || '');
            setClasses(initialClasses || '');
            setJs(initialJs || '');
            setActiveTab('css'); // Focus css directly if it's the requested tab, or default to html
        }
    }, [isOpen, initialHtml, initialStyles, initialClasses, initialJs]);

    if (!isOpen) return null;

    const tabs = [
        { id: 'html', label: 'index.html', icon: Code, color: '#e34c26' },
        { id: 'css', label: 'style.css', icon: Layers, color: '#264de4' },
        { id: 'js', label: 'script.js', icon: FileJson, color: '#f7df1e' }
    ];

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

    const getEditorContent = () => {
        switch (activeTab) {
            case 'html': return (
                <div style={{ ...editorStyle, background: '#1e1e1e', overflowY: 'auto', border: '1px solid #333', borderRadius: '4px' }}>
                    <Editor
                        value={html || ''}
                        onValueChange={code => setHtml(code)}
                        highlight={code => Prism.highlight(code, Prism.languages.html, 'html')}
                        padding={15}
                        style={{ fontFamily: 'monospace', fontSize: 13, minHeight: '100%' }}
                    />
                </div>
            );
            case 'css': return (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '11px', color: '#858585', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CSS Classes</div>
                        <input value={classes} onChange={e => setClasses(e.target.value)} spellCheck={false} placeholder="class1 class2..." style={{ ...editorStyle, height: '36px', background: 'rgba(0,0,0,0.2)', padding: '0 8px', borderRadius: '4px', border: '1px solid #333', overflowY: 'hidden' }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '11px', color: '#858585', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Inline Styles</div>
                        <div style={{ ...editorStyle, flex: 1, background: '#1e1e1e', overflowY: 'auto', border: '1px solid #333', borderRadius: '4px' }}>
                            <Editor
                                value={styles || ''}
                                onValueChange={code => setStyles(code)}
                                highlight={code => Prism.highlight(code, Prism.languages.css, 'css')}
                                padding={15}
                                style={{ fontFamily: 'monospace', fontSize: 13, minHeight: '100%' }}
                            />
                        </div>
                    </div>
                </div>
            );
            case 'js': return (
                <div style={{ ...editorStyle, background: '#1e1e1e', overflowY: 'auto', border: '1px solid #333', borderRadius: '4px' }}>
                    <Editor
                        value={js || ''}
                        onValueChange={code => setJs(code)}
                        highlight={code => Prism.highlight(code, Prism.languages.javascript, 'javascript')}
                        padding={15}
                        style={{ fontFamily: 'monospace', fontSize: 13, minHeight: '100%' }}
                    />
                </div>
            );
            default: return null;
        }
    };

    const handleSave = () => {
        onSave({ html, styles, classes, js });
        onClose();
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
            <div style={{ width: '80vw', height: '80vh', maxWidth: '1200px', background: '#1e1e1e', borderRadius: '12px', border: '1px solid #333', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                {/* Top Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#252526', padding: '0 1rem', height: '40px', borderBottom: '1px solid #333' }}>
                    <div style={{ fontSize: '13px', color: '#ccc', fontFamily: 'monospace' }}>Detailed Configuration - {elementId}</div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
                </div>
                {/* Tabs Area */}
                <div style={{ display: 'flex', background: '#2d2d2d', height: '35px' }}>
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 1rem', background: activeTab === tab.id ? '#1e1e1e' : 'transparent', border: 'none', borderTop: `2px solid ${activeTab === tab.id ? accentColor : 'transparent'}`, color: activeTab === tab.id ? '#fff' : '#969696', cursor: 'pointer', fontFamily: 'monospace', fontSize: '13px' }}>
                            <tab.icon size={14} color={tab.color} />
                            {tab.label}
                        </button>
                    ))}
                </div>
                {/* Editor Area */}
                <div style={{ flex: 1, position: 'relative', display: 'flex', minHeight: 0 }}>
                    {/* Line numbers mock for visual */}
                    <div style={{ width: '40px', background: '#1e1e1e', borderRight: '1px solid #333', color: '#858585', padding: '1rem 0', textAlign: 'right', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.5', userSelect: 'none', overflow: 'hidden' }}>
                        {[...Array(50)].map((_, i) => <div key={i} style={{ paddingRight: '10px' }}>{i + 1}</div>)}
                    </div>
                    {/* Active Editor */}
                    <div style={{ flex: 1, padding: '1rem', overflow: 'hidden', position: 'relative' }}>
                        {getEditorContent()}
                    </div>
                </div>
                {/* Bottom Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', background: '#007acc', padding: '0.5rem 1rem', height: '40px', flexShrink: 0 }}>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
                    <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', color: '#007acc', border: 'none', padding: '0.25rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                        <Check size={14} /> Apply Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailedConfigModal;
