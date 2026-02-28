import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../shared/api/client';
import { Layout, MousePointer2, ChevronLeft, Sidebar, Layers, Settings, Save, Play } from 'lucide-react';

const LAYOUT_TEMPLATES = {
    'vertical': `
<div class="section" data-id="v-1" style="padding:60px; border-bottom:1px solid #ddd;">Hero Section</div>
<div class="section" data-id="v-2" style="padding:60px; border-bottom:1px solid #ddd;">Features Section</div>
<div class="section" data-id="v-3" style="padding:60px; border-bottom:1px solid #ddd;">Testimonials Section</div>
<div class="section" data-id="v-4" style="padding:60px; border-bottom:1px solid #ddd;">Footer Section</div>
`,
    'sidebar': `
<div style="display:flex; height:100vh;">
    <div class="sidebar" data-id="s-1" style="width:220px; background:#222; color:white; padding:20px;">Menu</div>
    <div class="main" data-id="s-2" style="flex:1; padding:20px;">Main Content Area</div>
</div>
`,
    'two-column': `
<div class="container" style="display:flex;">
    <div class="content" data-id="tc-1" style="flex:3; padding:20px;">Article Content</div>
    <div class="sidebar" data-id="tc-2" style="flex:1; padding:20px; background:#f3f3f3;">Related Content</div>
</div>
`,
    'split-screen': `
<div style="display:flex; height:100vh;">
    <div class="left" data-id="ss-1" style="flex:1; display:flex; align-items:center; justify-content:center; background:#111; color:white; font-size:24px;">Text / CTA</div>
    <div class="right" data-id="ss-2" style="flex:1; display:flex; align-items:center; justify-content:center; background:#eee; font-size:24px;">Image / Visual</div>
</div>
`,
    'grid': `
<div class="grid" style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px;">
    <div class="item" data-id="g-1" style="padding:30px; background:#ddd; text-align:center;">Item 1</div>
    <div class="item" data-id="g-2" style="padding:30px; background:#ddd; text-align:center;">Item 2</div>
    <div class="item" data-id="g-3" style="padding:30px; background:#ddd; text-align:center;">Item 3</div>
    <div class="item" data-id="g-4" style="padding:30px; background:#ddd; text-align:center;">Item 4</div>
    <div class="item" data-id="g-5" style="padding:30px; background:#ddd; text-align:center;">Item 5</div>
    <div class="item" data-id="g-6" style="padding:30px; background:#ddd; text-align:center;">Item 6</div>
</div>
`,
    'card': `
<div class="container" style="display:flex; gap:16px; flex-wrap:wrap;">
    <div class="card" data-id="c-1" style="width:200px; padding:20px; border:1px solid #ccc; border-radius:8px;">Card 1</div>
    <div class="card" data-id="c-2" style="width:200px; padding:20px; border:1px solid #ccc; border-radius:8px;">Card 2</div>
    <div class="card" data-id="c-3" style="width:200px; padding:20px; border:1px solid #ccc; border-radius:8px;">Card 3</div>
</div>
`,
    'workspace': `
<div style="display:flex; height:100vh;">
    <div class="left-panel" data-id="w-1" style="width:220px; background:#222; color:white; padding:10px;">Tools</div>
    <div class="canvas" data-id="w-2" style="flex:1; background:#fafafa; padding:20px;">Canvas / Workspace</div>
    <div class="right-panel" data-id="w-3" style="width:260px; background:#eee; padding:10px;">Inspector</div>
</div>
`
};

export const CanvasPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedElementId, setSelectedElementId] = useState(null);
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
        if (!canvasRef.current || !isSelectionMode) return;

        const handleMouseOver = (e) => {
            e.stopPropagation();
            const target = e.target;
            target.style.outline = '2px solid var(--primary)';
            target.style.outlineOffset = '-2px';
            target.style.cursor = 'pointer';
        };

        const handleMouseOut = (e) => {
            const target = e.target;
            if (target.getAttribute('data-id') !== selectedElementId) {
                target.style.outline = 'none';
            } else {
                target.style.outline = '2px solid #10b981'; // Green for selected
            }
        };

        const handleClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const target = e.target;
            const elementId = target.getAttribute('data-id') || 'unknown';
            setSelectedElementId(elementId);

            // Highlight selected
            const allElements = canvasRef.current.querySelectorAll('*');
            allElements.forEach(el => el.style.outline = 'none');
            target.style.outline = '2px solid #10b981';
            target.style.outlineOffset = '-2px';
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
    }, [isSelectionMode, selectedElementId]);

    if (loading) return <div style={{ background: 'var(--bg-dark)', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Editor...</div>;
    if (!project) return null;

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', color: 'var(--text-main)' }}>
            {/* Editor Toolbar */}
            <header style={{
                height: '60px',
                background: 'var(--glass)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1.5rem',
                backdropFilter: 'blur(10px)',
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <div style={{ height: '24px', width: '1px', background: 'var(--border)' }} />
                    <span style={{ fontWeight: 'bold' }}>{project.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-dark)', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
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
                            background: isSelectionMode ? 'var(--primary)' : 'var(--card-bg)',
                            border: '1px solid var(--border)',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <MousePointer2 size={18} />
                        Selection Mode: {isSelectionMode ? 'ON' : 'OFF'}
                    </button>

                    <div style={{ height: '24px', width: '1px', background: 'var(--border)' }} />

                    <button className="premium-button" style={{ height: '36px', padding: '0 1rem' }}>
                        <Save size={18} />
                        Save
                    </button>
                    <button className="premium-button" style={{ height: '36px', padding: '0 1rem', background: '#10b981' }}>
                        <Play size={18} />
                        Publish
                    </button>
                </div>
            </header>

            {/* Editor Workspace */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Left Sidebar (Element Tree) */}
                <aside style={{ width: '280px', borderRight: '1px solid var(--border)', background: 'var(--glass)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Layers size={18} color="var(--primary)" />
                        <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>Element Tree</span>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                            {selectedElementId ? `Selected: ${selectedElementId}` : 'Select an element to inspect'}
                        </div>
                    </div>
                </aside>

                {/* Main Canvas Area */}
                <main style={{ flex: 1, position: 'relative', overflow: 'auto', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                    <div
                        ref={canvasRef}
                        style={{
                            width: '100%',
                            maxWidth: '1200px',
                            minHeight: '100%',
                            background: 'white',
                            color: 'black',
                            borderRadius: '0.5rem',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            position: 'relative'
                        }}
                        dangerouslySetInnerHTML={{ __html: LAYOUT_TEMPLATES[project.layout] || LAYOUT_TEMPLATES['vertical'] }}
                    />
                </main>

                {/* Right Sidebar (Inspector) */}
                <aside style={{ width: '300px', borderLeft: '1px solid var(--border)', background: 'var(--glass)' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Settings size={18} color="var(--primary)" />
                        <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>Inspector</span>
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
        </div>
    );
};
