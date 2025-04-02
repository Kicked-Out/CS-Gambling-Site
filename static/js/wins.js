const skinUrl = 'https://bymykel.github.io/CSGO-API/api/en/skins.json';
const skinsCount = 40; // Фіксована кількість елементів

async function fetchSkins() {
    try {
        const response = await fetch(skinUrl);
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
    skinItem.style.backgroundImage = `linear-gradient(to bottom, #121325 0%, ${skin.rarity.color} 300%)`;
    skinItem.style.borderColor = skin.rarity.color;

    // --------- Пропозиція (концепт) нового стилю ---------
    // Список гексів. Є не всі PNG. ПАНЕ DIZI ЗРОБІТЬ ІЩЕ, АЛЕ ВЖЕ НЕ В .ПЕЕСДЕ, а в .ПЕЕНҐЕ)
    // Немає: pink, orange
    const hexagons = {
        'Consumer Grade': '/static/img/grey.png',
        'Industrial': '/static/img/skyblue.png',
        'Mil-Spec Grade': '/static/img/blue.png',
        'Restricted': '/static/img/violet.png',
        'Classified': '/static/img/pink.png',
        'Covert': '/static/img/red.png',
        'Contraband': '/static/img/orange.png',
        'Extraordinary': '/static/img/yellow.png',
    }

    // Беремо зображення за ключем
    const hexagon = hexagons[skin.rarity.name];

    skinItem.style.setProperty('--skin-color', skin.rarity.color);
    // skinItem.style.backgroundImage = `url('${hexagon}')`;
    // -------------------------------------------------------------------------------------------

    const skinImage = document.createElement('img');
    skinImage.classList.add('skin-img');
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