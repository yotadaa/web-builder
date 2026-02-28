import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import api from '../../shared/api/client';
import { useNavigate } from 'react-router-dom';
import { Plus, Folder, Layout, LogOut, Search, Clock, ChevronRight, X, Check, Monitor, Sidebar, Columns, Grid, CreditCard, AppWindow, Rows } from 'lucide-react';

const LAYOUTS = [
    { id: 'vertical', name: 'Vertical / Single Column', icon: Monitor, desc: 'Best for landing pages and simple sites' },
    { id: 'sidebar', name: 'Sidebar / Dashboard', icon: Sidebar, desc: 'Great for web apps and admin panels' },
    { id: 'two-column', name: 'Two Column (Content + Sidebar)', icon: Columns, desc: 'Ideal for blogs and documentation' },
    { id: 'split-screen', name: 'Split Screen', icon: Rows, desc: 'Perfect for landing pages with big visuals' },
    { id: 'grid', name: 'Grid Layout', icon: Grid, desc: 'Excellent for galleries and catalogs' },
    { id: 'card', name: 'Card-Based', icon: CreditCard, desc: 'Clean and modular for content lists' },
    { id: 'workspace', name: 'Workspace / App', icon: AppWindow, desc: 'Full-featured app layout with multi-panels' },
];

export const ProjectDashboard = () => {
    const { user, logout } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects/');
            setProjects(response.data);
        } catch (err) {
            console.error('Failed to fetch projects', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const filteredProjects = Array.isArray(projects) ? projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    const handleProjectCreated = () => {
        fetchProjects();
        setIsModalOpen(false);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
            {/* Navbar */}
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 2rem',
                background: 'var(--glass)',
                borderBottom: '1px solid var(--border)',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Layout size={32} color="var(--primary)" />
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>WebBuilder AI</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.email}</span>
                    <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>My Projects</h1>
                    <button className="premium-button" onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} />
                        New Project
                    </button>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', marginBottom: '2rem' }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        className="premium-input"
                        style={{ paddingLeft: '3rem' }}
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>Loading projects...</div>
                ) : filteredProjects.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {filteredProjects.map(project => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--glass)', borderRadius: '1rem', border: '1px dashed var(--border)' }}>
                        <Folder size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
                        <p style={{ color: 'var(--text-muted)' }}>No projects found. Create your first one!</p>
                    </div>
                )}
            </main>

            {isModalOpen && <NewProjectModal onClose={() => setIsModalOpen(false)} onCreated={handleProjectCreated} />}
        </div>
    );
};

const NewProjectModal = ({ onClose, onCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [layout, setLayout] = useState('vertical');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/projects/', { name, description, layout });
            onCreated();
        } catch (err) {
            console.error('Failed to create project', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
            backdropFilter: 'blur(5px)'
        }}>
            <div className="premium-card" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Create New Project</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-muted)' }}>Project Name</label>
                            <input
                                type="text"
                                className="premium-input"
                                placeholder="My Awesome Website"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-muted)' }}>Description (Optional)</label>
                            <textarea
                                className="premium-input"
                                style={{ minHeight: '80px', padding: '1rem', resize: 'vertical' }}
                                placeholder="What is this project about?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-muted)' }}>Choose Base Layout</label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '1rem'
                        }}>
                            {LAYOUTS.map(l => (
                                <div
                                    key={l.id}
                                    onClick={() => setLayout(l.id)}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '1rem',
                                        border: `2px solid ${layout === l.id ? 'var(--primary)' : 'var(--border)'}`,
                                        background: layout === l.id ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-dark)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.75rem',
                                        position: 'relative'
                                    }}
                                >
                                    {layout === l.id && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '0.5rem',
                                            right: '0.5rem',
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            background: 'var(--primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white'
                                        }}>
                                            <Check size={12} weight="bold" />
                                        </div>
                                    )}
                                    <l.icon size={28} color={layout === l.id ? 'var(--primary)' : 'var(--text-muted)'} />
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{l.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.2' }}>{l.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border)',
                            background: 'transparent',
                            color: 'var(--text)',
                            cursor: 'pointer'
                        }}>
                            Cancel
                        </button>
                        <button type="submit" className="premium-button" disabled={isSubmitting || !name}>
                            {isSubmitting ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProjectCard = ({ project }) => {
    const navigate = useNavigate();
    return (
        <div
            className="premium-card"
            style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            onClick={() => navigate(`/project/${project.id}`)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <Layout size={20} />
                </div>
                <div style={{ padding: '0.25rem 0.5rem', borderRadius: '0.5rem', background: 'var(--bg-dark)', fontSize: '0.75rem', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    {project.layout}
                </div>
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{project.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', minHeight: '2.5rem' }}>
                {project.description || 'No description provided.'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Clock size={14} />
                Updated {new Date(project.updated_at).toLocaleDateString()}
            </div>
        </div>
    );
};
