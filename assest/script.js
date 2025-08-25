        const canvas = document.getElementById("starfield");
        const ctx = canvas.getContext("2d");

        let stars = [];
        let mouse = { x: 0, y: 0 };
        let scrollDelta = 0;
        let touchStartY = 0;
        let isScrolling = false;

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
                star.y -= scrollDelta * 1 * star.speed;

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
            updateStars();
            requestAnimationFrame(animate);
        }

        // Handle mouse movement
        window.addEventListener("mousemove", e => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        // Handle mouse wheel
        window.addEventListener("wheel", e => {
            scrollDelta = e.deltaY > 0 ? 1 : -1;
        });

        // Touch events for mobile devices
        window.addEventListener("touchstart", e => {
            touchStartY = e.touches[0].clientY;
            isScrolling = true;
            
            // Also update mouse position for star movement
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        });

        window.addEventListener("touchmove", e => {
            if (!isScrolling) return;
            
            const touchY = e.touches[0].clientY;
            const deltaY = touchY - touchStartY;
            
            // Set scroll delta based on touch movement
            scrollDelta = deltaY > 0 ? -1 : 1;
            touchStartY = touchY;
            
            // Update mouse position for star movement
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
            
            // Prevent default to avoid scrolling the page
            e.preventDefault();
        });

        window.addEventListener("touchend", () => {
            isScrolling = false;
        });

        // Handle window resize
        window.addEventListener("resize", resizeCanvas);

        // Initialize and start animation
        resizeCanvas();
        animate();