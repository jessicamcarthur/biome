document.addEventListener("DOMContentLoaded", () => {
    const cardsContainer = document.getElementById("cards");
    const leftArrow = document.getElementById("arrow-left");
    const rightArrow = document.getElementById("arrow-right");
    const dots = document.querySelectorAll("#progress-dots img");

    const cardWidth = 300 + 10; // card width + gap
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

    rightArrow.addEventListener("click", () => {
        if (currentIndex < totalCards - 1) {
            currentIndex++;
            updateCarousel();
        }
    });

    leftArrow.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });
});