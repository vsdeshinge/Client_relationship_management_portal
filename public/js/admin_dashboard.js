import { API_BASE_URL } from './apiconfig.js';

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('adminToken');
    const adminId = localStorage.getItem('adminId');

    if (!token || !adminId) {
        window.location.href = 'index.html';
        return;
    }

    const handleUnauthorized = () => {
        alert('Login session expired, please login again');
        logout();
    };

    const fetchAdminDetails = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/${adminId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const adminData = await response.json();
                console.log('Admin Data:', adminData);
                if (adminData && adminData.username) {
                    document.querySelector('.welcome-card h2').textContent = `Welcome ${adminData.username},`;
                } else {
                    console.error('Admin username is undefined or null');
                    document.querySelector('.welcome-card h2').textContent = 'Welcome,';
                }
                document.querySelector('.welcome-card p').textContent = 'Welcome to the admin panel';
            } else if (response.status === 401) {
                handleUnauthorized();
            } else {
                const errorData = await response.json();
                console.error('Error fetching admin details:', errorData.error);
            }
        } catch (error) {
            console.error('Error fetching admin details:', error);
        }
    };

    const fetchVisitorDetails = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/visitor-details`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const visitorDetails = await response.json();
                console.log('Visitor Details:', visitorDetails);
                renderVisitorDetails(visitorDetails);
            } else {
                console.error('Error fetching visitor details');
            }
        } catch (error) {
            console.error('Error fetching visitor details:', error);
        }
    };

    const renderVisitorDetails = (visitorDetails) => {
        const visitorTable = document.getElementById('clientTable');
        if (visitorTable) {
            visitorTable.innerHTML = ''; // Clear existing rows
            visitorDetails.forEach(visitor => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${visitor.name}</td>
                    <td>${visitor.companyName || 'N/A'}</td>
                    <td>${visitor.phone}</td>
                    <td>${visitor.email}</td>
                    <td>
                        <select class="status-select" data-visitor-id="${visitor._id}">
                            <option value="qualified" ${visitor.status === 'qualified' ? 'selected' : ''}>Qualified</option>
                            <option value="on-hold" ${visitor.status === 'on-hold' ? 'selected' : ''}>On Hold</option>
                            <option value="not-relevant" ${visitor.status === 'not-relevant' ? 'selected' : ''}>Not Relevant</option>
                        </select>
                    </td>
                    <td><button class="save-button" data-visitor-id="${visitor._id}">Save</button></td>
                `;
                visitorTable.appendChild(row);
            });
    
            // Add event listeners to save buttons
            document.querySelectorAll('.save-button').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const visitorId = event.target.dataset.visitorId;
                    const selectElement = document.querySelector(`.status-select[data-visitor-id="${visitorId}"]`);
                    const newStatus = selectElement.value;
                    try {
                        const response = await fetch(`${API_BASE_URL}/visitors/${visitorId}/status`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ status: newStatus })
                        });
                        if (response.ok) {
                            alert('Status updated successfully');
                        } else {
                            console.error('Error updating status');
                        }
                    } catch (error) {
                        console.error('Error updating status:', error);
                    }
                });
            });
        } else {
            console.error('Element with ID "clientTable" not found.');
        }
    };

    const fetchClientCount = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/clients-count`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const countData = await response.json();
            if (response.ok) {
                document.getElementById('walkInClients').textContent = countData.clientsCount;
            } else {
                console.error('Error fetching client count:', countData.error);
            }
        } catch (error) {
            console.error('Error fetching client count:', error);
        }
    };

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            const query = event.target.value.toLowerCase();
            const rows = document.querySelectorAll('#clientTable tr');
            rows.forEach(row => {
                const name = row.querySelector('td:first-child').textContent.toLowerCase();
                if (name.includes(query)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    } else {
        console.error('Element with ID "searchInput" not found.');
    }

    await fetchAdminDetails();
    await fetchVisitorDetails();
    await fetchClientCount();
    updateMetrics()
    initializeNavigation();

    document.getElementById('logoutButton').style.display = 'block';
   

    document.querySelectorAll('.nav-item').forEach(navItem => {
        navItem.addEventListener('click', (event) => {
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            navItem.classList.add('active');

            const section = navItem.dataset.section;
            document.querySelectorAll('.content').forEach(content => content.style.display = 'none');
            document.getElementById(section).style.display = 'block';

            if (section === 'visitors') {
                fetchVisitorDetails();
            } else if (section === 'qualified-lead' || section === 'on-hold' || section === 'not-relevant') {
                updateClientTable(section);
            }
        });
    });
});

function logout() {
    localStorage.removeItem('adminToken');
    alert('You have been logged out.');
    window.location.href = 'index.html';
}

function fetchStatusOptions() {
    return [
        { value: 'qualified', label: 'Qualified', color: '#4CAF50' },
        { value: 'on-hold', label: 'On Hold', color: '#FFC107' },
        { value: 'not-relevant', label: 'Not Relevant', color: '#F44336' }
    ];
}
function createStatusDropdown(options, currentStatus, clientId) {
    let html = `<select class="status-dropdown" data-client-id="${clientId}" onchange="updateStatus(this)">`;
    options.forEach(option => {
        html += `<option value="${option.value}" ${currentStatus === option.value ? 'selected' : ''} 
                 style="background-color: ${option.color};">
                 ${option.label}</option>`;
    });
    html += '</select>';
    return html;
}



async function updateClientTable(status = null) {
    console.log('updateClientTable called with status:', status);
    
    const tableBody = document.querySelector("#clientTable");
    if (!tableBody) {
        console.error('Table body element not found.');
        return;
    }

    try {
        // Clear existing rows
        tableBody.innerHTML = "";

        let url = `${API_BASE_URL}/api/clients`;
        if (status) {
            // Map the client-side status to the MongoDB status value
            const statusMapping = {
                'qualified': 'qualified',
                'on-hold': 'on-hold',
                'not-now': 'not-relevant'
            };
            url += `?status=${statusMapping[status]}`;
        }
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const clientData = await response.json();
        console.log('Fetched client data:', clientData);

        clientData.forEach(client => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${client.name}</td>
                <td>${client.companyName || 'N/A'}</td>
                <td>${client.phone}</td>
                <td>${client.email}</td>
                <td>${createStatusDropdown(fetchStatusOptions(), client.status, client._id)}</td>
            `;
            if (status === 'on-hold') {
                row.innerHTML += `<td><button class="save-button" data-client-id="${client._id}">Save</button></td>`;
            } else if (status === 'qualified') {
                row.innerHTML += `<td><button class="add-fields-button" data-client-id="${client._id}">Add Fields</button></td>`;
            }
            tableBody.appendChild(row);
        });

        document.querySelectorAll('.save-button').forEach(button => {
            button.addEventListener('click', async (event) => {
                const clientId = event.target.dataset.clientId;
                const selectElement = document.querySelector(`.status-dropdown[data-client-id="${clientId}"]`);
                if (!selectElement) {
                    console.error('Dropdown element not found for client ID:', clientId);
                    return;
                }
                const newStatus = selectElement.value;
                try {
                    const response = await fetch(`${API_BASE_URL}/visitors/${clientId}/status`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                        },
                        body: JSON.stringify({ status: newStatus })
                    });
                    if (response.ok) {
                        alert('Status updated successfully');
                    } else {
                        console.error('Error updating status');
                        console.log(await response.json());
                    }
                } catch (error) {
                    console.error('Error updating status:', error);
                }
            });
        });
