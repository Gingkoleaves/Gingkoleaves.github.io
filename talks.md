---
layout: default
title: Talks
---

<div class="container">
  <h2>Talks :speech_balloon:</h2>
  <div class="talk-list">
    {% for talk in site.talks %}
      <div class="talk-card">
        <div class="content">{{ talk.content }}</div>
        <div class="meta">{{ talk.date | date: "%Y-%m-%d %H:%M" }}</div>
      </div>
    {% endfor %}
  </div>
</div>

<style>
.talk-card { 
  background: #f9f9f9; padding: 15px; border-left: 4px solid #007bff; 
  margin-bottom: 15px; border-radius: 4px;
}
.meta { font-size: 0.8em; color: #888; margin-top: 10px; }
</style>