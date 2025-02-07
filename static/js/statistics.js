function updateStats() {
    let players = document.querySelector('.players');
    let online = document.querySelector('.online');
    let casesOpened = document.querySelector('.cases_opened');

    let playersCount = 4000000;
    let onlineCount = Math.floor(Math.random() * (50000 - 10000 + 1)) + 10000;
    let casesOpenedCount = 50000000;

    // Встановлюємо початкові значення
    players.textContent = playersCount.toLocaleString();
    online.textContent = onlineCount.toLocaleString();
    casesOpened.textContent = casesOpenedCount.toLocaleString();

    function updatePlayers() {
        let randomIncrement = Math.floor(Math.random() * 10) + 1;
        playersCount += randomIncrement;
        players.textContent = playersCount.toLocaleString();
    }

    function updateOnline() {
        let randomChange = Math.floor(Math.random() * (100 - 20 + 1)) + 20;
        if (Math.random() > 0.5) {
            onlineCount += randomChange;
        } else {
            onlineCount -= randomChange;
        }
        onlineCount = Math.max(10000, Math.min(50000, onlineCount));
        online.textContent = onlineCount.toLocaleString();
    }

    function updateCasesOpened() {
        let randomIncrement = Math.floor(Math.random() * 11) + 10;
        casesOpenedCount += randomIncrement;
        casesOpened.textContent = casesOpenedCount.toLocaleString();
    }

    setInterval(() => {
        updatePlayers();
        updateOnline();
        updateCasesOpened();
    }, 10000);
}

// Виконати після завантаження сторінки
document.addEventListener("DOMContentLoaded", updateStats);
