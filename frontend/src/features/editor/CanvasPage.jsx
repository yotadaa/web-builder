import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../shared/api/client';
import { useTheme } from '../../shared/context/ThemeContext';
import {
    Layout, MousePointer2, ChevronLeft, Sidebar as SidebarIcon, Layers,
    Settings, Save, Play, PanelLeftClose, PanelLeftOpen,
    PanelRightClose, PanelRightOpen, ChevronUp, ChevronDown
} from 'lucide-react';

const LAYOUT_TEMPLATES = {
    'vertical': `
<div class="canvas-element" data-id="v-1" style="padding:60px; border-bottom:1px solid #ddd;">Hero Section</div>
<div class="canvas-element" data-id="v-2" style="padding:60px; border-bottom:1px solid #ddd;">Features Section</div>
<div class="canvas-element" data-id="v-3" style="padding:60px; border-bottom:1px solid #ddd;">Testimonials Section</div>
<div class="canvas-element" data-id="v-4" style="padding:60px; border-bottom:1px solid #ddd;">Footer Section</div>
`,
    'sidebar': `
<div style="display:flex; height:100vh;">
    <div class="canvas-element" data-id="s-1" style="width:220px; background:#222; color:white; padding:20px;">Menu</div>
    <div class="canvas-element" data-id="s-2" style="flex:1; padding:20px;">Main Content Area</div>
</div>
`,
    'two-column': `
<div class="canvas-element" style="display:flex;">
    <div class="canvas-element" data-id="tc-1" style="flex:3; padding:20px;">Article Content</div>
    <div class="canvas-element" data-id="tc-2" style="flex:1; padding:20px; background:#f3f3f3;">Related Content</div>
</div>
`,
    'split-screen': `
<div style="display:flex; height:100vh;">
    <div class="canvas-element" data-id="ss-1" style="flex:1; display:flex; align-items:center; justify-content:center; background:#111; color:white; font-size:24px;">Text / CTA</div>
    <div class="canvas-element" data-id="ss-2" style="flex:1; display:flex; align-items:center; justify-content:center; background:#eee; font-size:24px;">Image / Visual</div>
</div>
`,
    'grid': `
<div class="canvas-element" style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px;">
    <div class="canvas-element" data-id="g-1" style="padding:30px; background:#ddd; text-align:center;">Item 1</div>
    <div class="canvas-element" data-id="g-2" style="padding:30px; background:#ddd; text-align:center;">Item 2</div>
    <div class="canvas-element" data-id="g-3" style="padding:30px; background:#ddd; text-align:center;">Item 3</div>
    <div class="canvas-element" data-id="g-4" style="padding:30px; background:#ddd; text-align:center;">Item 4</div>
    <div class="canvas-element" data-id="g-5" style="padding:30px; background:#ddd; text-align:center;">Item 5</div>
    <div class="canvas-element" data-id="g-6" style="padding:30px; background:#ddd; text-align:center;">Item 6</div>
</div>
`,
    'card': `
<div class="canvas-element" style="display:flex; gap:16px; flex-wrap:wrap;">
    <div class="canvas-element" data-id="c-1" style="width:200px; padding:20px; border:1px solid #ccc; border-radius:8px;">Card 1</div>
    <div class="canvas-element" data-id="c-2" style="width:200px; padding:20px; border:1px solid #ccc; border-radius:8px;">Card 2</div>
    <div class="canvas-element" data-id="c-3" style="width:200px; padding:20px; border:1px solid #ccc; border-radius:8px;">Card 3</div>
</div>
`,
    'workspace': `
<div style="display:flex; height:100vh;">
    <div class="canvas-element" data-id="w-1" style="width:220px; background:#222; color:white; padding:10px;">Tools</div>
    <div class="canvas-element" data-id="w-2" style="flex:1; background:#fafafa; padding:20px;">Canvas / Workspace</div>
    <div class="canvas-element" data-id="w-3" style="width:260px; background:#eee; padding:10px;">Inspector</div>
</div>
`
};

