---
layout: default
title: Talks
---

<div class="container">
  <h2>Talks :speech_balloon:</h2>
  <div class="talk-list">
    {% for talk in site.talks %}
      <a href="{{ talk.url }}" class="talk-card">
        <div class="content">{{ talk.content | strip_html }}</div>
        <div class="meta">{{ talk.date | date: "%Y-%m-%d %H:%M" }}</div>
      </a>
    {% endfor %}
  </div>
</div>

<style>
.talk-list { display: flex; flex-direction: column; gap: 16px; padding-top: 14px; }
.talk-card { 
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  height: 12.5rem;
  overflow: hidden;
  background: var(--card-bg); padding: 20px; border-left: 4px solid #007bff; 
  border-radius: 8px; border: 1px solid var(--card-border);
  text-decoration: none;
  color: var(--card-text);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.talk-card .content {
  color: inherit;
  margin: 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.talk-card .content p:last-child { margin-bottom: 0; }
.meta { font-size: 0.8em; color: var(--card-muted-text); margin-top: auto; }
</style>
