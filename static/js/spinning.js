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
            <div class="card-body">
                <h5 class="card-title hidden">${skinData.name}</h5>
                <p class="skin-odds text-secondary">${skinData.odds}%</p>
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

        fetch('/accounts/cases_opened/')
            .then(response => response.json())
        

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
