# Web Builder: Comprehensive Feature List

This document serves as a summarized directory of all major features implemented in the Web Builder project as of the current development phase.

## 1. Core Architecture & Backend
*   **Authentication & Security**: Secure user registration and login with JWT-based 24-hour persistent sessions.
*   **Database Schema**: Integrated PostgreSQL with Alembic for migrations. Supports dynamic schema for user-generated projects including custom metadata (name, layout, last modified) and the real-time HTML/CSS `content` tree.
*   **Global Error Handling**: Robust 500 error debugging pipelines with clear terminal logs.

## 2. Dynamic Workspace & Layout
*   **Responsive Application Shell**: Figma-style workspaces with resizable, hidden, or floating sidebars (Left: Layers, Right: Config).
*   **Zen Mode**: A `Ctrl + /` full-screen toggle that intelligently moves top-bar tools to a floating island, giving 100% real estate to the canvas constraint.
*   **Relative Canvas Scaling**: Maintains a visually 1:1 editing canvas within a constrained viewport box (`0.8x`), separating application UI scaling from canvas site scaling.

## 3. Advanced Keyboard System
*   **Figma-native Shortcuts**: Keyboard mapping for deep manipulation without using the mouse.
    *   `Ctrl+\`, `Alt+1`, `Alt+8`: Workspace toggles.
    *   `Ctrl+C / Ctrl+V`: Copy and paste whole node elements.
    *   `Ctrl+Alt+C / Ctrl+Alt+V`: Copy and paste only CSS/Stylespaces between elements.
    *   `Ctrl+R`: Rename element in tree wrapper.
    *   `Ctrl+D`: Duplicate node.
    *   `Enter` (Child), `Shift+Enter` (Parent), `Tab` (Sibling): Deep tree traversal.

## 4. DOM Tree & Deep Discovery
*   **Recursive Syncing**: The Element Tree natively parses deeply nested HTML nodes (including bare text nodes) into an interactive recursive sidebar.
*   **Smart Naming Context**: Layers will automatically be named by their textual content (if text node or button) for instant recognition, falling back to Tag Name/IDs.
*   **Collapsible Deep Trees**: Large elements can be folded to preserve mental models of the page structure.

## 5. UI/UX "Premium" Enhancements
*   **Custom Framework UI**: 100% removal of native browser interfaces (`prompt`, `alert`, `select`) in favor of glassmorphic React portals, modals, and frameless dropdowns.
*   **Accent Color Context**: Centralized `ThemeContext` powering active states and focus rings.
*   **Targeted Highlighting**: Subdued `33%` blur overlays and active borders (`outline-offset`) matching the Accent color to identify target nodes securely.
*   **Syntax Editors**: Global JS/CSS and Node-Specific Code is handled via `react-simple-code-editor` combined with `prismjs` for VS Code-like auto-spacing, line numbers, and syntax highlighting.

## 6. AI "Spark" Integration
*   **Contextual Multi-Variant Engine**: Users can select an element (or the whole canvas) and click the "Spark" wand to securely pipe the *Target HTML*, *Global CSS*, and *Global JS* directly to an LLM. 
*   **Live Preview Sandbox**: The AI generates precisely 3 deterministic variations. The modal dynamically renders a secure preview overlay in real-time, side-by-side with raw HTML/CSS/JS diff tabs.
*   **Fallback Intelligence Route**: A custom dropdown supports 20+ models (OpenAI/Google). The Google models iterate through 6 API keys on `429 Too Many Requests` exhaustion. Mock placeholder models seamlessly map back to functioning `gpt-4o-mini` routes.
