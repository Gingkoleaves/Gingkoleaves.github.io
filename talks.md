---
layout: default
title: Talks
---

<div class="container">
  <h2>Talks :speech_balloon:</h2>
  <div class="talk-list">
    {% for talk in site.talks %}
      <a href="{{ talk.url }}" class="talk-card">
        <div class="content">{{ talk.content }}</div>
        <div class="meta">{{ talk.date | date: "%Y-%m-%d %H:%M" }}</div>
      </a>
    {% endfor %}
  </div>
</div>

<style>
.talk-list { display: flex; flex-direction: column; gap: 16px; padding-top: 14px; }
.talk-card { 
  display: block;
  background: var(--card-bg); padding: 20px; border-left: 4px solid #007bff; 
  border-radius: 8px; border: 1px solid var(--card-border);
  text-decoration: none;
  color: var(--card-text);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.talk-card .content { color: inherit; }
.talk-card .content p:last-child { margin-bottom: 0; }
.meta { font-size: 0.8em; color: var(--card-muted-text); margin-top: 10px; }
</style>
