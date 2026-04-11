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

            const imageBase64 = canvas.toDataURL('image/jpeg');

            // Dim button to show loading
            captureBtn.style.opacity = '0.5';
            captureBtn.style.pointerEvents = 'none';

            try {
                const response = await fetch('https://plant.id/api/v3/identification?classification_level=all&similar_images=true&details=common_names,description,url', {
                    method: 'POST',
                    headers: {
                        'Api-Key': 'izrAk3IBw4UBz0rpa6EgAFfkA9GKomql35jZ2TZNizsUf6NhKs',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        images: [imageBase64.split(",")[1]]
                    })
                });

                const rawText = await response.text();
                console.log('Plant.id raw response:', rawText);

                const data = JSON.parse(rawText);
                console.log('Plant.id response:', data);

                if (!response.ok) {
                    console.error('Plant.id error:', data);
                    alert('Could not identify plant. Please try again with a clearer photo.');
                    captureBtn.style.opacity = '1';
                    captureBtn.style.pointerEvents = 'auto';
                    return;
                }

                localStorage.setItem('plantResult', JSON.stringify(data));
                localStorage.setItem('capturedPlant', imageBase64);

                window.location.href = 'identified.html';

            } catch (err) {
                console.error('Network error:', err);
                alert('Network error. Please check your connection and try again.');
                captureBtn.style.opacity = '1';
                captureBtn.style.pointerEvents = 'auto';
            }
        });
    }

    // =========================
    // 3️⃣ IDENTIFIED PAGE (identified.html)
    // =========================
    const container = document.getElementById('plant-result');

    if (container) {
        (async () => {
            const data = JSON.parse(localStorage.getItem('plantResult') || 'null');
            const capturedImage = localStorage.getItem('capturedPlant');

            if (!data || !data.result || !data.result.classification) {
                container.innerHTML = "<p>No plant data found. Try scanning again!</p>";
            } else {
                const suggestions = data.result.classification.suggestions;

                if (!suggestions || suggestions.length === 0) {
                    container.innerHTML = "<p>Could not identify this plant. Try scanning again with a clearer photo.</p>";
                } else {
                    const top = suggestions[0];
                    const scientificName = top.name || '';

                    // Update the existing h2 in the header
                    const h2 = document.querySelector('.hero-text h2');
                    if (h2) h2.textContent = scientificName;

                    // Show initial UI with loading states for Gemini content
                    container.innerHTML = `
                        ${capturedImage ? `<img src="${capturedImage}" alt="Captured plant" style="width:100%; max-height:300px; object-fit:cover; border-radius:12px; margin-bottom:16px;">` : ''}
                        <span id="native-badge" class="confidence-badge">Checking origin...</span>
                        <h3>Meet ${scientificName}</h3>
                        <p id="plant-description" class="plant-description"></p>
                        <div id="plant-remedy" class="remedy-section">
                            <h4>Remedy</h4>
                            <p>Loading remedy...</p>
                        </div>
                    `;

                    // Call Groq for native status + remedy
                    const GROQ_API_KEY = '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';
                    const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';

                    try {
                        const groqResponse = await fetch(groqUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${GROQ_API_KEY}`
                            },
                            body: JSON.stringify({
                                model: 'llama-3.3-70b-versatile',
                                messages: [
                                    {
                                        role: 'system',
                                        content: 'You are a writer for Biome, a New Zealand nature app. Always respond ONLY with a valid JSON object, no extra text or markdown.'
                                    },
                                    {
                                        role: 'user',
                                        content: `Given the plant (${scientificName}), respond ONLY with a valid JSON object in this exact format:
                                        {"isNative": true or false, 
                                        "plantDescription": "A short 1-2 sentence description of the plant in a warm New Zealand tone.",
                                        "title": "A short recipe name e.g. Manuka Balm",
                                        "remedy": "One sentence introducing the remedy in a warm New Zealand tone.",
                                        "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
                                        "steps": ["Step 1 instruction", "Step 2 instruction", "Step 3 instruction"]
                                        }`
                                    }
                                ],
                                temperature: 0.7,
                                max_tokens: 500
                            })
                        });

                        const groqData = await groqResponse.json();
                        console.log('Groq raw response:', groqData);
                        const rawText = groqData.choices?.[0]?.message?.content || '{}';
                        const cleaned = rawText.replace(/```json|```/g, '').trim();
                        let parsed = {};
                        try {
                            parsed = JSON.parse(cleaned);
                        } catch (parseErr) {
                            console.error('JSON parse error:', parseErr);
                        }

                        // Update native badge
                        const nativeBadge = document.getElementById('native-badge');
                        if (nativeBadge) {
                            nativeBadge.textContent = parsed.isNative ? 'Native to Aotearoa' : 'Introduced Species';
                            nativeBadge.className = parsed.isNative ? 'confidence-badge native' : 'confidence-badge introduced';
                        }

                        // Update plant description
const descEl = document.getElementById('plant-description');
if (descEl) descEl.textContent = parsed.plantDescription || '';

                        // Update remedy
                        const remedyEl = document.getElementById('plant-remedy');
                        if (remedyEl) {
                            const ingredientsList = parsed.ingredients?.map(i => `<li>${i}</li>`).join('') || '';
                            const stepsList = parsed.steps?.map(s => `<li>${s}</li>`).join('') || '';
                            remedyEl.innerHTML = `
        <h4>${parsed.title || 'Remedy'}</h4>
        <p>${parsed.remedy || ''}</p>
        ${ingredientsList ? `<h5>What You'll Need:</h5><ul>${ingredientsList}</ul>` : ''}
        ${stepsList ? `<h5>Lets Make It:</h5><ol>${stepsList}</ol>` : ''}
    `;
                        }

                    } catch (err) {
                        console.error('Groq error:', err);
                        const nativeBadge = document.getElementById('native-badge');
                        if (nativeBadge) nativeBadge.textContent = 'Origin unknown';
                        const remedyEl = document.getElementById('plant-remedy');
                        if (remedyEl) remedyEl.innerHTML = '<h4>Remedy</h4><p>No remedy information available.</p>';
                    }
                }
            }
        })();
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