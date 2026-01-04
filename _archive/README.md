# Archive - Unused Files & Coursework

This folder contains files that are **not part of the live website** at [joshpattani.github.io](https://joshpattani.github.io). These are archived coursework, experiments, and unused assets from previous projects.

> **📦 Easy Extraction**: This entire `_archive` folder can be moved to a separate repository without affecting the main portfolio website.

---

## 📁 Archive Structure

```
_archive/
├── coursework/          # CU Boulder coursework assignments
│   ├── ICA/             # In-Class Activities (ICA 3-12)
│   ├── WA/              # Weekly Assignments (WA 1-13)
│   ├── html-midterm/    # Midterm project files
│   └── ica3-part2/      # Additional ICA files
│
├── projects/            # Older/experimental project folders
│   ├── atls4141_color/  # ATLS 4141 Color Music Visualizer (p5.js)
│   ├── ATLS4616-intro2VR/  # VR intro course assets
│   ├── HowThingsWork/   # Educational interactive projects (Gameboy, Projectors)
│   └── html-experiments/  # Misc HTML experiments (Garbage Odyssey, Slime, etc.)
│
├── libraries/           # External libraries (p5.js)
│
├── unused-css/          # CSS files not used by current site
│   ├── fontStyle.css
│   ├── garbageOdyssey.css
│   ├── heroesStyle.css
│   ├── ica*.css         # ICA-related styles
│   ├── wa*.css          # WA-related styles
│   ├── quiz10Style.css
│   ├── index_OG.css     # Old index page styles
│   └── style.css        # General old styles
│
├── unused-js/           # JS files not used by current site
│   ├── asteroids.js     # Game project files
│   ├── fx.js, game.js, gameLoop.js, goo.js, gui.js
│   ├── particle.js, player.js, projectile.js
│   ├── eventHandler.js
│   ├── ica11.js
│   ├── main.js
│   ├── project-gallery-scroll.js
│   └── wa*.js           # WA-related scripts
│
└── misc/                # Miscellaneous files
    ├── index_OG.html    # Old index.html backup
    └── smooth-fullscreen-slideshow-animation/
```

---

## 📚 Coursework Details

### In-Class Activities (ICA)

| Assignment | Description           |
| ---------- | --------------------- |
| ICA 3a/3b  | HTML/CSS fundamentals |
| ICA 4      | Box model & layout    |
| ICA 5      | Flexbox               |
| ICA 6      | CSS Grid (3 parts)    |
| ICA 7      | Responsive design     |
| ICA 9      | JavaScript intro      |
| ICA 10     | DOM manipulation      |
| ICA 11     | Event handling        |
| ICA 12     | Advanced JS           |
| Quiz 10    | JavaScript quiz       |

### Weekly Assignments (WA)

| Assignment | Description           |
| ---------- | --------------------- |
| WA 1-5     | HTML/CSS fundamentals |
| WA 6       | Multi-page site       |
| WA 7       | Responsive design     |
| WA 9       | Image gallery         |
| WA 10      | JavaScript gallery    |
| WA 11-13   | Advanced JS projects  |
| Heroes     | Superhero page        |

---

## 🔬 Project Descriptions

### ATLS 4141 Color Music Visualizer

An audio-reactive color visualization project using p5.js. Features:

- Real-time audio analysis with FFT
- Physics-based particle systems
- Color mapping to frequency spectrum

### HowThingsWork

Educational interactive explainers:

- **Gameboy/** - How the original Game Boy display works
- **Projectors/** - How projector technology functions

### HTML Experiments

Various experimental web projects:

- **garbageOdyssey.html** - Interactive garbage collection game/visualization
- **slime.html** - Slime simulation experiment
- **show.js** - Animation/presentation utilities

---

## 🚀 Moving to Another Repository

To extract these files to a new repository:

```bash
# Option 1: Copy to new location
cp -r _archive /path/to/new/repo

# Option 2: Git subtree (preserves history)
git subtree split --prefix=_archive -b archive-branch
cd /path/to/new/repo
git pull /path/to/original/repo archive-branch
```

---

## 📅 Archive Date

**Archived on:** January 3, 2026

**Reason:** Repository cleanup to separate active portfolio website from coursework and experimental projects.

---

## ⚠️ Notes

- Some files may have broken relative paths since they were moved from their original locations
- To restore functionality, update paths to assets (CSS, JS, images) accordingly
- The `libraries/p5/` folder contains p5.js and p5.sound.js if needed for the visualization projects
