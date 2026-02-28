export const LAYOUT_TEMPLATES = {
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
