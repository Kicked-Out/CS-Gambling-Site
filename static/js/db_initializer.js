url = 'https://bymykel.github.io/CSGO-API/api/uk/skins.json'

async function fetchApi() {
    const response = await fetch(url);
    const json = await response.json();

    for (const key in json) {
        sendWeaponAndSkinData(json[key])
    }
}

async function sendWeaponAndSkinData(skinData) {
    fetch("https://localhost:8001/cases/add-skin/", {
        method: 'POST',
        body: JSON.stringify({
            skinName: skinData.name,
            weaponName: skinData.weapon.name,
            rarityName: skinData.rarity.name,
            rarityColor: skinData.rarity.color,
            image: skinData.image,
        }),
    });
}

fetchApi();