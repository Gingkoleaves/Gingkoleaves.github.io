---
layout: default
title: Gallery
permalink: /gallery/
---

<div class="gallery-page">
  <div class="gallery-hero card">
    <div class="gallery-heading">
      <h2>Gallery</h2>
    </div>

    <div class="gallery-grid" aria-label="Gallery images">
      <figure class="gallery-item">
        <img src="{{ '/assets/images/bg1.jpg' | relative_url }}" alt="Gallery image 1" loading="lazy" />
        <figcaption>
          <span>Image 1</span>
        </figcaption>
      </figure>
      <figure class="gallery-item">
        <img src="{{ '/assets/images/bg2.jpg' | relative_url }}" alt="Gallery image 2" loading="lazy" />
        <figcaption>
          <span>Image 2</span>
        </figcaption>
      </figure>
      <figure class="gallery-item">
        <img src="{{ '/assets/images/bg3.jpg' | relative_url }}" alt="Gallery image 3" loading="lazy" />
        <figcaption>
          <span>Image 3</span>
        </figcaption>
      </figure>
      <figure class="gallery-item">
        <img src="{{ '/assets/images/bg4.jpg' | relative_url }}" alt="Gallery image 4" loading="lazy" />
        <figcaption>
          <span>Image 4</span>
        </figcaption>
      </figure>
      <figure class="gallery-item">
        <img src="{{ '/assets/images/bg5.jpg' | relative_url }}" alt="Gallery image 5" loading="lazy" />
        <figcaption>
          <span>Image 5</span>
        </figcaption>
      </figure>
    </div>
  </div>
</div>

<style>
.gallery-page {
  padding-top: 20px;
}

.gallery-hero {
  box-sizing: border-box;
  padding: 2rem;
  border-radius: 18px;
  border: 1px solid var(--surface-border);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.gallery-heading {
  display: grid;
  gap: 0.35rem;
  margin-bottom: 1.2rem;
}

.gallery-heading h2 {
  margin: 0;
}

.gallery-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  margin-top: 1rem;
}

.gallery-item {
  margin: 0;
  padding: 0.9rem;
  border: 1px solid var(--surface-border);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  overflow: hidden;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.gallery-item img {
  width: 100%;
  height: clamp(280px, 60vw, 640px);
  object-fit: contain;
  display: block;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.08);
}

.gallery-item figcaption {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.75rem;
  color: var(--muted-text);
  font-size: 0.92rem;
}

.gallery-item figcaption span {
  min-width: 0;
}

@media (max-width: 720px) {
  .gallery-hero {
    padding: 1.2rem;
  }

  .gallery-grid {
    gap: 1rem;
    margin-top: 0.9rem;
  }

  .gallery-item {
    padding: 0.75rem;
  }

  .gallery-item img {
    height: clamp(220px, 72vw, 420px);
  }
}
</style>