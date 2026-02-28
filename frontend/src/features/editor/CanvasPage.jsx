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
            // Cleanup highlights when selection mode is OFF
            if (canvasRef.current) {
                const elements = canvasRef.current.querySelectorAll('.canvas-element');
                elements.forEach(el => {
                    el.classList.remove('element-hovered', 'element-selected');
                    el.style.boxShadow = 'none';
                });
            }
            return;
        }

        const handleMouseOver = (e) => {
            e.stopPropagation();
            const target = e.target.closest('.canvas-element');
            if (target && target.getAttribute('data-id') !== selectedElementId) {
                target.style.boxShadow = `inset 0 0 0 2px ${accentColor}88`; // Semi-transparent accent
                target.style.cursor = 'pointer';
            }
        };

        const handleMouseOut = (e) => {
            const target = e.target.closest('.canvas-element');
            if (target && target.getAttribute('data-id') !== selectedElementId) {
                target.style.boxShadow = 'none';
            }
        };

        const handleClick = (e) => {
            const target = e.target.closest('.canvas-element');
            if (!target) return;

            e.preventDefault();
            e.stopPropagation();

            const elementId = target.getAttribute('data-id');
            setSelectedElementId(elementId);

            // Clear previous and set new selected
            const allElements = canvasRef.current.querySelectorAll('.canvas-element');
            allElements.forEach(el => el.style.boxShadow = 'none');
            target.style.boxShadow = `inset 0 0 0 2px ${accentColor}`;
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
            overflow: 'hidden'
        }}>
            {/* Editor Toolbar */}
            <header style={{
                height: headerOpen ? '60px' : '0px',
                background: 'var(--glass)',
                borderBottom: headerOpen ? '1px solid var(--border)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: headerOpen ? '0 1.5rem' : '0',
                backdropFilter: 'blur(10px)',
                zIndex: 100,
                transition: 'all 0.3s ease-in-out',
                overflow: 'hidden',
                position: 'relative'
            }}>
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
                    <button
                        onClick={() => {
                            setIsSelectionMode(!isSelectionMode);
                            if (isSelectionMode) setSelectedElementId(null);
                        }}
                        style={{
                            background: isSelectionMode ? accentColor : 'var(--card-bg)',
                            border: '1px solid var(--border)',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s',
                            fontWeight: '600'
                        }}
                    >
                        <MousePointer2 size={18} />
                        <span style={{ whiteSpace: 'nowrap' }}>Selection Mode</span>
                    </button>

                    <div style={{ height: '24px', width: '1px', background: 'var(--border)' }} />

                    <button className="premium-button" style={{ height: '36px', padding: '0 1rem', background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                        <Save size={18} />
                        Save
                    </button>
                    <button className="premium-button" style={{ height: '36px', padding: '0 1rem', background: '#10b981' }}>
                        <Play size={18} />
                        Publish
                    </button>
                </div>
            </header>

            {/* Toggle Header Button */}
            <button
                onClick={() => setHeaderOpen(!headerOpen)}
                style={{
                    position: 'absolute',
                    top: headerOpen ? '60px' : '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--glass)',
                    border: '1px solid var(--border)',
                    borderTop: 'none',
                    borderRadius: '0 0 0.5rem 0.5rem',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '0.25rem 1rem',
                    zIndex: 110,
                    transition: 'all 0.3s ease-in-out'
                }}
            >
                {headerOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {/* Editor Workspace */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
                {/* Left Sidebar Toggle */}
                {!leftPanelOpen && (
                    <button
                        onClick={() => setLeftPanelOpen(true)}
                        style={{
                            position: 'absolute',
                            left: '0.5rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'var(--glass)',
                            border: '1px solid var(--border)',
                            borderRadius: '0.5rem',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            zIndex: 90
                        }}
                    >
                        <PanelLeftOpen size={18} />
                    </button>
                )}

                {/* Left Sidebar (Element Tree) */}
                <aside style={{
                    width: leftPanelOpen ? '280px' : '0px',
                    borderRight: leftPanelOpen ? '1px solid var(--border)' : 'none',
                    background: 'var(--glass)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease-in-out',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
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

                {/* Main Canvas Area */}
                <main style={{
                    flex: 1,
                    position: 'relative',
                    overflow: 'auto',
                    padding: '2rem',
                    display: 'flex',
                    justifyContent: 'center',
                    background: '#1e293b' // Deep workspace background
                }}>
                    <div
                        ref={canvasRef}
                        style={{
                            width: '100%',
                            maxWidth: '1200px',
                            minHeight: '100%',
                            background: 'white',
                            color: 'black',
                            borderRadius: '0.25rem',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                            position: 'relative',
                            transition: 'all 0.3s ease'
                        }}
                        dangerouslySetInnerHTML={{ __html: LAYOUT_TEMPLATES[project.layout] || LAYOUT_TEMPLATES['vertical'] }}
                    />
                </main>

                {/* Right Sidebar Toggle */}
                {!rightPanelOpen && (
                    <button
                        onClick={() => setRightPanelOpen(true)}
                        style={{
                            position: 'absolute',
                            right: '0.5rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'var(--glass)',
                            border: '1px solid var(--border)',
                            borderRadius: '0.5rem',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            zIndex: 90
                        }}
                    >
                        <PanelRightOpen size={18} />
                    </button>
                )}

                {/* Right Sidebar (Inspector) */}
                <aside style={{
                    width: rightPanelOpen ? '320px' : '0px',
                    borderLeft: rightPanelOpen ? '1px solid var(--border)' : 'none',
                    background: 'var(--glass)',
                    transition: 'all 0.3s ease-in-out',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
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
            </div>

            <style>{`
                .canvas-element {
                    transition: box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
            `}</style>
        </div>
    );
};
