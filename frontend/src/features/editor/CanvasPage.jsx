import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../shared/api/client';
import { useTheme } from '../../shared/context/ThemeContext';
import {
    Layout, MousePointer2, ChevronLeft, Sidebar as SidebarIcon, Layers,
    Settings, Save, Play, PanelLeftClose, PanelLeftOpen,
    PanelRightClose, PanelRightOpen, ChevronUp, ChevronDown,
    Search, ZoomIn, ZoomOut, Maximize, Grid3X3, Ruler,
    ChevronRight, Code, Wand2, Type, RotateCcw, Minimize, Plus
} from 'lucide-react';

import Notification from '../../components/ui/Notification';


import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { LAYOUT_TEMPLATES } from './constants/layouts';

const TreeItem = ({ item, depth, selectedId, onSelect, expandedNodes, onToggleExpand }) => {
    const isSelected = selectedId === item.id;
    const isExpanded = expandedNodes.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const indentation = depth * 16 + 8; // Increased indentation

    const getIcon = (tagName) => {
        switch (tagName) {
            case 'p':
            case 'span':
            case 'text':
            case 'label':
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
                return <Type size={14} style={{ color: '#94a3b8' }} />;
            case 'img':
            case 'image':
            case 'figure':
                return <Image size={14} style={{ color: '#60a5fa' }} />;
            case 'nav':
            case 'footer':
            case 'header':
            case 'section':
            case 'main':
            case 'article':
            case 'aside':
                return <Layout size={14} style={{ color: '#f59e0b' }} />;
            case 'button':
            case 'a':
            case 'select':
            case 'input':
                return <MousePointer2 size={14} style={{ color: '#10b981' }} />;
            case 'svg':
            case 'path':
            case 'circle':
            case 'rect':
                return <Layers size={14} style={{ color: '#ec4899' }} />;
            case 'video':
            case 'iframe':
                return <Play size={14} style={{ color: '#ef4444' }} />;
            case 'ul':
            case 'ol':
            case 'li':
                return <Grid3X3 size={14} style={{ color: '#8b5cf6' }} />;
            default:
                return <Code size={14} style={{ color: '#94a3b8' }} />;
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* Visual Nesting Line */}
            {depth > 0 && (
                <div style={{
                    position: 'absolute',
                    left: `${(depth - 1) * 16 + 16}px`,
                    top: 0,
                    bottom: 0,
                    width: '1px',
                    background: 'rgba(255,255,255,0.05)',
                    pointerEvents: 'none'
                }} />
            )}

            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(item.id);
                }}
                className="tree-item-row"
                style={{
                    padding: '0.375rem 0.5rem',
                    paddingLeft: `${indentation}px`,
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    border: `1px solid ${isSelected ? 'rgba(99, 102, 241, 0.4)' : 'transparent'} `,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: isSelected ? 'white' : 'var(--text-muted)',
                    transition: 'all 0.15s ease',
                    fontSize: '0.8125rem',
                    position: 'relative',
                    userSelect: 'none',
                    margin: '1px 0'
                }}
                onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
            >
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleExpand(item.id);
                    }}
                    style={{
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: isExpanded ? 'rotate(90deg)' : 'none',
                        transition: 'transform 0.2s',
                        visibility: hasChildren ? 'visible' : 'hidden',
                        cursor: 'pointer',
                        marginLeft: '-4px',
                        color: isSelected ? 'white' : 'rgba(255,255,255,0.4)'
                    }}
                >
                    <ChevronRight size={14} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', opacity: isSelected ? 1 : 0.7 }}>
                    {getIcon(item.tagName)}
                </div>
                <span style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: isSelected ? '600' : '400',
                    opacity: isSelected ? 1 : 0.8,
                    fontSize: '0.75rem',
                    letterSpacing: '0.01em'
                }}>
                    {item.name}
                </span>
            </div>
            {hasChildren && isExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {item.children.map(child => (
                        <TreeItem
                            key={child.id}
                            item={child}
                            depth={depth + 1}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            expandedNodes={expandedNodes}
                            onToggleExpand={onToggleExpand}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const CanvasPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { accentColor, setAccentColor } = useTheme();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedElementId, setSelectedElementId] = useState(null);

    const [leftPanelOpen, setLeftPanelOpen] = useState(false);
    const [rightPanelOpen, setRightPanelOpen] = useState(false);
    const [headerOpen, setHeaderOpen] = useState(true);

    const [showRulers, setShowRulers] = useState(false);
    const [showGrid, setShowGrid] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [elementTree, setElementTree] = useState([]);
    const [expandedNodes, setExpandedNodes] = useState(new Set(['canvas']));
    const [canvasHtml, setCanvasHtml] = useState(null);

    // Inspector Edit States
    const [editHtml, setEditHtml] = useState('');
    const [editClasses, setEditClasses] = useState('');
    const [cssProperties, setCssProperties] = useState([]);
    const [editJs, setEditJs] = useState('');

    const [notification, setNotification] = useState(null);
    const [clipboardData, setClipboardData] = useState(null);
    const [clipboardStyles, setClipboardStyles] = useState(null);

    // Sidebar widths
    const [leftWidth, setLeftWidth] = useState(280);
    const [rightWidth, setRightWidth] = useState(320);
    const [isResizingLeft, setIsResizingLeft] = useState(false);
    const [isResizingRight, setIsResizingRight] = useState(false);

    const canvasRef = useRef(null);

    // Helpers
    const parseInlineStyle = (styleString) => {
        if (!styleString) return [];
        return styleString.split(';')
            .filter(s => s.trim())
            .map(s => {
                const [prop, ...val] = s.split(':');
                return { prop: prop.trim(), value: val.join(':').trim() };
            });
    };

    const stringifyProperties = (props) => {
        return props
            .filter(p => p.prop.trim() && p.value.trim())
            .map(p => `${p.prop.trim()}: ${p.value.trim()}`)
            .join('; ');
    };

    const handleUpdateCssProp = (index, field, value) => {
        setCssProperties(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const toggleExpand = useCallback((id) => {
        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const expandToNode = useCallback((id) => {
        if (!canvasRef.current || id === 'canvas') return;
        const el = canvasRef.current.querySelector(`[data-id="${id}"]`);
        if (!el) return;

        setExpandedNodes(prev => {
            const next = new Set(prev);
            // Root must be expanded to show top-level elements
            next.add('canvas');

            let parent = el.parentElement?.closest('.canvas-element');
            while (parent) {
                const parentId = parent.getAttribute('data-id');
                if (parentId) next.add(parentId);
                parent = parent.parentElement?.closest('.canvas-element');
            }
            return next;
        });
    }, []);

    const prepareCanvasElements = useCallback((node) => {
        if (!node) return;

        const walk = (curr) => {
            // STEP 1: Wrap ALL non-empty text nodes that aren't already in a text-wrapper
            // and aren't in elements that should handle text themselves (like BUTTON or INPUT)
            // Actually, even in a BUTTON, having a selectable text layer is fine for some users.
            // But let's avoid wrapping if it's already a single child of a common text tag.

            const isTextWrapper = curr.classList.contains('text-wrapper');
            if (!isTextWrapper) {
                Array.from(curr.childNodes).forEach(child => {
                    // nodeType 3 is Text
                    if (child.nodeType === 3 && child.textContent.trim().length > 0) {
                        const span = document.createElement('span');
                        span.className = 'canvas-element text-wrapper';
                        span.textContent = child.textContent;
                        curr.replaceChild(span, child);
                    }
                });
            }

            // STEP 2: Tag all actual elements and Recurse
            Array.from(curr.children).forEach(el => {
                if (el.id === 'canvas-ruler-container') return;

                if (!el.classList.contains('canvas-element')) {
                    el.classList.add('canvas-element');
                }

                if (!el.getAttribute('data-id')) {
                    const random = Math.random().toString(36).substring(2, 9);
                    el.setAttribute('data-id', `el-${Date.now()}-${random}`);
                }

                walk(el);
            });
        };
        walk(node);
    }, []);

    const generateTree = useCallback((node) => {
        if (!node) return [];

        return Array.from(node.children)
            .filter(el => el.classList.contains('canvas-element'))
            .map(el => {
                const id = el.getAttribute('data-id');
                const tagName = el.tagName.toLowerCase();

                // Smarter name: 
                // 1. If it's a text-wrapper, use its text
                // 2. If it has direct text nodes (rare now due to wrapping), use them
                // 3. Otherwise use tag + first meaningful class

                let name = tagName;
                const isTextWrapper = el.classList.contains('text-wrapper');

                if (isTextWrapper) {
                    const text = el.textContent.trim();
                    name = text.length > 20 ? text.substring(0, 20) + '...' : text;
                } else if (el.getAttribute('data-label')) {
                    name = el.getAttribute('data-label');
                } else {
                    // Check if it has any DIRECT text node (though most should be wrapped)
                    const directText = Array.from(el.childNodes)
                        .filter(n => n.nodeType === 3)
                        .map(n => n.textContent.trim())
                        .join('')
                        .trim();

                    if (directText.length > 0) {
                        name = directText.length > 20 ? directText.substring(0, 20) + '...' : directText;
                    } else {
                        // Use class name as fallback if descriptive
                        const classes = el.className.split(' ')
                            .filter(c => !['canvas-element', 'element-selected', 'element-hovered', 'text-wrapper'].includes(c));
                        if (classes.length > 0) {
                            name = `${tagName}.${classes[0]}`;
                        }
                    }
                }

                return {
                    id,
                    tagName,
                    name,
                    children: generateTree(el)
                };
            });
    }, []);

    const handleApplyEdits = () => {
        if (selectedElementId && canvasRef.current) {
            if (selectedElementId === 'canvas') {
                canvasRef.current.innerHTML = editHtml;
            } else {
                const el = canvasRef.current.querySelector(`[data-id="${selectedElementId}"]`);
                if (el) {
                    el.innerHTML = editHtml;
                    // Preserve mandatory class
                    el.className = `canvas-element ${editClasses}`.trim();
                    el.setAttribute('style', stringifyProperties(cssProperties));
                }
            }
            // Strip temporary visual classes before saving
            const all = canvasRef.current.querySelectorAll('.canvas-element');
            all.forEach(x => x.classList.remove('element-selected', 'element-hovered'));

            // Persist to state
            const newHtml = canvasRef.current.innerHTML;
            setCanvasHtml(newHtml);

            // Re-apply selection visual to DOM (for current view)
            if (selectedElementId !== 'canvas') {
                const el = canvasRef.current.querySelector(`[data-id="${selectedElementId}"]`);
                if (el) el.classList.add('element-selected');
            }

            // Refresh tree
            prepareCanvasElements(canvasRef.current);
            setElementTree(generateTree(canvasRef.current));
        }
    }, [selectedElementId, editHtml, editClasses, cssProperties, stringifyProperties, prepareCanvasElements, generateTree]);

    const handleSave = useCallback(async () => {
        if (!id || !canvasRef.current) return;

        // Auto-apply pending edits from inspector if an element is selected
        if (selectedElementId) {
            handleApplyEdits();
        }

        try {
            // 1. Clear visual highlights for a clean save
            const allElements = canvasRef.current.querySelectorAll('.canvas-element');
            allElements.forEach(el => el.classList.remove('element-selected', 'element-hovered'));

            // 2. Save to backend
            const cleanHtml = canvasRef.current.innerHTML;
            await api.put(`/projects/${id}`, {
                name: project.name,
                content: cleanHtml,
                accent_color: accentColor
            });

            // 3. Restore visual highlights for the UI
            if (selectedElementId && selectedElementId !== 'canvas') {
                const el = canvasRef.current.querySelector(`[data-id="${selectedElementId}"]`);
                if (el) el.classList.add('element-selected');
            }

            // 4. Update local state to match
            setCanvasHtml(cleanHtml);
            console.log('Project saved successfully');
        } catch (err) {
            console.error('Save failed', err);
        }
    }, [id, project?.name, accentColor, selectedElementId, handleApplyEdits]);

    // Auto-save effect
    useEffect(() => {
        if (!canvasHtml) return;
        const timer = setTimeout(() => {
            handleSave();
        }, 3000); // 3 second debounce
        return () => clearTimeout(timer);
    }, [canvasHtml, handleSave]);

    const fetchProject = useCallback(async () => {
        try {
            const response = await api.get(`/projects/${id}`);
            setProject(response.data);
        } catch (err) {
            console.error('Failed to fetch project', err);
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    // Effects
    /* Removed unused isMobile resize effect */

    useEffect(() => {
        if (id) {
            fetchProject();
        }
    }, [id, fetchProject]);

    useEffect(() => {
        if (project && canvasHtml === null) {
            // Use saved content if available, otherwise use template
            setCanvasHtml(project.content || LAYOUT_TEMPLATES[project.layout] || LAYOUT_TEMPLATES['vertical']);

            // Set accent color from project if exists
            if (project.accent_color) {
                setAccentColor(project.accent_color);
            }
        }
    }, [project, canvasHtml, setAccentColor]);

    useEffect(() => {
        if (canvasRef.current && canvasHtml !== null) {
            canvasRef.current.innerHTML = canvasHtml;
            // Tag all elements after rendering HTML
            prepareCanvasElements(canvasRef.current);
            setElementTree(generateTree(canvasRef.current));
        }
    }, [canvasHtml, prepareCanvasElements, generateTree]);

    useEffect(() => {
        if (selectedElementId && canvasRef.current) {
            expandToNode(selectedElementId);
            if (selectedElementId === 'canvas') {
                setEditHtml(canvasRef.current.innerHTML);
                setCssProperties([]);
                setEditJs('');
            } else {
                const el = canvasRef.current.querySelector(`[data-id="${selectedElementId}"]`);
                if (el) {
                    setEditHtml(el.innerHTML);
                    const classes = Array.from(el.classList)
                        .filter(c => !['canvas-element', 'element-selected', 'element-hovered'].includes(c))
                        .join(' ');
                    setEditClasses(classes);
                    setCssProperties(parseInlineStyle(el.getAttribute('style') || ''));
                    setEditJs(`// Element: ${selectedElementId}`);
                }
            }
        }
    }, [selectedElementId, expandToNode]);


    // Keyboard Shortcuts Logic
    const shortcutActions = {
        toggleAllPanels: () => {
            const allClosed = !leftPanelOpen && !rightPanelOpen && !headerOpen;
            if (allClosed) {
                setLeftPanelOpen(true);
                setRightPanelOpen(true);
                setHeaderOpen(true);
            } else {
                setLeftPanelOpen(false);
                setRightPanelOpen(false);
                setHeaderOpen(false);
            }
        },
        toggleLeftPanel: () => setLeftPanelOpen(!leftPanelOpen),
        toggleRightPanel: () => setRightPanelOpen(!rightPanelOpen),
        toggleSelectionMode: () => {
            setIsSelectionMode(!isSelectionMode);
            if (!isSelectionMode === false) setSelectedElementId(null);
        },
        clearSelection: () => {
            setSelectedElementId(null);
            if (canvasRef.current) {
                const elements = canvasRef.current.querySelectorAll('.canvas-element');
                elements.forEach(el => el.classList.remove('element-selected'));
            }
        },
        toggleRulers: () => setShowRulers(!showRulers),
        toggleGrid: () => setShowGrid(!showGrid),
        zoomIn: () => setZoom(prev => Math.min(prev + 0.1, 2)),
        zoomOut: () => setZoom(prev => Math.max(prev - 0.1, 0.5)),
        zoomReset: () => setZoom(1),
        saveProject: handleSave,
        duplicateElement: () => {
            if (!selectedElementId || selectedElementId === 'canvas') {
                setNotification('Select an element to duplicate');
                return;
            }

            const el = canvasRef.current.querySelector(`[data-id="${selectedElementId}"]`);
            if (el) {
                const clone = el.cloneNode(true);
                const random = Math.random().toString(36).substring(2, 9);
                const newId = `el-${Date.now()}-${random}`;
                clone.setAttribute('data-id', newId);

                // Recursively update children IDs to avoid duplicates
                const updateChildIds = (node) => {
                    Array.from(node.children).forEach(child => {
                        const childRandom = Math.random().toString(36).substring(2, 9);
                        child.setAttribute('data-id', `el-${Date.now()}-${childRandom}`);
                        updateChildIds(child);
                    });
                };
                updateChildIds(clone);

                el.parentNode.insertBefore(clone, el.nextSibling);

                prepareCanvasElements(canvasRef.current);
                setElementTree(generateTree(canvasRef.current));
                setSelectedElementId(newId);
                setNotification('Element duplicated');
            }
        },
        renameElement: () => {
            if (!selectedElementId || selectedElementId === 'canvas') return;
            const newName = window.prompt('Enter new name for this layer:', '');
            if (newName) {
                // In this simplified system, names are derived from tags/text
                // To support custom names, we'd need a data-name attribute or similar
                const el = canvasRef.current.querySelector(`[data-id="${selectedElementId}"]`);
                if (el) {
                    el.setAttribute('data-label', newName); // Custom attribute for naming
                    prepareCanvasElements(canvasRef.current);
                    setElementTree(generateTree(canvasRef.current));
                    setNotification('Element renamed');
                }
            }
        },
        copyElement: () => {
            if (!selectedElementId || selectedElementId === 'canvas') return;
            const el = canvasRef.current.querySelector(`[data-id="${selectedElementId}"]`);
            if (el) {
                setClipboardData({
                    html: el.outerHTML,
                    styles: el.getAttribute('style'),
                    classes: el.className
                });
                setNotification('Element copied to clipboard');
            }
        },
        pasteElement: () => {
            if (!clipboardData) {
                setNotification('Clipboard is empty');
                return;
            }

            let parent = canvasRef.current;
            if (selectedElementId && selectedElementId !== 'canvas') {
                const selected = canvasRef.current.querySelector(`[data-id="${selectedElementId}"]`);
                parent = selected?.parentElement || canvasRef.current;
            }

            const temp = document.createElement('div');
            temp.innerHTML = clipboardData.html;
            const newEl = temp.firstElementChild;

            const random = Math.random().toString(36).substring(2, 9);
            const newId = `el-${Date.now()}-${random}`;
            newEl.setAttribute('data-id', newId);

            parent.appendChild(newEl);
            prepareCanvasElements(canvasRef.current);
            setElementTree(generateTree(canvasRef.current));
            setSelectedElementId(newId);
            setNotification('Element pasted');
        },
        pasteOverSelection: () => {
            if (!clipboardData) return;
            if (!selectedElementId) {
                shortcutActions.pasteElement();
                return;
            }

            const parent = selectedElementId === 'canvas'
                ? canvasRef.current
                : canvasRef.current.querySelector(`[data-id="${selectedElementId}"]`);

            if (parent) {
                const temp = document.createElement('div');
                temp.innerHTML = clipboardData.html;
                const newEl = temp.firstElementChild;
                const random = Math.random().toString(36).substring(2, 9);
                const newId = `el-${Date.now()}-${random}`;
                newEl.setAttribute('data-id', newId);

                parent.appendChild(newEl);
                prepareCanvasElements(canvasRef.current);
                setElementTree(generateTree(canvasRef.current));
                setSelectedElementId(newId);
                setNotification('Element pasted into selection');
            }
        },
        copyProperties: () => {
            if (!selectedElementId || selectedElementId === 'canvas') return;
            const el = canvasRef.current.querySelector(`[data-id="${selectedElementId}"]`);
            if (el) {
                setClipboardStyles(el.getAttribute('style'));
                setNotification('Properties copied');
            }
        },
        pasteProperties: () => {
            if (!clipboardStyles || !selectedElementId || selectedElementId === 'canvas') return;
            const el = canvasRef.current.querySelector(`[data-id="${selectedElementId}"]`);
            if (el) {
                el.setAttribute('style', clipboardStyles);
                setNotification('Properties pasted');
                // Force sync inspector
                setCssProperties(parseInlineStyle(clipboardStyles));
            }
        },
        deleteElement: () => {
            if (selectedElementId) {
                console.log(`Deleting element: ${selectedElementId} `);
                // Future Implementation: Remove element from tree state
                setSelectedElementId(null);
            }
        },
        selectChildren: () => {
            if (canvasRef.current) {
                let parentNode;
                if (!selectedElementId || selectedElementId === 'canvas') {
                    parentNode = canvasRef.current;
                } else {
                    parentNode = canvasRef.current.querySelector(`[data-id="${selectedElementId}"]`);
                }

                if (!parentNode) return;

                // Specifically look for the FIRST direct child that is a canvas-element
                const firstChild = Array.from(parentNode.children).find(el => el.classList.contains('canvas-element'));
                if (firstChild) {
                    const childId = firstChild.getAttribute('data-id');
                    setSelectedElementId(childId);

                    const allElements = canvasRef.current.querySelectorAll('.canvas-element');
                    allElements.forEach(el => el.classList.remove('element-selected'));
                    firstChild.classList.add('element-selected');

                    // Also ensure it's expanded in the tree
                    if (selectedElementId) toggleExpand(selectedElementId);
                }
            }
        },
        selectParent: () => {
            if (selectedElementId && canvasRef.current) {
                if (selectedElementId === 'canvas') return;

                const selected = canvasRef.current.querySelector(`[data-id="${selectedElementId}"]`);
                if (!selected) {
                    // If we can't find the selected element but it's not 'canvas', 
                    // something is wrong, but let's fallback to root
                    setSelectedElementId('canvas');
                    return;
                }

                const parent = selected.parentElement?.closest('.canvas-element');
                const allElements = canvasRef.current.querySelectorAll('.canvas-element');
                allElements.forEach(el => el.classList.remove('element-selected'));

                if (parent) {
                    const parentId = parent.getAttribute('data-id');
                    setSelectedElementId(parentId);
                    parent.classList.add('element-selected');
                } else {
                    // Top-level element selected, move selection to Canvas root
                    setSelectedElementId('canvas');
                }
            }
        },
        nextSibling: () => {
            if (selectedElementId && canvasRef.current) {
                const selected = canvasRef.current.querySelector(`[data-id="${selectedElementId}"]`);
                let next = selected?.nextElementSibling;
                while (next && !next.classList.contains('canvas-element')) {
                    next = next.nextElementSibling;
                }
                if (next) {
                    const nextId = next.getAttribute('data-id');
                    setSelectedElementId(nextId);

                    const allElements = canvasRef.current.querySelectorAll('.canvas-element');
                    allElements.forEach(el => el.classList.remove('element-selected'));
                    next.classList.add('element-selected');
                }
            }
        },
        prevSibling: () => {
            if (selectedElementId && canvasRef.current) {
                const selected = canvasRef.current.querySelector(`[data-id="${selectedElementId}"]`);
                let prev = selected?.previousElementSibling;
                while (prev && !prev.classList.contains('canvas-element')) {
                    prev = prev.previousElementSibling;
                }
                if (prev) {
                    const prevId = prev.getAttribute('data-id');
                    setSelectedElementId(prevId);

                    const allElements = canvasRef.current.querySelectorAll('.canvas-element');
                    allElements.forEach(el => el.classList.remove('element-selected'));
                    prev.classList.add('element-selected');
                }
            }
        },
        groupSelection: () => console.log('Grouping elements'),
        toggleFullScreen: () => {
            const anyOpen = leftPanelOpen || rightPanelOpen || headerOpen;
            if (anyOpen) {
                setLeftPanelOpen(false);
                setRightPanelOpen(false);
                setHeaderOpen(false);
            } else {
                setLeftPanelOpen(true);
                setRightPanelOpen(true);
                setHeaderOpen(true);
            }
        },
        addElement: () => {
            if (!selectedElementId) {
                setNotification('Please select a parent element first!');
                return;
            }

            if (canvasRef.current) {
                let parent;
                if (selectedElementId === 'canvas') {
                    parent = canvasRef.current;
                } else {
                    parent = canvasRef.current.querySelector(`[data-id="${selectedElementId}"]`);
                }

                if (parent) {
                    const newEl = document.createElement('div');
                    const randomId = Math.random().toString(36).substring(2, 9);
                    const id = `el-${Date.now()}-${randomId}`;
                    newEl.setAttribute('data-id', id);
                    newEl.className = 'canvas-element';
                    newEl.style.padding = '1.5rem';
                    newEl.style.border = '1px dashed rgba(0,0,0,0.1)';
                    newEl.style.borderRadius = '0.5rem';
                    newEl.style.margin = '0.5rem';
                    newEl.textContent = 'New Layer';

                    parent.appendChild(newEl);

                    // Refresh tree
                    prepareCanvasElements(canvasRef.current);
                    setElementTree(generateTree(canvasRef.current));

                    // Select new element
                    setSelectedElementId(id);

                    // Trigger expansion of parent to show new child
                    setExpandedNodes(prev => {
                        const next = new Set(prev);
                        next.add(selectedElementId);
                        return next;
                    });
                }
            }
        }
    };

    useKeyboardShortcuts(shortcutActions);


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

            e.preventDefault();
            e.stopPropagation();

            const allElements = canvasRef.current.querySelectorAll('.canvas-element');
            allElements.forEach(el => el.classList.remove('element-selected'));

            if (target) {
                const elementId = target.getAttribute('data-id');
                setSelectedElementId(elementId);
                target.classList.add('element-selected');
            } else {
                // Clicked on empty canvas
                setSelectedElementId('canvas');
            }
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

    // Resizing Logic
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isResizingLeft) {
                const newWidth = Math.max(200, Math.min(600, e.clientX));
                setLeftWidth(newWidth);
            }
            if (isResizingRight) {
                const newWidth = Math.max(240, Math.min(600, window.innerWidth - e.clientX));
                setRightWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizingLeft(false);
            setIsResizingRight(false);
            document.body.style.cursor = 'default';
        };

        if (isResizingLeft || isResizingRight) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = 'auto';
        };
    }, [isResizingLeft, isResizingRight]);

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.5rem' }}>
                        <button
                            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                            style={{ background: 'none', border: 'none', color: leftPanelOpen ? accentColor : 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
                            title="Toggle Layers"
                        >
                            {leftPanelOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                        </button>
                        <button
                            onClick={() => setRightPanelOpen(!rightPanelOpen)}
                            style={{ background: 'none', border: 'none', color: rightPanelOpen ? accentColor : 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
                            title="Toggle Inspector"
                        >
                            {rightPanelOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                            onClick={handleSave}
                            className="premium-button"
                            style={{ height: '36px', padding: '0 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
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

            {/* Header Toggle Button */}
            {!headerOpen && (
                <button
                    onClick={() => setHeaderOpen(true)}
                    className="glass-panel"
                    style={{
                        position: 'fixed',
                        top: '1rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '40px',
                        height: '40px',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        zIndex: 3000,
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        transition: 'all 0.3s'
                    }}
                >
                    <ChevronDown size={20} />
                </button>
            )}

            {/* Layout Wrapper */}
            <div style={{
                display: 'flex',
                height: '100%',
                paddingTop: headerOpen ? '60px' : 0,
                transition: 'padding 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Left Sidebar */}
                <aside
                    className="glass-panel"
                    style={{
                        position: 'fixed',
                        top: headerOpen ? '60px' : 0,
                        left: leftPanelOpen ? 0 : `-${leftWidth}px`,
                        bottom: 0,
                        width: `${leftWidth}px`,
                        flexShrink: 0,
                        borderRight: leftPanelOpen ? '1px solid rgba(255,255,255,0.1)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: isResizingLeft ? 'none' : 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        overflow: 'hidden',
                        zIndex: 1500,
                        height: 'auto'
                    }}
                >
                    {/* Resize Handle Left */}
                    <div
                        onMouseDown={() => setIsResizingLeft(true)}
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: '4px',
                            cursor: 'col-resize',
                            zIndex: 10,
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = accentColor + '66'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    />
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Layers size={18} color={accentColor} />
                            <span style={{ fontWeight: '600', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>Element Tree</span>
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {/* Static Canvas Entry (Now Collapsible) */}
                            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                <div
                                    onClick={() => setSelectedElementId('canvas')}
                                    style={{
                                        padding: '0.375rem 0.5rem',
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer',
                                        background: selectedElementId === 'canvas' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                        border: `1px solid ${selectedElementId === 'canvas' ? 'rgba(99, 102, 241, 0.4)' : 'transparent'}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: selectedElementId === 'canvas' ? 'white' : 'var(--text-muted)',
                                        transition: 'all 0.15s ease',
                                        fontSize: '0.8125rem',
                                        userSelect: 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (selectedElementId !== 'canvas') e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedElementId !== 'canvas') e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleExpand('canvas');
                                        }}
                                        style={{
                                            width: 20,
                                            height: 20,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transform: expandedNodes.has('canvas') ? 'rotate(90deg)' : 'none',
                                            transition: 'transform 0.2s',
                                            cursor: 'pointer',
                                            marginLeft: '-4px',
                                            color: selectedElementId === 'canvas' ? 'white' : 'rgba(255,255,255,0.4)'
                                        }}
                                    >
                                        <ChevronRight size={14} />
                                    </div>
                                    <Layout size={14} style={{ opacity: selectedElementId === 'canvas' ? 1 : 0.7 }} />
                                    <span style={{
                                        fontWeight: selectedElementId === 'canvas' ? '600' : '400',
                                        fontSize: '0.75rem'
                                    }}>
                                        Canvas (Root)
                                    </span>
                                </div>

                                {/* Element Tree Recursive Rendering - Only if Canvas is expanded */}
                                {expandedNodes.has('canvas') && (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        {elementTree.map(item => (
                                            <TreeItem
                                                key={item.id}
                                                item={item}
                                                depth={1}
                                                selectedId={selectedElementId}
                                                onSelect={(id) => {
                                                    setSelectedElementId(id);
                                                    const el = canvasRef.current.querySelector(`[data-id="${id}"]`);
                                                    if (el) {
                                                        const all = canvasRef.current.querySelectorAll('.canvas-element');
                                                        all.forEach(x => x.classList.remove('element-selected'));
                                                        el.classList.add('element-selected');
                                                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    }
                                                }}
                                                expandedNodes={expandedNodes}
                                                onToggleExpand={toggleExpand}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Workspace Area */}
                <main style={{
                    flex: 1,
                    marginLeft: leftPanelOpen ? `${leftWidth}px` : 0,
                    marginRight: rightPanelOpen ? `${rightWidth}px` : 0,
                    position: 'relative',
                    transition: (isResizingLeft || isResizingRight) ? 'none' : 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    zIndex: 100
                }}>
                    {/* Rulers */}
                    {showRulers && (
                        <>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '20px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border)', zIndex: 1000, fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '0 5px' }}>
                                <span>0</span>
                                <div style={{ flex: 1, height: '100%', background: 'repeating-linear-gradient(90deg, transparent, transparent 49px, var(--border) 50px)', marginLeft: '10px' }} />
                            </div>
                            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '20px', background: 'rgba(255,255,255,0.05)', borderRight: '1px solid var(--border)', zIndex: 1000, fontSize: '10px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px 0' }}>
                                <span>0</span>
                                <div style={{ flex: 1, width: '100%', background: 'repeating-linear-gradient(180deg, transparent, transparent 49px, var(--border) 50px)', marginTop: '10px' }} />
                            </div>
                        </>
                    )}

                    {/* Canvas Frame */}
                    <div style={{
                        width: '80vw',
                        height: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'white',
                        color: 'black',
                        borderRadius: 0,
                        boxShadow: selectedElementId === 'canvas'
                            ? `0 0 0 4px ${accentColor}, 0 30px 80px rgba(0,0,0,0.8)`
                            : '0 30px 80px rgba(0,0,0,0.8)',
                        position: 'relative',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        overflow: 'hidden',
                        transform: `scale(${zoom})`,
                        border: selectedElementId === 'canvas' ? `2px solid ${accentColor}` : 'none'
                    }}>
                        {/* Grid Overlay */}
                        {showGrid && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                pointerEvents: 'none',
                                backgroundImage: `linear-gradient(${accentColor}11 1px, transparent 1px), linear-gradient(90deg, ${accentColor}11 1px, transparent 1px)`,
                                backgroundSize: '20px 20px',
                                zIndex: 5
                            }} />
                        )}
                        <div
                            ref={canvasRef}
                            style={{
                                width: '100%',
                                height: '100%',
                                overflow: 'auto'
                            }}
                        />
                    </div>

                    {/* View/Tool Controls (Bottom Right) */}
                    <div style={{
                        position: 'absolute',
                        bottom: '1.5rem',
                        right: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        zIndex: 2500
                    }}>
                        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '0.25rem', borderRadius: '0.75rem', gap: '0.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                            {/* Selection Mode Toggle */}
                            <button
                                onClick={() => {
                                    setIsSelectionMode(!isSelectionMode);
                                    if (isSelectionMode) setSelectedElementId(null);
                                }}
                                style={{
                                    background: isSelectionMode ? accentColor : 'transparent',
                                    color: isSelectionMode ? 'white' : 'var(--text-muted)',
                                    border: 'none',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s'
                                }}
                                title="Selection Mode (V)"
                            >
                                <MousePointer2 size={18} />
                            </button>

                            <button
                                onClick={shortcutActions.addElement}
                                style={{
                                    background: 'transparent',
                                    color: 'var(--text-muted)',
                                    border: 'none',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s'
                                }}
                                title="Add Element (A)"
                                onMouseEnter={(e) => e.currentTarget.style.color = accentColor}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                            >
                                <Plus size={18} />
                            </button>

                            <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 4px' }} />

                            <button onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }} title="Zoom Out (Ctrl -)">
                                <ZoomOut size={18} />
                            </button>
                            <span style={{ fontSize: '0.75rem', width: '40px', textAlign: 'center', color: 'var(--text-main)' }}>{Math.round(zoom * 100)}%</span>
                            <button onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }} title="Zoom In (Ctrl +)">
                                <ZoomIn size={18} />
                            </button>
                            <div style={{ height: '24px', width: '1px', background: 'var(--border)' }} />
                            <button onClick={() => setZoom(1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }} title="Reset Zoom (Ctrl 0)">
                                <RotateCcw size={18} />
                            </button>
                        </div>

                        <button
                            onClick={shortcutActions.toggleFullScreen}
                            className="glass-panel"
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: !(leftPanelOpen || rightPanelOpen || headerOpen) ? accentColor : 'var(--text-muted)',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                            title="Toggle Full UI (Ctrl /)"
                        >
                            {!(leftPanelOpen || rightPanelOpen || headerOpen) ? (
                                <Minimize size={18} />
                            ) : (
                                <Maximize size={18} />
                            )}
                        </button>

                        <button
                            onClick={() => setShowGrid(!showGrid)}
                            className="glass-panel"
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: showGrid ? accentColor : 'var(--text-muted)',
                                cursor: 'pointer',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                            title="Toggle Grid (Shift G)"
                        >
                            <Grid3X3 size={18} />
                        </button>

                        <button
                            onClick={() => setShowRulers(!showRulers)}
                            className="glass-panel"
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: showRulers ? accentColor : 'var(--text-muted)',
                                cursor: 'pointer',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                            title="Toggle Rulers (Shift R)"
                        >
                            <Ruler size={18} />
                        </button>
                    </div>
                </main>

                {/* Right Sidebar */}
                <aside
                    className="glass-panel"
                    style={{
                        position: 'fixed',
                        top: headerOpen ? '60px' : 0,
                        right: rightPanelOpen ? 0 : `-${rightWidth}px`,
                        bottom: 0,
                        width: `${rightWidth}px`,
                        flexShrink: 0,
                        borderLeft: rightPanelOpen ? '1px solid rgba(255,255,255,0.1)' : 'none',
                        transition: isResizingRight ? 'none' : 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        overflow: 'hidden',
                        zIndex: 1500,
                        height: 'auto',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Resize Handle Right */}
                    <div
                        onMouseDown={() => setIsResizingRight(true)}
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '4px',
                            cursor: 'col-resize',
                            zIndex: 10,
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = accentColor + '66'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    />
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>Inspector</span>
                            <Settings size={18} color={accentColor} />
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                        {selectedElementId ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Element ID</div>
                                    <div style={{ fontWeight: '600', color: accentColor }}>{selectedElementId}</div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        <Code size={14} /> HTML Content
                                    </div>
                                    <textarea
                                        value={editHtml}
                                        onChange={(e) => setEditHtml(e.target.value)}
                                        placeholder="Inner HTML..."
                                        style={{
                                            width: '100%', height: '80px', background: 'rgba(0,0,0,0.3)', color: '#eee',
                                            border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.5rem',
                                            fontSize: '0.8125rem', fontFamily: 'monospace', resize: 'vertical'
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        <Layers size={14} /> CSS Classes
                                    </div>
                                    <input
                                        value={editClasses}
                                        onChange={(e) => setEditClasses(e.target.value)}
                                        placeholder="class1 class2..."
                                        style={{
                                            width: '100%', background: 'rgba(0,0,0,0.3)', color: '#eee',
                                            border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem',
                                            fontSize: '0.8125rem', outline: 'none'
                                        }}
                                    />
                                </div>

                                {/* CSS Property Editor Placeholder */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        <Wand2 size={14} /> Styles
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {cssProperties.map((p, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', padding: '4px 8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <input
                                                    value={p.prop}
                                                    onChange={(e) => handleUpdateCssProp(i, 'prop', e.target.value)}
                                                    placeholder="property"
                                                    style={{ flex: 1, background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '11px', outline: 'none' }}
                                                />
                                                <div style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 'bold' }}>:</div>
                                                <input
                                                    value={p.value}
                                                    onChange={(e) => handleUpdateCssProp(i, 'value', e.target.value)}
                                                    placeholder="value"
                                                    style={{ flex: 2, background: 'transparent', border: 'none', color: accentColor, fontSize: '11px', outline: 'none' }}
                                                />
                                                <button
                                                    onClick={() => {
                                                        const newProps = cssProperties.filter((_, index) => index !== i);
                                                        setCssProperties(newProps);
                                                    }}
                                                    style={{ background: 'none', border: 'none', color: 'rgba(244, 63, 94, 0.4)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                                                    onMouseEnter={(e) => e.target.style.color = 'rgba(244, 63, 94, 0.8)'}
                                                    onMouseLeave={(e) => e.target.style.color = 'rgba(244, 63, 94, 0.4)'}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => setCssProperties([...cssProperties, { prop: '', value: '' }])}
                                            style={{
                                                background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)',
                                                borderRadius: '6px', padding: '6px', color: 'var(--text-muted)',
                                                fontSize: '11px', cursor: 'pointer', marginTop: '4px', transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = 'rgba(255,255,255,0.05)';
                                                e.target.style.color = 'white';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = 'rgba(255,255,255,0.02)';
                                                e.target.style.color = 'var(--text-muted)';
                                            }}
                                        >
                                            + Add Property
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        <Type size={14} /> JS / State
                                    </div>
                                    <textarea
                                        value={editJs}
                                        onChange={(e) => setEditJs(e.target.value)}
                                        placeholder="// JavaScript logic..."
                                        style={{
                                            width: '100%', height: '60px', background: 'rgba(0,0,0,0.3)', color: '#eee',
                                            border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.5rem',
                                            fontSize: '0.8125rem', fontFamily: 'monospace', resize: 'vertical'
                                        }}
                                    />
                                </div>

                                <button
                                    onClick={handleApplyEdits}
                                    className="premium-button"
                                    style={{ width: '100%', background: accentColor, marginTop: '0.5rem' }}
                                >
                                    Apply Changes
                                </button>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                                Pick an element to start editing
                            </div>
                        )}
                    </div>
                </aside>

                <style>{`
                .canvas-element {
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }
                .element-hovered {
                    background-color: ${accentColor}33 !important;
                    box-shadow: inset 0 0 0 4px ${accentColor}66 !important;
                }
                .element-selected {
                    box-shadow: inset 0 0 0 4px ${accentColor} !important;
                    outline: 4px solid ${accentColor} !important;
                    outline-offset: -4px;
                }
            `}</style>
            </div>

            {notification && (
                <Notification
                    message={notification}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
};
