const skins = document.getElementsByClassName("skin");

const url = 'https://bymykel.github.io/CSGO-API/api/en/skins.json';
const url_uk = 'https://bymykel.github.io/CSGO-API/api/uk/skins.json';

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

async function pushAllSkins() {
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

async function pushAllSkinUkNames() {
    const response = await fetch(url_uk);
    const json = await response.json();

    for (const key in json) {
        pushSkinUkName(key, json[key]);
    }
}

async function initialize() {
    await pushAllSkins();
    await pushAllSkinUkNames();
}

async function getSkinPrice(skin) {
    const priceUrl = `/api/get-skin-info/`;
    let body = {
        "skin_name": skin.name
    }

    let randomWear = undefined;

    if (
        !skin.name.includes("Factory New") &&
        !skin.name.includes("Minimal Wear") &&
        !skin.name.includes("Field-Tested") &&
        !skin.name.includes("Well-Worn") &&
        !skin.name.includes("Battle-Scarred")
    ) {
        if (skin.wear_rating === undefined) {
            const wearRatings = ["Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle-Scarred"];
            const randomIndex = Math.floor(Math.random() * wearRatings.length);
            randomWear = wearRatings[randomIndex];

            body.skin_name = `${skin.name} (${randomWear})`;
        } else {
            body.skin_name = `${skin.name} (${skin.wear_rating})`;
        }

    }

    try {
        const response =
            await fetch(
                priceUrl,
                {
                    "method": "POST",
                    "body": JSON.stringify(body)
                }
            )
                // .catch(error => console.error('Request failed', error));

        const result = await response.json();

        if (result.length > 0) {
            const data = result[0];
            skin.price = data.suggested_price / 1000;
            if (randomWear !== undefined) {
                skin.wearRating = randomWear;
            }
            return data.suggested_price / 1000;
        } else {
            console.error("The API cannot find skin:", skin.name);
            return 0;
        }
    } catch (error) {
        console.error("[Error] Cannot to get skin price:", error);
        return 0;
    }
}

async function getSkinByName(targetSkinName) {
    if (skinArr.length === 0) {
        await initialize();
    }

    if (targetSkinName.length === 0) {
        return "";
    }

    for (let index in skinArr) {
        const sourceSkinName = skinArr[index].name;

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


    return "Cannot find element!!!";
}

async function loadSkins() {
    await initialize();

    const skinElements = document.getElementsByClassName("skin");

    for (let index = 0; index < skinElements.length; index++) {
        const skinImg = skinElements[index].querySelector(".skin-img");
        const currentUrl = location.href;

        if (skinImg.src && skinImg.src.trim() !== "" && skinImg.src !== currentUrl) {
            console.log(skinImg);
            continue;
        }


        const skinGradient = skinElements[index].querySelector(".gradient");
        const skin = await getSkinByName(skinImg.alt);

        if (skinGradient) {
            skinGradient.style.backgroundImage = `linear-gradient(180deg, transparent 0, ${skin.rarityColor} 200%)`;
        }

        if (skin) {
            skinImg.src = skin.image;
        }

    }
}

document.addEventListener("DOMContentLoaded", async function() {
    await loadSkins();
});

