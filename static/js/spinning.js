// document.addEventListener("DOMContentLoaded", function () {
//     const spinButton = document.getElementById("spin-button");
//     const skinsContainer = document.getElementById("slot-skins");
//     const skins = Array.from(document.querySelectorAll(".slot-skin"));
//     const skinWidth = 150 + 5; // Ширина блока + gap
//     const visibleSkinsCount = 6; // Видимих скінів у слоті
//     let isSpinning = false;

//     // Функція створення нового скіна (HTML-структура)
//     function createSkinElement(skinData) {
//         const skinDiv = document.createElement("div");
//         skinDiv.classList.add("slot-skin", "skin");
//         skinDiv.setAttribute("data-name", skinData.name);
//         skinDiv.setAttribute("data-odds", skinData.odds);

//         skinDiv.innerHTML = `
//             <img src="${skinData.image_url}" alt="${skinData.name}" class="skin-img"/>
//             <div class="card-body">
//                 <h5 class="card-title hidden">${skinData.name}</h5>
//                 <p class="skin-odds text-secondary">${skinData.odds}%</p>
//             </div>
//         `;

//         return skinDiv;
//     }

//     // Отримуємо всі доступні скіни з HTML
//     let allSkins = skins.map(skin => ({
//         name: skin.getAttribute("data-name"),
//         odds: parseFloat(skin.getAttribute("data-odds")),
//         image_url: skin.querySelector("img").getAttribute("src") // Дістаємо URL картинки
//     }));

//     // Встановлюємо ширину контейнера
//     skinsContainer.style.width = `${visibleSkinsCount * skinWidth}px`;
//     skinsContainer.style.overflow = "hidden";
//     skinsContainer.style.position = "relative";

//     // Функція для відображення 6 випадкових скінів у слоті
//     function displayRandomSkins() {
//         const shuffledSkins = [...allSkins].sort(() => Math.random() - 0.5);
//         const randomSkins = shuffledSkins.slice(0, visibleSkinsCount);

//         skinsContainer.innerHTML = '';
//         randomSkins.forEach(skinData => skinsContainer.appendChild(createSkinElement(skinData)));
//     }

//     // Запускаємо початковий рендер слотів
//     displayRandomSkins();

//     // Функція для отримання топ-5 скинів за odds
//     function getTopOddsSkins() {
//         const sortedSkins = [...allSkins].sort((a, b) => b.odds - a.odds); // Сортуємо по odds від найбільшого до найменшого
//         return sortedSkins.slice(0, 3); // Беремо перші 5 скинів
//     }

//     // Функція для запуску анімації крутіння
//     function startSpin() {
//         if (isSpinning) return;
//         isSpinning = true;
//         let position = 0;

//         function animateSpin() {
//             position -= 10;
//             skinsContainer.style.transform = `translateX(${position}px)`;

//             const firstSkin = skinsContainer.firstElementChild;
//             const lastSkin = skinsContainer.lastElementChild;

//             // Додаємо новий блок (скін) при прокручуванні
//             if (Math.abs(position) >= skinWidth * 0.8 && lastSkin.nextElementSibling === null) {
//                 skinsContainer.appendChild(createSkinElement(allSkins[Math.floor(Math.random() * allSkins.length)]));
//             }

//             // Приховуємо лівий скін, коли він наполовину вийшов
//             if (Math.abs(position) >= skinWidth) {
//                 firstSkin.style.opacity = "0.5"; // Робимо напівпрозорим перед видаленням
//             }

//             // Коли скін повністю виходить - видаляємо
//             if (Math.abs(position) >= skinWidth * 1.2) {
//                 firstSkin.remove();
//                 position += skinWidth; // Коригуємо зміщення
//                 skinsContainer.style.transform = `translateX(${position}px)`;
//             }

//             // Продовжуємо анімацію
//             if (isSpinning) {
//                 requestAnimationFrame(animateSpin);
//             }
//         }

//         animateSpin();

//         // Зупиняємо спін через 3 секунди
//         setTimeout(() => {
//             isSpinning = false;
            
