document.addEventListener('DOMContentLoaded', function () {
    let selectedItemId = null;
    document.body.addEventListener('click', function (event) {
        if (event.target.classList.contains('withdraw-button')) {
            selectedItemId = event.target.getAttribute('data-item-id');
            const itemName = event.target.getAttribute('data-item-name');
            document.getElementById('modalItemName').textContent = itemName;
            const modal = new bootstrap.Modal(document.getElementById('withdrawModal'));
            modal.show();
        }
    });

    document.getElementById('confirmWithdrawButton').addEventListener('click', function () {
        if (selectedItemId) {
            fetch('/accounts/withdraw/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ item_id: selectedItemId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert('Withdraw request submitted successfully.');
                } else {
                    alert('Error submitting withdraw request: ' + data.message);
                }
                const modal = bootstrap.Modal.getInstance(document.getElementById('withdrawModal'));
                modal.hide();
                selectedItemId = null;
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error submitting withdraw request.');
                const modal = bootstrap.Modal.getInstance(document.getElementById('withdrawModal'));
                modal.hide();
                selectedItemId = null;
            });
        }
    });

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});

