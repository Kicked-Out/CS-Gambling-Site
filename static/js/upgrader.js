document.addEventListener("DOMContentLoaded", async function() {
    const pages_counter = {
        "inventory": 1,
        "upgrade": 1
    };

    const max_pages = {
        "inventory": 0,
        "upgrade": 0,
    }

    const itemPrices = {
        "inventory": [],
        "upgrade": []
    }

    const totalItemPrices = {
        "inventory": 0,
        "upgrade": 0
    }

    const selected_items = {
        "inventory": [],
        "upgrade": [],
    }

    const MAX_ELEMENTS_PER_PAGE = 16;

    let stopUpdating = false;

    async function updatePrices(items) {
        stopUpdating = false;

        const pricePromises = Array.from(items).map(async (item) => {
            if (stopUpdating) return;

            console.log(stopUpdating);

            item.price = await getSkinPrice(item);
        });

        Promise.all(pricePromises);
    }

    async function updatePricesInElements(elements) {
        stopUpdating = false;

        const pricePromises = Array.from(elements).map(async (element) => {
            if (stopUpdating) return;

            const itemName = element.querySelector(".skin-title");
            const itemWearRarity = element.querySelector(".skin-wear");
            let itemFullName = itemName.innerText;

            if (itemWearRarity.innerText != undefined) {
                itemFullName += ` (${itemWearRarity.innerText})`;
            }

            const priceElement = element.querySelector(".skin-price");

            const item = {
                "name": itemFullName
            }

            priceElement.innerText = `${await getSkinPrice(item)}$`;
        });

        Promise.all(pricePromises);
    }

    async function getPageElements(item_type) {
        let result = [];

        if (pages_counter[item_type] > 0) {
            await fetch(`/upgrade/get-${item_type}-items/${pages_counter[item_type]}`)
                .then(response => response.json())
                .then(data => {
                    result = data;
                });

            if (item_type === "upgrade") {
                await updatePrices(result);
            }
        }

        return result;
    }

    function getFirstPages(item_type) {
        if (max_pages[item_type] > 0) {
            return 1;
        } else {
            return 0;
        }
    }

    async function getMaxPages(item_type) {
        let result = 0;

        await fetch(`/upgrade/get-${item_type}-pages/`)
            .then(response => response.json())
            .then(data => {
                result = data;
            });

        return result;
    }

    function updateChance() {
        let chance = totalItemPrices["inventory"] / totalItemPrices["upgrade"];

        if (chance === Infinity || isNaN(chance)) {
            chance = 0.00;
        }

        if (chance >= 0.75) {
            chance = 0.75;
        }

        chance = chance * 100;
        chance = chance.toFixed(2);

        const chanceTitle = document.getElementById("chance");
        chanceTitle.innerText = chance;

        const chanceTypeTitle = document.getElementById("chance-type");

        if (chance >= 0.00) {
            chanceTypeTitle.innerText = "Risky Chance";
        }else if (chance >= 20) {
            chanceTypeTitle.innerText = "Very Low Chance";
        } else if (chance >= 40) {
            chanceTypeTitle.innerText = "Low Chance";
        } else if (chance >= 50) {
            chanceTypeTitle.innerText = "Moderate Chance";
        } else if (chance >= 55) {
            chanceTypeTitle.innerText = "Above Average Chance";
        } else if (chance >= 60) {
            chanceTypeTitle.innerText = "Good Chance";
        } else if (chance >= 65) {
            chanceTypeTitle.innerText = "High Chance";
        } else if (chance >= 70) {
            chanceTypeTitle.innerText = "Very High Chance";
        } else if (chance === 75) {
            chanceTypeTitle.innerText = "Almost Certain";
        } else {
            chanceTypeTitle.innerText = "Unknown Chance";
        }

        const chanceVisual = document.getElementById("chance-visual");
        chanceVisual.style.strokeDashoffset = 880 - Math.ceil((880 / 100) * chance);
    }

    function updateTotalPrice(item_type) {
        totalItemPrices[item_type] = itemPrices[item_type].reduce((accumulator, currentVal) => {
            return accumulator + Number(currentVal);
        }, 0);

        updateChance();
    }

    function updateSpinBtnState() {
        const upgradeBtn = document.getElementById("upgrade-btn");

        upgradeBtn.disabled = itemPrices["inventory"].length === 0 || itemPrices["upgrade"].length === 0;
    }

    function updateItemsBlockBg(item_type) {
        const itemsBlock = document.getElementById(`selected-${item_type}-items`);

        if (itemPrices[item_type].length !== 0) {
            itemsBlock.style.backgroundImage = null;
        } else {
            itemsBlock.style.backgroundImage = 'url("/static/img/select_item_bg6.png")';
        }
    }

    function removeItem(selectedItemBlock, item_type, item, itemBlock) {
        const nameBlock = selectedItemBlock.querySelector(".selected-skin-title");
        const itemName = nameBlock.innerText;

        itemBlock.classList.remove("added");

        if (itemBlock.addClickListener) {
            itemBlock.addEventListener("click", itemBlock.addClickListener);
            console.log("Listener Added!!!")
        }

        selectedItemBlock.remove();
        const priceIndex = itemPrices[item_type].indexOf(item.price);
        itemPrices[item_type].splice(priceIndex, 1);

        const nameIndex = selected_items[item_type].indexOf(itemName);
        selected_items[item_type].splice(nameIndex, 1);

        updateTotalPrice(item_type);
        updateSpinBtnState();
        updateItemsBlockBg(item_type);
    }

    function addItem(item_type, item, itemBlock) {
        const selectedItemsBlock = document.getElementById(`selected-${item_type}-items`);
        const selectedItem = document.createElement("div");

        itemBlock.classList.add("added");

        if (itemBlock.addClickListener) {
            itemBlock.removeEventListener("click", itemBlock.addClickListener);
        }

        itemBlock.addClickListener = () => addItem(item_type, item, itemBlock);
        itemBlock.removeEventListener("click", itemBlock.addClickListener);

        selectedItem.innerHTML = `
            <img class="selected-skin-img" src="${item.image_url}" alt="${item.name}"/>
            <p class="selected-skin-title">${item.name}</p>
            <p class="selected-skin-price">${item.price}</p>
        `;

        itemPrices[item_type].push(item.price);
        selected_items[item_type].push(item);

        selectedItem.addEventListener("click", () => {removeItem(selectedItem, item_type, item, itemBlock)});

        selectedItemsBlock.append(selectedItem);

        console.log(selected_items[item_type]);

        updateTotalPrice(item_type);
        updateSpinBtnState();
        updateItemsBlockBg(item_type);
    }

    async function fillPageElements(item_type) {
        const items = await getPageElements(item_type);
        const itemsBlock = document.getElementById(`${item_type}-list`);

        for (const item of items) {
            if (item.image_url === "") {
                item.image_url = await getItemImage(item.name);
            }

            const itemBlock = document.createElement("div");
            itemBlock.className = `${item_type}-item item-block skin`;

            itemBlock.innerHTML = `
                <p class="skin-price">${item.price}$</p>
                <img class="skin-img" src="${item.image_url}" alt="${item.name}"/>
                <p class="skin-title">${item.name}</p>
                <p class="skin-wear">${item.wear_rating}</p>
                
                <div class="item-hover">
                    <div class="add-item-btn">
                        <i class="bi bi-plus-lg"></i>
                    </div>
                </div>
            `;

            itemBlock.addClickListener = () => addItem(item_type, item, itemBlock);
            itemBlock.addEventListener("click", itemBlock.addClickListener)

            itemsBlock.append(itemBlock);
        }

        if (item_type === "upgrade") {
            await updatePricesInElements(itemsBlock.children);
        }

    }

    async function getItemImage(item_name) {
        const item = await getSkinByName(item_name);

        return item.image;
    }

    function clearPageElements(item_type) {
        const itemsBlock = document.getElementById(`${item_type}-list`);

        if (itemsBlock) {
            itemsBlock.innerHTML = "";
        }
    }

    async function updatePageElements(item_type) {
        clearPageElements(item_type);
        await fillPageElements(item_type);

        const cur_page = document.getElementById(`${item_type}-cur-page`);
        cur_page.innerText = pages_counter[item_type];
    }

    async function prev_page(item_type) {
        if (pages_counter[item_type] > 1) {
            pages_counter[item_type] -= 1
            stopUpdating = true;

            await updatePageElements(item_type)
        }
    }

    async function next_page(item_type) {
        if (pages_counter[item_type] < max_pages[item_type]) {
            pages_counter[item_type] += 1
            stopUpdating = true;

            await updatePageElements(item_type)
        }
    }

    function checkSpinResult(rotationValue, indicator) {
        const chanceBlock = document.getElementById("chance");
        const chance = Number(chanceBlock.innerText);
        const chanceDegree = (360 / 100) * chance;
        const rotationDegree = rotationValue - ((360 * 4) + 270);

        return rotationDegree >= 0 && rotationDegree <= chanceDegree || rotationDegree === 360;
    }

    function deleteUpgradeBtn() {
        const upgradeBtn = document.getElementById("upgrade-btn");

        upgradeBtn.remove();
    }

    function addUpgradeBtn() {
        const upgradeCol = document.getElementById("upgrade-col");
        let upgradeBtn = document.getElementById("upgrade-btn");

        if (!upgradeBtn) {
            upgradeBtn = document.createElement("button");
            upgradeBtn.id = "upgrade-btn";
            upgradeBtn.className = "open bloom-button";
            upgradeBtn.disabled = true;
            const upgradeText = document.createElement("p");
            upgradeText.innerText = "Upgrade";

            upgradeBtn.append(upgradeText);

            upgradeBtn.addEventListener("click", () => {startSpin()});

            upgradeCol.append(upgradeBtn);
        }
    }

    function removeGetItemsBtn() {
        const getItemBtn = document.getElementById("get-items-btn");

        getItemBtn.remove();
    }

    async function addItemToInventory(item) {
        await fetch(`/upgrade/success/give_item/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                upgrade_item_id: item.id,
                upgrade_item_price: item.price,
                upgrade_item_image_url: item.image_url
            })
        });
    }

    async function removeItemFromInventory(item) {
        await fetch(`/upgrade/success/remove_item`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inventory_item_id: item.id,
            })
        });
    }

    async function getItems() {
        removeGetItemsBtn();
        addUpgradeBtn();
        clearItems();

        const inventoryItems = selected_items["inventory"];
        const upgradeItems = selected_items["upgrade"];

        console.log(inventoryItems);

        for (const inventoryItem of inventoryItems) {
            await removeItemFromInventory(inventoryItem);
        }

        for (const upgradeItem of upgradeItems) {
            await addItemToInventory(upgradeItem);
        }
    }

    function addGetItemsBtn() {
        const upgradeCol = document.getElementById("upgrade-col");
        let getItemsBtn = document.getElementById("get-items-btn");

        if (!getItemsBtn) {
            getItemsBtn = document.createElement("button");
            getItemsBtn.id = "get-items-btn";
            getItemsBtn.className = "open bloom-button";
            const getItemsText = document.createElement("p");
            getItemsText.innerText = "Get Item";

            getItemsBtn.append(getItemsText);
            getItemsBtn.addEventListener("click", () => {getItems()});
            upgradeCol.append(getItemsBtn);
        }
    }

    function removeTryAgainBtn() {
        const tryAgainBtn = document.getElementById("try-again-btn");

        tryAgainBtn.remove();
    }

    function tryAgainBtnOnClick() {
        removeTryAgainBtn();
        addUpgradeBtn();
        clearItems();
    }

    function addTryAgainBtn() {
        const upgradeCol = document.getElementById("upgrade-col");
        let tryAgainBtn = document.getElementById("try-again-btn");

        if (!tryAgainBtn) {
            tryAgainBtn = document.createElement("button");
            tryAgainBtn.id = "try-again-btn";
            tryAgainBtn.className = "open bloom-button";
            const tryAgainText = document.createElement("p");
            tryAgainText.innerText = "Try Again";

            tryAgainBtn.append(tryAgainText);
            tryAgainBtn.addEventListener("click", () => {tryAgainBtnOnClick()});
            upgradeCol.append(tryAgainBtn);
        }
    }

    function clearItemPrices() {
        itemPrices["inventory"] = [];
        itemPrices["upgrade"] = [];

        totalItemPrices["inventory"] = 0;
        totalItemPrices["upgrade"] = 0;
    }

    function clearItems() {
        const chanceBlock = document.getElementById("chance");
        const chanceTypeBlock = document.getElementById("chance-type");
        const selectedInventoryItems = document.getElementById("selected-inventory-items");
        const selectedUpgradeItems = document.getElementById("selected-upgrade-items");
        const chanceVisual = document.getElementById("chance-visual");
        const indicator = document.getElementById("indicator");

        chanceBlock.innerText = "0.00%";
        chanceBlock.style.color = "white";

        chanceTypeBlock.innerText = "Risky Chance";
        chanceTypeBlock.style.color = "lightgray";

        selectedInventoryItems.innerHTML = "";
        selectedUpgradeItems.innerHTML = "";

        chanceVisual.style.strokeDashoffset = 880;
        chanceVisual.style.stroke = "#5E5DF0";

        indicator.style.animation = "";

        clearItemPrices();
        updateItemsBlockBg("inventory");
        updateItemsBlockBg("upgrade");
        addUpgradeBtn();
    }

    function removeItemsFromInventoryVisually() {
        const inventoryItemContainer = document.getElementById("inventory-list");
        const elementsToRemove = inventoryItemContainer.getElementsByClassName("added");

        for (const elementToRemove of elementsToRemove) {
            elementToRemove.remove();
        }
    }

    function addItemsToInventoryVisually() {
        const inventoryItemContainer = document.getElementById("inventory-list");
        const upgradeItemContainer = document.getElementById("upgrade-list");
        const elementsToAdd = upgradeItemContainer.getElementsByClassName("added");

        for (const elementToAdd of elementsToAdd) {
            if (inventoryItemContainer.childElementCount < MAX_ELEMENTS_PER_PAGE) {
                inventoryItemContainer.append(elementToAdd);
            }
        }
    }

    function unselectItemsFromItemListVisually(item_type) {
        const itemContainer = document.getElementById(`${item_type}-list`);
        const selectedItems = itemContainer.getElementsByClassName("added");

        for (const selectedItem of selectedItems) {
            selectedItem.classList.remove("added");
        }
    }

    function unselectItemsFromItemListsVisually() {
        unselectItemsFromItemListVisually("inventory");
        unselectItemsFromItemListVisually("upgrade");
    }

    function updateInventoryVisually() {
        removeItemsFromInventoryVisually();
        addItemsToInventoryVisually();
        unselectItemsFromItemListsVisually();
    }

    function startSpin() {
        deleteUpgradeBtn();

        const indicator = document.getElementById("indicator");
        const MIN_ROTATION = 1710;
        const MAX_ROTATION = 2070;
        const rotationValue = Math.floor(Math.random() * (MAX_ROTATION - MIN_ROTATION + 1)) + MIN_ROTATION;

        indicator.style.animation = 'none';
        indicator.offsetHeight;

        indicator.style.setProperty('--rotate-end', `${rotationValue}deg`);
        indicator.style.animation = 'rotate 8s cubic-bezier(.46,.94,.38,1) 1 forwards, trace 8s cubic-bezier(1,.4,1,.53) 1 forwards';

        const result = checkSpinResult(rotationValue, indicator);

        indicator.addEventListener("animationend", function() {
            const chanceBlock = document.getElementById("chance");
            const chanceTypeBlock = document.getElementById("chance-type");
            const chanceVisual = document.getElementById("chance-visual");

            if (result) {
                chanceBlock.innerText = "You Won!!!";
                chanceBlock.style.color = "#4FD05E";

                chanceTypeBlock.innerText = "You're Lucky!"
                chanceTypeBlock.style.color = "#4FD05E";

                chanceVisual.style.strokeDashoffset = 0;
                chanceVisual.style.stroke = "#4FD05E";

                addGetItemsBtn();
            } else {
                const firstItem = selected_items["inventory"][0];
                const itemId = Object.values(firstItem)[0];

                const request = fetch(`/upgrade/fail/${itemId}`)
                    .then(response => request.json())
                    .then(data => console.log(data));

                chanceBlock.innerText = "You Lose!!!";
                chanceBlock.style.color = "#E04F5F";

                chanceTypeBlock.innerText = "Better Luck next time!"
                chanceTypeBlock.style.color = "#E04F5F";

                chanceVisual.style.strokeDashoffset = 0;
                chanceVisual.style.stroke = "#E04F5F";

                addTryAgainBtn();
            }

            updateInventoryVisually();
        }, {once: true});

    }

    const inventory_prev_btn = document.getElementById("inventory-prev-btn");
    inventory_prev_btn.addEventListener("click", async () => {await prev_page("inventory")});

    const inventory_next_btn = document.getElementById("inventory-next-btn");
    inventory_next_btn.addEventListener("click", async () => {await next_page("inventory")});


    const upgrade_prev_btn = document.getElementById("upgrade-prev-btn");
    upgrade_prev_btn.addEventListener("click", async () => {await prev_page("upgrade")});

    const upgrade_next_btn = document.getElementById("upgrade-next-btn");
    upgrade_next_btn.addEventListener("click", async () => {await next_page("upgrade")});

    // Виконуємо ініціалізацію
    updateItemsBlockBg("inventory");
    updateItemsBlockBg("upgrade");

    max_pages.inventory = await getMaxPages("inventory");
    max_pages.upgrade = await getMaxPages("upgrade");
    pages_counter.inventory = getFirstPages("inventory");
    pages_counter.upgrade = getFirstPages("upgrade");

    console.log(max_pages);

    await updatePageElements("inventory");
    await updatePageElements("upgrade");

    const upgradeBtn = document.getElementById("upgrade-btn");

    upgradeBtn.addEventListener("click", () => {startSpin()});
    updateSpinBtnState();
});