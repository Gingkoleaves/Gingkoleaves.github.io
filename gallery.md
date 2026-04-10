---
layout: default
title: Gallery
permalink: /gallery/
---

<div class="gallery-page">
  <div class="gallery-hero card">
    <div class="gallery-heading">
      <h2>Gallery</h2>
      <p>单独的图片页面，会自动播放，也可以手动切换。</p>
    </div>

    <div class="gallery-shell" data-gallery>
      <button class="gallery-nav gallery-prev" type="button" aria-label="上一张图片" data-gallery-prev>‹</button>

      <div class="gallery-stage">
        <img class="gallery-main" data-gallery-main src="{{ '/assets/images/bg1.jpg' | relative_url }}" alt="Gallery image 1" />
        <div class="gallery-meta">
          <span class="gallery-count" data-gallery-count>1 / 5</span>
          <p class="gallery-title" data-gallery-title>Image 1</p>
        </div>
      </div>

      <button class="gallery-nav gallery-next" type="button" aria-label="下一张图片" data-gallery-next>›</button>
    </div>

    <div class="gallery-thumbs" aria-label="Gallery thumbnails">
      <button class="gallery-thumb is-active" type="button" data-gallery-thumb="0">
        <img src="{{ '/assets/images/bg1.jpg' | relative_url }}" alt="Gallery thumbnail 1" />
      </button>
      <button class="gallery-thumb" type="button" data-gallery-thumb="1">
        <img src="{{ '/assets/images/bg2.jpg' | relative_url }}" alt="Gallery thumbnail 2" />
      </button>
      <button class="gallery-thumb" type="button" data-gallery-thumb="2">
        <img src="{{ '/assets/images/bg3.jpg' | relative_url }}" alt="Gallery thumbnail 3" />
      </button>
      <button class="gallery-thumb" type="button" data-gallery-thumb="3">
        <img src="{{ '/assets/images/bg4.jpg' | relative_url }}" alt="Gallery thumbnail 4" />
      </button>
      <button class="gallery-thumb" type="button" data-gallery-thumb="4">
        <img src="{{ '/assets/images/bg5.jpg' | relative_url }}" alt="Gallery thumbnail 5" />
      </button>
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

.gallery-heading h2,
.gallery-heading p {
  margin: 0;
}

.gallery-heading p {
  color: var(--muted-text);
}

.gallery-shell {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.9rem;
}

.gallery-stage {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid var(--surface-border);
  background: rgba(255, 255, 255, 0.04);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.gallery-main {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.gallery-main.is-transitioning {
  opacity: 0.35;
  transform: scale(1.01);
}

.gallery-meta {
  position: absolute;
  left: 1rem;
  right: 1rem;
  bottom: 1rem;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 16px;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.58), rgba(0, 0, 0, 0.22));
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #fff;
  text-align: left;
}

.gallery-count,
.gallery-title {
  margin: 0;
}

.gallery-count {
  font-size: 0.8rem;
  opacity: 0.86;
  white-space: nowrap;
}

.gallery-title {
  font-size: 1rem;
  font-weight: 600;
}

.gallery-nav {
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--surface-border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--page-text);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.gallery-nav:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.24);
}

.gallery-thumbs {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.gallery-thumb {
  padding: 0;
  border: 1px solid var(--surface-border);
  border-radius: 14px;
  overflow: hidden;
  background: transparent;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.gallery-thumb:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.24);
}

.gallery-thumb.is-active {
  box-shadow: 0 0 0 2px rgba(64, 196, 99, 0.45);
  border-color: rgba(64, 196, 99, 0.7);
}

.gallery-thumb img {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

@media (max-width: 720px) {
  .gallery-hero {
    padding: 1.2rem;
  }

  .gallery-shell {
    grid-template-columns: 1fr;
  }

  .gallery-nav {
    display: none;
  }

  .gallery-meta {
    left: 0.75rem;
    right: 0.75rem;
    bottom: 0.75rem;
    flex-direction: column;
    align-items: start;
  }

  .gallery-thumbs {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 0.5rem;
  }
}
</style>

<script>
  (() => {
    const gallery = document.querySelector("[data-gallery]");

    if (!gallery) {
      return;
    }

    const items = [
      {
        src: "{{ '/assets/images/bg1.jpg' | relative_url }}",
        alt: "Gallery image 1",
        title: "Image 1"
      },
      {
        src: "{{ '/assets/images/bg2.jpg' | relative_url }}",
        alt: "Gallery image 2",
        title: "Image 2"
      },
      {
        src: "{{ '/assets/images/bg3.jpg' | relative_url }}",
        alt: "Gallery image 3",
        title: "Image 3"
      },
      {
        src: "{{ '/assets/images/bg4.jpg' | relative_url }}",
        alt: "Gallery image 4",
        title: "Image 4"
      },
      {
        src: "{{ '/assets/images/bg5.jpg' | relative_url }}",
        alt: "Gallery image 5",
        title: "Image 5"
      }
    ];

    const mainImage = gallery.querySelector("[data-gallery-main]");
    const countLabel = gallery.querySelector("[data-gallery-count]");
    const titleLabel = gallery.querySelector("[data-gallery-title]");
    const prevButton = gallery.querySelector("[data-gallery-prev]");
    const nextButton = gallery.querySelector("[data-gallery-next]");
    const thumbButtons = Array.from(gallery.querySelectorAll("[data-gallery-thumb]"));

    let currentIndex = 0;
    let timerId = null;

    function setActiveThumb(index) {
      thumbButtons.forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === index);
      });
    }

    function showImage(index) {
      const nextIndex = (index + items.length) % items.length;
      const item = items[nextIndex];

      currentIndex = nextIndex;
      mainImage.classList.add("is-transitioning");
      window.setTimeout(() => {
        mainImage.src = item.src;
        mainImage.alt = item.alt;
        countLabel.textContent = `${nextIndex + 1} / ${items.length}`;
        titleLabel.textContent = item.title;
        setActiveThumb(nextIndex);
        mainImage.classList.remove("is-transitioning");
      }, 180);
    }

    function nextImage() {
      showImage(currentIndex + 1);
    }

    function previousImage() {
      showImage(currentIndex - 1);
    }

    function restartAutoplay() {
      if (timerId) {
        window.clearInterval(timerId);
      }

      timerId = window.setInterval(nextImage, 4500);
    }

    thumbButtons.forEach((button) => {
      button.addEventListener("click", () => {
        showImage(Number(button.dataset.galleryThumb));
        restartAutoplay();
      });
    });

    prevButton?.addEventListener("click", () => {
      previousImage();
      restartAutoplay();
    });

    nextButton?.addEventListener("click", () => {
      nextImage();
      restartAutoplay();
    });

    gallery.addEventListener("mouseenter", () => {
      if (timerId) {
        window.clearInterval(timerId);
      }
    });

    gallery.addEventListener("mouseleave", () => {
      restartAutoplay();
    });

    showImage(0);
    restartAutoplay();
  })();
</script>