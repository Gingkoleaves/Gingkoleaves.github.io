---
layout: default
title: 首页
---

## 欢迎来到我的站点 :wave:

这里是我记录 **计算机系统结构** 和 **Rust** 学习笔记的地方。

### 最近文章
<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a> ({{ post.date | date_to_string }})
    </li>
  {% endfor %}
</ul>