---
layout: default
title: Portfolio
permalink: /portfolio/
---

# Portfolio

<ul class="portfolio-grid">
{% for item in site.portfolio %}
  <li class="portfolio-card">
    <h3><a href="{{ item.url | relative_url }}">{{ item.title }}</a></h3>
    <p>{{ item.summary }}</p>
  </li>
{% endfor %}
</ul>
