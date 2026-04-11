---
layout: default
title: Talks
---

<div class="container">
  <h2>Talks :speech_balloon:</h2>
  <div class="talk-list">
    {% assign image_exts = 'jpg,jpeg,png,webp,gif' | split: ',' %}
    {% for talk in site.talks %}
      {% assign stem = talk.path | split: '/' | last | split: '.' | first %}
      {% assign cover = '' %}
      {% for ext in image_exts %}
        {% assign candidate = '/assets/images/notes_content/' | append: stem | append: '.' | append: ext %}
        {% assign file = site.static_files | where: 'path', candidate | first %}
        {% if file %}
          {% assign cover = candidate %}
          {% break %}
        {% endif %}
      {% endfor %}
      <a href="{{ talk.url }}" class="talk-card">
        {% if cover != '' %}
          <img class="entry-cover" src="{{ cover | relative_url }}" alt="{{ talk.title | default: 'Talk cover' }}" loading="lazy" />
        {% endif %}
        <div class="content">{{ talk.content | strip_html }}</div>
        <div class="meta">{{ talk.date | date: "%Y-%m-%d" }}</div>
      </a>
    {% endfor %}
  </div>
</div>

<style>
:root { --entry-card-height: 12.5rem; }

.talk-list { display: flex; flex-direction: column; gap: 16px; padding-top: 14px; }
.talk-card { 
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  height: var(--entry-card-height);
  overflow: hidden;
  background: var(--card-bg); padding: 20px; border-left: 4px solid #007bff; 
  border-radius: 8px; border: 1px solid var(--card-border);
  text-decoration: none;
  color: var(--card-text);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.entry-cover {
  width: 100%;
  height: 8.5rem;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--card-border);
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
.meta {
  margin-top: auto;
  font-size: 0.92rem;
  color: var(--card-muted-text);
}
</style>
