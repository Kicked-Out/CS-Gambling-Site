document.getElementById("amount").addEventListener("input", function (event) {
    validateInput();
});

function validateInput() {
    var amount = document.getElementById("amount");
    amount.value = amount.value.replace(/[^0-9]/g, "");
}

document.getElementById("amount").addEventListener("keydown", function (event) {
    var key = event.key;
    if (
        !/^[0-9]$/.test(key) &&
        event.key !== "Backspace" &&
        event.key !== "Delete" &&
        event.key !== "ArrowLeft" &&
        event.key !== "ArrowRight"
    ) {
        event.preventDefault();
    }
});

function validateForm() {
    var amount = document.getElementById("amount").value;
    if (amount < 0) {
        alert("Amount cannot be negative.");
        return false;
    }
    return true;
}
