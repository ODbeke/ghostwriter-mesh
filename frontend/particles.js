const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let bubbles = [];
const mouse = { x: null, y: null };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

// Handle mouse leaving the window
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle {
    constructor() {
        this.init();
    }

    init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 5;
    }

    update() {
        if (mouse.x !== null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let maxDistance = 120;
            
            if (distance < maxDistance) {
                let force = (maxDistance - distance) / maxDistance;
                let directionX = (dx / distance) * force * this.density;
                let directionY = (dy / distance) * force * this.density;
                this.x -= directionX;
                this.y -= directionY;
            } else {
                if (this.x !== this.baseX) {
                    let dx = this.x - this.baseX;
                    this.x -= dx / 15;
                }
                if (this.y !== this.baseY) {
                    let dy = this.y - this.baseY;
                    this.y -= dy / 15;
                }
            }
        } else {
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx / 15;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy / 15;
            }
        }
    }

    draw() {
        ctx.fillStyle = 'rgba(108, 92, 231, 0.2)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Bubble {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 200;
        this.size = Math.random() * 18 + 7; // Slightly larger
        this.speedY = Math.random() * 0.7 + 0.4;
        this.opacity = Math.random() * 0.25 + 0.15; // More visible
        this.popped = false;
    }

    update() {
        this.y -= this.speedY;
        
        // Pop logic
        if (mouse.x !== null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < this.size) {
                this.popped = true;
            }
        }

        if (this.y < -50 || this.popped) {
            this.reset();
        }
    }

    draw() {
        // Create radial gradient for glossiness
        const gradient = ctx.createRadialGradient(
            this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.1,
            this.x, this.y, this.size
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity + 0.3})`);
        gradient.addColorStop(0.6, `rgba(162, 155, 254, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(108, 92, 231, ${this.opacity * 0.5})`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Add sharp glint for "shiny" kid appearance
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity + 0.4})`;
        ctx.beginPath();
        ctx.arc(this.x - this.size * 0.4, this.y - this.size * 0.4, this.size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // Thin high-light border
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity + 0.2})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }
}

function init() {
    particles = [];
    bubbles = [];
    const particleCount = (canvas.width * canvas.height) / 15000;
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    for (let i = 0; i < 20; i++) {
        bubbles.push(new Bubble());
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    bubbles.forEach(b => {
        b.update();
        b.draw();
    });

    requestAnimationFrame(animate);
}

init();
animate();
