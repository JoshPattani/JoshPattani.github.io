# Climbing Wall Project Images

This folder contains images for the climbing wall design portfolio showcase.

## Required Images

Each gallery item now supports multiple images. Add your project images here with the following naming convention:

### Concept Renderings

**Commercial Gym Design (concept-1):**

- `concept-placeholder-1.png` - Main view (hero image)
- `concept-1-angle2.jpg` - Alternate angle
- `concept-1-detail.jpg` - Detail view

**Residential Installation (concept-2):**

- `concept-placeholder-2.jpg` - Main view (hero image)
- `concept-2-installed.jpg` - Installation photo
- `concept-2-detail.jpg` - Panel detail

**Site Assessment (space-1):**

- `space-placeholder-1.jpg` - Initial space (hero image)
- `space-1-measurements.jpg` - Measurements
- `space-1-concept.jpg` - Overlay concept

### Completed Builds

**Student Facility (completed-1):**

- `completed-placeholder-1.jpg` - Main view (hero image)
- `completed-1-wide.jpg` - Wide angle
- `completed-1-detail.jpg` - Feature detail

**Bouldering Area (completed-2):**

- `completed-placeholder-2.jpg` - Main view (hero image)
- `completed-2-cave.jpg` - Cave section
- `completed-2-volumes.jpg` - Volume features

**Bouldering Wall (completed-3):**

- `completed-placeholder-3.jpg` - Main view (hero image)
- `completed-3-angle.jpg` - Side angle
- `completed-3-climber.jpg` - In use

### Technical Documentation

**Drafting Package (drafting-1):**

- `drafting-placeholder-1.jpg` - Overview (hero image)
- `drafting-1-detail.jpg` - Section detail
- `drafting-1-elevation.jpg` - Elevation view

**Fabrication Drawings (fab-1):**

- `fab-placeholder-1.jpg` - Assembly overview (hero image)
- `fab-1-weldment.jpg` - Weldment details
- `fab-1-bom.jpg` - Bill of materials

**CNC Panel Nesting (cnc-1):**

- `cnc-placeholder-1.jpg` - Sheet layout (hero image)
- `cnc-1-toolpath.jpg` - Toolpath detail
- `cnc-1-output.jpg` - Finished panels

## Image Guidelines

1. **Proprietary Information**: Ensure no proprietary processes, internal methods, or sensitive company information is visible
2. **Resolution**: Recommended minimum 1200px width for optimal display
3. **Format**: JPG or PNG, optimized for web (compress if needed)
4. **Aspect Ratios**:
   - Standard items: Any aspect ratio (images will be cropped to fit)
   - Tall items: Vertical orientation works best
   - Wide items: Horizontal orientation (2:1 or wider recommended)

## Gallery Features

- **Multi-image galleries**: Each project card opens a lightbox with navigation
- **Keyboard navigation**: Use arrow keys to navigate, Escape to close
- **Thumbnails**: Click thumbnails to jump to specific images
- **Responsive**: Works on desktop and mobile devices

## Content Categories

The gallery supports filtering by:

- **Concepts**: Design renderings and visualizations
- **Completed**: Photos of finished installations
- **Documentation**: Drafting, CNC files, technical drawings

## Updating Images

To update the gallery images for a project:

1. Add your images to this folder following the naming convention above
2. Update the `data-gallery` JSON attribute in `/projects/climbing-walls.html`
3. The first image in the array is shown as the hero/thumbnail
4. Update alt text to be descriptive for accessibility

### Example data-gallery attribute:

```json
data-gallery='[
  {"src": "/img/climbing-walls/your-image-1.jpg", "alt": "Description 1"},
  {"src": "/img/climbing-walls/your-image-2.jpg", "alt": "Description 2"},
  {"src": "/img/climbing-walls/your-image-3.jpg", "alt": "Description 3"}
]'
```

## Hero Image for Portfolio Card

Consider adding a hero image specifically for the main portfolio page card:

- `/img/webpage/climbing-wall-hero.jpg`
