const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

let stars = [];
let mouse = { x: 0, y: 0 };
let scrollDelta = 0;
let lastScrollY = window.scrollY;
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
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateStars() {
    stars.forEach(star => {
        // Mouse motion effect
        star.x += (mouse.x - canvas.width / 2) * 0.001 * star.speed;
        star.y += (mouse.y - canvas.height / 2) * 0.001 * star.speed;

        // Scroll inverted movement
        star.y -= scrollDelta * star.speed;

        // Wrap around
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;
    });
    scrollDelta = 0;
}

function animate() {
    drawStars();

    const currentScrollY = window.scrollY;
    scrollDelta = (currentScrollY - lastScrollY);
    lastScrollY = currentScrollY;

    updateStars();
    requestAnimationFrame(animate);
}

// Handle mouse movement
window.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
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
    touchStartY = touchY;
    
    // Update mouse position for star movement
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
});

window.addEventListener("touchend", () => {
});

// Handle window resize
window.addEventListener("resize", resizeCanvas);

// Initialize and start animation
resizeCanvas();
animate();
