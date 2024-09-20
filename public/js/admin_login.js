document.getElementById('adminForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('admin_username').value;
    const password = document.getElementById('admin_password').value;

    console.log(`Attempting login with username: ${username}`);

    try {
        const response = await fetch('/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password }) // Send the form data to the server as JSON
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(`HTTP error! Status: ${response.status} - ${result.error}`);
        }

        const data = await response.json(); // Parse the JSON response

        // Store the JWT token and admin ID in localStorage
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('userType', 'admin'); // Store the user type for role-based checks
        localStorage.setItem('adminId', data.adminId); // Store the admin ID

        console.log('Admin ID set in localStorage:', data.adminId);
        window.location.href = 'welcome.html'; // Redirect to the admin dashboard or welcome page

    } catch (error) {
        console.error('Error during login:', error);
        alert('Invalid username or password. Please try again.');
    }
});
