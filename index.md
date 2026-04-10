---
layout: default
title: Home
---

<section class="hero-section" style="background-image: url('{{ "/assets/images/bg1.jpg" | relative_url }}');">
  <div class="overlay">
    <h1>Welcome to Gingkoleaves‘ personal homepage</h1>
    <div class="scroll-indicator">↓ Scroll Down</div>
  </div>
</section>

<section class="content-section" style="background-image: url('{{ "/assets/images/bg2.jpg" | relative_url }}');">
  <div class="overlay">
    <div class="card">
      <h2>GitHub Profile</h2>
      <div class="card">
        <h2>GitHub Contributions</h2>
        <img class="gh-stats" 
            src="https://ghchart.rshah.org/409ba5/Gingkoleaves" 
            alt="Gingkoleaves' GitHub Chart" />
        <p style="font-size: 0.8rem; color: #216e39; margin-top: 10px;">最近一年的代码提交分布</p>
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
/* --- 彻底消除外部干扰 --- */
/* 强制让 Jekyll 主题的包装层铺满，不留白 */
.wrapper, .container, main {
  max-width: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
  overflow-x: hidden;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
}

/* --- 全屏容器设置 --- */
.hero-section, .content-section {
  width: 100vw;
  height: 100vh;
  /* 如果有 Toolbar，某些浏览器 100vh 会导致溢出，可改用 100dvh */
  height: 100dvh; 
  display: flex;
  position: relative;
  overflow: hidden;
  
  /* 确保图片永远填满，不留死角 */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

/* --- 覆盖层 --- */
.overlay {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4); 
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
}

/* --- 内容微调 --- */
.card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 15px;
  margin: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 85%;
  max-width: 700px;
}
</style>