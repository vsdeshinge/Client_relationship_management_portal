document.addEventListener('DOMContentLoaded', () => {
    const syndicateLoginForm = document.getElementById('syndicateLoginForm');
    
    if (syndicateLoginForm) {
        syndicateLoginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent form from refreshing the page

            const formData = new FormData(syndicateLoginForm);
            const data = Object.fromEntries(formData.entries());

            console.log("Data being sent:", data); // Log data to check if it's correct

            try {
                const response = await fetch(`/syndicate-login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data) // Send the form data to the server as JSON
                });

                if (!response.ok) {
                    const result = await response.json();
                    alert(result.message); // Show error message if login fails
                    return;
                }

                const result = await response.json();
                alert(result.message); // Show success message

                if (result.message === 'Syndicate login successful') {
                    localStorage.setItem('syndicateToken', result.token); // Store token in localStorage
                    localStorage.setItem('userType', 'syndicate'); // Optionally store the user type
                    window.location.href = '/syndicate-dashboard.html'; // Redirect to the dashboard
                }

            } catch (error) {
                console.error('Error logging in:', error);
                alert('Error logging in');
            }
        });
    } else {
        // Check if the user is already logged in
        const token = localStorage.getItem('syndicateToken');
        if (!token) {
            window.location.href = 'index.html'; // If not logged in, redirect to the login page
        }
    }
});
