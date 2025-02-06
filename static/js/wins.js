const url = 'https://bymykel.github.io/CSGO-API/api/en/skins.json';
const skinsCount = 12; // Фіксована кількість елементів

async function fetchSkins() {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Помилка при отриманні даних:', error);
        return [];
    }
}

function getRandomSkins(skins, count) {
    let shuffled = skins.sort(() => 0.5 - Math.random()); // Перемішуємо масив
    return shuffled.slice(0, count); // Беремо потрібну кількість випадкових елементів
}

function createSkinElement(skin) {
    const skinItem = document.createElement('div');
    skinItem.classList.add('skin-item');

    const skinImage = document.createElement('img');
    skinImage.src = skin.image;
    skinImage.alt = skin.name;

    skinItem.appendChild(skinImage);
    return skinItem;
}

async function startAnimation() {
    const skins = await fetchSkins();
    if (skins.length === 0) return;

    const winsReel = document.querySelector('.wins-reel');
    winsReel.innerHTML = ''; // Очищення перед стартом

    let displayedSkins = getRandomSkins(skins, skinsCount);

    displayedSkins.forEach(skin => {
        winsReel.appendChild(createSkinElement(skin));
    });

    setInterval(() => {
        const newSkin = getRandomSkins(skins, 1)[0]; // Випадковий новий скін

        const firstItem = createSkinElement(newSkin);
        firstItem.style.opacity = '0';
        winsReel.insertBefore(firstItem, winsReel.firstChild);

        setTimeout(() => {
            firstItem.style.opacity = '1';
        }, 100);

        if (winsReel.children.length > skinsCount) {
            winsReel.lastChild.remove();
        }
    }, 2000);
}

// Запуск анімації
startAnimation();
