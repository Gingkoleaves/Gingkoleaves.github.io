---
layout: default
title: Home
---

{% assign home_background_image = site.home_background_image | default: '/assets/images/bg4.jpg' %}

<section class="hero-screen">
  <div class="hero-backdrop" aria-hidden="true"></div>
  <img class="hero-image" src="{{ home_background_image | relative_url }}" alt="Homepage background" />
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
         src="https://ghchart.rshah.org/40c463/Gingkoleaves"
           alt="Gingkoleaves' GitHub Chart" />
       <p style="font-size: 0.8rem; color: #40c463; margin-top: 10px;">最近一年的代码提交分布</p>
    </div>

    <div class="card">
      <h2>Techniques</h2>
      <div class="tech-tags">
        {% for technique in site.data.techniques %}
        <span class="tag">{{ technique }}</span>
        {% endfor %}
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
    align-items: center;
  }

  .hero-backdrop {
    position: absolute;
    inset: 0;
    background-image: url('{{ home_background_image | relative_url }}');
    background-position: center center;
    background-repeat: no-repeat;
    background-size: cover;
    filter: blur(42px) saturate(0.9) brightness(0.82);
    transform: scale(1.32);
    opacity: 0.95;
  }

  .hero-image {
    position: relative;
    z-index: 1;
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
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.28) 0%, rgba(0, 0, 0, 0.08) 58%, transparent 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: var(--page-text);
    z-index: 2;
  }

  .hero-copy {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    padding: 0;
    text-align: center;
  }

  .hero-fade {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 44vh;
    background: linear-gradient(
      to bottom,
      rgba(18, 18, 18, 0) 0%,
      rgba(18, 18, 18, 0.04) 18%,
      rgba(18, 18, 18, 0.12) 40%,
      rgba(18, 18, 18, 0.28) 68%,
      rgba(18, 18, 18, 0.52) 88%,
      var(--page-bg) 100%
    );
    pointer-events: none;
  }

  .content-screen {
    background-color: transparent;
  }

  .content-screen::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('{{ home_background_image | relative_url }}');
    background-position: center center;
    background-repeat: no-repeat;
    background-size: cover;
    filter: blur(42px) saturate(0.9) brightness(0.7);
    transform: scale(1.18);
    opacity: 0.35;
    pointer-events: none;
    z-index: 0;
  }

  .content-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    --home-panel-width: min(85%, 800px);
    position: relative;
    z-index: 1;
  }

  .card {
    background: var(--surface-bg);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-sizing: border-box;
    padding: 2rem;
    border-radius: 15px;
    margin: 15px 0;
    border: 1px solid var(--surface-border);
    width: var(--home-panel-width);
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
    box-sizing: border-box;
    width: var(--home-panel-width);
    margin: 15px 0 60px;
  }

  .comments-section {
    box-sizing: border-box;
    width: 100%;
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