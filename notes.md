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
      <span>notes</span>
    </div>
    <div class="archive-stat">
      <strong>{{ note_year_groups | size }}</strong>
      <span>different year</span>
    </div>
    <div class="archive-stat">
      <strong>{{ all_tags | size }}</strong>
      <span>tags</span>
    </div>
  </div>

  <div class="archive-group" aria-label="Notes archive by year">
    <h3>Archived by year</h3>
    <div class="archive-chips">
      {% for group in note_year_groups %}
        <a class="archive-chip" href="{{ '/archives/' | append: group.name | append: '/' | relative_url }}">{{ group.name }} ({{ group.items | size }})</a>
      {% endfor %}
    </div>
  </div>

  <div class="archive-group" aria-label="Notes archive by tag">
    <h3>Archived by tags</h3>
    <div class="archive-chips" id="note-tag-filters">
      <a class="archive-chip archive-chip-active" href="#" data-filter-tag="__all__" aria-pressed="true">All ({{ site.notes | size }})</a>
      {% for tag in all_tags %}
        {% assign tag_count = 0 %}
        {% for note in site.notes %}
          {% if note.tags contains tag %}
            {% assign tag_count = tag_count | plus: 1 %}
          {% endif %}
        {% endfor %}
        {% assign slugified_tag = tag | slugify %}
        <a
          class="archive-chip"
          href="{{ '/notes/?tag=' | append: tag | url_encode | relative_url }}"
          data-filter-tag="{{ tag | escape }}"
          aria-pressed="false"
        >{{ tag }} ({{ tag_count }})</a>
      {% endfor %}
    </div>
  </div>

  <p id="note-filter-summary" class="archive-summary-line" aria-live="polite">Currently showing all {{ site.notes | size }} notes</p>

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
      <a href="{{ note.permalink }}" class="card" data-note-tags="{{ note.tags | join: '|' | downcase | escape }}">
        {% if cover != '' %}
          <img class="entry-cover" src="{{ cover | relative_url }}" alt="{{ note.title }} cover" loading="lazy" />
        {% endif %}
        <h3>{{ note.title }}</h3>
        <p>{{ note.excerpt | strip_html }}</p>
        {% if note.tags %}
          <div class="card-tags">
            {% for tag in note.tags %}
              <span class="tag">{{ tag }}</span>
            {% endfor %}
          </div>
        {% endif %}
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

.archive-summary-line {
  margin: 12px 2px 2px;
  color: var(--card-muted-text);
  font-size: 0.95rem;
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

.archive-chip-active {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.35);
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
  line-height: 1.4;
  padding-bottom: 2px;
  display: block;
  white-space: nowrap;
  text-overflow: ellipsis;
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
  margin-top: 2px;
}
.card .date,
.talk-card .meta {
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

<script>
(() => {
  const filterBar = document.getElementById('note-tag-filters');
  const summary = document.getElementById('note-filter-summary');
  const cards = Array.from(document.querySelectorAll('.card-list .card[data-note-tags]'));

  if (!filterBar || !summary || cards.length === 0) {
    return;
  }

  const chips = Array.from(filterBar.querySelectorAll('[data-filter-tag]'));
  const setActiveChip = (active) => {
    chips.forEach((chip) => {
      const isActive = chip === active;
      chip.classList.toggle('archive-chip-active', isActive);
      chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const applyFilter = (tagValue, chip) => {
    const normalized = String(tagValue || '__all__').toLowerCase();
    let shown = 0;

    cards.forEach((card) => {
      const tags = String(card.getAttribute('data-note-tags') || '').toLowerCase().split('|').filter(Boolean);
      const visible = normalized === '__all__' || tags.includes(normalized);
      card.hidden = !visible;
      if (visible) shown += 1;
    });

    setActiveChip(chip);
    if (normalized === '__all__') {
      summary.textContent = `Currently showing all ${shown} notes`;
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, '', '{{ '/notes/' | relative_url }}');
      }
    } else {
      summary.textContent = `Tag: ${tagValue}, matched ${shown} notes`;
      if (window.history && window.history.replaceState) {
        const next = '{{ '/notes/' | relative_url }}' + '?tag=' + encodeURIComponent(tagValue);
        window.history.replaceState({}, '', next);
      }
    }
  };

  chips.forEach((chip) => {
    chip.addEventListener('click', (event) => {
      event.preventDefault();
      const selectedTag = chip.getAttribute('data-filter-tag') || '__all__';
      applyFilter(selectedTag, chip);
    });
  });

  const params = new URLSearchParams(window.location.search);
  const initialTag = params.get('tag');
  if (initialTag) {
    const initialChip = chips.find((chip) => {
      const value = (chip.getAttribute('data-filter-tag') || '').toLowerCase();
      return value === initialTag.toLowerCase();
    });
    if (initialChip) {
      applyFilter(initialChip.getAttribute('data-filter-tag'), initialChip);
      return;
    }
  }
  const allChip = chips.find((chip) => (chip.getAttribute('data-filter-tag') || '') === '__all__');
  if (allChip) {
    applyFilter('__all__', allChip);
  }
})();
</script>