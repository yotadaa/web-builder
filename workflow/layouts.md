### 1️⃣ Vertical / Single Column Layout

```html id="y2k4t1"
<!DOCTYPE html>
<html>
<head>
<style>
body { margin:0; font-family:sans-serif; }
.section {
  padding:60px;
  border-bottom:1px solid #ddd;
}
</style>
</head>
<body>

<div class="section">Hero Section</div>
<div class="section">Features Section</div>
<div class="section">Testimonials Section</div>
<div class="section">Footer Section</div>

</body>
</html>
```

**Penjelasan singkat:**
Semua section ditumpuk vertikal (scroll ke bawah). Cocok untuk landing page / company profile.

---

### 2️⃣ Sidebar / Dashboard Layout

```html id="t8v2p3"
<!DOCTYPE html>
<html>
<head>
<style>
body { margin:0; display:flex; height:100vh; font-family:sans-serif; }
.sidebar {
  width:220px;
  background:#222;
  color:white;
  padding:20px;
}
.main {
  flex:1;
  padding:20px;
}
</style>
</head>
<body>

<div class="sidebar">Menu</div>
<div class="main">Main Content Area</div>

</body>
</html>
```

**Penjelasan singkat:**
Layout dua area: kiri navigasi tetap, kanan area kerja utama. Umum untuk dashboard dan web app. (Flexbox memang dirancang untuk pengaturan layout satu arah seperti ini). ([Wikipedia][1])

---

### 3️⃣ Two Column Layout (Content + Sidebar)

```html id="m4q9d7"
<!DOCTYPE html>
<html>
<head>
<style>
.container {
  display:flex;
}
.content {
  flex:3;
  padding:20px;
}
.sidebar {
  flex:1;
  padding:20px;
  background:#f3f3f3;
}
</style>
</head>
<body>

<div class="container">
  <div class="content">Article Content</div>
  <div class="sidebar">Related Content</div>
</div>

</body>
</html>
```

**Penjelasan singkat:**
Konten utama lebih besar, kolom samping sebagai support (related post, TOC, dll). Umum untuk blog/article. ([W3Schools][2])

---

### 4️⃣ Split Screen Layout

```html id="n7u1r5"
<!DOCTYPE html>
<html>
<head>
<style>
body { margin:0; display:flex; height:100vh; }
.left, .right {
  flex:1;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:24px;
}
.left { background:#111; color:white; }
.right { background:#eee; }
</style>
</head>
<body>

<div class="left">Text / CTA</div>
<div class="right">Image / Visual</div>

</body>
</html>
```

**Penjelasan singkat:**
Dua area dengan bobot sama. Biasanya pairing teks vs visual pada hero section.

---

### 5️⃣ Grid Layout

```html id="q1b6x8"
<!DOCTYPE html>
<html>
<head>
<style>
.grid {
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:10px;
}
.item {
  padding:30px;
  background:#ddd;
  text-align:center;
}
</style>
</head>
<body>

<div class="grid">
  <div class="item">Item 1</div>
  <div class="item">Item 2</div>
  <div class="item">Item 3</div>
  <div class="item">Item 4</div>
  <div class="item">Item 5</div>
  <div class="item">Item 6</div>
</div>

</body>
</html>
```

**Penjelasan singkat:**
Layout berbasis baris & kolom. Sangat fleksibel untuk gallery, ecommerce, atau dashboard widget. ([Wikipedia][3])

---

### 6️⃣ Card-Based Layout

```html id="w5c2z9"
<!DOCTYPE html>
<html>
<head>
<style>
.container {
  display:flex;
  gap:16px;
  flex-wrap:wrap;
}
.card {
  width:200px;
  padding:20px;
  border:1px solid #ccc;
  border-radius:8px;
}
</style>
</head>
<body>

<div class="container">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>

</body>
</html>
```

**Penjelasan singkat:**
Konten dibungkus dalam unit mandiri (card). Mudah di-reuse dan scalable untuk list data.

---

### 7️⃣ Workspace / App Layout

```html id="r3h8k2"
<!DOCTYPE html>
<html>
<head>
<style>
body { margin:0; display:flex; height:100vh; font-family:sans-serif; }
.left-panel { width:220px; background:#222; color:white; padding:10px; }
.canvas { flex:1; background:#fafafa; padding:20px; }
.right-panel { width:260px; background:#eee; padding:10px; }
</style>
</head>
<body>

<div class="left-panel">Tools</div>
<div class="canvas">Canvas / Workspace</div>
<div class="right-panel">Inspector</div>

</body>
</html>
```

**Penjelasan singkat:**
Layout multi-panel untuk aplikasi interaktif (builder, editor, design tools).

---

### Ringkasannya

| Layout       | Struktur Inti              |
| ------------ | -------------------------- |
| Vertical     | Section bertumpuk          |
| Sidebar      | Nav + Main                 |
| Two Column   | Content + Aside            |
| Split Screen | 2 area setara              |
| Grid         | Baris & kolom              |
| Card         | Kumpulan komponen mandiri  |
| Workspace    | Panel + Canvas + Inspector |

---

[1]: https://en.wikipedia.org/wiki/Flexbox?utm_source=chatgpt.com "Flexbox"
[2]: https://www.w3schools.com/howto/howto_css_two_columns.asp?utm_source=chatgpt.com "How To Create a Two Column Layout"
[3]: https://en.wikipedia.org/wiki/CSS_grid_layout?utm_source=chatgpt.com "CSS grid layout"
