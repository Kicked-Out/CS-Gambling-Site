document.addEventListener("DOMContentLoaded", function () {
    const spinButton = document.getElementById("spin-button");
    const reel = document.querySelector(".slot-reel");
    const skinsContainer = document.getElementById("slot-skins");
    const skins = document.querySelectorAll(".slot-skin");
    const skinWidth = skins[0].offsetWidth + 5; // Включаємо відступ між картками
    let position = 0;
    let spinning = false;

    function cloneSkins() {
        const originalSkins = Array.from(skinsContainer.children);
        originalSkins.forEach(skin => {
            const clone = skin.cloneNode(true);
            skinsContainer.appendChild(clone);
        });
    }

    cloneSkins(); // Робимо дублікати, щоб можна було крутити без кінця

    function generateMoreSkins() {
        const originalSkins = Array.from(skinsContainer.children);
        originalSkins.forEach(skin => {
            const clone = skin.cloneNode(true);
            skinsContainer.appendChild(clone);
        });
    }

    function startSpinning() {
        if (spinning) return;
        spinning = true;

        let speed = 50; // Початкова швидкість
        let duration = 2000; // Час крутіння (2 секунди)
        let slowDownTime = 1500; // Час сповільнення (1.5 секунди)
        let startTime = performance.now();
        let frame;

        function animate(currentTime) {
            let elapsedTime = currentTime - startTime;

            if (elapsedTime < duration) {
                position -= speed;
                reel.style.transform = `translateX(${position}px)`;

                if (Math.abs(position) > skinsContainer.scrollWidth / 2) {
                    generateMoreSkins(); // Генеруємо нові скіни, щоб вони не закінчувалися
                }
            } else if (elapsedTime < duration + slowDownTime) {
                let progress = (elapsedTime - duration) / slowDownTime;
                position -= speed * (1 - progress);
                reel.style.transform = `translateX(${position}px)`;
            } else {
                let finalOffset = Math.round(position / skinWidth) * skinWidth;
                reel.style.transform = `translateX(${finalOffset}px)`;
                spinning = false;
                cancelAnimationFrame(frame);
                return;
            }

            frame = requestAnimationFrame(animate);
        }

        frame = requestAnimationFrame(animate);
    }

    spinButton.addEventListener("click", startSpinning);
});
