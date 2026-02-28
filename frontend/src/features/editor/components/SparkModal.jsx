import React, { useState, useEffect } from 'react';
import { X, Sparkles, Wand2, Loader2, Check, ArrowRight } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import api from '../../../shared/api/client';

const SparkModal = ({ isOpen, onClose, context, onApply }) => {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [activeSuggestion, setActiveSuggestion] = useState(0);
    const [activeTab, setActiveTab] = useState('preview'); // preview, html, css, js
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setPrompt('');
            setSuggestions([]);
            setActiveSuggestion(0);
            setActiveTab('preview');
            setError('');
            setIsGenerating(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        setError('');

        try {
            const response = await api.post('/ai/spark', {
                prompt,
                context
            });

            if (response.data?.suggestions?.length > 0) {
                setSuggestions(response.data.suggestions);
                setActiveSuggestion(0);
            } else {
                setError('AI returned no valid suggestions. Please try again.');
            }
        } catch (err) {
            console.error('Error generating spark:', err);
            setError('Failed to generate suggestions. Please ensure the backend is running and OPENAI_API_KEY is valid.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApply = () => {
        if (suggestions.length === 0) return;
        onApply(suggestions[activeSuggestion]);
        onClose();
    };

    const renderPreview = (suggestion) => {
        // Construct a safe preview sandbox or just render directly
        // We will inline the styles and class attributes.
        const previewHtml = suggestion.html;
        return (
            <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: '#fff', borderRadius: '8px' }}>
                <style>{suggestion.global_css_additions}</style>
                <div
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                    className={suggestion.css_classes}
                    style={typeof suggestion.inline_styles === 'string' ? {} : suggestion.inline_styles} // We might need to map string to obj if react, but dangerouslySetInnerHTML is safer as just HTML for the element itself, wait we need to parse style string.
                // simpler approach: inject CSS block inside the preview div.
                />
            </div>
        );
    };

    const activeData = suggestions[activeSuggestion];

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}>
            <div style={{ width: '85vw', height: '85vh', maxWidth: '1200px', background: '#1e1e1e', borderRadius: '12px', border: '1px solid #333', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, #252526, #1e1e24)', padding: '0 1rem', height: '50px', borderBottom: '1px solid #333' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>
                        <Wand2 size={18} color="#a855f7" /> AI Spark
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', display: 'flex' }}><X size={18} /></button>
                </div>

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {/* Left Sidebar - Prompt & Input */}
                    <div style={{ width: '30%', minWidth: '300px', background: '#252526', borderRight: '1px solid #333', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '12px', color: '#858585', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>Describe your changes</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="E.g., Make this button glow with a neon red shadow and add a bouncing animation"
                                style={{ width: '100%', height: '120px', background: '#1e1e1e', border: '1px solid #333', borderRadius: '6px', padding: '12px', color: '#eaeaea', fontFamily: 'inherit', resize: 'none', outline: 'none' }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                        handleGenerate();
                                    }
                                }}
                            />
                            <div style={{ fontSize: '11px', color: '#666', marginTop: '6px', textAlign: 'right' }}>Press Ctrl+Enter to generate</div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt.trim()}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                background: isGenerating ? '#333' : 'linear-gradient(135deg, #a855f7, #6366f1)',
                                color: isGenerating ? '#888' : '#fff', border: 'none', padding: '12px', borderRadius: '6px',
                                cursor: isGenerating || !prompt.trim() ? 'not-allowed' : 'pointer', fontWeight: 'bold', transition: 'all 0.2s'
                            }}
                        >
                            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            {isGenerating ? 'Generating...' : Object.keys(suggestions).length > 0 ? 'Regenerate' : 'Generate Suggestions'}
                        </button>

                        {error && (
                            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '6px', fontSize: '13px', lineHeight: '1.4' }}>
                                {error}
                            </div>
                        )}

                        {suggestions.length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                                <div style={{ fontSize: '12px', color: '#858585', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Generated Variants</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {suggestions.map((sug, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveSuggestion(idx)}
                                            style={{
                                                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '12px',
                                                background: activeSuggestion === idx ? 'rgba(168, 85, 247, 0.1)' : '#1e1e1e',
                                                border: `1px solid ${activeSuggestion === idx ? '#a855f7' : '#333'}`,
                                                borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ fontSize: '13px', fontWeight: 'bold', color: activeSuggestion === idx ? '#a855f7' : '#eaeaea', marginBottom: '4px' }}>Variant {idx + 1}: {sug.title}</div>
                                            <div style={{ fontSize: '11px', color: '#858585', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{sug.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Workspace - Preview & Code */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#1e1e1e' }}>
                        {suggestions.length > 0 ? (
                            <>
                                <div style={{ display: 'flex', borderBottom: '1px solid #333', background: '#252526' }}>
                                    {['preview', 'html', 'css', 'js'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            style={{
                                                padding: '12px 24px', background: activeTab === tab ? '#1e1e1e' : 'transparent',
                                                border: 'none', borderTop: `2px solid ${activeTab === tab ? '#a855f7' : 'transparent'}`,
                                                color: activeTab === tab ? '#fff' : '#858585', textTransform: 'capitalize',
                                                fontSize: '13px', fontWeight: activeTab === tab ? 'bold' : 'normal', cursor: 'pointer'
                                            }}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                                <div style={{ flex: 1, padding: '1.5rem', overflow: 'auto' }}>
                                    {activeTab === 'preview' && (
                                        <div style={{ width: '100%', height: '100%', border: '1px dashed #444', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', position: 'relative', overflow: 'hidden' }}>
                                            {/* We inject the style locally so we don't mess up the rest of the app */}
                                            <style>{`
                                                #spark-preview-container .${activeData.css_classes && activeData.css_classes.replace(/\\s+/g, ' .')} {
                                                    ${activeData.inline_styles || ''}
                                                }
                                                ${activeData.global_css_additions || ''}
                                            `}</style>
                                            <div id="spark-preview-container" dangerouslySetInnerHTML={{ __html: activeData.html }} />
                                            {/* Note: js execution in preview varies in complexity, skipping auto-eval out of safety for straightforward previews */}
                                        </div>
                                    )}
                                    {activeTab === 'html' && (
                                        <div style={{ height: '100%', background: '#1e1e1e', borderRadius: '4px', border: '1px solid #333' }}>
                                            <Editor value={activeData.html} onValueChange={() => { }} highlight={code => Prism.highlight(code, Prism.languages.html, 'html')} padding={15} style={{ fontFamily: 'monospace', fontSize: 13 }} disabled />
                                        </div>
                                    )}
                                    {activeTab === 'css' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                                            <div>
                                                <div style={{ fontSize: '11px', color: '#858585', marginBottom: '8px', textTransform: 'uppercase' }}>Classes</div>
                                                <div style={{ padding: '12px', background: '#252526', border: '1px solid #333', borderRadius: '4px', fontFamily: 'monospace', fontSize: '13px', color: '#d4d4d4' }}>{activeData.css_classes || 'None'}</div>
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ fontSize: '11px', color: '#858585', marginBottom: '8px', textTransform: 'uppercase' }}>Inline Styles</div>
                                                <div style={{ flex: 1, background: '#1e1e1e', borderRadius: '4px', border: '1px solid #333' }}>
                                                    <Editor value={activeData.inline_styles || ''} onValueChange={() => { }} highlight={code => Prism.highlight(code, Prism.languages.css, 'css')} padding={15} style={{ fontFamily: 'monospace', fontSize: 13 }} disabled />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'js' && (
                                        <div style={{ height: '100%', background: '#1e1e1e', borderRadius: '4px', border: '1px solid #333' }}>
                                            <Editor value={activeData.js || ''} onValueChange={() => { }} highlight={code => Prism.highlight(code, Prism.languages.javascript, 'javascript')} padding={15} style={{ fontFamily: 'monospace', fontSize: 13 }} disabled />
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: '#252526', borderTop: '1px solid #333' }}>
                                    <div style={{ fontSize: '13px', color: '#858585' }}>Displaying Variant {activeSuggestion + 1} of {suggestions.length}</div>
                                    <button
                                        onClick={handleApply}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#a855f7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        <Check size={16} /> Apply This Variant
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666', gap: '1rem' }}>
                                <Wand2 size={48} opacity={0.2} />
                                <div>Enter a prompt and generate suggestions to see AI magic here.</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SparkModal;
