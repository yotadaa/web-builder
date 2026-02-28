import React, { useState, useEffect } from 'react';
import { X, Code, Layers, FileJson, Check } from 'lucide-react';

const DetailedConfigModal = ({ isOpen, onClose, elementId, initialHtml, initialClasses, initialJs, onSave, accentColor = '#6366f1' }) => {
    const [activeTab, setActiveTab] = useState('html');
    const [html, setHtml] = useState('');
    const [classes, setClasses] = useState('');
    const [js, setJs] = useState('');

    useEffect(() => {
        if (isOpen) {
            setHtml(initialHtml || '');
            setClasses(initialClasses || '');
            setJs(initialJs || '');
            setActiveTab('html');
        }
    }, [isOpen, initialHtml, initialClasses, initialJs]);

    if (!isOpen) return null;

    const tabs = [
        { id: 'html', label: 'index.html', icon: Code, color: '#e34c26' },
        { id: 'css', label: 'classes.css', icon: Layers, color: '#264de4' },
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
        whiteSpace: 'pre'
    };

    const getEditorContent = () => {
        switch (activeTab) {
            case 'html': return <textarea value={html} onChange={e => setHtml(e.target.value)} spellCheck={false} style={editorStyle} />;
            case 'css': return <textarea value={classes} onChange={e => setClasses(e.target.value)} spellCheck={false} placeholder="Enter class names separated by spaces..." style={editorStyle} />;
            case 'js': return <textarea value={js} onChange={e => setJs(e.target.value)} spellCheck={false} placeholder="// Enter JavaScript logic..." style={editorStyle} />;
            default: return null;
        }
    };

    const handleSave = () => {
        onSave({ html, classes, js });
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
                <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', background: '#007acc', padding: '0.5rem 1rem', height: '40px' }}>
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
