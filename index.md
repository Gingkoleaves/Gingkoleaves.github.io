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
      <img class="gh-stats" src="https://github-readme-stats.vercel.app/api?username=Gingkoleaves&show_icons=true&theme=transparent" alt="GitHub Stats" />
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
/* 开启整页平滑滚动吸附 */
html {
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
}

body {
  margin: 0;
  overflow-x: hidden;
}

.hero-section, .content-section {
  height: 100vh;
  width: 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 遮罩层：让背景图变暗，突出文字 */
.overlay {
  background: rgba(0, 0, 0, 0.4); 
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
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

/* 卡片样式：用于第二屏内容 */
.card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 15px;
  margin: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 80%;
  max-width: 600px;
}

.gh-stats {
  max-width: 100%;
  height: auto;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 5px 15px;
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