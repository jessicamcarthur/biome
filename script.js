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

        const cards = cardsContainer.querySelectorAll(".card");
        let currentIndex = 0;
        const totalCards = cards.length;

        function getCardWidth() {
            return cards[0].offsetWidth + 20;
        }

        function updateCarousel() {
            const cardWidth = getCardWidth();

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

        updateCarousel();
    }

    // =========================
    // 2️⃣ CAMERA PAGE (scan.html)
    // =========================
    const video = document.getElementById('camera');
    const captureBtn = document.getElementById('capture-btn');

    if (video && captureBtn) {
        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { ideal: 'environment' } }
                });
                video.srcObject = stream;
            } catch (err) {
                console.warn("Back camera failed, trying any camera:", err);
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    video.srcObject = stream;
                } catch (fallbackErr) {
                    console.error("Camera error:", fallbackErr);
                    alert("Unable to access camera. Please allow camera access in your browser settings.");
                }
            }
        }

        startCamera();

        captureBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            if (!video.videoWidth || !video.videoHeight) {
                alert("Camera is not ready yet. Please wait a moment and try again.");
                return;
            }

            // Capture frame from video
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert canvas to a Blob (image file)
            canvas.toBlob(async (blob) => {
                const formData = new FormData();
                formData.append('images', blob, 'plant.jpg');
                formData.append('organs', 'auto');

                const PLANTNET_API_KEY = '2b10rCKYqFIILPte2UZFPCDlXu';
                const url = `https://my-api.plantnet.org/v2/identify/all?api-key=${PLANTNET_API_KEY}&lang=en&include-related-images=false`;

                // Show loading state
                captureBtn.style.opacity = '0.5';
                captureBtn.style.pointerEvents = 'none';

                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        body: formData
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('PlantNet error:', errorData);
                        alert('Could not identify plant. Please try again with a clearer photo.');
                        captureBtn.style.opacity = '1';
                        captureBtn.style.pointerEvents = 'auto';
                        return;
                    }

                    const data = await response.json();

                    // Store result and captured image for identified.html
                    localStorage.setItem('plantResult', JSON.stringify(data));
                    localStorage.setItem('capturedPlant', canvas.toDataURL('image/jpeg'));

                    window.location.href = 'identified.html';

                } catch (err) {
                    console.error('Network error:', err);
                    alert('Network error. Please check your connection and try again.');
                    captureBtn.style.opacity = '1';
                    captureBtn.style.pointerEvents = 'auto';
                }
            }, 'image/jpeg', 0.9);
        });
    }

    // =========================
    // 3️⃣ IDENTIFIED PAGE (identified.html)
    // =========================
    const container = document.getElementById('plant-result');

    if (container) {
        const data = JSON.parse(localStorage.getItem('plantResult') || 'null');
        const capturedImage = localStorage.getItem('capturedPlant');

        if (!data || !data.results || data.results.length === 0) {
            container.innerHTML = "<p>No plant data found. Try scanning again!</p>";
        } else {
            const top = data.results[0];
            const commonNames = top.species?.commonNames?.join(', ') || 'No common name found';
            const scientificName = top.species?.scientificNameWithoutAuthor || '';
            const family = top.species?.family?.scientificNameWithoutAuthor || '';
            const confidence = Math.round(top.score * 100);
            const wikiUrl = top.species?.gbif?.id
                ? `https://www.gbif.org/species/${top.species.gbif.id}`
                : null;

            container.innerHTML = `
                ${capturedImage ? `<img src="${capturedImage}" alt="Captured plant" style="width:100%; max-height:300px; object-fit:cover; border-radius:12px; margin-bottom:16px;">` : ''}
                <h2>${commonNames}</h2>
                <p><em>${scientificName}</em></p>
                ${family ? `<p>Family: ${family}</p>` : ''}
                <p>Match confidence: ${confidence}%</p>
                ${wikiUrl ? `<a href="${wikiUrl}" target="_blank">Learn more</a>` : ''}
                <br><br>
                <a href="scan.html">Scan another plant</a>
            `;
        }
    }

    // =========================
    // 4️⃣ TAP INTERACTIONS FOR MOBILE
    // =========================

    const buttons = document.querySelectorAll('.explore-button, .view-button, .remedy-button, .account-icon, .logo');
    buttons.forEach(btn => {
        btn.addEventListener('touchstart', () => btn.classList.add('pressed'));
        btn.addEventListener('touchend', () => setTimeout(() => btn.classList.remove('pressed'), 150));
        btn.addEventListener('touchcancel', () => btn.classList.remove('pressed'));
    });

    const arrows = document.querySelectorAll('.arrow');
    arrows.forEach(arrow => {
        arrow.addEventListener('touchstart', () => arrow.classList.add('pressed'));
        arrow.addEventListener('touchend', () => setTimeout(() => arrow.classList.remove('pressed'), 150));
        arrow.addEventListener('touchcancel', () => arrow.classList.remove('pressed'));
    });

    const accountCards = document.querySelectorAll('.account-card');
    accountCards.forEach(card => {
        card.addEventListener('touchstart', () => card.classList.add('pressed'));
        card.addEventListener('touchend', () => setTimeout(() => card.classList.remove('pressed'), 150));
        card.addEventListener('touchcancel', () => card.classList.remove('pressed'));
    });

    const collectionCards = document.querySelectorAll('.collection .card');
    collectionCards.forEach(card => {
        card.addEventListener('touchstart', () => card.classList.add('pressed'));
        card.addEventListener('touchend', () => setTimeout(() => card.classList.remove('pressed'), 150));
        card.addEventListener('touchcancel', () => card.classList.remove('pressed'));
    });

    const partnerLogos = document.querySelectorAll('.partner-logos a');
    partnerLogos.forEach(logo => {
        logo.addEventListener('touchstart', () => logo.classList.add('pressed'));
        logo.addEventListener('touchend', () => setTimeout(() => logo.classList.remove('pressed'), 150));
        logo.addEventListener('touchcancel', () => logo.classList.remove('pressed'));
    });

});