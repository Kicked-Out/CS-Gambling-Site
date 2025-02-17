document.addEventListener("DOMContentLoaded", async function() {
    const itemBlocks = document.getElementsByClassName("item-block");

    const pricePromises = Array.from(itemBlocks).map(async (itemBlock) => {
        const itemName = itemBlock.querySelector(".skin-title");
        const itemWear = itemBlock.querySelector(".skin-wear");
        const itemPrice = itemBlock.querySelector(".skin-price");
        const skinName = `${itemName.textContent} (${itemWear.textContent})`;

        const skin = { name: skinName };
        const price = await getSkinPrice(skin);

        itemPrice.textContent = `${price}$`;
    });
});