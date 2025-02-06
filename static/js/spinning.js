document.addEventListener("DOMContentLoaded", function () {
    const spinButton = document.getElementById("spin-button");
    const reel = document.querySelector(".slot-reel");
    const skinsContainer = document.getElementById("slot-skins");
    const skins = document.querySelectorAll(".slot-skin");
    const skinWidth = skins[0].offsetWidth + 5; // Including margin between cards
    let position = 0;
    let spinning = false;

    // Збираємо дані про скіни
    const skinsData = Array.from(skins).map(skin => ({
        name: skin.getAttribute("data-name"),
        odds: parseFloat(skin.getAttribute("data-odds"))
    }));

    // Функція для рандомного генерації скінів при завантаженні сторінки
    function shuffleSkins() {
        const skinsArray = Array.from(skinsContainer.children);
        skinsArray.sort(() => Math.random() - 0.5); // Рандомно перемішуємо скіни
        skinsContainer.innerHTML = ''; // Очищуємо контейнер
        skinsArray.forEach(skin => skinsContainer.appendChild(skin)); // Додаємо перемішані скіни
    }

    // Функція для вибору найгіршого скіна (з найвищими odds)
    function getWorstSkin() {
        // Сортуємо скіни за odds (від найбільшого до найменшого)
        const sortedSkins = skinsData.sort((a, b) => b.odds - a.odds);
        // Вибираємо топ-10 найгірших скінів
        const worstSkins = sortedSkins.slice(0, 10);
        // Випадково обираємо один із них
        const randomIndex = Math.floor(Math.random() * worstSkins.length);
        return worstSkins[randomIndex];
    }

    // Функція для клонування скінів
    function cloneSkins() {
        const originalSkins = Array.from(skinsContainer.children);
    
        // Визначаємо, які скіни клонувати частіше (найкращі скіни)
        const sortedSkins = originalSkins.sort((a, b) => {
            const oddsA = parseFloat(a.getAttribute("data-odds"));
            const oddsB = parseFloat(b.getAttribute("data-odds"));
            return oddsA - oddsB; // Сортуємо за зростанням odds (найкращі скіни перші)
        });
    
        // Клонуємо найкращі скіни частіше
        sortedSkins.forEach((skin, index) => {
            const cloneCount = index < 10 ? 1 : 10; // Найкращі 10 скінів клонуємо 3 рази, інші — 1 раз
            for (let i = 0; i < cloneCount; i++) {
                const clone = skin.cloneNode(true);
                skinsContainer.appendChild(clone);
            }
        });
    }

    cloneSkins(); // Дублюємо скіни для безкінечного прокручування
    shuffleSkins(); // Рандомно генеруємо скіни при завантаженні сторінки

    // Функція для визначення кінцевого результату (найгірший скін)
    function determineFinalSkin() {
        const worstSkin = getWorstSkin(); // Отримуємо найгірший скін
        const worstSkinIndex = skinsData.findIndex(skin => skin.name === worstSkin.name); // Знаходимо його позицію в масиві
        const rotations = Math.floor(Math.random() * 10) + 5; // Випадкова кількість обертів (5-14 обертів)
    
        // Розрахунок часу прокручування до найгіршого скіна
        const scrollTime = rotations * 3000; // Кожна обертка триває 3 секунди (3000 мс)
    
        return {
            worstSkinIndex,
            scrollTime
        };
    }

    // Функція для запуску прокручування з урахуванням часу до найгіршого скіна
    function startSpinning() {
        if (spinning) return;
        spinning = true;
    
        const { worstSkinIndex, scrollTime } = determineFinalSkin();
        const speed = 50; // Початкова швидкість
        const slowDownTime = 2000; // Час уповільнення (2 секунди)
        const halfContainerWidth = skinsContainer.scrollWidth / 2;
        let startTime = performance.now();
        let frame;
    
        function animate(currentTime) {
            const elapsedTime = currentTime - startTime;
    
            if (elapsedTime < scrollTime) {
                position -= speed;
                reel.style.transform = `translateX(${position}px)`;
    
                if (Math.abs(position) > halfContainerWidth) {
                    cloneSkins(); // Генеруємо нові скіни, щоб уникнути закінчення
                }
            } else if (elapsedTime < scrollTime + slowDownTime) {
                const progress = (elapsedTime - scrollTime) / slowDownTime;
                position -= speed * (1 - progress);
                reel.style.transform = `translateX(${position}px)`;
            } else {
                // Зупиняємося на найгіршому скіні
                const finalOffset = worstSkinIndex * skinWidth; // Позиція найгіршого скіна
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
