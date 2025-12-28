/**
 * Skills Physics Effect
 * Interactive physics simulation for skill keywords using Matter.js
 * Keywords fall like text in a tilted book and react to mouse movement
 */

class SkillsPhysics {
  constructor(container) {
    this.container = container;
    this.canvas = container.querySelector('.skills__canvas');
    this.skillsList = container.querySelector('.skills__list');
    this.skills = JSON.parse(this.skillsList.dataset.skills);
    this.isActive = false;
    this.engine = null;
    this.render = null;
    this.bodies = [];
    this.mouse = null;
    this.mouseConstraint = null;
    
    this.init();
  }
  
  init() {
    // Add hover handler to activate physics
    this.container.addEventListener('mouseenter', () => {
      if (!this.isActive) {
        this.activate();
      }
    });
  }
  
  activate() {
    this.isActive = true;
    this.container.classList.add('active');
    
    // Set canvas dimensions
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    
    // Create Matter.js engine
    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: 1 }
    });
    
    // Create renderer
    this.render = Matter.Render.create({
      canvas: this.canvas,
      engine: this.engine,
      options: {
        width: this.canvas.width,
        height: this.canvas.height,
        wireframes: false,
        background: 'transparent'
      }
    });
    
    // Create walls (boundaries)
    this.createWalls();
    
    // Create text bodies for each skill
    this.createSkillBodies();
    
    // Add mouse interaction
    this.addMouseInteraction();
    
    // Run the engine and renderer
    Matter.Runner.run(this.engine);
    Matter.Render.run(this.render);
    
    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  createWalls() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const wallThickness = 50;
    
    const options = {
      isStatic: true,
      render: {
        fillStyle: 'transparent'
      }
    };
    
    // Bottom wall
    const ground = Matter.Bodies.rectangle(
      width / 2,
      height + wallThickness / 2,
      width,
      wallThickness,
      options
    );
    
    // Left wall
    const leftWall = Matter.Bodies.rectangle(
      -wallThickness / 2,
      height / 2,
      wallThickness,
      height * 2,
      options
    );
    
    // Right wall
    const rightWall = Matter.Bodies.rectangle(
      width + wallThickness / 2,
      height / 2,
      wallThickness,
      height * 2,
      options
    );
    
    // Top wall (invisible ceiling)
    const ceiling = Matter.Bodies.rectangle(
      width / 2,
      -wallThickness / 2,
      width,
      wallThickness,
      options
    );
    
    Matter.World.add(this.engine.world, [ground, leftWall, rightWall, ceiling]);
  }
  
  createSkillBodies() {
    const ctx = this.canvas.getContext('2d');
    const padding = 16;
    const fontSize = 14;
    const fontFamily = 'Inter, sans-serif';
    ctx.font = `500 ${fontSize}px ${fontFamily}`;
    
    const width = this.canvas.width;
    const startY = 50;
    const spacing = 8;
    
    this.skills.forEach((skill, index) => {
      // Measure text width
      const textWidth = ctx.measureText(skill).width;
      const textHeight = fontSize;
      
      // Create rectangular body for text
      const bodyWidth = textWidth + padding * 2;
      const bodyHeight = textHeight + padding;
      
      // Random starting position at top
      const x = Math.random() * (width - bodyWidth) + bodyWidth / 2;
      const y = startY + index * spacing;
      
      const body = Matter.Bodies.rectangle(x, y, bodyWidth, bodyHeight, {
        restitution: 0.6, // Bounciness
        friction: 0.1,
        density: 0.001,
        render: {
          fillStyle: 'transparent',
          strokeStyle: 'transparent',
          lineWidth: 0
        },
        label: skill,
        // Store original dimensions for rendering
        originalWidth: bodyWidth,
        originalHeight: bodyHeight
      });
      
      this.bodies.push(body);
      Matter.World.add(this.engine.world, body);
    });
    
    // Custom rendering for text
    Matter.Events.on(this.render, 'afterRender', () => {
      this.renderText(ctx, fontSize, fontFamily);
    });
  }
  
  renderText(ctx, fontSize, fontFamily) {
    ctx.font = `500 ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    this.bodies.forEach(body => {
      const pos = body.position;
      const angle = body.angle;
      const width = body.originalWidth;
      const height = body.originalHeight;
      
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(angle);
      
      // Draw rounded rectangle background
      const radius = 8;
      ctx.fillStyle = 'rgba(99, 102, 241, 0.8)';
      ctx.beginPath();
      ctx.roundRect(-width/2, -height/2, width, height, radius);
      ctx.fill();
      
      // Text color
      ctx.fillStyle = '#e0e7ff';
      ctx.fillText(body.label, 0, 0);
      
      ctx.restore();
    });
  }
  
  addMouseInteraction() {
    // Create mouse control
    this.mouse = Matter.Mouse.create(this.canvas);
    
    // Create mouse constraint for dragging
    this.mouseConstraint = Matter.MouseConstraint.create(this.engine, {
      mouse: this.mouse,
      constraint: {
        stiffness: 0.05,
        render: {
          visible: false
        }
      }
    });
    
    Matter.World.add(this.engine.world, this.mouseConstraint);
    
    // Track mouse position for repulsion effect
    let mousePosition = { x: -1000, y: -1000 }; // Start offscreen
    let isMouseInCanvas = false;
    
    // Update mouse position on canvas mousemove
    const updateMousePosition = (event) => {
      const rect = this.canvas.getBoundingClientRect();
      mousePosition = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      isMouseInCanvas = true;
    };
    
    this.canvas.addEventListener('mousemove', updateMousePosition);
    
    // Track when mouse leaves canvas
    this.canvas.addEventListener('mouseleave', () => {
      isMouseInCanvas = false;
      mousePosition = { x: -1000, y: -1000 }; // Move offscreen
    });
    
    // Track when mouse enters canvas
    this.canvas.addEventListener('mouseenter', (event) => {
      isMouseInCanvas = true;
      updateMousePosition(event);
    });
    
    // Apply repulsion force in the engine update loop
    Matter.Events.on(this.engine, 'afterUpdate', () => {
      if (!isMouseInCanvas) return;
      
      // Apply force to nearby bodies
      this.bodies.forEach(body => {
        const dx = body.position.x - mousePosition.x;
        const dy = body.position.y - mousePosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Repel bodies within 120px
        if (distance < 120 && distance > 0.1) {
          const forceMagnitude = (120 - distance) / 120 * 0.0005;
          const forceX = (dx / distance) * forceMagnitude;
          const forceY = (dy / distance) * forceMagnitude;
          
          Matter.Body.applyForce(body, body.position, {
            x: forceX,
            y: forceY
          });
        }
      });
    });
    
    // Prevent dragging from scrolling the page
    this.mouseConstraint.mouse.element.removeEventListener(
      'mousewheel',
      this.mouseConstraint.mouse.mousewheel
    );
    this.mouseConstraint.mouse.element.removeEventListener(
      'DOMMouseScroll',
      this.mouseConstraint.mouse.mousewheel
    );
  }
  
  handleResize() {
    if (!this.isActive) return;
    
    // Update canvas dimensions
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    
    // Update render dimensions
    this.render.bounds.max.x = rect.width;
    this.render.bounds.max.y = rect.height;
    this.render.options.width = rect.width;
    this.render.options.height = rect.height;
    this.render.canvas.width = rect.width;
    this.render.canvas.height = rect.height;
    
    // Recreate walls with new dimensions
    Matter.World.clear(this.engine.world, false);
    this.createWalls();
    
    // Re-add bodies
    this.bodies.forEach(body => {
      Matter.World.add(this.engine.world, body);
    });
    
    // Re-add mouse constraint
    Matter.World.add(this.engine.world, this.mouseConstraint);
  }
}

// Initialize physics for all skill containers
document.addEventListener('DOMContentLoaded', () => {
  // Wait for Matter.js to load
  if (typeof Matter === 'undefined') {
    console.warn('Matter.js not loaded. Physics effects disabled.');
    return;
  }
  
  const containers = document.querySelectorAll('.skills__physics-container');
  containers.forEach(container => {
    new SkillsPhysics(container);
  });
});
