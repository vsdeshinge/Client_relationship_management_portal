document.getElementById('adminForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('admin_username').value;
    const password = document.getElementById('admin_password').value;

    console.log(`Attempting login with username: ${username}`);
    try {
        const response = await fetch('https://client-relationship-management-portal.onrender.com/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(`HTTP error! Status: ${response.status} - ${result.error}`);
        }

        const data = await response.json();
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('userType', 'admin');
        localStorage.setItem('adminId', data.adminId); 
        console.log('Admin ID set in localStorage:', data.adminId);
        window.location.href = 'welcome.html';
    } catch (error) {
        console.error('Error during login:', error);
        alert('Invalid username or password. Please try again.');
    }
});