//             // Виводимо масив скінів, які зараз в слоті
//             const currentSkins = Array.from(skinsContainer.children).map(skin => skin.getAttribute("data-name"));
//             console.log("Скіни в слоті після спіну:", currentSkins);

//             // Отримуємо топ-5 скинів з найвищими odds
//             const topOddsSkins = getTopOddsSkins();
//             console.log("Топ-5 скинів з найвищими odds:", topOddsSkins);

//             // Вибираємо випадковий скін з топ-5
//             const randomTopSkin = topOddsSkins[Math.floor(Math.random() * topOddsSkins.length)];

//             // Створюємо новий скін для позиції currentSkins[3]
//             const newSkin = createSkinElement(randomTopSkin);

//             // Приховуємо позицію перед тим, як змінити
//             const currentSkin = skinsContainer.children[3];
//             currentSkin.style.opacity = "0"; // Робимо скін невидимим під час заміни

//             // Заміщаємо старий скін новим після анімації
//             setTimeout(() => {
//                 currentSkin.replaceWith(newSkin);
//                 newSkin.style.opacity = "1"; // Встановлюємо нормальну прозорість
//             }, 100); // Час затримки, щоб дочекатися завершення анімації
//         }, 8000);
//     }

//     spinButton.addEventListener("click", startSpin);
// });



document.addEventListener("DOMContentLoaded", function () {
    const spinButton = document.getElementById("spin-button");
    const skinsContainer = document.getElementById("slot-skins");
    const skinWidth = 155; // 150px + 5px gap
    const visibleSkinsCount = 6;
    const totalSkinsInArray = 21;
    let isSpinning = false;
    let skinsArray = [];

    function createSkinElement(skinData) {
        const skinDiv = document.createElement("div");
        skinDiv.classList.add("slot-skin", "skin");
        skinDiv.setAttribute("data-name", skinData.name);
        skinDiv.setAttribute("data-odds", skinData.odds);
        skinDiv.innerHTML = `
            <img src="${skinData.image_url}" alt="${skinData.name}" class="skin-img"/>
                <p class="skin-title hidden">${skinData.name}</p>
            </div>
        `;
        return skinDiv;
    }

    let allSkins = Array.from(document.querySelectorAll(".slot-skin")).map(skin => ({
        name: skin.getAttribute("data-name"),
        odds: parseFloat(skin.getAttribute("data-odds")),
        image_url: skin.querySelector("img").getAttribute("src")
    }));

    function getTopOddsSkins() {
        return [...allSkins].sort((a, b) => b.odds - a.odds).slice(0, 5);
    }

    function generateSkinsArray() {
        let shuffledSkins = [...allSkins].sort(() => Math.random() - 0.5).slice(0, totalSkinsInArray - 1);
        let topOddsSkins = getTopOddsSkins();
        shuffledSkins[totalSkinsInArray - 2] = topOddsSkins[Math.floor(Math.random() * topOddsSkins.length)];
        skinsArray = shuffledSkins;
    }

    function displayInitialSkins() {
        skinsContainer.innerHTML = '';
        skinsArray.slice(0, visibleSkinsCount).forEach(skinData => skinsContainer.appendChild(createSkinElement(skinData)));
    }

    function startSpin() {
        if (isSpinning) return;
        isSpinning = true;
        let position = 0;
        let speed = 20;
        let frameCount = 0;

        function animateSpin() {
            if (frameCount % 2 === 0) { 
                position -= 10;
                skinsContainer.style.transform = `translateX(${position}px)`;
            }

            if (Math.abs(position) >= skinWidth) {
                skinsContainer.firstElementChild.remove();
                position += skinWidth;
                skinsContainer.style.transform = `translateX(${position}px)`;

                let newSkin = createSkinElement(skinsArray.shift());
                skinsContainer.appendChild(newSkin);
            }

            if (frameCount >= 200) { 
                isSpinning = false;
                console.log("Виграшний скін:", skinsArray[3].name);
            } else {
                speed += 0.2;
                frameCount++;
                setTimeout(() => requestAnimationFrame(animateSpin), speed);
            }
        }

        animateSpin();
    }

    generateSkinsArray();
    displayInitialSkins();
    spinButton.addEventListener("click", startSpin);
});