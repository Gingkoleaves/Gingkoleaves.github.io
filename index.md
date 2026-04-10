---
layout: default
title: Home
---

<section class="hero-screen">
  <img class="hero-image" src="{{ "/assets/images/bg1.jpg" | relative_url }}" alt="Homepage background" />
  <div class="hero-overlay">
    <h1>Welcome to Gingkoleaves' personal homepage</h1>
    <div class="scroll-indicator">↓ Scroll Down</div>
  </div>
  <div class="hero-fade"></div>
</section>

<section class="content-screen">
  <div class="content-container">
    
    <div class="card">
      <h2>GitHub Contributions</h2>
      <img class="gh-stats" 
           src="https://ghchart.rshah.org/409ba5/Gingkoleaves" 
           alt="Gingkoleaves' GitHub Chart" />
      <p style="font-size: 0.8rem; color: #409ba5; margin-top: 10px;">最近一年的代码提交分布</p>
    </div>

    <div class="card">
      <h2>Techniques</h2>
      <div class="tech-tags">
        <span class="tag">Rust</span>
        <span class="tag">RISC-V</span>
        <span class="tag">Operating Systems</span>
        <span class="tag">Database Design</span>
      </div>
    </div>

  </div>
</section>

<style>
/* 1. 彻底击碎 Jekyll 包装容器限制 */
/* 这段代码必须存在，否则内容会被锁死在屏幕中间的小框里 */
.site-shell, .wrapper, main, .container {
  max-width: none !important;
  padding: 0 !important;
  margin: 0 !important;
  width: 100% !important;
}

html, body {
  margin: 0; padding: 0;
  width: 100%; height: 100%;
  overflow-x: hidden;
  scroll-behavior: smooth;
  background: var(--page-bg);
  color: var(--page-text);
}

/* 2. 定义首屏和内容区 */
.hero-screen, .content-screen {
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.hero-screen {
  min-height: calc(100dvh - 60px);
  padding-top: 60px;
  box-sizing: border-box;
  align-items: center;
  background: var(--page-bg);
}

.hero-image {
  display: block;
  width: min(82vw, 980px);
  height: auto;
  margin: 0 auto;
}

.hero-overlay {
  position: absolute;
  top: 60px; left: 0;
  width: 100%; height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.1) 55%, transparent 100%);
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  color: white;
}

.hero-fade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 34vh;
  background: linear-gradient(to bottom, rgba(18, 18, 18, 0) 0%, var(--page-bg) 100%);
  pointer-events: none;
}

/* 第二屏特有：纯色内容区 */
.content-screen {
  background-color: var(--page-bg);
}

.content-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  z-index: 2;
}

/* 3. 卡片与字体样式 */
.card {
  background: var(--surface-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 15px;
  margin: 15px 0;
  border: 1px solid var(--surface-border);
  width: 85%;
  max-width: 800px;
  color: var(--page-text);
  text-align: center;
}

h1 { font-size: 3rem; text-align: center; }

.gh-stats {
  width: 100%;
  max-width: 700px;
  height: auto;
  filter: brightness(1.1);
}

.tech-tags {
  display: flex; flex-wrap: wrap;
  justify-content: center; gap: 10px;
}

.tag {
  background: var(--surface-bg);
  padding: 8px 18px;
  border-radius: 20px;
  border: 1px solid var(--surface-border);
}

.scroll-indicator {
  position: absolute; bottom: 30px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
  40% {transform: translateY(-10px);}
}
</style>