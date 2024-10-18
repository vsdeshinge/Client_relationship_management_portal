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

                const result = await response.json(); // Parse JSON response
                console.log("Response from server:", result); // Log the entire response

                if (!response.ok) {
                    alert(result.message); // Show error message if login fails
                    return;
                }

                // Now check if the token exists instead of checking the exact message
                if (result.token) {
                    alert(result.message); // Show success message

                    localStorage.setItem('syndicateToken', result.token); // Store token in localStorage
                    localStorage.setItem('userType', 'syndicate'); // Optionally store the user type

                    window.location.href = '/syndicate-dashboard.html'; // Redirect to the dashboard
                } else {
                    alert('Login failed. Please check your credentials.'); // Fallback if token is missing
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
