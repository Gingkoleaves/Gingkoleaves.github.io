---
layout: default
title: Notes
---

<div class="container">
  <h2>Notes :book:</h2>
  {% assign note_year_groups = site.notes | group_by_exp: "note", "note.date | date: '%Y'" | sort: "name" | reverse %}
  
  <!-- Extract tags from notes collection -->
  {% assign all_tags = '' | split: '' %}
  {% for note in site.notes %}
    {% if note.tags %}
      {% for tag in note.tags %}
        {% unless all_tags contains tag %}
          {% assign all_tags = all_tags | push: tag %}
        {% endunless %}
      {% endfor %}
    {% endif %}
  {% endfor %}
  {% assign all_tags = all_tags | sort %}
  
  <div class="archive-summary" aria-label="Notes statistics">
    <div class="archive-stat">
      <strong>{{ site.notes | size }}</strong>
      <span>篇笔记</span>
    </div>
    <div class="archive-stat">
      <strong>{{ note_year_groups | size }}</strong>
      <span>个年份</span>
    </div>
    <div class="archive-stat">
      <strong>{{ all_tags | size }}</strong>
      <span>个标签</span>
    </div>
  </div>

  <div class="archive-group" aria-label="Notes archive by year">
    <h3>按年份归档</h3>
    <div class="archive-chips">
      {% for group in note_year_groups %}
        <a class="archive-chip" href="{{ '/archives/' | append: group.name | append: '/' | relative_url }}">{{ group.name }} ({{ group.items | size }})</a>
      {% endfor %}
    </div>
  </div>

  <div class="archive-group" aria-label="Notes archive by tag">
    <h3>按标签归类</h3>
    <div class="archive-chips">
      {% for tag in all_tags %}
        {% assign tag_count = 0 %}
        {% for note in site.notes %}
          {% if note.tags contains tag %}
            {% assign tag_count = tag_count | plus: 1 %}
          {% endif %}
        {% endfor %}
        {% assign slugified_tag = tag | slugify %}
        <a class="archive-chip" href="{{ '/tags/' | append: slugified_tag | append: '/' | relative_url }}">{{ tag }} ({{ tag_count }})</a>
      {% endfor %}
    </div>
  </div>

  <div class="card-list">
    {% assign image_exts = 'jpg,jpeg,png,webp,gif' | split: ',' %}
    {% for note in site.notes %}
      {% assign stem = note.path | split: '/' | last | split: '.' | first %}
      {% assign cover = '' %}
      {% for ext in image_exts %}
        {% assign candidate = '/assets/images/notes_content/' | append: stem | append: '.' | append: ext %}
        {% assign file = site.static_files | where: 'path', candidate | first %}
        {% if file %}
          {% assign cover = candidate %}
          {% break %}
        {% endif %}
      {% endfor %}
      <a href="{{ note.permalink }}" class="card">
        {% if cover != '' %}
          <img class="entry-cover" src="{{ cover | relative_url }}" alt="{{ note.title }} cover" loading="lazy" />
        {% endif %}
        <h3>{{ note.title }}</h3>
        <p>{{ note.excerpt | strip_html }}</p>
        <span class="date">{{ note.date | date: "%Y-%m-%d" }}</span>
      </a>
    {% endfor %}
  </div>
</div>

<style>
:root { --entry-card-height: 12.5rem; }

.archive-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.archive-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.archive-stat strong {
  font-size: 1.45rem;
  line-height: 1;
}

.archive-stat span,
.archive-group h3 {
  color: var(--card-muted-text);
}

.archive-group {
  margin-top: 18px;
}

.archive-group h3 {
  margin: 0 0 10px;
  font-size: 1rem;
}

.archive-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.archive-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid var(--card-border);
  background: rgba(255, 255, 255, 0.06);
  color: var(--card-text);
  text-decoration: none;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.archive-chip:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.12);
}

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
.entry-cover {
  width: 100%;
  height: 8.5rem;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--card-border);
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
.card .date,
.talk-card .meta {
  font-size: 0.92rem;
  color: var(--card-muted-text);
}
</style>