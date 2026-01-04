# Repository Reorganization - Change Log

**Date:** January 3, 2026  
**Purpose:** Separate personal portfolio website files from archived coursework and old projects

---

## Summary

Moved all unused files to `_archive/` folder to enable easy extraction to a separate repository while keeping the main portfolio site clean and maintainable.

---

## Files Kept (Active Website)

### Root Level

- `index.html` - Main portfolio homepage
- `CNAME` - Custom domain config (jpattani.me)
- `README.md` - Updated repository documentation
- `.gitignore`

### CSS/ (3 files)

- `index.css` - Main site styles
- `project.css` - Project detail page styles
- `climbing-walls.css` - Climbing portfolio styles

### JS/ (3 files)

- `portfolio.js` - Main navigation & interactions
- `skills-physics.js` - Matter.js skills animation
- `climbing-walls.js` - Climbing portfolio interactions

### projects/ (2 files)

- `resi.html` - ReSi Capstone Project page
- `climbing-walls.html` - Climbing Wall Design Portfolio

### WA/ (1 file)

- `wa14.html` - Shark Attack Map (featured in portfolio)

### assets/ (kept entirely)

- `fonts/` - Custom typography
- `img/` - Project images (resi photos, shark attacks hero, etc.)
- `audio/`, `videos/` - Media files

### img/webpage/ (kept entirely)

- Logo files, hero image, project thumbnails

---

## Files Moved to `_archive/`

### Coursework → `_archive/coursework/`

| Original Path            | New Path                            |
| ------------------------ | ----------------------------------- |
| `ICA/`                   | `_archive/coursework/ICA/`          |
| `WA/` (except wa14.html) | `_archive/coursework/WA/`           |
| `html-midterm/`          | `_archive/coursework/html-midterm/` |
| `ica3-part2/`            | `_archive/coursework/ica3-part2/`   |

### Old Projects → `_archive/projects/`

| Original Path        | New Path                               | Description                |
| -------------------- | -------------------------------------- | -------------------------- |
| `atls4141_color/`    | `_archive/projects/atls4141_color/`    | p5.js audio visualizer     |
| `ATLS4616-intro2VR/` | `_archive/projects/ATLS4616-intro2VR/` | VR course files            |
| `HowThingsWork/`     | `_archive/projects/HowThingsWork/`     | Educational explainers     |
| `html/`              | `_archive/projects/html-experiments/`  | Experimental HTML projects |

### Libraries → `_archive/libraries/`

| Original Path | New Path              |
| ------------- | --------------------- |
| `libraries/`  | `_archive/libraries/` |

### Unused CSS → `_archive/unused-css/`

| Files Moved                                        |
| -------------------------------------------------- |
| fontStyle.css, garbageOdyssey.css, heroesStyle.css |
| ica11.css, ica3a.css, ica3b.css, ica4.css          |
| ica5-style.css, ica7.css, index_OG.css             |
| quiz10Style.css, style.css                         |
| wa11.css, wa13.css, wa5.css, wa7.css               |

### Unused JS → `_archive/unused-js/`

| Files Moved                                   |
| --------------------------------------------- |
| asteroids.js, eventHandler.js, fx.js, game.js |
| gameLoop.js, goo.js, gui.js, ica11.js         |
| main.js, particle.js, player.js               |
| project-gallery-scroll.js, projectile.js      |
| wa9.js, wa11.js, wa12.js, wa13.js             |

### Misc → `_archive/misc/`

| Files Moved                            |
| -------------------------------------- |
| index_OG.html                          |
| smooth-fullscreen-slideshow-animation/ |

---

## Links Verified

All internal links in the active website have been verified:

- ✅ CSS files (index.css, project.css, climbing-walls.css)
- ✅ JS files (portfolio.js, skills-physics.js, climbing-walls.js)
- ✅ Project pages (resi.html, climbing-walls.html)
- ✅ Featured work (wa14.html)
- ✅ Images (logo, hero, project thumbnails, RESI photos)

---

## Next Steps

1. **Review changes** - Verify site works locally before pushing
2. **Commit changes** - `git add -A && git commit -m "Reorganize: Move coursework/old projects to _archive"`
3. **Optional: Extract archive** - Move `_archive/` to separate repo if desired

---

## Rollback (if needed)

All files are still in the repository under `_archive/`. To restore:

```bash
# Example: Restore ICA folder
mv _archive/coursework/ICA ./ICA

# Example: Restore a CSS file
mv _archive/unused-css/ica11.css ./CSS/ica11.css
```
