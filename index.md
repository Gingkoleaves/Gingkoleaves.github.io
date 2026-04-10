---
layout: default
title: Home
---

<section class="hero-screen">
  <img class="hero-image" src="{{ "/assets/images/bg1.jpg" | relative_url }}" alt="Homepage background" />
  <div class="hero-overlay">
    <div class="hero-copy">
      <h1>Welcome to Gingkoleaves' personal homepage</h1>
    </div>
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

    <div class="card hidden-tip" id="konami-banner" hidden>
      <h2>隐藏提示</h2>
      <p>尝试输入一段熟悉的键盘序列，页面会出现特别效果。</p>
    </div>

    <div class="comments-wrap">
      {% include comments.html %}
    </div>

  </div>
</section>

<style>
  .site-shell, .wrapper, main, .container {
    max-width: none !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
  }

  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    scroll-behavior: smooth;
    background: var(--page-bg);
    color: var(--page-text);
  }

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
    top: 60px;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.1) 55%, transparent 100%);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding-top: 24vh;
    color: var(--page-text);
  }

  .hero-copy {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    padding: 2rem 2.5rem;
    border-radius: 24px;
    background: var(--surface-bg);
    border: 1px solid var(--surface-border);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    text-align: center;
  }

  .hero-fade {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 46vh;
    background: linear-gradient(
      to bottom,
      rgba(18, 18, 18, 0) 0%,
      rgba(18, 18, 18, 0.22) 34%,
      rgba(18, 18, 18, 0.58) 68%,
      var(--page-bg) 100%
    );
    pointer-events: none;
  }

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

  h1 {
    font-size: 3rem;
    text-align: center;
    margin: 0;
    color: inherit;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
  }

  .gh-stats {
    width: 100%;
    max-width: 700px;
    height: auto;
    filter: brightness(1.1);
  }

  .tech-tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }

  .tag {
    background: var(--surface-bg);
    padding: 8px 18px;
    border-radius: 20px;
    border: 1px solid var(--surface-border);
  }

  .comments-wrap {
    width: 85%;
    max-width: 800px;
    margin: 15px auto 60px;
  }

  .comments-section {
    width: 100%;
    box-sizing: border-box;
    background: var(--surface-bg);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 15px;
    border: 1px solid var(--surface-border);
    padding: 2rem;
  }

  .comments-header h2 {
    margin-top: 0;
    margin-bottom: 0.5rem;
  }

  .comments-header p {
    margin-top: 0;
    color: var(--muted-text);
  }

  .comments-fallback {
    display: grid;
    gap: 12px;
    justify-items: start;
    text-align: left;
  }

  .comments-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.85rem 1.2rem;
    border-radius: 999px;
    border: 1px solid var(--surface-border);
    background: rgba(255, 255, 255, 0.08);
    color: var(--page-text);
    text-decoration: none;
    font-weight: 600;
    transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
  }

  .comments-link:hover {
    transform: translateY(-1px);
    border-color: rgba(255, 255, 255, 0.24);
    background: rgba(255, 255, 255, 0.12);
  }

  body[data-theme="light"] .comments-link {
    background: rgba(255, 255, 255, 0.78);
  }

  body[data-theme="light"] .comments-link:hover {
    background: rgba(255, 255, 255, 0.92);
  }

  .comments-note {
    margin: 0;
    color: var(--muted-text);
    font-size: 0.92rem;
  }

  .scroll-indicator {
    position: static;
    animation: bounce 2s infinite;
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
  }
</style>