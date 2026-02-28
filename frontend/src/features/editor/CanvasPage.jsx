import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MousePointer2, Plus, ZoomOut, ZoomIn, RotateCcw, Minimize, Maximize, Grid3X3, Ruler, ChevronLeft, PanelLeftOpen, PanelRightOpen, Play, ChevronUp, Code, PanelLeftClose, PanelRightClose, Wand2, Type, Layout, Settings, Layers, ChevronRight, X, Copy, Square, Circle, Image, Type as TypeIcon, Save, History, Redo, Undo, Trash2, Edit3 } from 'lucide-react';
import PromptModal from './components/PromptModal';
import DetailedConfigModal from './components/DetailedConfigModal';
import GlobalCssModal from './components/GlobalCssModal';
import api from '../../shared/api/client';
import { useTheme } from '../../shared/context/ThemeContext';
import Notification from '../../components/ui/Notification';
import Tooltip from '../../components/ui/Tooltip';
import FloatingToolbox from './components/FloatingToolbox';


import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { LAYOUT_TEMPLATES } from './constants/layouts';

const TreeItem = ({ item, depth, selectedIds = [], onSelect, expandedNodes, onToggleExpand }) => {
    const isSelected = selectedIds.includes(item.id);
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
                    border: `1px solid ${isSelected ? 'rgba(99, 102, 241, 0.4)' : 'transparent'}`,
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
                <Tooltip content={item.name} position="right">
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
                </Tooltip>
            </div>
            {hasChildren && isExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {item.children.map(child => (
                        <TreeItem
                            key={child.id}
                            item={child}
                            depth={depth + 1}
                            selectedIds={selectedIds}
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
    const [selectedElementIds, setSelectedElementIds] = useState([]);

    const [leftPanelOpen, setLeftPanelOpen] = useState(false);
    const [rightPanelOpen, setRightPanelOpen] = useState(false);
    const [headerOpen, setHeaderOpen] = useState(true);

    const [showRulers, setShowRulers] = useState(false);
    const [showGrid, setShowGrid] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [elementTree, setElementTree] = useState([]);
    const [expandedNodes, setExpandedNodes] = useState(new Set(['canvas']));
    // Custom Modal States
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [renameTargetId, setRenameTargetId] = useState(null);
    const [renameDefaultValue, setRenameDefaultValue] = useState('');
    const [canvasHtml, setCanvasHtml] = useState(null);
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

    // Inspector Edit States
    const [editHtml, setEditHtml] = useState('');
    const [editClasses, setEditClasses] = useState('');
    const [cssProperties, setCssProperties] = useState([]);
    const [editJs, setEditJs] = useState('');
    const [isDetailedConfigOpen, setIsDetailedConfigOpen] = useState(false);
    const [isGlobalCssModalOpen, setIsGlobalCssModalOpen] = useState(false);
    const [globalCss, setGlobalCss] = useState('');

    const [notification, setNotification] = useState(null);
    const [clipboardData, setClipboardData] = useState(null);
    const [clipboardStyles, setClipboardStyles] = useState(null);

    // Sidebar widths
    const [leftWidth, setLeftWidth] = useState(280);
    const [rightWidth, setRightWidth] = useState(320);
    const [isResizingLeft, setIsResizingLeft] = useState(false);
    const [isResizingRight, setIsResizingRight] = useState(false);

    const canvasRef = useRef(null);
    const lastSyncHtmlRef = useRef(null);

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

    const stringifyProperties = useCallback((props) => {
        return props
            .filter(p => p.prop.trim() && p.value.trim())
            .map(p => `${p.prop.trim()}: ${p.value.trim()} `)
            .join('; ');
    }, []);

    const handleUpdateCssProp = (index, field, value) => {
        setCssProperties(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const pushHistory = useCallback((content) => {
        if (!content) return;
        setUndoStack(prev => [...prev.slice(-49), content]); // Limit to 50 steps
        setRedoStack([]);
    }, []);

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
                            name = `${tagName}.${classes[0]} `;
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

    const prepareCanvasElements = useCallback((container) => {
        if (!container) return;
        const elements = container.querySelectorAll('.canvas-element');
        elements.forEach(el => {
            if (!el.getAttribute('data-id')) {
                const random = Math.random().toString(36).substring(2, 9);
                el.setAttribute('data-id', `el-${Date.now()}-${random}`);
            }
        });
    }, []);

    const handleSave = useCallback(async () => {
        if (!id || !canvasRef.current) return;

        try {
            // 1. Clear visual highlights for a clean save
            const allElements = canvasRef.current.querySelectorAll('.canvas-element');
            allElements.forEach(el => el.classList.remove('element-selected', 'element-hovered'));

            // 2. Save to backend
            const cleanHtml = canvasRef.current.innerHTML;
            await api.patch(`/projects/${id}`, {
                name: project.name,
                content: cleanHtml,
                accent_color: accentColor
            });

            // 3. Restore visual highlights for the UI
            selectedElementIds.forEach(id => {
                if (id === 'canvas') return;
                const el = canvasRef.current.querySelector(`[data-id="${id}"]`);
                if (el) el.classList.add('element-selected');
            });

            // 4. Update local state to match
            setCanvasHtml(cleanHtml);
            console.log('Project saved successfully');
        } catch (err) {
            console.error('Save failed', err);
        }
    }, [id, project?.name, accentColor, selectedElementIds]);

    const undo = useCallback(() => {
        if (undoStack.length === 0) return;

        const current = canvasRef.current.innerHTML;
        const previous = undoStack[undoStack.length - 1];

        setRedoStack(prev => [current, ...prev]);
        setUndoStack(prev => prev.slice(0, -1));

        setCanvasHtml(previous);
        // Effects will sync DOM
        setNotification('Undo');
    }, [undoStack]);

    const redo = useCallback(() => {
        if (redoStack.length === 0) return;

        const current = canvasRef.current.innerHTML;
        const next = redoStack[0];

        setUndoStack(prev => [...prev, current]);
        setRedoStack(prev => prev.slice(1));

        setCanvasHtml(next);
        setNotification('Redo');
    }, [redoStack]);

    const handleOpenGlobalCss = () => {
        if (!canvasRef.current) return;
        const styleEl = canvasRef.current.querySelector('style#global-project-styles');
        setGlobalCss(styleEl ? styleEl.innerHTML : '');
        setIsGlobalCssModalOpen(true);
    };

    const handleSaveGlobalCss = (cssText) => {
        if (!canvasRef.current) return;
        pushHistory(canvasRef.current.innerHTML);
        let styleEl = canvasRef.current.querySelector('style#global-project-styles');

        if (!cssText.trim()) {
            if (styleEl) styleEl.remove();
        } else {
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = 'global-project-styles';
                canvasRef.current.prepend(styleEl);
            }
            styleEl.innerHTML = cssText;
        }

        setGlobalCss(cssText);
        setNotification('Global CSS applied');
        handleSave();
    };

    const handleOpenDetailedConfig = () => {
        if (selectedElementId && selectedElementId !== 'canvas') {
            setIsDetailedConfigOpen(true);
        }
    };

    const handleSaveDetailedConfig = ({ html, styles, classes, js }) => {
        if (!selectedElementId || selectedElementId === 'canvas') return;
        pushHistory(canvasRef.current.innerHTML);
        const el = canvasRef.current.querySelector(`[data-id="${selectedElementId}"]`);
        if (el) {
            el.innerHTML = html;
            el.className = classes;
            el.style.cssText = styles;
            el.classList.add('canvas-element', 'element-selected');
            el.setAttribute('data-js', js);
            prepareCanvasElements(canvasRef.current);
            setElementTree(generateTree(canvasRef.current));
            setNotification(`Config ${selectedElementId} changed`);
            setEditHtml(html);
            setEditClasses(classes);
            setCssProperties(parseInlineStyle(styles));
            setEditJs(js);
            handleSave();
        }
    };

    const handleApplyEdits = useCallback(() => {
        if (selectedElementIds.length > 0 && canvasRef.current) {
            // Push current state to history before changing
            pushHistory(canvasRef.current.innerHTML);

            if (selectedElementIds.length === 1 && selectedElementIds[0] === 'canvas') {
                canvasRef.current.innerHTML = editHtml;
            } else {
                // Batch Update
                selectedElementIds.forEach(id => {
                    if (id === 'canvas') return;
                    const el = canvasRef.current.querySelector(`[data-id="${id}"]`);
                    if (el) {
                        // For multi-select, we typically only apply Styles and Classes
                        // as text content (editHtml) might be unique per element.
                        // If only one is selected, we apply everything.
                        if (selectedElementIds.length === 1) {
                            el.innerHTML = editHtml;
                        }

                        el.className = `canvas-element ${editClasses}`.trim();
                        el.setAttribute('style', stringifyProperties(cssProperties));
                    }
                });
            }
            // Strip temporary visual classes before saving
            const all = canvasRef.current.querySelectorAll('.canvas-element');
            all.forEach(x => x.classList.remove('element-selected', 'element-hovered'));

            // Persist to state
            const newHtml = canvasRef.current.innerHTML;
            setCanvasHtml(newHtml);

            // Re-apply selection visual to DOM
            selectedElementIds.forEach(id => {
                if (id === 'canvas') return;
                const el = canvasRef.current.querySelector(`[data-id="${id}"]`);
                if (el) el.classList.add('element-selected');
            });

            // Refresh tree
            prepareCanvasElements(canvasRef.current);
            setElementTree(generateTree(canvasRef.current));
            handleSave();
        }
    }, [selectedElementIds, editHtml, editClasses, cssProperties, stringifyProperties, prepareCanvasElements, generateTree, handleSave, pushHistory]);

    // Auto-save effect
    useEffect(() => {
        if (!canvasHtml) return;
        const timer = setTimeout(() => {
            handleSave();
        }, 500); // 500ms debounce for property edits/content changes
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
            // ONLY update if the incoming HTML is different from what we just synced
            // This prevents cursor jumps while typing
            if (canvasRef.current.innerHTML !== canvasHtml && lastSyncHtmlRef.current !== canvasHtml) {
                canvasRef.current.innerHTML = canvasHtml;
                prepareCanvasElements(canvasRef.current);
                setElementTree(generateTree(canvasRef.current));
            } else if (lastSyncHtmlRef.current !== canvasHtml) {
                // Just tag if it's the first render or external update that matches DOM
                prepareCanvasElements(canvasRef.current);
                setElementTree(generateTree(canvasRef.current));
            }
            lastSyncHtmlRef.current = canvasHtml;
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
        openDetailedConfig: handleOpenDetailedConfig,
        saveProject: handleSave,
        undo: undo,
        redo: redo,
        duplicateElement: () => {
            const idsToDuplicate = selectedElementIds.filter(id => id !== 'canvas');
            if (idsToDuplicate.length === 0) {
                setNotification('Select element(s) to duplicate');
                return;
            }

            pushHistory(canvasRef.current.innerHTML);
            const newIds = [];
            idsToDuplicate.forEach(id => {
                const el = canvasRef.current.querySelector(`[data-id="${id}"]`);
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
                    newIds.push(newId);
                }
            });

            prepareCanvasElements(canvasRef.current);
            setElementTree(generateTree(canvasRef.current));

            if (newIds.length === 1) {
                setSelectedElementId(newIds[0]);
                setSelectedElementIds([newIds[0]]);
            } else {
                setSelectedElementIds(newIds);
                setSelectedElementId(newIds[newIds.length - 1]);
            }

            setNotification(`${idsToDuplicate.length} element(s) duplicated`);
            handleSave();
        },
        renameElement: () => {
            if (!selectedElementId || selectedElementId === 'canvas') return;
            const el = canvasRef.current.querySelector(`[data-id="${selectedElementId}"]`);
            if (el) {
                setRenameTargetId(selectedElementId);
                setRenameDefaultValue(el.getAttribute('data-label') || el.innerText?.substring(0, 20) || 'Element');
                setIsRenameModalOpen(true);
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

            pushHistory(canvasRef.current.innerHTML);
            parent.appendChild(newEl);
            prepareCanvasElements(canvasRef.current);
            setElementTree(generateTree(canvasRef.current));
            setSelectedElementId(newId);
            setNotification('Element pasted');
            handleSave();
        },
        pasteOverSelection: () => {
            if (!clipboardData) {
                setNotification('Clipboard is empty');
                return;
            }
            if (!selectedElementId) {
                shortcutActions.pasteElement();
                return;
            }

            pushHistory(canvasRef.current.innerHTML);
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
                handleSave();
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
            if (!clipboardStyles) {
                setNotification('No properties copied');
                return;
            }

            const idsToPaste = selectedElementIds.filter(id => id !== 'canvas');
            if (idsToPaste.length === 0) {
                setNotification('Select element(s) to paste properties');
                return;
            }

            pushHistory(canvasRef.current.innerHTML);
            idsToPaste.forEach(id => {
                const el = canvasRef.current.querySelector(`[data-id="${id}"]`);
                if (el) {
                    el.setAttribute('style', clipboardStyles);
                }
            });

            // Force sync inspector for primary element
            if (selectedElementId && selectedElementId !== 'canvas') {
                setCssProperties(parseInlineStyle(clipboardStyles));
            }

            setNotification(`Properties pasted to ${idsToPaste.length} element(s)`);
            handleSave();
        },
        deleteElement: () => {
            if (selectedElementIds.length === 0 || (selectedElementIds.length === 1 && selectedElementIds[0] === 'canvas')) {
                setNotification('Select element(s) to delete');
                return;
            }

            pushHistory(canvasRef.current.innerHTML);
            // Filter out canvas and parents if children are also selected to avoid double delete errors
            // though DOM el.remove() handles children automatically.
            const idsToDelete = selectedElementIds.filter(id => id !== 'canvas');

            idsToDelete.forEach(id => {
                const el = canvasRef.current.querySelector(`[data-id="${id}"]`);
                if (el) el.remove();
            });

            prepareCanvasElements(canvasRef.current);
            setElementTree(generateTree(canvasRef.current));
            setSelectedElementId(null);
            setSelectedElementIds([]);
            setNotification(`${idsToDelete.length} element(s) deleted`);
            handleSave();
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
                    handleSave();
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
            const isShift = e.shiftKey;
            const isCtrl = e.ctrlKey || e.metaKey;

            e.preventDefault();
            e.stopPropagation();

            if (!target) {
                // Clicked on empty canvas
                setSelectedElementId('canvas');
                setSelectedElementIds(['canvas']);
                const allElements = canvasRef.current.querySelectorAll('.canvas-element');
                allElements.forEach(el => el.classList.remove('element-selected'));
                return;
            }

            const elementId = target.getAttribute('data-id');
            let nextIds = [...selectedElementIds];

            if (isShift) {
                // Multi-select or Deep-select
                if (isCtrl) {
                    // Deep Toggle (including children)
                    const childIds = Array.from(target.querySelectorAll('.canvas-element')).map(el => el.getAttribute('data-id'));
                    const allToToggle = [elementId, ...childIds];

                    const anyIncluded = allToToggle.some(id => nextIds.includes(id));
                    if (anyIncluded) {
                        nextIds = nextIds.filter(id => !allToToggle.includes(id));
                    } else {
                        nextIds = [...new Set([...nextIds, ...allToToggle])];
                    }
                } else {
                    // Simple Toggle
                    if (nextIds.includes(elementId)) {
                        nextIds = nextIds.filter(id => id !== elementId);
                    } else {
                        nextIds.push(elementId);
                    }
                }
            } else {
                // Normal single select
                nextIds = [elementId];
            }

            // If empty, default to canvas
            if (nextIds.length === 0) {
                nextIds = ['canvas'];
            }

            // Remove canvas from multi-selection if other elements are selected
            if (nextIds.length > 1 && nextIds.includes('canvas')) {
                nextIds = nextIds.filter(id => id !== 'canvas');
            }

            setSelectedElementIds(nextIds);
            setSelectedElementId(elementId); // Set last clicked as primary for inspector

            // Sync DOM classes
            const allElements = canvasRef.current.querySelectorAll('.canvas-element');
            allElements.forEach(el => {
                const id = el.getAttribute('data-id');
                if (nextIds.includes(id)) {
                    el.classList.add('element-selected');
                } else {
                    el.classList.remove('element-selected');
                }
            });
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
    }, [isSelectionMode, selectedElementId, selectedElementIds, accentColor]);

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
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            background: 'var(--bg-main)',
            color: 'var(--text-main)',
            position: 'relative'
        }}>
            {/* Header */}
            {headerOpen && (
                <header
                    className="glass-panel"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 1.5rem',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
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
                            <Tooltip content="Toggle Layers (Alt+1)" position="bottom">
                                <button
                                    onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                                    style={{ background: 'none', border: 'none', color: leftPanelOpen ? accentColor : 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
                                >
                                    {leftPanelOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                                </button>
                            </Tooltip>
                            <Tooltip content="Toggle Inspector (Alt+8)" position="bottom">
                                <button
                                    onClick={() => setRightPanelOpen(!rightPanelOpen)}
                                    style={{ background: 'none', border: 'none', color: rightPanelOpen ? accentColor : 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
                                >
                                    {rightPanelOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
                                </button>
                            </Tooltip>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Tooltip content="Global CSS" position="bottom">
                                <button
                                    onClick={handleOpenGlobalCss}
                                    style={{ height: '36px', width: '36px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#ccc'}
                                >
                                    <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '16px' }}>{`{ }`}</span>
                                </button>
                            </Tooltip>
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

                        <Tooltip content="Collapse Header" position="bottom">
                            <button
                                onClick={() => setHeaderOpen(false)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
                            >
                                <ChevronUp size={20} />
                            </button>
                        </Tooltip>
                    </div>
                </header>
            )}

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

            {/* Main Content Area */}
            <div style={{
                display: 'flex',
                flex: 1,
                overflow: 'hidden',
                position: 'relative',
                marginTop: headerOpen ? '60px' : 0
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
                        zIndex: 1500
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
                                    onClick={() => {
                                        setSelectedElementId('canvas');
                                        setSelectedElementIds(['canvas']);
                                    }}
                                    style={{
                                        padding: '0.375rem 0.5rem',
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer',
                                        background: selectedElementIds.includes('canvas') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                        border: `1px solid ${selectedElementIds.includes('canvas') ? 'rgba(99, 102, 241, 0.4)' : 'transparent'}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: selectedElementIds.includes('canvas') ? 'white' : 'var(--text-muted)',
                                        transition: 'all 0.15s ease',
                                        fontSize: '0.8125rem',
                                        userSelect: 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!selectedElementIds.includes('canvas')) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!selectedElementIds.includes('canvas')) e.currentTarget.style.background = 'transparent';
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
                                            color: selectedElementIds.includes('canvas') ? 'white' : 'rgba(255,255,255,0.4)'
                                        }}
                                    >
                                        <ChevronRight size={14} />
                                    </div>
                                    <Layout size={14} style={{ opacity: selectedElementIds.includes('canvas') ? 1 : 0.7 }} />
                                    <span style={{
                                        fontWeight: selectedElementIds.includes('canvas') ? '600' : '400',
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
                                                selectedIds={selectedElementIds}
                                                onSelect={(id) => {
                                                    setSelectedElementId(id);
                                                    setSelectedElementIds([id]);
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

                {/* Main Workspace Area (Aware of Sidebars) */}
                <main style={{
                    flex: 1,
                    position: 'relative',
                    marginLeft: leftPanelOpen ? `${leftWidth}px` : 0,
                    marginRight: rightPanelOpen ? `${rightWidth}px` : 0,
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
                            <Tooltip content="Selection Mode (V)">
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
                                >
                                    <MousePointer2 size={18} />
                                </button>
                            </Tooltip>

                            {selectedElementId && selectedElementId !== 'canvas' && (
                                <Tooltip content="AI Spark">
                                    <button
                                        style={{
                                            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                                            color: '#fff',
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
                                    >
                                        <Wand2 size={18} />
                                    </button>
                                </Tooltip>
                            )}

                            <Tooltip content="Add Element (A)">
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
                                    onMouseEnter={(e) => e.currentTarget.style.color = accentColor}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                >
                                    <Plus size={18} />
                                </button>
                            </Tooltip>

                            <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 4px' }} />

                            <Tooltip content="Zoom Out (Ctrl -)">
                                <button onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}>
                                    <ZoomOut size={18} />
                                </button>
                            </Tooltip>
                            <span style={{ fontSize: '0.75rem', width: '40px', textAlign: 'center', color: 'var(--text-main)' }}>{Math.round(zoom * 100)}%</span>
                            <Tooltip content="Zoom In (Ctrl +)">
                                <button onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}>
                                    <ZoomIn size={18} />
                                </button>
                            </Tooltip>
                            <div style={{ height: '24px', width: '1px', background: 'var(--border)' }} />
                            <Tooltip content="Reset Zoom (Ctrl 0)">
                                <button onClick={() => setZoom(1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}>
                                    <RotateCcw size={18} />
                                </button>
                            </Tooltip>
                        </div>

                        <Tooltip content="Toggle Full UI (Ctrl /)">
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
                            >
                                {!(leftPanelOpen || rightPanelOpen || headerOpen) ? (
                                    <Minimize size={18} />
                                ) : (
                                    <Maximize size={18} />
                                )}
                            </button>
                        </Tooltip>

                        <Tooltip content="Toggle Grid (Shift G)">
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
                            >
                                <Grid3X3 size={18} />
                            </button>
                        </Tooltip>

                        <Tooltip content="Toggle Rulers (Shift R)">
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
                            >
                                <Ruler size={18} />
                            </button>
                        </Tooltip>
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
                            <span style={{ fontWeight: '600', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                                {selectedElementIds.length > 1 ? `Inspector (${selectedElementIds.length} items)` : 'Inspector'}
                            </span>
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
                                <button
                                    onClick={handleOpenDetailedConfig}
                                    className="premium-button"
                                    style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', marginTop: '0.5rem' }}
                                >
                                    <Settings size={16} /> Detailed Config (Ctrl+E)
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
                .element-hovered::after {
                    content: '' !important;
                    position: absolute !important;
                    inset: 0 !important;
                    background-color: ${accentColor} !important;
                    opacity: 0.15 !important;
                    pointer-events: none !important;
                    z-index: 50 !important;
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

            <FloatingToolbox
                selectedElementId={selectedElementIds.length === 1 ? selectedElementIds[0] : null}
                canvasRef={canvasRef}
                actions={{
                    delete: shortcutActions.deleteElement,
                    duplicate: shortcutActions.duplicateElement,
                    rename: shortcutActions.renameElement,
                    openConfig: handleOpenDetailedConfig
                }}
                accentColor={accentColor}
            />

            {/* Prompt Modals */}
            <PromptModal
                key={renameTargetId || 'rename'}
                isOpen={isRenameModalOpen}
                onClose={() => {
                    setIsRenameModalOpen(false);
                    setRenameTargetId(null);
                }}
                title="Rename Layer"
                label="New Name"
                defaultValue={renameDefaultValue}
                placeholder="Enter layer name..."
                onSubmit={(newName) => {
                    if (newName && renameTargetId) {
                        pushHistory(canvasRef.current.innerHTML);
                        const el = canvasRef.current.querySelector(`[data-id="${renameTargetId}"]`);
                        if (el) {
                            el.setAttribute('data-label', newName);
                            prepareCanvasElements(canvasRef.current);
                            setElementTree(generateTree(canvasRef.current));
                            setNotification('Element renamed');
                            handleSave();
                        }
                    }
                }}
            />

            <DetailedConfigModal
                isOpen={isDetailedConfigOpen}
                onClose={() => setIsDetailedConfigOpen(false)}
                elementId={selectedElementId}
                initialHtml={editHtml}
                initialStyles={cssProperties.filter(p => p.prop && p.value).map(p => `${p.prop}: ${p.value};`).join('\n')}
                initialClasses={editClasses}
                initialJs={editJs}
                onSave={handleSaveDetailedConfig}
                accentColor={accentColor}
            />

            <GlobalCssModal
                isOpen={isGlobalCssModalOpen}
                onClose={() => setIsGlobalCssModalOpen(false)}
                initialCss={globalCss}
                onSave={handleSaveGlobalCss}
                accentColor={accentColor}
            />
        </div>
    );
};
