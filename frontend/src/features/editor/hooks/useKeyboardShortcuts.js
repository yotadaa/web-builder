import { useEffect } from 'react';

/**
 * Custom hook to manage keyboard shortcuts for the editor.
 * 
 * @param {Object} actions - Object containing callback functions for each shortcut.
 * @param {boolean} disabled - Whether shortcuts should be disabled (e.g., when typing in an input).
 */
export const useKeyboardShortcuts = (actions, disabled = false) => {
    useEffect(() => {
        if (disabled) return;

        const handleKeyDown = (e) => {
            const ctrl = e.ctrlKey || e.metaKey;
            const shift = e.shiftKey;
            const alt = e.altKey;
            const key = e.key.toLowerCase();

            // Helper to check if user is typing in an input/textarea
            const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) ||
                document.activeElement.isContentEditable;

            // 1. Critical Shortcuts (Always enabled even if typing)

            // Undo: Ctrl + Z
            if (ctrl && key === 'z' && !shift) {
                e.preventDefault();
                actions.undo?.();
                return;
            }

            // Redo: Ctrl + Y or Ctrl + Shift + Z
            if (ctrl && (key === 'y' || (key === 'z' && shift))) {
                e.preventDefault();
                actions.redo?.();
                return;
            }

            // Save: Ctrl + S
            if (ctrl && key === 's') {
                e.preventDefault();
                actions.saveProject?.();
                return;
            }

            // Escape: Always allowed to blur
            if (key === 'escape') {
                actions.clearSelection?.();
                if (isTyping) document.activeElement.blur();
                return;
            }

            // Toggle all panels: Ctrl + \
            if (ctrl && e.key === '\\') {
                e.preventDefault();
                actions.toggleAllPanels?.();
                return;
            }

            // Full Screen Toggle: Ctrl + /
            if (ctrl && e.key === '/') {
                e.preventDefault();
                actions.toggleFullScreen?.();
                return;
            }

            // If typing and not a combo/special key above, block other shortcuts
            if (isTyping) return;

            // 2. UI / Workspace Control
            // Left Panel: Alt + 1
            if (alt && key === '1') {
                e.preventDefault();
                actions.toggleLeftPanel?.();
            }

            // Design Panel: Alt + 8
            if (alt && key === '8') {
                e.preventDefault();
                actions.toggleRightPanel?.();
            }

            // Rulers: Shift + R
            if (shift && key === 'r') {
                e.preventDefault();
                actions.toggleRulers?.();
            }

            // Grid: Shift + G
            if (shift && key === 'g') {
                e.preventDefault();
                actions.toggleGrid?.();
            }

            // Copy: Ctrl + C
            if (ctrl && key === 'c') {
                if (alt) {
                    e.preventDefault();
                    actions.copyProperties?.();
                } else {
                    e.preventDefault();
                    actions.copyElement?.();
                }
            }

            // Paste / Paste Over
            if (ctrl && key === 'v') {
                if (alt) {
                    e.preventDefault();
                    actions.pasteProperties?.();
                } else {
                    e.preventDefault();
                    if (shift) actions.pasteOverSelection?.();
                    else actions.pasteElement?.();
                }
            }

            // 3. Navigation & View
            // Zoom In: Ctrl + +
            if (ctrl && (key === '+' || key === '=')) {
                e.preventDefault();
                actions.zoomIn?.();
            }

            // Zoom Out: Ctrl + -
            if (ctrl && key === '-') {
                e.preventDefault();
                actions.zoomOut?.();
            }

            // Zoom 100%: Ctrl + 0
            if (ctrl && key === '0') {
                e.preventDefault();
                actions.zoomReset?.();
            }

            // 4. Tool Selection
            // Move/Selection Tool: V
            if (!ctrl && !alt && !shift && key === 'v') {
                actions.toggleSelectionMode?.();
            }

            // Add Element: A
            if (!ctrl && !alt && !shift && key === 'a') {
                actions.addElement?.();
            }

            // 5. Selection & Element Navigation
            // Select Children: Enter
            if (key === 'enter' && !ctrl && !shift && !alt) {
                e.preventDefault();
                actions.selectChildren?.();
            }

            // Select Parent: Shift + Enter
            if (key === 'enter' && shift && !ctrl && !alt) {
                e.preventDefault();
                actions.selectParent?.();
            }

            // Next Sibling: Tab
            if (key === 'tab' && !shift && !ctrl && !alt) {
                e.preventDefault();
                actions.nextSibling?.();
            }

            // Previous Sibling: Shift + Tab
            if (key === 'tab' && shift && !ctrl && !alt) {
                e.preventDefault();
                actions.prevSibling?.();
            }

            // Group: Ctrl + G
            if (ctrl && key === 'g' && !shift) {
                e.preventDefault();
                actions.groupSelection?.();
            }

            // Duplicate: Ctrl + D
            if (ctrl && key === 'd') {
                e.preventDefault();
                actions.duplicateElement?.();
            }

            // Delete: Backspace or Delete
            if (key === 'backspace' || key === 'delete') {
                actions.deleteElement?.();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [actions, disabled]);
};
