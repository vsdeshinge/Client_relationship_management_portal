document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = {
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value.trim(),
            };

            try {
                const response = await fetch('http://localhost:3000/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                const messageDiv = document.getElementById('message');

                if (response.ok) {
                    // Store token and email from the response
                    localStorage.setItem('accessToken', result.token);
                    localStorage.setItem('userEmail', result.email); // Store user's email
                    formData.email = result.email;

                    messageDiv.textContent = 'Login successful!';
                    setTimeout(() => {
                        location.href = '/client_dashboard.html';
                    }, 2000);
                } else {
                    messageDiv.textContent = `Error: ${result.message}`;
                }
            } catch (error) {
                console.error('Error during login:', error);
                const messageDiv = document.getElementById('message');
                messageDiv.textContent = 'Error during login. Please try again later.';
            }
        });
    }
});
