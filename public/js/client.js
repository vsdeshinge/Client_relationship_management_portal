document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('connectForm');
    const thankYouContainer = document.getElementById('thankYouContainer');
    const overlayContainer = document.querySelector('.overlay-container');
    const phoneInput = document.getElementById('phone');
    const submitButton = form.querySelector('button[type="submit"]');
    const phoneMessage = document.createElement('div');
    phoneMessage.style.color = 'red';
    phoneInput.parentNode.insertBefore(phoneMessage, phoneInput.nextSibling);

    phoneInput.addEventListener('input', function() {
        const phone = phoneInput.value.trim();
        if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
            phoneMessage.textContent = 'Phone number must be exactly 10 digits.';
            submitButton.disabled = true;
        } else {
            phoneMessage.textContent = '';
            submitButton.disabled = false;
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        form.style.display = 'none';
        overlayContainer.style.display = 'none';
        thankYouContainer.style.display = 'block';
    });
});
setTimeout(() => {
    overlayContainer.classList.add('transition-left');
}, 1200);


document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('connectForm');
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = {
                name: document.getElementById('name').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                email: document.getElementById('email').value.trim(),
                companyName: document.getElementById('companyName').value.trim(),
                personToMeet: document.getElementById('personToMeet').value.trim(),
                personReferred: document.getElementById('personReferred').value.trim(),
                syndicate_name: document.getElementById('syndicate_name').value.trim()
            };

            // Validate phone number length
            const phone = formData.phone;
            if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
                alert('Phone number must be exactly 10 digits.');
                return;
            }

            try {
                console.log('Sending request with data:', formData);
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify(formData)
                });
    
                const result = await response.json();
                console.log('Response received:', response);
                console.log('Parsed JSON:', result);
    
                if (response.ok) {
                    document.getElementById('message').textContent = 'Registration successful! Thank you.';
                    setTimeout(() => {
                        location.href = 'client.html';
                    }, 2000);
                } else {
                    document.getElementById('message').textContent = `Error: ${result.error}`;
                }
            } catch (error) {
                console.error('Error during registration:', error);
                document.getElementById('message').textContent = 'Error during registration. Please try again later.';
            }
        });
    }

    // Login form submission handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = {
                phone: document.getElementById('loginPhone').value.trim()
            };

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    localStorage.setItem('accessToken', result.token);
                    localStorage.setItem('userPhone', result.phone);
                    messageDiv.textContent = 'Login successful!';
                    setTimeout(() => {
                        location.href = '/client_dashboard.html';
                    }, 2000);
                } else {
                    messageDiv.textContent = `Error: ${result.message}`;
                }
            } catch (error) {
                console.error('Error during login:', error);
                messageDiv.textContent = 'Error during login. Please try again later.';
            }
        });
    }
});
