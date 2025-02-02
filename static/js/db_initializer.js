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
        wearRating: undefined,
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
    const wearRatings = ["Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle-Scarred"]
    const randomIndex = Math.floor(Math.random() * (wearRatings.length - 1));
    const randomWear = wearRatings[randomIndex];
    const url = `https://market.csgo.com/api/v2/search-item-by-hash-name?key=${apiKey}&hash_name=${skin.name} (${randomWear})`;
    let data = undefined;

    fetch(url)
        .then(response => response.json().then(data => ({
            data: data,
            status: response.status
        }))
        .then(res => {
            data = res.data.data[0];
            skin.price = data.price / 1000;
            skin.wearRating = randomWear;
    }));
}

function getSkinByName(skinName) {
    for (index in skinArr) {
        if (skinArr[index].name === skinName) {
            getSkinPrice(skinArr[index]);
            console.log(skinArr[index]);
            break;
        }
    }
}

async function initialize() {
    await getAllSkins();
    await getAllSkinUkNames();
    getSkinByName("AK-47 | Nightwish");
}

initialize();