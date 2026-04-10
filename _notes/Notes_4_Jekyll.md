---
layout: default
title: Trip to Jekyll
date: 2026-04-11
permalink: /notes/Notes_4_Jekyll/
categories:
    - notes
tags:
    - jekyll
    - setup
    - static-site
---


Jekyll 作为一个基于 Ruby 的静态网站生成器，非常适合处理程序员的个人博客或项目文档（尤其是托管在 GitHub Pages 上时）。

---

### 1. 核心目录结构回顾
在 `_config.yml` 之外，这几个目录是 Jekyll 的灵魂：
* **`_includes/`**：存放可重用的代码片段（如 `footer.html`, `navigation.html`）。使用 `{% raw %}{% include filename.html %}{% endraw %}` 引入。
* **`_layouts/`**：定义页面的模板。你 YAML 头部的 `layout: default` 就是在这里找 `default.html`。
* **`_sass/`**：存放分模块的样式文件，方便管理复杂的 CSS。
* **`_data/`**：存放 YAML 或 JSON 数据。比如你可以写个 `members.yml`，然后用 `site.data.members` 在页面上循环渲染。

---

### 2. Liquid 常用语法 (补充)
Liquid 是 Jekyll 的模板引擎，掌握这三类语法至关重要：

* **对象 (Objects)**：用 `{% raw %}{{ }}{% endraw %}` 包裹，输出内容。
    * `{% raw %}{{ page.title }}{% endraw %}`：当前页面的标题。
    * `{% raw %}{{ site.time | date: "%Y-%B-%d" }}{% endraw %}`：格式化输出当前时间。
* **标记 (Tags)**：用 `{% raw %}{% %}{% endraw %}` 包裹，用于逻辑控制。
    * **条件判断**：`{% raw %}{% if page.tags contains 'jekyll' %} ... {% endif %}{% endraw %}`
    * **循环**：`{% raw %}{% for post in site.posts limit:5 %} ... {% endfor %}{% endraw %}`
* **过滤器 (Filters)**：通过管道符 `|` 修改输出。
    * `{% raw %}{{ "hello world" | upcase }}{% endraw %}` $\rightarrow$ **HELLO WORLD**
    * `{% raw %}{{ content | strip_html | truncatewords: 20 }}{% endraw %}`：生成文章摘要。

---

### 3. 本地调试与配置优化
在开发阶段，这两个技巧能显著提升效率：

* **排除不必要文件**：
    在 `_config.yml` 中使用 `exclude` 避免编译 `node_modules` 或 `README.md`：
    ```yaml
    exclude:
      - Gemfile
      - Gemfile.lock
      - node_modules/
      - vendor/
    ```
* **草稿功能 (Drafts)**：
    创建 `_drafts/` 文件夹。运行 `bundle exec jekyll serve --drafts` 时，草稿会被编译，但在正式部署（没有该 flag）时不会显示。

---

### 4. 静态资源处理
* **Baseurl 的坑**：
    如果你的网站不是托管在域名根目录（例如 `username.github.io/my-blog/`），在引用图片或 CSS 时，务必加上 `relative_url` 过滤器：
    `{% raw %}<link rel="stylesheet" href="{{ '/assets/css/style.css' | relative_url }}">{% endraw %}`
* **Assets 结构**：
    建议采用标准路径：`/assets/images/`, `/assets/css/`, `/assets/js/`。

---

### 5. 常用插件推荐
如果你是手动配置环境，可以在 `Gemfile` 中添加：
* `jekyll-sitemap`：自动生成站点地图，利于 SEO。
* `jekyll-feed`：生成 RSS 订阅。
* `jekyll-paginate`：文章列表分页。
* `jekyll-gist`：方便嵌入 GitHub Gist 代码块。

---