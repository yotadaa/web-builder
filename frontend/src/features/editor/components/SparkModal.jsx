import React, { useState, useEffect } from 'react';
import { X, Sparkles, Wand2, Loader2, Check, ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
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

    // Model Selection State
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');

    const MODELS = [
        { id: 'gemini-flash-latest', label: 'Gemini Flash Latest', group: 'Google Gemini' },
        { id: 'gemini-3.0-flash', label: 'Gemini 3.0 Flash', group: 'Google Gemini' },
        { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', group: 'Google Gemini' },
        { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', group: 'Google Gemini' },
        { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', group: 'Google Gemini' },
        { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite', group: 'Google Gemini' },
        { id: 'gemini-2.5-flash-live', label: 'Gemini 2.5 Flash Live', group: 'Google Gemini' },
        { id: 'gemini-2.5-flash-preview-native-audio-dialog', label: 'Gemini 2.5 Native Audio', group: 'Google Gemini' },
        { id: 'gemini-2.5-flash-experimental-native-audio-thinking-dialog', label: 'Gemini 2.5 Thinking Audio', group: 'Google Gemini' },
        { id: 'gemini-2.0-flash-live', label: 'Gemini 2.0 Flash Live', group: 'Google Gemini' },
        { id: 'gemini-2.5-flash-preview-tts', label: 'Gemini 2.5 Preview TTS', group: 'Google Gemini' },
        { id: 'gemini-2.0-flash-preview-image-generation', label: 'Gemini 2.0 Image Gen', group: 'Google Gemini' },
        { id: 'gemini-embedding', label: 'Gemini Embedding', group: 'Google Gemini' },
        { id: 'gemma-3', label: 'Gemma 3', group: 'Google Gemini' },
        { id: 'gemma-3n', label: 'Gemma 3n', group: 'Google Gemini' },

        { id: 'gpt-4o-mini', label: 'GPT-4o Mini', group: 'OpenAI / Other' },
        { id: 'gpt-5.1-codex-mini', label: 'GPT-5.1 Codex Mini', group: 'OpenAI / Other' },
        { id: 'gpt-5-mini', label: 'GPT-5 Mini', group: 'OpenAI / Other' },
        { id: 'gpt-5-nano', label: 'GPT-5 Nano', group: 'OpenAI / Other' },
        { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini', group: 'OpenAI / Other' },
        { id: 'gpt-4.1-nano', label: 'GPT-4.1 Nano', group: 'OpenAI / Other' },
        { id: 'o1-mini', label: 'O1 Mini', group: 'OpenAI / Other' },
        { id: 'o3-mini', label: 'O3 Mini', group: 'OpenAI / Other' },
        { id: 'o4-mini', label: 'O4 Mini', group: 'OpenAI / Other' },
        { id: 'codex-mini-latest', label: 'Codex Mini Latest', group: 'OpenAI / Other' },
    ];

    useEffect(() => {
        if (!isOpen) {
            setPrompt('');
            setSuggestions([]);
            setActiveSuggestion(0);
            setActiveTab('preview');
            setError('');
            setIsGenerating(false);
            setIsDropdownOpen(false);
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
                model: selectedModel,
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

    const activeData = suggestions[activeSuggestion];

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}>
            <style>
                {`
                    @keyframes customSpin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .animate-custom-spin {
                        animation: customSpin 1s linear infinite;
                    }
                    
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: #1e1e1e;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #444;
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #666;
                    }

                    @keyframes skeletonPulse {
                        0% { background-color: rgba(255, 255, 255, 0.05); }
                        50% { background-color: rgba(255, 255, 255, 0.1); }
                        100% { background-color: rgba(255, 255, 255, 0.05); }
                    }

                    .skeleton-pulse {
                        animation: skeletonPulse 1.5s ease-in-out infinite;
                        border-radius: 6px;
                    }
                `}
            </style>
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
                            <Textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="E.g., Make this button glow with a neon red shadow and add a bouncing animation"
                                inputStyle={{ minHeight: '120px' }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                        handleGenerate();
                                    }
                                }}
                            />
                            <div style={{ fontSize: '11px', color: '#666', marginTop: '6px', textAlign: 'right' }}>Press Ctrl+Enter to generate</div>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <label style={{ fontSize: '12px', color: '#858585', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>AI Model</label>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '10px 12px', background: '#1e1e1e', border: '1px solid #333', borderRadius: '6px',
                                    color: '#eaeaea', fontSize: '13px', cursor: 'pointer', textAlign: 'left'
                                }}
                            >
                                <span>{MODELS.find(m => m.id === selectedModel)?.label || selectedModel}</span>
                                <ChevronDown size={14} style={{ opacity: 0.6 }} />
                            </button>

                            {isDropdownOpen && (
                                <>
                                    <div
                                        style={{ position: 'fixed', inset: 0, zIndex: 100 }}
                                        onClick={() => setIsDropdownOpen(false)}
                                    />
                                    <div style={{
                                        position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                                        background: 'rgba(15, 23, 42, 0.85)',
                                        backdropFilter: 'blur(8px) saturate(120%)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px',
                                        maxHeight: '200px', overflowY: 'auto', zIndex: 101, boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                                    }} className="custom-scrollbar">
                                        {['Google Gemini', 'OpenAI / Other'].map(group => (
                                            <div key={group}>
                                                <div style={{ padding: '6px 12px', fontSize: '10px', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.02)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                                    {group}
                                                </div>
                                                {MODELS.filter(m => m.group === group).map(m => (
                                                    <div
                                                        key={m.id}
                                                        onClick={() => { setSelectedModel(m.id); setIsDropdownOpen(false); }}
                                                        style={{
                                                            padding: '8px 12px', fontSize: '13px', color: m.id === selectedModel ? '#a855f7' : '#eaeaea',
                                                            cursor: 'pointer', background: m.id === selectedModel ? 'rgba(168,85,247,0.1)' : 'transparent',
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = m.id === selectedModel ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.05)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = m.id === selectedModel ? 'rgba(168,85,247,0.1)' : 'transparent'}
                                                    >
                                                        {m.label}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <Button
                            onClick={handleGenerate}
                            disabled={!prompt.trim()}
                            loading={isGenerating}
                            style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', width: '100%' }}
                            icon={Sparkles}
                        >
                            {Object.keys(suggestions).length > 0 ? 'Regenerate' : 'Generate Suggestions'}
                        </Button>

                        {error && (
                            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '6px', fontSize: '13px', lineHeight: '1.4' }}>
                                {error}
                            </div>
                        )}

                        {isGenerating && suggestions.length === 0 && (
                            <div style={{ marginTop: '1rem' }}>
                                <div style={{ fontSize: '12px', color: '#858585', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Generating Suggestions...</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="skeleton-pulse" style={{ height: '70px', width: '100%' }} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {suggestions.length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                                <div style={{ fontSize: '12px', color: '#858585', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Generated Variants</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: isGenerating ? 0.5 : 1, pointerEvents: isGenerating ? 'none' : 'auto' }}>
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
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#1e1e1e', position: 'relative' }}>
                        {isGenerating && (
                            <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(30,30,30,0.7)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                                <div className="skeleton-pulse" style={{ width: '80%', height: '60%', borderRadius: '12px' }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a855f7' }}>
                                    <Sparkles size={24} className="animate-custom-spin" />
                                    <span style={{ fontWeight: '600', letterSpacing: '0.5px' }}>Engaging AI Spark...</span>
                                </div>
                            </div>
                        )}
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
                                                #spark-preview-container-wrapper {
                                                    ${activeData.inline_styles || ''}
                                                }
                                                ${activeData.global_css_additions || ''}
                                            `}</style>
                                            <div
                                                id="spark-preview-container-wrapper"
                                                className={activeData.css_classes}
                                                style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <div id="spark-preview-container" dangerouslySetInnerHTML={{ __html: activeData.html }} />
                                            </div>
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
                                    <Button
                                        onClick={handleApply}
                                        style={{ background: '#a855f7' }}
                                        icon={Check}
                                    >
                                        Apply This Variant
                                    </Button>
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
