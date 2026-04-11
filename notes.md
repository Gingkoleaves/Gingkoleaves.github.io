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
    <div class="archive-chips" id="note-year-filters">
      <a class="archive-chip archive-chip-active" href="{{ '/notes/' | relative_url }}" data-filter-year="__all__" aria-pressed="true">All years</a>
      {% for group in note_year_groups %}
        <a class="archive-chip" href="{{ '/notes/?year=' | append: group.name | relative_url }}" data-filter-year="{{ group.name }}" aria-pressed="false">{{ group.name }} ({{ group.items | size }})</a>
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
          href="{{ '/notes/?tag=' | append: slugified_tag | relative_url }}"
          data-filter-tag="{{ slugified_tag }}"
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
      {% assign note_tag_keys = '' | split: '' %}
      {% if note.tags %}
        {% for tag in note.tags %}
          {% assign tag_key = tag | slugify %}
          {% assign note_tag_keys = note_tag_keys | push: tag_key %}
        {% endfor %}
      {% endif %}
      <a href="{{ note.permalink }}" class="card" data-note-tags="{{ note_tag_keys | join: '|' }}" data-note-year="{{ note.date | date: '%Y' }}">
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
.card.is-hidden { display: none !important; }
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
  margin-top: auto;
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
  margin-top: auto;
}
.card-tags + .date { margin-top: 2px; }
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
  const yearBar = document.getElementById('note-year-filters');
  const summary = document.getElementById('note-filter-summary');
  const cards = Array.from(document.querySelectorAll('.card-list .card[data-note-tags]'));

  if (!filterBar || !yearBar || !summary || cards.length === 0) {
    return;
  }

  const tagChips = Array.from(filterBar.querySelectorAll('[data-filter-tag]'));
  const yearChips = Array.from(yearBar.querySelectorAll('[data-filter-year]'));
  const slugify = (value) => String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  const state = { tag: '__all__', year: '__all__' };

  const setActiveChip = (chipList, active) => {
    chipList.forEach((chip) => {
      const isActive = chip === active;
      chip.classList.toggle('archive-chip-active', isActive);
      chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const syncUrl = () => {
    const params = new URLSearchParams();
    if (state.tag !== '__all__') params.set('tag', state.tag);
    if (state.year !== '__all__') params.set('year', state.year);
    const query = params.toString();
    const next = query ? `{{ '/notes/' | relative_url }}?${query}` : `{{ '/notes/' | relative_url }}`;
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, '', next);
    }
  };

  const applyFilters = () => {
    let shown = 0;

    cards.forEach((card) => {
      const tags = String(card.getAttribute('data-note-tags') || '').toLowerCase().split('|').filter(Boolean);
      const year = String(card.getAttribute('data-note-year') || '');
      const byTag = state.tag === '__all__' || tags.includes(state.tag);
      const byYear = state.year === '__all__' || year === state.year;
      const visible = byTag && byYear;
      card.classList.toggle('is-hidden', !visible);
      if (visible) shown += 1;
    });

    const parts = [];
    if (state.tag !== '__all__') parts.push(`Tag: ${state.tag}`);
    if (state.year !== '__all__') parts.push(`Year: ${state.year}`);
    summary.textContent = parts.length > 0
      ? `${parts.join(' · ')}, matched ${shown} notes`
      : `Currently showing all ${shown} notes`;
    syncUrl();
  };

  tagChips.forEach((chip) => {
    chip.addEventListener('click', (event) => {
      event.preventDefault();
      state.tag = (chip.getAttribute('data-filter-tag') || '__all__').toLowerCase();
      setActiveChip(tagChips, chip);
      applyFilters();
    });
  });

  yearChips.forEach((chip) => {
    chip.addEventListener('click', (event) => {
      event.preventDefault();
      state.year = chip.getAttribute('data-filter-year') || '__all__';
      setActiveChip(yearChips, chip);
      applyFilters();
    });
  });

  const params = new URLSearchParams(window.location.search);
  const initialTag = params.get('tag');
  const initialYear = params.get('year');

  if (initialTag) {
    const initialTagKey = slugify(initialTag);
    const chip = tagChips.find((item) => (item.getAttribute('data-filter-tag') || '').toLowerCase() === initialTagKey);
    if (chip) {
      state.tag = initialTagKey;
      setActiveChip(tagChips, chip);
    }
  }

  if (initialYear) {
    const chip = yearChips.find((item) => (item.getAttribute('data-filter-year') || '') === initialYear);
    if (chip) {
      state.year = initialYear;
      setActiveChip(yearChips, chip);
    }
  }

  if (state.tag === '__all__') {
    const allTagChip = tagChips.find((chip) => (chip.getAttribute('data-filter-tag') || '') === '__all__');
    if (allTagChip) setActiveChip(tagChips, allTagChip);
  }
  if (state.year === '__all__') {
    const allYearChip = yearChips.find((chip) => (chip.getAttribute('data-filter-year') || '') === '__all__');
    if (allYearChip) setActiveChip(yearChips, allYearChip);
  }

  applyFilters();
})();
</script>