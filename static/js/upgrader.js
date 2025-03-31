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

    const MIN_INDICATOR_DEGREES = 1710;
    const MAX_INDICATOR_DEGREES = 2070;
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

    function getFirstPage(item_type) {
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

    function removeItemOnClick(selectedItemBlock, item_type, item, itemBlock) {
        const nameBlock = selectedItemBlock.querySelector(".selected-skin-title");
        const itemName = nameBlock.innerText;

        itemBlock.classList.remove("added");

        if (itemBlock.addClickListener) {
            itemBlock.addEventListener("click", itemBlock.addClickListener);
        }

        if (itemBlock.removeClickListener) {
            itemBlock.removeEventListener("click", itemBlock.removeClickListener);
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

    function addItemOnClick(item_type, item, itemBlock) {
        const selectedItemsBlock = document.getElementById(`selected-${item_type}-items`);
        const selectedItem = document.createElement("div");

        itemBlock.classList.add("added");

        if (itemBlock.addClickListener) {
            itemBlock.removeEventListener("click", itemBlock.addClickListener);
        }

        itemBlock.removeClickListener = () => removeItemOnClick(selectedItem, item_type, item, itemBlock);
        itemBlock.addEventListener("click", itemBlock.removeClickListener);

        selectedItem.innerHTML = `
            <img class="selected-skin-img" src="${item.image_url}" alt="${item.name}"/>
            <p class="selected-skin-title">${item.name}</p>
            <p class="selected-skin-price">${item.price}</p>
        `;

        itemPrices[item_type].push(item.price);
        selected_items[item_type].push(item);

        selectedItem.addEventListener("click", () => {removeItemOnClick(selectedItem, item_type, item, itemBlock)});

        selectedItemsBlock.append(selectedItem);

        console.log(selected_items[item_type]);

        updateTotalPrice(item_type);
        updateSpinBtnState();
        updateItemsBlockBg(item_type);
    }

    async function fillPageElement(item_type, item, itemsBlock) {
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

        itemBlock.addClickListener = () => addItemOnClick(item_type, item, itemBlock);
        itemBlock.addEventListener("click", itemBlock.addClickListener)

        itemsBlock.append(itemBlock);
    }

    async function fillPageElements(item_type) {
        const items = await getPageElements(item_type);
        const itemsBlock = document.getElementById(`${item_type}-list`);

        for (const item of items) {
            await fillPageElement(item_type, item, itemsBlock);
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

    function deleteUpgradeBtn() {
        const upgradeBtn = document.getElementById("upgrade-btn");

        upgradeBtn.remove();
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

    async function addItemsToInventory() {
        const upgradeItems = selected_items["upgrade"];

        for (const upgradeItem of upgradeItems) {
            await addItemToInventory(upgradeItem);
        }
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

    async function removeItemsFromInventory() {
        const inventoryItems = selected_items["inventory"];

        for (const inventoryItem of inventoryItems) {
            await removeItemFromInventory(inventoryItem);
        }
    }

    function removeItemsFromInventoryVisually() {
        const inventoryItemContainer = document.getElementById("inventory-list");
        const elementsToRemove = Array.from(inventoryItemContainer.getElementsByClassName("added"));

        for (const elementToRemove of elementsToRemove) {
            elementToRemove.remove();
        }
    }

    function configureIndicator(indicator) {
        const rotationValue = Math.floor(Math.random() * (MAX_INDICATOR_DEGREES - MIN_INDICATOR_DEGREES + 1)) + MIN_INDICATOR_DEGREES;

        indicator.rotationValue = rotationValue;
        indicator.style.setProperty('--rotate-end', `${rotationValue}deg`);
        indicator.style.animation = 'rotate 8s cubic-bezier(.46,.94,.38,1) 1 forwards, trace 8s cubic-bezier(1,.4,1,.53) 1 forwards';
    }

    function checkSpinResult(indicator) {
        const rotationValue = indicator.rotationValue;
        const chanceBlock = document.getElementById("chance");
        const chance = Number(chanceBlock.innerText);
        const chanceDegree = (360 / 100) * chance;
        const rotationDegree = rotationValue - ((360 * 4) + 270);

        return rotationDegree >= 0 && rotationDegree <= chanceDegree || rotationDegree === 360;
    }

    function updateChanceBlock(title, subtitle, color) {
        const chanceBlock = document.getElementById("chance");
        const chanceTypeBlock = document.getElementById("chance-type");
        const chanceVisual = document.getElementById("chance-visual");

        chanceBlock.innerText = title;
        chanceBlock.style.color = color;

        chanceTypeBlock.innerText = subtitle;
        chanceTypeBlock.style.color = color;

        chanceVisual.style.strokeDashoffset = 0;
        chanceVisual.style.stroke = color;
    }

    function createSpinBtn(btn_id, btn_title, onClickFunc) {
        const upgradeCol = document.getElementById("upgrade-col");
        let btn = document.getElementById(btn_id);

        if (!btn) {
            btn = document.createElement("button");
            btn.id = btn_id;
            btn.className = "open bloom-button";

            if (btn_id === "upgrade-btn") {
                btn.disabled = true;
            }

            const btnText = document.createElement("p");
            btnText.innerText = btn_title;

            btn.append(btnText);
            btn.addEventListener("click", () => {onClickFunc()});
            upgradeCol.append(btn);
        }
    }

    function resetIndicatorAnimation() {
        const indicator = document.getElementById("indicator");
        indicator.style.animation = "";
    }

    function resetChanceBlock() {
        const chanceBlock = document.getElementById("chance");
        const chanceTypeBlock = document.getElementById("chance-type");
        const chanceVisual = document.getElementById("chance-visual");

        chanceBlock.innerText = "0.00%";
        chanceBlock.style.color = "white";

        chanceTypeBlock.innerText = "Risky Chance";
        chanceTypeBlock.style.color = "lightgray";

        chanceVisual.style.strokeDashoffset = 880;
        chanceVisual.style.stroke = "#5E5DF0";
    }

    function resetItemLists() {
        const selectedInventoryItems = document.getElementById("selected-inventory-items");
        const selectedUpgradeItems = document.getElementById("selected-upgrade-items");

        selectedInventoryItems.innerHTML = "";
        selectedUpgradeItems.innerHTML = "";
    }

    function resetItemPrices() {
        itemPrices["inventory"] = [];
        itemPrices["upgrade"] = [];

        totalItemPrices["inventory"] = 0;
        totalItemPrices["upgrade"] = 0;
    }

    function resetSpin() {
        resetIndicatorAnimation();
        resetChanceBlock();
        resetItemLists();
        resetItemPrices();
        updateItemsBlockBg("inventory");
        updateItemsBlockBg("upgrade");
        createSpinBtn("upgrade-btn", "Upgrade", startSpin);
    }

    function removeBtn(btn_id) {
        const btn = document.getElementById(btn_id);

        btn.remove();
    }

    function resetResults(remove_btn_id) {
        removeBtn(remove_btn_id);
        createSpinBtn("upgrade-btn", "Upgrade", startSpin);
        resetSpin();
    }

    async function getRewardOnClick() {
        await addItemsToInventory();
        await updatePageElements("inventory")
        updateInventoryVisually();
        resetResults("get-items-btn");
    }

    function tryAgainBtnOnClick() {
        resetResults("try-again-btn");
    }

    function unselectItemsFromItemListVisually(item_type) {
        const itemContainer = document.getElementById(`${item_type}-list`);
        const selectedItems = Array.from(itemContainer.getElementsByClassName("added"));

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
        unselectItemsFromItemListsVisually();
    }

    async function triggerWinEvent() {
        updateChanceBlock("You Won!!!", "You're Lucky", "#4FD05E");
        createSpinBtn("get-items-btn", "Get Reward", getRewardOnClick);
        await removeItemsFromInventory();
    }

    async function triggerLoseEvent() {
        updateChanceBlock("You Lose!!!", "Better Luck next time!", "#E04F5F");
        createSpinBtn("try-again-btn", "Try Again", tryAgainBtnOnClick);
        await removeItemsFromInventory();
        updateInventoryVisually();
    }

    function handleSpinResult(indicator) {
        const result = checkSpinResult(indicator);

        indicator.addEventListener("animationend", async function() {
            if (result) {
                await triggerWinEvent()
            } else {
                await triggerLoseEvent();
            }

        }, {once: true});
    }

    function startSpin() {
        const indicator = document.getElementById("indicator");

        deleteUpgradeBtn();
        configureIndicator(indicator);
        handleSpinResult(indicator);
    }

    function initPrevBtn(item_type) {
        const prev_btn = document.getElementById(`${item_type}-prev-btn`);
        prev_btn.addEventListener("click", async () => {await prev_page(item_type)});
    }

    function initNextBtn(item_type) {
        const next_btn = document.getElementById(`${item_type}-next-btn`);
        next_btn.addEventListener("click", async () => {await next_page(item_type)});
    }

    function initPaginationBtns(item_type) {
        initPrevBtn(item_type);
        initNextBtn(item_type);
    }

    async function initMaxPages(item_type) {
        max_pages[item_type] = await getMaxPages(item_type);
    }

    function updatePageCounter(item_type) {
        pages_counter[item_type] = getFirstPage(item_type);
    }

    function initPagination() {
        initPaginationBtns("inventory");
        initPaginationBtns("upgrade");
    }

    function initItemsBlockBgs() {
        updateItemsBlockBg("inventory");
        updateItemsBlockBg("upgrade");
    }

    async function initAllMaxPages() {
        await initMaxPages("inventory");
        await initMaxPages("upgrade");
    }

    function initPageCounters() {
        updatePageCounter("inventory");
        updatePageCounter("upgrade");
    }

    async function initPageElements() {
        await updatePageElements("inventory");
        await updatePageElements("upgrade");
    }

    // Виконуємо ініціалізацію
    async function init() {
        initPagination();
        initItemsBlockBgs();
        await initAllMaxPages();
        await initPageCounters();
        await initPageElements();

        updateSpinBtnState();

        const upgradeBtn = document.getElementById("upgrade-btn");
        upgradeBtn.addEventListener("click", () => {startSpin()});
    }

    await init();
});