// main.js
document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // 1️⃣ CAROUSEL
    // =========================
    const cardsContainer = document.getElementById("cards");
    if (cardsContainer) {
        const leftArrow = document.getElementById("arrow-left");
        const rightArrow = document.getElementById("arrow-right");
        const dots = document.querySelectorAll("#progress-dots img");

        const cardWidth = 310; // card width + gap
        let currentIndex = 0;
        const totalCards = cardsContainer.children.length;

        function updateCarousel() {
            cardsContainer.scrollTo({
                left: currentIndex * cardWidth,
                behavior: "smooth",
            });

            dots.forEach((dot, index) => {
                if (index === currentIndex) {
                    dot.src = "images/circle.svg";
                    dot.classList.add("active");
                } else {
                    dot.src = "images/circle-outline.svg";
                    dot.classList.remove("active");
                }
            });
        }

        rightArrow?.addEventListener("click", () => {
            if (currentIndex < totalCards - 1) {
                currentIndex++;
                updateCarousel();
            }
        });

        leftArrow?.addEventListener("click", () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });
    }

    // =========================
    // 2️⃣ CAMERA PAGE
    // =========================
document.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById('camera');
    const captureBtn = document.getElementById('capture-btn');

    if (!video || !captureBtn) return;

    // Start camera immediately
    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // back camera
            });
            video.srcObject = stream;
            await video.play();
        } catch (err) {
            console.error("Camera error:", err);
            alert("Unable to access camera. Please allow camera access.");
        }
    }

    startCamera();

    // Capture photo on button click
    captureBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        if (!video.videoWidth || !video.videoHeight) {
            alert("Camera is not ready yet!");
            return;
        }

        // Capture current frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Save the image locally in base64 (simulate API result)
        const imageBase64 = canvas.toDataURL('image/jpeg');
        localStorage.setItem('capturedPlant', imageBase64);

        // Navigate to identified.html
        window.location.href = 'identified.html';
    });
});

    // =========================
    // 3️⃣ IDENTIFIED PAGE
    // =========================
    const plantData = JSON.parse(localStorage.getItem('identifiedPlant') || "null");
    if (plantData) {
        if (!plantData.suggestions || plantData.suggestions.length === 0) {
            document.body.innerHTML = "<p>No plant data found. Try scanning again!</p>";
        } else {
            const topResult = plantData.suggestions[0];
            document.body.innerHTML = `
                <div style="padding:20px; text-align:center;">
                    <h2>${topResult.plant_name}</h2>
                    <p>Confidence: ${Math.round(topResult.probability * 100)}%</p>
                    <p>${topResult.plant_details?.wiki_description?.value || ''}</p>
                    <a href="${topResult.plant_details?.url}" target="_blank">Learn more</a>
                </div>
            `;
        }
    }

});

// TAP INTERACTIONS FOR MOBILE

// Buttons + text links (scale down)
const buttons = document.querySelectorAll('.explore-button, .view-button, .remedy-button');

buttons.forEach(btn => {
    btn.addEventListener('touchstart', () => {
        btn.classList.add('pressed');
    });

    btn.addEventListener('touchend', () => {
        setTimeout(() => {
            btn.classList.remove('pressed');
        }, 150);
    });

    btn.addEventListener('touchcancel', () => {
        btn.classList.remove('pressed');
    });
});


// Carousel arrows (scale UP)
const arrows = document.querySelectorAll('.arrow');

arrows.forEach(arrow => {
    arrow.addEventListener('touchstart', () => {
        arrow.classList.add('pressed');
    });

    arrow.addEventListener('touchend', () => {
        setTimeout(() => {
            arrow.classList.remove('pressed');
        }, 150);
    });

    arrow.addEventListener('touchcancel', () => {
        arrow.classList.remove('pressed');
    });
});


// Account cards (scale down)
const accountCards = document.querySelectorAll('.account-card');

accountCards.forEach(card => {
    card.addEventListener('touchstart', () => {
        card.classList.add('pressed');
    });

    card.addEventListener('touchend', () => {
        setTimeout(() => {
            card.classList.remove('pressed');
        }, 150);
    });

    card.addEventListener('touchcancel', () => {
        card.classList.remove('pressed');
    });
});


// Collection page cards (scale down)
const collectionCards = document.querySelectorAll('.collection .card');

collectionCards.forEach(card => {
    card.addEventListener('touchstart', () => {
        card.classList.add('pressed');
    });

    card.addEventListener('touchend', () => {
        setTimeout(() => {
            card.classList.remove('pressed');
        }, 150);
    });

    card.addEventListener('touchcancel', () => {
        card.classList.remove('pressed');
    });
});


// Partner logos (lift + scale)
const partnerLogos = document.querySelectorAll('.partner-logos a');

partnerLogos.forEach(logo => {
    logo.addEventListener('touchstart', () => {
        logo.classList.add('pressed');
    });

    logo.addEventListener('touchend', () => {
        setTimeout(() => {
            logo.classList.remove('pressed');
        }, 150);
    });

    logo.addEventListener('touchcancel', () => {
        logo.classList.remove('pressed');
    });
});