export const CanvasPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { accentColor } = useTheme();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedElementId, setSelectedElementId] = useState(null);

    // UI States
    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [headerOpen, setHeaderOpen] = useState(true);

    const canvasRef = useRef(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await api.get(`/projects/${id}`);
                setProject(response.data);
            } catch (err) {
                console.error('Failed to fetch project', err);
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id, navigate]);

    useEffect(() => {
        if (!canvasRef.current || !isSelectionMode) {
            if (canvasRef.current) {
                const elements = canvasRef.current.querySelectorAll('.canvas-element');
                elements.forEach(el => {
                    el.classList.remove('element-hovered', 'element-selected');
                });
            }
            return;
        }

        const handleMouseOver = (e) => {
            e.stopPropagation();
            const target = e.target.closest('.canvas-element');
            if (target && target.getAttribute('data-id') !== selectedElementId) {
                target.classList.add('element-hovered');
                target.style.cursor = 'pointer';
            }
        };

        const handleMouseOut = (e) => {
            const target = e.target.closest('.canvas-element');
            if (target) {
                target.classList.remove('element-hovered');
            }
        };

        const handleClick = (e) => {
            const target = e.target.closest('.canvas-element');
            if (!target) return;

            e.preventDefault();
            e.stopPropagation();

            const elementId = target.getAttribute('data-id');
            setSelectedElementId(elementId);

            const allElements = canvasRef.current.querySelectorAll('.canvas-element');
            allElements.forEach(el => el.classList.remove('element-selected'));
            target.classList.add('element-selected');
        };

        const canvas = canvasRef.current;
        canvas.addEventListener('mouseover', handleMouseOver);
        canvas.addEventListener('mouseout', handleMouseOut);
        canvas.addEventListener('click', handleClick);

        return () => {
            canvas.removeEventListener('mouseover', handleMouseOver);
            canvas.removeEventListener('mouseout', handleMouseOut);
            canvas.removeEventListener('click', handleClick);
        };
    }, [isSelectionMode, selectedElementId, accentColor]);

    if (loading) return <div style={{ background: 'var(--bg-dark)', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Editor...</div>;
    if (!project) return null;

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-dark)',
            color: 'var(--text-main)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Editor Header (Fixed) */}
            <header
                className="glass-panel"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: headerOpen ? '60px' : '0px',
                    borderBottom: headerOpen ? '1px solid var(--border)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: headerOpen ? '0 1.5rem' : '0',
                    zIndex: 1000,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <div style={{ height: '24px', width: '1px', background: 'var(--border)' }} />
                    <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>{project.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-dark)', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                        {project.layout}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button className="premium-button" style={{ height: '36px', padding: '0 1rem', background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                            <Save size={18} />
                            Save
                        </button>
                        <button className="premium-button" style={{ height: '36px', padding: '0 1rem', background: '#10b981' }}>
                            <Play size={18} />
                            Publish
                        </button>
                    </div>

                    <div style={{ height: '24px', width: '1px', background: 'var(--border)' }} />

                    <button
                        onClick={() => setHeaderOpen(false)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
                        title="Collapse Header"
                    >
                        <ChevronUp size={20} />
                    </button>
                </div>
            </header>

            {/* Left Sidebar (Fixed) */}
            <aside
                className="glass-panel"
                style={{
                    position: 'fixed',
                    top: headerOpen ? '60px' : 0,
                    left: 0,
                    bottom: 0,
                    width: leftPanelOpen ? '280px' : '0px',
                    borderRight: leftPanelOpen ? '1px solid var(--border)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                    zIndex: 900
                }}
            >
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Layers size={18} color={accentColor} />
                        <span style={{ fontWeight: '600', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>Element Tree</span>
                    </div>
                    <button onClick={() => setLeftPanelOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <PanelLeftClose size={18} />
                    </button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                        {selectedElementId ? `Selected: ${selectedElementId}` : 'Select an element to inspect'}
                    </div>
                </div>
            </aside>

            {/* Right Sidebar (Fixed) */}
            <aside
                className="glass-panel"
                style={{
                    position: 'fixed',
                    top: headerOpen ? '60px' : 0,
                    right: 0,
                    bottom: 0,
                    width: rightPanelOpen ? '320px' : '0px',
                    borderLeft: rightPanelOpen ? '1px solid var(--border)' : 'none',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                    zIndex: 900
                }}
            >
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button onClick={() => setRightPanelOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <PanelRightClose size={18} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: '600', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>Inspector</span>
                        <Settings size={18} color={accentColor} />
                    </div>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    {selectedElementId ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Element ID</label>
                                <div style={{ padding: '0.5rem', background: 'var(--bg-dark)', borderRadius: '0.25rem', border: '1px solid var(--border)', fontSize: '0.875rem' }}>
                                    {selectedElementId}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                            Pick an element to start editing
                        </div>
                    )}
                </div>
            </aside>

            {/* Floating Navigation Tools */}
            <div style={{
                position: 'fixed',
                right: '1.5rem',
                top: headerOpen ? '80px' : '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                zIndex: 1100,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                {/* Header Toggle (Only when closed) */}
                {!headerOpen && (
                    <button
                        onClick={() => setHeaderOpen(true)}
                        className="glass-panel"
                        style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '0.75rem',
                            color: 'var(--text-main)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            border: '1px solid var(--border)',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                        }}
                        title="Expand Header"
                    >
                        <ChevronDown size={20} />
                    </button>
                )}

                {/* Left Sidebar Toggle (Only when closed) */}
                {!leftPanelOpen && (
                    <button
                        onClick={() => setLeftPanelOpen(true)}
                        className="glass-panel"
                        style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '0.75rem',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                        }}
                    >
                        <PanelLeftOpen size={20} />
                    </button>
                )}

                {/* Right Sidebar Toggle (Only when closed) */}
                {!rightPanelOpen && (
                    <button
                        onClick={() => setRightPanelOpen(true)}
                        className="glass-panel"
                        style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '0.75rem',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                        }}
                    >
                        <PanelRightOpen size={20} />
                    </button>
                )}

                {/* Selection Mode Toggle */}
                <button
                    onClick={() => {
                        setIsSelectionMode(!isSelectionMode);
                        if (isSelectionMode) setSelectedElementId(null);
                    }}
                    className="glass-panel"
                    style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '0.75rem',
                        background: isSelectionMode ? accentColor : 'transparent',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        border: '1px solid var(--border)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                    }}
                    title="Selection Mode"
                >
                    <MousePointer2 size={20} />
                </button>
            </div>

            {/* Main Canvas Area */}
            <main style={{
                flex: 1,
                paddingTop: headerOpen ? '60px' : '0px',
                paddingLeft: leftPanelOpen ? '280px' : '0px',
                paddingRight: rightPanelOpen ? '320px' : '0px',
                height: '100vh',
                overflow: 'auto',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                background: '#0a0f1d', // Darker background for canvas area
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <div style={{ width: '100%', padding: '3rem', display: 'flex', justifyContent: 'center', minHeight: '100%' }}>
                    <div
                        ref={canvasRef}
                        style={{
                            width: '100%',
                            maxWidth: '1200px',
                            background: 'white',
                            color: 'black',
                            borderRadius: '0.5rem',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            position: 'relative',
                            transition: 'all 0.3s ease',
                            minHeight: '800px'
                        }}
                        dangerouslySetInnerHTML={{ __html: LAYOUT_TEMPLATES[project.layout] || LAYOUT_TEMPLATES['vertical'] }}
                    />
                </div>
            </main>

            <style>{`
                .canvas-element {
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }
                .element-hovered {
                    background-color: ${accentColor}33 !important;
                    box-shadow: inset 0 0 0 2px ${accentColor}66 !important;
                }
                .element-selected {
                    box-shadow: inset 0 0 0 2px ${accentColor} !important;
                    outline: 2px solid ${accentColor} !important;
                    outline-offset: -2px;
                }
            `}</style>
        </div>
    );
};
