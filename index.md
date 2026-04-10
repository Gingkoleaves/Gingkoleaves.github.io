---
layout: default
title: Home
---

<section class="hero-section" style="background-image: url('{{ "/assets/images/bg1.jpg" | relative_url }}');">
  <div class="overlay">
    <h1>Welcome to Gingkoleaves' personal homepage</h1>
    <div class="scroll-indicator">↓ Scroll Down</div>
  </div>
</section>
<section class="hero-section" >
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
/* =========================================
   1. 暴力破除 Jekyll 全局限制 (最关键)
   ========================================= */
/* 强制让 Minima 等主题的 main, wrapper, container 彻底铺满 */
html body .wrapper,
html body main,
html body .container,
html body #main-content {
  width: 100vw !important;    /* 强制视口 100% 宽度 */
  max-width: none !important; /* 彻底移除最大宽度限制 */
  padding: 0 !important;      /* 移除左右 padding */
  margin: 0 !important;       /* 移除全局 margin */
  position: relative;
  left: 0;
  right: 0;
}

/* =========================================
   2. 全局重置与 Scroll Snap
   ========================================= */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden; /* 防止左右出现横向滚动条 */
  
  /* 开启整页吸附 */
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  background: black; /* 兜底背景色 */
}

/* =========================================
   3. 全屏容器设置 (确保图片真正 Cover)
   ========================================= */
.hero-section, .content-section {
  width: 100vw;       /* 确保容器本身占满视口 */
  height: 100vh;      /* 确保容器本身占满视口 */
  /* 如果在手机上露白，尝试用 100dvh */
  height: 100dvh; 
  
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  /* 关键核心：确保图片不拉伸、不留死角且铺满 */
  background-size: cover;    /* 等比例缩放直至填满，裁剪边缘 */
  background-position: center center; /* 图片始终居中对齐 */
  background-repeat: no-repeat;
  
  /* 开启吸附对齐 */
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

/* =========================================
   4. 覆盖层与卡片 (毛玻璃效果)
   ========================================= */
.overlay {
  position: absolute; /* 覆盖全屏 section */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4); /* 背景变暗 */
  
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  padding: 0 10%; /* 侧边留出安全距离 */
  box-sizing: border-box;
}

h1 {
  font-size: 3rem;
  max-width: 80%;
  text-shadow: 2px 2px 10px rgba(0,0,0,0.5);
}

.scroll-indicator {
  position: absolute;
  bottom: 30px;
  animation: bounce 2s infinite;
  font-size: 1.2rem;
}

.card {
  background: rgba(255, 255, 255, 0.1); /* 半透明白 */
  backdrop-filter: blur(10px);        /* 毛玻璃核心 */
  -webkit-backdrop-filter: blur(10px);
  padding: 2.5rem;
  border-radius: 15px;
  margin: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 85%;
  max-width: 750px; /* 限制卡片宽度 */
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
}

/* =========================================
   5. GitHub Contributions 方格图
   ========================================= */
.gh-stats {
  width: 100%;
  max-width: 650px; /* 限制方格图最大宽度 */
  height: auto;
  display: block;
  margin: 0 auto;
  filter: brightness(1.1) saturate(1.2); /* 亮化方格 */
  object-fit: contain;
}

/* ... 标签样式 ... */
.tech-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}
.tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 0.9rem;
  border: 1px solid rgba(255,255,255,0.3);
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
  40% {transform: translateY(-10px);}
  60% {transform: translateY(-5px);}
}
</style>