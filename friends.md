---
layout: default
title: 友链
permalink: /friends/
---

<div class="friends-page">
  <h2>友链</h2>
  <p class="friends-intro">大佬</p>

  <div class="friends-list">
    {% for friend in site.data.friends %}
    <a class="friend-card" href="{{ friend.url }}" target="_blank" rel="noreferrer">
      <strong>{{ friend.name }}</strong>
      {% if friend.description %}
      <span>{{ friend.description }}</span>
      {% endif %}
    </a>
    {% endfor %}
  </div>
</div>

<style>
.friends-page {
  padding-top: 20px;
}

.friends-intro {
  color: var(--muted-text);
  max-width: 40rem;
}

.friends-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.friend-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px 20px;
  border-radius: 16px;
  border: 1px solid var(--surface-border);
  background: var(--surface-bg);
  color: var(--page-text);
  text-decoration: none;
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.friend-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.24);
}

body[data-theme="light"] .friend-card:hover {
  border-color: rgba(29, 27, 22, 0.24);
}

.friend-card span {
  color: var(--muted-text);
  font-size: 0.95rem;
}
</style>