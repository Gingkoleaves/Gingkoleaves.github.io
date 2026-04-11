---
layout: default
title: 2026 Archive
permalink: /archives/2026/
---

<div class="container archive-page">
  <h2>2026 Archive</h2>
  {% assign year_notes = site.notes | where_exp: "item", "item.date.year == 2026" %}
  {% assign year_talks = site.talks | where_exp: "item", "item.date.year == 2026" %}
  {% assign note_count = year_notes | size %}
  {% assign talk_count = year_talks | size %}
  {% assign total_count = note_count | plus: talk_count %}

  <p class="archive-summary-line">共 {{ total_count }} 篇内容</p>

  <section class="archive-section">
    <h3>Notes ({{ year_notes | size }})</h3>
    <ul class="archive-list">
      {% for note in year_notes %}
        <li class="archive-item">
          <a href="{{ note.url | relative_url }}">{{ note.title }}</a>
          <span class="archive-date">{{ note.date | date: "%Y-%m-%d" }}</span>
        </li>
      {% endfor %}
    </ul>
  </section>

  <section class="archive-section">
    <h3>Talks ({{ year_talks | size }})</h3>
    <ul class="archive-list">
      {% for talk in year_talks %}
        <li class="archive-item">
          <a href="{{ talk.url | relative_url }}">{{ talk.title }}</a>
          <span class="archive-date">{{ talk.date | date: "%Y-%m-%d" }}</span>
        </li>
      {% endfor %}
    </ul>
  </section>
</div>

<style>
.archive-page {
  display: grid;
  gap: 22px;
}

.archive-section h3 {
  margin: 0 0 10px;
}

.archive-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.archive-summary-line {
  margin: 0;
  color: var(--muted-text);
}

.archive-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px 14px;
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  background: var(--surface-bg);
}

.archive-item a {
  color: var(--page-text);
  text-decoration: none;
}

.archive-item a:hover {
  text-decoration: underline;
}

.archive-date {
  color: var(--muted-text);
  white-space: nowrap;
  font-size: 0.9rem;
}
</style>
