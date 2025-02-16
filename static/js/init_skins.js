skins = document.getElementsByClassName("skin");

url = 'https://bymykel.github.io/CSGO-API/api/en/skins.json'
url_uk = 'https://bymykel.github.io/CSGO-API/api/uk/skins.json'

const skinArr = []

function pushSkin(skinData) {
    const skin = {
        name: skinData.name,
        name_uk: "",
        rarityName: skinData.rarity.name,
        rarityColor: skinData.rarity.color,
        image: skinData.image,
        wearRating: "Battle-Scarred",
        price: 0.00
    };

    skinArr.push(skin);
}

async function getAllSkins() {
    const response = await fetch(url);
    const json = await response.json();

    for (const key in json) {
        pushSkin(json[key]);
    }
    return skinArr;
}

function pushSkinUkName(skinIndex, UkSkinData) {
    skinArr[skinIndex].name_uk = UkSkinData.name;
}

async function getAllSkinUkNames() {
    const response = await fetch(url_uk);
    const json = await response.json();

    for (const key in json) {
        pushSkinUkName(key, json[key]);
    }
}

async function getSkinPrice(skin) {
    const apiKey = "4wYD32slQWBHfEphJL2JyqkCL0YX054";
    const wearRatings = ["Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle-Scarred"];
    const randomIndex = Math.floor(Math.random() * wearRatings.length);
    const randomWear = wearRatings[randomIndex];
    const url = `https://market.csgo.com/api/v2/search-item-by-hash-name?key=${apiKey}&hash_name=${skin.name} (${randomWear})`;

    try {
        const response = await fetch(url);
        const result = await response.json();

        if (result.data.length > 0) {
            const data = result.data[0];
            const price = data.price / 1000;
            skin.price = price; 
            skin.wearRating = randomWear;
            return price;
        } else {
            console.error("Скін не знайдено у відповіді API:", skin.name);
            return 0;
        }
    } catch (error) {
        console.error("Помилка при отриманні ціни скіна:", error);
        return 0;
    }
}

async function getSkinByName(targetSkinName) {
    if (skinArr.length === 0) {
        await initialize();
    }

    for (index in skinArr) {
        sourceSkinName = skinArr[index].name;
        if (sourceSkinName.includes(targetSkinName)) {
            return skinArr[index];
        }

        if (targetSkinName.includes("Phase ")) {
            targetSkinNameWithoutPhase = targetSkinName.slice(0, -8);

            if (sourceSkinName.includes(targetSkinNameWithoutPhase)) {
                return skinArr[index];
            }
        }

        if (targetSkinName.includes("Sapphire")) {
            targetSkinNameWithoutPhase = targetSkinName.slice(0, -9);

            if (sourceSkinName.includes(targetSkinNameWithoutPhase)) {
                return skinArr[index];
            }
        }
    }

    console.log(skinArr);

    return "Cannot find element!!!";
}

async function initialize() {
    await getAllSkins();
    await getAllSkinUkNames();
}

async function loadSkins() {
    await initialize();

    const skinElements = document.getElementsByClassName("skin");

    for (let index = 0; index < skinElements.length; index++) {
        const skinImg = skinElements[index].querySelector(".skin-img");
        const skinNameBlock = skinElements[index].querySelector(".skin-title");
        const skinGradient = skinElements[index].querySelector(".gradient");
        const skinName = skinNameBlock.textContent;
        const skin = await getSkinByName(skinImg.alt);

        if (skinGradient) {
            skinGradient.style.backgroundImage = `linear-gradient(180deg, transparent 0, ${skin.rarityColor} 200%)`;
        }

        if (skin) {
            skinImg.src = skin.image;
        }

    }
}

loadSkins();