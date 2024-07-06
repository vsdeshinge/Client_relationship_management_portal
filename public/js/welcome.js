document.addEventListener('DOMContentLoaded', () => {
    const userType = localStorage.getItem('userType');
    console.log('User Type:', userType);

    document.getElementById('crm').addEventListener('click', function() {
        if (userType === 'admin') {
            window.location.href = 'admin_dashboard.html';
        } else if (userType === 'syndicate') {
            window.location.href = 'syndicate-dashboard.html';
        } else {
            alert('Unknown user type!');
        }
    });

    document.getElementById('hr').addEventListener('click', function() {
        alert('HR button clicked!');
    });

    document.getElementById('pms').addEventListener('click', function() {
        alert('PMS button clicked!');
    });
});