// Add event listeners to "Add Fields" buttons
document.querySelectorAll('.add-fields-button').forEach(button => {
    button.addEventListener('click', (event) => {
        const clientId = event.target.dataset.clientId;
        localStorage.setItem('currentClientId', clientId);
        window.location.href = 'profile_data_entry.html';
    });
});
        updateMetrics(); // Update metrics after updating table
    } catch (error) {
        console.error('Error fetching client data:', error);
    }
}

function updateStatus(select) {
    const newStatus = select.value;
    const statusOptions = fetchStatusOptions();
    const selectedOption = statusOptions.find(option => option.value === newStatus);
    
    if (selectedOption) {
        select.style.backgroundColor = selectedOption.color;
    }
    
    console.log(`Status updated to: ${newStatus}`);
    // Optionally, update server with new status
}
async function updateMetrics() {
    console.log('Updating metrics...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/status-counts`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const counts = await response.json();
        console.log('Fetched counts:', counts);

        document.getElementById('accepted-leads').textContent = counts.qualified;
        document.getElementById('deferred-leads').textContent = counts.onHold;
        document.getElementById('not-now-leads').textContent = counts.notRelevant;
        console.log('Metrics updated:', counts);
    } catch (error) {
        console.error('Error updating metrics:', error);
    }
}

function initializeNavigation() {
    console.log('Initializing navigation...');
    const navItems = document.querySelectorAll('nav > ul > li');
    const qualifiedLeadItem = document.querySelector('nav ul li[data-section="qualified-lead"]');
    const submenu = qualifiedLeadItem.querySelector('.submenu');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            console.log('Nav item clicked:', this.dataset.section);
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            if (this.dataset.section === 'qualified-lead') {
                submenu.classList.add('show');
            } else {
                submenu.classList.remove('show');
                if (this.dataset.section === 'visitors') {
                    fetchVisitorDetails();
                } else {
                    updateClientTable(this.dataset.section);
                }
            }
        });
    });

    const submenuItems = submenu.querySelectorAll('li');
    submenuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Submenu item clicked:', this.dataset.status);
            submenuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            updateClientTable(this.dataset.status);
        });
    });
}

// vidtor reload

document.getElementById('visitorsTab').addEventListener('click', function() {
    location.reload();
});
