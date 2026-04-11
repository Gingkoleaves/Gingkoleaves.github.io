---
layout: default
title: Talks
---

<div class="container">
  <h2>Talks :speech_balloon:</h2>
  {% assign talk_year_groups = site.talks | group_by_exp: "talk", "talk.date | date: '%Y'" | sort: "name" | reverse %}
  
  <!-- Extract tags from talks collection -->
  {% assign all_tags = '' | split: '' %}
  {% for talk in site.talks %}
    {% if talk.tags %}
      {% for tag in talk.tags %}
        {% unless all_tags contains tag %}
          {% assign all_tags = all_tags | push: tag %}
        {% endunless %}
      {% endfor %}
    {% endif %}
  {% endfor %}
  {% assign all_tags = all_tags | sort %}
  
  <div class="archive-summary" aria-label="Talks statistics">
    <div class="archive-stat">
      <strong>{{ site.talks | size }}</strong>
      <span>talks</span>
    </div>
    <div class="archive-stat">
      <strong>{{ talk_year_groups | size }}</strong>
      <span>different year</span>
    </div>
    <div class="archive-stat">
      <strong>{{ all_tags | size }}</strong>
      <span>tags</span>
    </div>
  </div>

  <div class="archive-group" aria-label="Talks archive by year">
    <h3>Archived by year</h3>
    <div class="archive-chips">
      {% for group in talk_year_groups %}
        <a class="archive-chip" href="{{ '/archives/' | append: group.name | append: '/' | relative_url }}">{{ group.name }} ({{ group.items | size }})</a>
      {% endfor %}
    </div>
  </div>

  <div class="archive-group" aria-label="Talks archive by tag">
    <h3>Archived by tags</h3>
    <div class="archive-chips">
      {% for tag in all_tags %}
        {% assign tag_count = 0 %}
        {% for talk in site.talks %}
          {% if talk.tags contains tag %}
            {% assign tag_count = tag_count | plus: 1 %}
          {% endif %}
        {% endfor %}
        {% assign slugified_tag = tag | slugify %}
        <a class="archive-chip" href="{{ '/tags/' | append: slugified_tag | append: '/' | relative_url }}">{{ tag }} ({{ tag_count }})</a>
      {% endfor %}
    </div>
  </div>

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
        {% if talk.tags %}
          <div class="card-tags">
            {% for tag in talk.tags %}
              <span class="tag">{{ tag }}</span>
            {% endfor %}
          </div>
        {% endif %}
        <div class="meta">{{ talk.date | date: "%Y-%m-%d" }}</div>
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
  margin-top: 2px;
  font-size: 0.92rem;
  color: var(--card-muted-text);
}
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag {
  display: inline-block;
  padding: 4px 10px;
  font-size: 0.8rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--card-muted-text);
  border: 1px solid rgba(255, 255, 255, 0.15);
}
</style>
