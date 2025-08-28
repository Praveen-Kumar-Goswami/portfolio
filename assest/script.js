const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

let stars = [];
let mouse = { x: 0, y: 0 };
let scrollDelta = 0;
let touchStartY = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = [];
    for (let i = 0; i < 800; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2,
            speed: Math.random() * 1 + 1
        });
    }
}

function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.beginPath();
    stars.forEach(star => {
        ctx.moveTo(star.x, star.y);
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    });
    ctx.fill();
}

function updateStars() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const dx = (mouse.x - centerX) * 0.001;
    const dy = (mouse.y - centerY) * 0.001;
    const ds = -scrollDelta; // Inverted scroll

    const width = canvas.width;
    const height = canvas.height;

    stars.forEach(star => {
        star.x += (dx + ds) * star.speed;
        star.y += (dy + ds) * star.speed;

        // Modulo wrap-around handling negative values
        star.x = (star.x % width + width) % width;
        star.y = (star.y % height + height) % height;
    });

    scrollDelta = 0;
}

function animate() {
    updateStars();
    drawStars();
    requestAnimationFrame(animate);
}

// Handle mouse movement
window.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Handle mouse wheel with magnitude
window.addEventListener("wheel", e => {
    scrollDelta = e.deltaY * 0.01; // Scale delta for smoother control
});

// Touch events for mobile devices
window.addEventListener("touchstart", e => {
    touchStartY = e.touches[0].clientY;
    
    // Update mouse position for star movement
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
});

window.addEventListener("touchmove", e => {
    const touchY = e.touches[0].clientY;
    const deltaY = touchY - touchStartY;
    
    // Set scroll delta with magnitude (inverted for natural feel)
    scrollDelta = -deltaY * 0.02; // Adjust factor for sensitivity
    touchStartY = touchY;
    
    // Update mouse position for star movement
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
    
    // Prevent default to avoid page scrolling
    e.preventDefault();
});

// Handle window resize
window.addEventListener("resize", resizeCanvas);

// Initialize and start animation
resizeCanvas();
animate();
