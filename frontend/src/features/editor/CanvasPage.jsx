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
<div style="display:flex; height:100%;">
    <div class="canvas-element" data-id="s-1" style="width:220px; background:#222; color:white; padding:20px;">Menu</div>
    <div class="canvas-element" data-id="s-2" style="flex:1; padding:20px;">Main Content Area</div>
</div>
`,
    'two-column': `
<div class="canvas-element" style="display:flex; height:100%;">
    <div class="canvas-element" data-id="tc-1" style="flex:3; padding:20px;">Article Content</div>
    <div class="canvas-element" data-id="tc-2" style="flex:1; padding:20px; background:#f3f3f3;">Related Content</div>
</div>
`,
    'split-screen': `
<div style="display:flex; height:100%;">
    <div class="canvas-element" data-id="ss-1" style="flex:1; display:flex; align-items:center; justify-content:center; background:#111; color:white; font-size:24px;">Text / CTA</div>
    <div class="canvas-element" data-id="ss-2" style="flex:1; display:flex; align-items:center; justify-content:center; background:#eee; font-size:24px;">Image / Visual</div>
</div>
`,
    'grid': `
<div class="canvas-element" style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; height:100%;">
    <div class="canvas-element" data-id="g-1" style="padding:30px; background:#ddd; text-align:center;">Item 1</div>
    <div class="canvas-element" data-id="g-2" style="padding:30px; background:#ddd; text-align:center;">Item 2</div>
    <div class="canvas-element" data-id="g-3" style="padding:30px; background:#ddd; text-align:center;">Item 3</div>
    <div class="canvas-element" data-id="g-4" style="padding:30px; background:#ddd; text-align:center;">Item 4</div>
    <div class="canvas-element" data-id="g-5" style="padding:30px; background:#ddd; text-align:center;">Item 5</div>
    <div class="canvas-element" data-id="g-6" style="padding:30px; background:#ddd; text-align:center;">Item 6</div>
</div>
`,
    'card': `
<div class="canvas-element" style="display:flex; gap:16px; flex-wrap:wrap; padding:20px;">
    <div class="canvas-element" data-id="c-1" style="width:200px; padding:20px; border:1px solid #ccc; border-radius:8px;">Card 1</div>
    <div class="canvas-element" data-id="c-2" style="width:200px; padding:20px; border:1px solid #ccc; border-radius:8px;">Card 2</div>
    <div class="canvas-element" data-id="c-3" style="width:200px; padding:20px; border:1px solid #ccc; border-radius:8px;">Card 3</div>
</div>
`,
    'workspace': `
<div style="display:flex; height:100%;">
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
            width: '100vw',
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
                    zIndex: 2000,
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <div style={{ height: '24px', width: '1px', background: 'var(--border)' }} />
                    <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>{project.name}</span>
                    <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        whiteSpace: 'nowrap'
                    }}>
                        {project.layout}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button className="premium-button" style={{ height: '36px', padding: '0 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
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
                    left: leftPanelOpen ? 0 : '-280px',
                    bottom: 0,
                    width: '280px',
                    borderRight: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                    zIndex: 1500
                }}
            >
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Layers size={18} color={accentColor} />
                        <span style={{ fontWeight: '600', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>Element Tree</span>
                    </div>
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
                    right: rightPanelOpen ? 0 : '-320px',
                    bottom: 0,
                    width: '320px',
                    borderLeft: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                    zIndex: 1500
                }}
            >
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                                <div style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.25rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.875rem' }}>
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
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                zIndex: 2500,
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                {/* Header Toggle (Only when closed) */}
                {!headerOpen && (
                    <button
                        onClick={() => setHeaderOpen(true)}
                        className="glass-panel"
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '1rem',
                            color: 'var(--text-main)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                        }}
                        title="Expand Header"
                    >
                        <ChevronDown size={22} />
                    </button>
                )}

                {/* Left Sidebar Toggle */}
                <button
                    onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                    className="glass-panel"
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '1rem',
                        color: leftPanelOpen ? accentColor : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        background: leftPanelOpen ? 'rgba(255,255,255,0.05)' : 'transparent'
                    }}
                    title={leftPanelOpen ? "Close Left Sidebar" : "Open Left Sidebar"}
                >
                    {leftPanelOpen ? <PanelLeftClose size={22} /> : <PanelLeftOpen size={22} />}
                </button>

                {/* Right Sidebar Toggle */}
                <button
                    onClick={() => setRightPanelOpen(!rightPanelOpen)}
                    className="glass-panel"
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '1rem',
                        color: rightPanelOpen ? accentColor : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        background: rightPanelOpen ? 'rgba(255,255,255,0.05)' : 'transparent'
                    }}
                    title={rightPanelOpen ? "Close Right Sidebar" : "Open Right Sidebar"}
                >
                    {rightPanelOpen ? <PanelRightClose size={22} /> : <PanelRightOpen size={22} />}
                </button>

                {/* Selection Mode Toggle */}
                <button
                    onClick={() => {
                        setIsSelectionMode(!isSelectionMode);
                        if (isSelectionMode) setSelectedElementId(null);
                    }}
                    className="glass-panel"
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '1rem',
                        background: isSelectionMode ? accentColor : 'transparent',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                    }}
                    title="Selection Mode"
                >
                    <MousePointer2 size={22} />
                </button>
            </div>

            {/* Main Workspace Area (Stable) */}
            <main style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                zIndex: 100
            }}>
                {/* Canvas Frame */}
                <div style={{
                    width: '80vw',
                    height: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'white',
                    color: 'black',
                    borderRadius: '1.25rem',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
                    position: 'relative',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden'
                }}>
                    <div
                        ref={canvasRef}
                        style={{
                            width: '100%',
                            height: '100%',
                            overflow: 'auto'
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
