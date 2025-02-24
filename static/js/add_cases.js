document.addEventListener('DOMContentLoaded', async function() {
    await initialize();
    const skinsList = document.getElementById('skins-list');
    for (const index in skinArr) {
        const skinDiv = document.createElement('div');
        skinDiv.classList.add('skin');
        skinDiv.classList.add('skin-item');
        skinDiv.innerHTML = `
            <input type="checkbox" onclick="bufferSkinListCheckboxes('${ skinArr[index].name }')" name="skin" value="${ skinArr[index].name }">
            <img alt="${ skinArr[index].name }" src="${ skinArr[index].image }" class="skin-img">
            <p class="skin-title">${ skinArr[index].name }</p>
        `;
        skinsList.appendChild(skinDiv);
    }
    console.log(skinArr);

    const submenuToggles = document.querySelectorAll('.submenu-toggle');

    submenuToggles.forEach(function(toggle) {
        toggle.addEventListener('click', function(event) {
            event.preventDefault();
            const submenu = this.nextElementSibling;
            if (submenu.style.display === 'block') {
                submenu.style.display = 'none';
            } else {
                submenu.style.display = 'block';
            }
        });
    });
});

function skinFilter(itemName) {
    const skinsList = document.getElementById('skins-list');
    skinsList.innerHTML = '';
    for (const index in skinArr) {
        if(skinArr[index].name.includes(itemName)) {
            const skinDiv = document.createElement('div');
            skinDiv.classList.add('skin');
            skinDiv.classList.add('skin-item');
            skinDiv.innerHTML = `
                <input type="checkbox" onclick="bufferSkinListCheckboxes('${ skinArr[index].name }')" name="skin" value="${ skinArr[index].name }">
                <img alt="${ skinArr[index].name }" src="${ skinArr[index].image }" class="skin-img">
                <p class="skin-title">${ skinArr[index].name }</p>
            `;
            skinsList.appendChild(skinDiv);
        }
    }
    console.log(skinArr);
}

const skinListCheckboxes = [];

function bufferSkinListCheckboxes(itemName) {
    skinListCheckboxes.push(itemName);
}

async function addItem(itemName) {
    const params = new URLSearchParams(window.location.search);
    const inventory = params.get('inventory');
    const caseName = params.get('case_name');

    if(inventory != undefined) {
        const skin = await getSkinByName(itemName)
        const imageUrl = skin.image;

        console.log(`${itemName} - ${skin}`);

        fetch('/admins/add_item_to_inventory_view/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inventory: inventory,
                item_name: itemName,
                image_url: imageUrl,
                price: 0.00
            })
        }).then(response => {
            if(response.status == 200) {
                console.log(`Item ${itemName} added to inventory`);
            } else {
                console.log(`Error adding item ${itemName} to inventory`);
            }
        });
    }
    if(caseName != undefined) {
        fetch('/admins/add_item_to_case_view/' + caseName + '/' + itemName + '/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if(response.status == 200) {
                console.log('Item added to case');
            } else {
                console.log('Error adding item to case');
            }
        });
    }
}

async function addItems(){
    for(const itemName of skinListCheckboxes) {
        await addItem(itemName);
    }
}
