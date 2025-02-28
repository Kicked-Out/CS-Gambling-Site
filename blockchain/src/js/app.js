var App = {
    web3: null,
    web3Provider: null,
    contracts: {},
};

async function initWeb3() {
    // Перевіряємо наявність MetaMask
    if (window.ethereum) {
        App.web3Provider = window.ethereum;
        try {
            await window.ethereum.enable();
        } catch (error) {
            console.error("User denied account access");
            return;
        }
    } else if (window.web3) {
        App.web3Provider = window.web3.currentProvider;
    } else {
        // Якщо немає MetaMask, використовуйте локальний провайдер (переконайтеся, що Ganache запущено)
        App.web3Provider = new Web3.providers.HttpProvider("http://localhost:7545");
    }
    App.web3 = new Web3(App.web3Provider);
    initContract();
}

function initContract() {
    // Завантажуємо artifact контракту з каталогу static
    $.getJSON("/static/BaseWallet.json", function (data) {
        App.contracts.BaseWallet = TruffleContract(data);
        App.contracts.BaseWallet.setProvider(App.web3Provider);
        // Встановлюємо адресу контракту вручну,
        // ЗАМІНІТЬ "0xYourContractAddress" на фактичну адресу задеплоєного контракту.
        App.contracts.BaseWallet.deployed = function () {
            return App.contracts.BaseWallet.at("0x85BacA93A237cb638ee67Ce569EfcecD43f650CC");
        };
    });
}

async function getCurrency() {
    const convertURL = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";
    const request = await fetch(convertURL)
        .then((response) => response.json())
        .then((data) => data.ethereum.usd);

    return request;
}

// https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd
async function convertToUSD(eth) {
    const currency = await getCurrency();

    return eth * currency;
}

async function topUp(sum) {
    const request = await fetch(`/admins/top_up/${sum}`)
        .then((response) => response.json())
        .then((data) => data);

    if (request.status == 200) {
        top_up_visually(sum);
    }
}

function top_up_visually(sum) {
    const wallet = document.getElementById("balance");
    const walletTextLength = wallet.innerText.length;
    const walletBalance = wallet.innerText.substring(0, walletTextLength - 1);

    wallet.innerText = parseFloat(walletBalance) + sum + "$";
}

async function depositCrypto() {
    if (!App.web3) {
        alert("Web3 не ініціалізовано. Переконайтесь, що MetaMask увімкнено.");
        return;
    }
    const selectedMethod = document.getElementById("selectedPm").innerText;
    const depositInput = document.getElementById("priceInput").value;
    if (!depositInput || Number(depositInput) <= 0) {
        alert("Введіть коректну суму депозиту");
        return;
    }
    const amountWei = App.web3.utils.toWei(depositInput, "ether");

    if (selectedMethod === "Ethereum") {
        try {
            // Отримуємо акаунти з MetaMask
            const accounts = await App.web3.eth.getAccounts();
            const account = accounts[0];
            // Переконайтеся, що MetaMask підключений до мережі, де задеплоєно контракт
            const instance = await App.contracts.BaseWallet.deployed();
            // Викликаємо функцію deposit()
            const tx = await instance.deposit({
                from: account,
                value: amountWei,
            });
            alert("Транзакцію виконано успішно! Tx Hash: " + tx.tx);

            const depositInUsd = await convertToUSD(depositInput);
            topUp(depositInUsd);

            console.log("ETH TO USD:", depositInUsd);
        } catch (err) {
            console.error("Помилка транзакції:", err);
            alert("Транзакцію не виконано: " + err.message);
        }
    } else if (selectedMethod === "Tether ERC20") {
        alert("Метод Tether ERC20 наразі не підтримується. Реалізацію додамо пізніше.");
    } else if (selectedMethod === "Bitcoin" || selectedMethod === "TRX" || selectedMethod === "Tether TRC20") {
        alert(
            `Метод ${selectedMethod} не підтримується через обмеження MetaMask. Будь ласка, скористайтеся відповідним гаманцем.`
        );
    } else {
        alert("Обраний метод оплати не підтримується.");
    }
}

$(document).ready(function () {
    // Ініціалізуємо Web3 після завантаження DOM
    initWeb3().then(() => {
        $("#btnDeposit").click(function (e) {
            e.preventDefault();
            depositCrypto();
        });
    });
});
