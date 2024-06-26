document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = {
                name: document.getElementById('name').value.trim(),
                syndicate_name: document.getElementById('syndicate_name').value.trim(),
                address: document.getElementById('address').value.trim(),
                username: document.getElementById('username').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value.trim(),
                personToMeet: document.getElementById('personToMeet').value.trim(),
                personReferred: document.getElementById('personReferred').value.trim(),
            };

            // Validate password length
            if (formData.password.length < 6) {
                alert('Password must be at least 6 characters long.');
                return;
            }

            // Validate phone number length
            if (formData.phone.length !== 10 || !/^\d{10}$/.test(formData.phone)) {
                alert('Phone number must be exactly 10 digits.');
                return;
            }

            try {
                console.log('Sending request with data:', formData);
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                console.log('Response received:', response);
                console.log('Parsed JSON:', result);

                const messageDiv = document.getElementById('message');
                if (response.ok) {
                    messageDiv.textContent = 'Registration successful! Thank you.';
                    setTimeout(() => {
                        location.href = 'client.html';
                    }, 2000);
                } else {
                    messageDiv.textContent = `Error: ${result.error}`;
                }
            } catch (error) {
                console.error('Error during registration:', error);
                const messageDiv = document.getElementById('message');
                messageDiv.textContent = 'Error during registration. Please try again later.';
            }
        });
    }
});
