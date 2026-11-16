---
layout: default
title: Portfolio
permalink: /portfolio/
---

# Portfolio

## Projects Archive

<p class="section-note">These are the projects I worked on when I first got started. I keep them here as a reminder of how far I have come.</p>

<ul class="portfolio-grid">
{% for item in site.portfolio %}
  <li class="portfolio-card">
    <h3><a href="{{ item.url | relative_url }}">{{ item.title }}</a></h3>
    <p>{{ item.summary }}</p>
  </li>
{% endfor %}
</ul>
