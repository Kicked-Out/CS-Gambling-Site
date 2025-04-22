function showInfo() {
    document.getElementById("short-info").classList.toggle("moved");
    document.getElementById("full-info").classList.toggle("displayed");
}


function validateInput() {
    const inputField = document.getElementById("tradeOfferInput");
    const confirmButton = document.getElementById("confirmButton");
    const regex = /^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=\d+&token=[a-zA-Z0-9-_]+$/;
    
    if (regex.test(inputField.value)) {
        confirmButton.disabled = false;
        confirmButton.style.opacity = "1";
    } else {
        confirmButton.disabled = true;
        confirmButton.style.opacity = "0.5";
    }
}

function saveLink() {
    const notification_yes = document.getElementById("notification-yes");
    notification_yes.classList.add("show");
    setTimeout(() => {
        notification_yes.classList.remove("show");
    }, 2000);
}