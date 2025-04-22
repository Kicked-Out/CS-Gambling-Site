function getChatMessages() {
    friend_uid = new URLSearchParams(window.location.search).get('friend_uid');

    fetch(`/chat/${friend_uid}/`, 
    
    )
    .then(response => response.json())
    .then(data => {
        console.log(data);
        const messages = data.messages;
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const messageElement = document.createElement('div');
            messageElement.classList.add('chat-message');
            messageElement.innerHTML = `
                <div class="chat-message-left">
                    <div class="content">
                        <p>${message.content}</p>
                        <small>${message.timestamp}</small>
                    </div>
                </div>
            `;
            document.getElementById('chat-messages').appendChild(messageElement);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
