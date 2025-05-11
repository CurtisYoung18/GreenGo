// Function to setup contact form
document.addEventListener('DOMContentLoaded', function() {
    setupContactForm();

});


// Function to setup contact form
function setupContactForm() {
    const messageForm = document.getElementById('message-form');
    const messagesContainer = document.getElementById('messages');

    // Add event listener to form submission
    if (messageForm && messagesContainer) {
        messageForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (name && email && message) {
                emailjs.send('service_7w3xocd', 'template_n6qvi67', {
                    from_name: name,
                    reply_to: email,
                    message: message
                })
                .then(function(response) {
                    console.log('SUCCESS!', response.status, response.text);
                    alert('Message sent successfully!');
                    addMessage(name, email, message); 
                    messageForm.reset();
                }, function(error) {
                    console.log('FAILED...', error);
                    alert('Failed to send the message. Please try again.');
                });
            } else {
                alert('Please fill in all fields');
            }
        });
    }

    // Function to add a message to the messages container
    function addMessage(name, email, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerHTML = `
            <h3>${name}</h3>
            <p>${message}</p>
            <small>${email}</small>
        `;
        messagesContainer.prepend(messageElement);
    }
}

