document.addEventListener("DOMContentLoaded", function() {
    let selectedUserItems = [];
    let selectedTradeItems = [];

    document.querySelectorAll("#user-items .trade-item").forEach(item => {
        item.addEventListener("click", function() {
            this.querySelector("input").checked = !this.querySelector("input").checked;
        });
    });

    document.querySelectorAll("#trade-items .trade-item").forEach(item => {
        item.addEventListener("click", function() {
            this.querySelector("input").checked = !this.querySelector("input").checked;
        });
    });

    document.getElementById("move-to-trade").addEventListener("click", function() {
        const selected = getSelectedItems("#user-items", "user_item");
        moveItems("#user-items", "#user-selected-items", selected);
        selectedUserItems = selectedUserItems.concat(selected);
    });

    document.getElementById("move-to-user").addEventListener("click", function() {
        const selected = getSelectedItems("#trade-items", "trade_item");
        moveItems("#trade-items", "#trade-selected-items", selected);
        selectedTradeItems = selectedTradeItems.concat(selected);
    });

    document.getElementById("confirm-selection").addEventListener("click", function() {
        moveSelectedItems("#user-selected-items", "#trade-items", selectedUserItems);
        moveSelectedItems("#trade-selected-items", "#user-items", selectedTradeItems);
    });

    document.getElementById("confirm-trade").addEventListener("click", function() {
        if (selectedUserItems.length > 0 && selectedTradeItems.length > 0) {
            const form = new FormData();
            form.append('from_items', selectedUserItems.join(","));
            form.append('to_items', selectedTradeItems.join(","));

            fetch("{% url 'exchanger' to_user.id %}", {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCookie("csrftoken")
                },
                body: form
            }).then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Обмін успішно підтверджений обома сторонами.");
                    location.reload();
                } else {
                    console.error("Помилка: " + data.message);
                }
            });
        } else {
            console.error("Виберіть предмети для обміну!");
        }
    });
});

function moveItems(fromSelector, toSelector, items) {
    items.forEach(itemId => {
        const item = document.querySelector(`${fromSelector} .trade-item[data-id='${itemId}']`);
        if (item) {
            const newItem = item.cloneNode(true);
            newItem.querySelector('input').remove();
            document.querySelector(toSelector).appendChild(newItem);
            item.remove();
        }
    });
}

function getSelectedItems(fromSelector, name) {
    const selectedItems = [];
    document.querySelectorAll(`${fromSelector} .trade-item input[name="${name}"]:checked`).forEach(checkbox => {
        selectedItems.push(checkbox.value);
    });
    return selectedItems;
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        let cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
