---
layout: default
title: Notes
---

<div class="container">
  <h2>Notes :book:</h2>
  <div class="card-list">
    {% for note in site.notes %}
      <a href="{{ note.permalink }}" class="card">
        <h3>{{ note.title }}</h3>
        <p>{{ note.excerpt | strip_html }}</p>
        <span class="date">{{ note.date | date: "%Y-%m-%d" }}</span>
      </a>
    {% endfor %}
  </div>
</div>

<style>
:root { --entry-card-height: 12.5rem; }

.card-list { display: flex; flex-direction: column; gap: 16px; padding-top: 14px; }
.card { 
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  height: var(--entry-card-height);
  overflow: hidden;
  background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 8px; 
  padding: 20px; text-decoration: none; color: var(--card-text); transition: 0.3s;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.card:hover { transform: translateY(-5px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
.card h3, .card p, .card .date { color: inherit; }
.card p, .card .date { color: var(--card-muted-text); }
.card h3 {
  margin: 0;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card p {
  margin: 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card .date {
  margin-top: auto;
}
</style>