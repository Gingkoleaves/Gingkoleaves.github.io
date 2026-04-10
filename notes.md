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
        <p>{{ note.excerpt | strip_html | truncate: 100 }}</p>
        <span class="date">{{ note.date | date: "%Y-%m-%d" }}</span>
      </a>
    {% endfor %}
  </div>
</div>

<style>
.card-list { display: flex; flex-direction: column; gap: 20px; padding-top: 80px; }
.card { 
  background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 8px; 
  padding: 20px; text-decoration: none; color: var(--card-text); transition: 0.3s;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.card:hover { transform: translateY(-5px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
.card h3, .card p, .card .date { color: inherit; }
.card p, .card .date { color: var(--card-muted-text); }
</style>