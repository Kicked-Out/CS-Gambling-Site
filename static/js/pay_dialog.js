var dialog = document.querySelector('#depositDialog');
    document.querySelector('#openDialog').onclick = function() {
        dialog.showModal();
    }
    document.querySelector('#closeDialog').onclick = function() {
        dialog.close();
    }
    
    function selectPayment(method) {
        document.getElementById('selectedPm').innerText = method;
        var priceInput = document.getElementById('priceInput');
        var minPrice = document.getElementById('minPrice');
        if (method === 'Skins' || method === 'SkinPay' || method === 'SkinsBack' || method === 'Skinify') {
            priceInput.style.display = 'none';
            // minPrice.style.display = 'none';
        } else {
            priceInput.style.display = 'block';
            // minPrice.style.display = 'block';
        }

        if (method === 'Tether TRC20' || method === 'Tether ERC20' || method === 'Bitcoin' || method === 'Ethereum' || method === 'Tron') {
            minPrice.textContent = 'Min deposit: 1$';
        } else {
            minPrice.textContent = 'Min deposit: 100₴';
        }
    }