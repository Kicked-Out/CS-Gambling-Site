document.addEventListener("DOMContentLoaded", function () {
    const spinButton = document.getElementById("spin-button");
    const reel = document.querySelector(".slot-reel");
    const skinsContainer = document.getElementById("slot-skins");
    let skins = Array.from(document.querySelectorAll(".slot-skin"));
    const skinWidth = skins[0].offsetWidth + 5; // Враховуємо відступи
    let position = 0;
    let spinning = false;

    // Отримуємо масив даних про скіни
    const skinsData = skins.map(skin => ({
        element: skin,
        name: skin.getAttribute("data-name"),
        odds: parseFloat(skin.getAttribute("data-odds"))
    }));

    // Функція для вибору випадкового найгіршого скіна (з найбільшими odds)
    function getWorstSkin() {
        const sortedSkins = [...skinsData].sort((a, b) => b.odds - a.odds);
        return sortedSkins[0]; // Найгірший скін (з найбільшим odds)
    }

    // Функція клонування скінів: більше найкращих (з мінімальним odds)
    function cloneSkins() {
        skinsContainer.innerHTML = ''; // Очищаємо перед додаванням нових
        const sortedSkins = [...skinsData].sort((a, b) => a.odds - b.odds); // Найкращі спочатку

        sortedSkins.forEach((skin, index) => {
            const cloneCount = skin.odds < 0.1 ? 6 : skin.odds < 0.5 ? 3 : 1; // Найкращі частіше
            for (let i = 0; i < cloneCount; i++) {
                const clone = skin.element.cloneNode(true);
                skinsContainer.appendChild(clone);
            }
        });

        skins = Array.from(document.querySelectorAll(".slot-skin")); // Оновлюємо список
    }

    // Функція запуску прокручування
    function startSpinning() {
        if (spinning) return;
        spinning = true;

        const worstSkin = getWorstSkin(); // Обираємо найгірший скін
        const worstIndex = skins.findIndex(skin => skin.getAttribute("data-name") === worstSkin.name);
        const totalTime = 3000; // Загальний час обертання (3 секунди)
        const slowDownTime = 2000; // Час уповільнення (2 секунди)
        const finalOffset = worstIndex * skinWidth;
        let startTime = performance.now();
        let frame;

        function animate(currentTime) {
            const elapsedTime = currentTime - startTime;

            if (elapsedTime < totalTime) {
                position -= 50; // Початкова швидкість
            } else if (elapsedTime < totalTime + slowDownTime) {
                const progress = (elapsedTime - totalTime) / slowDownTime;
                position -= 50 * (1 - progress); // Плавне уповільнення
            } else {
                reel.style.transform = `translateX(${-finalOffset}px)`; // Фіксуємо на найгіршому скіні
                spinning = false;
                cancelAnimationFrame(frame);
                return;
            }

            reel.style.transform = `translateX(${position}px)`;
            frame = requestAnimationFrame(animate);
        }

        frame = requestAnimationFrame(animate);
    }

    // Ініціалізація: клонування + стартове перемішування
    cloneSkins();

    spinButton.addEventListener("click", startSpinning);
});
