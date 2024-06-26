async function fetchPendingApprovals() {
    console.log('Fetching pending approvals...');
    
    const token = localStorage.getItem('adminToken');
    if (!token) {
        console.error('No token found');
        alert('Please login to view pending approvals.');
        window.location.href = 'admin_login.html'; // Redirect to admin login
        return;
    }

    try {
        const response = await fetch('/admin/pending-approvals', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Response status:', response.status);
        const responseData = await response.json();
        console.log('Response data:', responseData);

        if (!response.ok) {
            throw new Error('Failed to fetch pending approvals');
        }

        const pendingApprovalsContainer = document.getElementById('pendingApprovals');
        pendingApprovalsContainer.innerHTML = ''; // Clear previous content

        responseData.forEach(client => {
            const clientDiv = document.createElement('div');
            clientDiv.className = 'client';

            // Initially show only summary, hide details
            clientDiv.innerHTML = `
                <div class="client-summary">
                    <div class="client-name">${client.name}</div>
                    <div class="syndicate-name">Syndicate Name: ${client.syndicate_name}</div>
                    <div class="phone">Phone: ${client.phone}</div>
                    <div class="email">Email: ${client.email}</div>
                    <div class="address">Address: ${client.address}</div>
                    <button class="toggleBtn">Toggle Details</button>
                </div>
                <div class="client-details" style="display: none;">
                    <h3>Market Access</h3>
                    <pre>${JSON.stringify(client.market_access, null, 2)}</pre>
                    <h3>Expert Talent</h3>
                    <pre>${JSON.stringify(client.expert_talent, null, 2)}</pre>
                    <h3>Product Creation</h3>
                    <pre>${JSON.stringify(client.product_creation, null, 2)}</pre>
                    <h3>Manufacturing</h3>
                    <pre>${JSON.stringify(client.manufacturing, null, 2)}</pre>
                    <h3>Funding</h3>
                    <pre>${JSON.stringify(client.funding, null, 2)}</pre>
                    <textarea id="adminComment-${client._id}" class="admin-comment" placeholder="Admin comments..."></textarea>
                    <button class="approveBtn" onclick="confirmApproval('${client._id}')">Approve</button>
                </div>
                <hr>
            `;

            const toggleBtn = clientDiv.querySelector('.toggleBtn');
            toggleBtn.addEventListener('click', () => {
                const detailsDiv = clientDiv.querySelector('.client-details');
                if (detailsDiv.style.display === 'none') {
                    detailsDiv.style.display = 'block';
                    toggleBtn.textContent = 'Hide Details'; // Change button text on show
                } else {
                    detailsDiv.style.display = 'none';
                    toggleBtn.textContent = 'Toggle Details'; // Change button text on hide
                }
            });

            pendingApprovalsContainer.appendChild(clientDiv);
        });

    } catch (error) {
        console.error('Error fetching pending approvals:', error);
        alert('Error fetching pending approvals');
    }
}

// Fetch pending approvals on page load
fetchPendingApprovals();

// Function to confirm approval
async function confirmApproval(clientId) {
    const adminComment = document.getElementById(`adminComment-${clientId}`).value;
    console.log('Confirming approval for client:', clientId);
    console.log('Admin comment:', adminComment);

    const token = localStorage.getItem('adminToken');
    if (!token) {
        console.error('No token found');
        alert('Please login to confirm approval.');
        window.location.href = 'admin_login.html'; // Redirect to admin login
        return;
    }

    try {
        const response = await fetch(`/admin/confirm-approval/${clientId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ adminComment })
        });

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response text:', responseText);

        if (response.ok) {
            alert('Approval confirmed successfully');
            fetchPendingApprovals(); // Refresh pending approvals list
        } else {
            console.error('Failed to confirm approval:', responseText);
            alert('Failed to confirm approval');
        }

    } catch (error) {
        console.error('Error confirming approval:', error);
        alert('Error confirming approval');
    }
}

// Fetch pending approvals on page load
fetchPendingApprovals();


// logout function
function logout() {
    localStorage.removeItem('adminToken');
    alert('You have been logged out.');
    window.location.href = 'admin_login.html';
}

document.getElementById('logoutButton').style.display = 'block';