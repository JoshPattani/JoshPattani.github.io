# Josh Pattani - Portfolio Website

**Live Site:** [joshpattani.github.io](https://joshpattani.github.io) | [jpattani.me](https://www.jpattani.me)

Personal portfolio website showcasing my work as a **Designer, Developer, Maker & Engineer**. Currently working as a Design Coordinator at Eldorado Climbing.

---

## 🌐 Site Structure

```
JoshPattani.github.io/
├── index.html              # Main portfolio homepage
├── CNAME                   # Custom domain configuration
│
├── CSS/                    # Active stylesheets
│   ├── index.css           # Main site styles
│   ├── project.css         # Project page styles
│   └── climbing-walls.css  # Climbing portfolio styles
│
├── JS/                     # Active scripts
│   ├── portfolio.js        # Main navigation & interactions
│   ├── skills-physics.js   # Matter.js skills animation
│   └── climbing-walls.js   # Climbing portfolio interactions
│
├── projects/               # Project detail pages
│   ├── resi.html           # ReSi Capstone Project
│   └── climbing-walls.html # Climbing Wall Design Portfolio
│
├── WA/                     # Featured work (used by portfolio)
│   └── wa14.html           # Shark Attack Data Visualization
│
├── assets/                 # Media assets
│   ├── fonts/              # Custom fonts (Trade Gothic, Lucida)
│   ├── img/                # Project images & icons
│   └── audio/, videos/     # Media files
│
├── img/
│   └── webpage/            # Website images (logo, hero, etc.)
│
└── _archive/               # 📦 Archived coursework & old projects
                            # (See _archive/README.md)
```

---

## ✨ Features

- **Responsive Design** - Mobile-first, works on all devices
- **Physics-based Skills Animation** - Interactive Matter.js integration
- **Smooth Animations** - CSS transitions and scroll-triggered reveals
- **Project Showcases** - Detailed pages for featured work
- **Contact Form** - Formspree integration for inquiries
- **Private Analytics** - Lightweight Supabase-backed traffic dashboard

---

## 🛠️ Tech Stack

- **HTML5 / CSS3** - Semantic markup, CSS custom properties, Grid & Flexbox
- **Vanilla JavaScript** - No frameworks, lightweight and fast
- **Matter.js** - Physics engine for interactive skill bubbles
- **Mapbox GL** - Interactive shark attack data visualization
- **Google Fonts** - Space Grotesk & Inter typography
- **Supabase** - Optional private analytics storage, auth, and Edge Function

---

## 🚀 Local Development

```bash
# Clone the repository
git clone https://github.com/JoshPattani/JoshPattani.github.io.git

# Serve locally (Python)
python -m http.server 8000

# Or use VS Code Live Server extension
```

## Analytics Setup

This repo includes an optional privacy-conscious analytics tracker and private
`/admin/` dashboard backed by Supabase. The tracker is disabled by default until
`JS/analytics-config.js` is filled with public Supabase values.

See [docs/analytics.md](docs/analytics.md) for Supabase setup, RLS, Edge
Function deployment, admin allowlist setup, local testing, and the privacy note.

---

## 📦 Archived Content

Old coursework and experimental projects have been moved to `_archive/` for easy extraction to a separate repository. See [\_archive/README.md](_archive/README.md) for details.

### What's Archived:

- **CU Boulder Coursework** - ICA & WA assignments from ATLS2200
- **Old Projects** - ATLS4141 Color Visualizer, ATLS4616 VR, HowThingsWork
- **Unused CSS/JS** - Files no longer used by the main site
- **Libraries** - p5.js and related libraries

---

## 📄 License

© 2026 Josh Pattani. All rights reserved.

---

## 📬 Contact

- **Email:** josh.pattani@gmail.com
- **LinkedIn:** [linkedin.com/in/josh-pattani](https://www.linkedin.com/in/josh-pattani/)
- **GitHub:** [github.com/JoshPattani](https://github.com/JoshPattani)
