import { API_BASE_URL } from './apiconfig.js';
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('syndicateToken');
    if (!token) {
        window.location.href = 'syndicate.html';
        return;
    }

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('syndicateToken');
        window.location.href = 'index.html';
    });

    try {
        const response = await fetch(`${API_BASE_URL}/syndicate-data`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (response.ok) {
            const clientsContainer = document.getElementById('syndicateData');
            clientsContainer.innerHTML = '';
            data.forEach(client => {
                const clientDiv = document.createElement('div');
                clientDiv.className = 'client';
                clientDiv.setAttribute('data-id', client._id);

                const clientFieldDataTitles = extractClientFieldDataTitles(client.clientFieldData);

                clientDiv.innerHTML = `
                    <div class="client-summary">
                        <div class="client-name editable">${client.name}</div>
                        <div class="syndicate-name editable">Syndicate Name: ${client.syndicate_name}</div>
                        <div class="phone editable">Phone: ${client.phone}</div>
                        <div class="email editable">Email: ${client.email}</div>
                        <div class="company-name editable">Company Name: ${client.companyName}</div>
                        <div class="client-field-titles">${clientFieldDataTitles}</div>
                        <div class="approval-status">${client.approved ? 'Approved' : 'Pending Approval'}</div>
                        <div class="admin-comments">${client.adminComment || 'No comments'}</div>
                        <button class="editBtn">Edit</button>
                        <button class="more_info" data-email="${client.email}">Add More info</button>
                        <button class="saveBtn" style="display: none;">Save</button>
                        <button class="sendApprovalBtn">Send Approval</button>
                        <button class="backBtn" style="display: none;">Back</button>
                    </div>
                    <div class="client-details" style="display: none;">
                        <h3>Market Access</h3>
                        <pre class="market-access">${JSON.stringify(client.market_access, null, 2)}</pre>
                        <h3>Expert Talent</h3>
                        <pre class="expert-talent">${JSON.stringify(client.expert_talent, null, 2)}</pre>
                        <h3>Product Creation</h3>
                        <pre class="product-creation">${JSON.stringify(client.product_creation, null, 2)}</pre>
                        <h3>Manufacturing</h3>
                        <pre class="manufacturing">${JSON.stringify(client.manufacturing, null, 2)}</pre>
                        <h3>Funding</h3>
                        <pre class="funding">${JSON.stringify(client.funding, null, 2)}</pre>
                    </div>
                `;

                clientDiv.querySelector('.editBtn').addEventListener('click', () => {
                    enableEditing(clientDiv);
                });

                clientDiv.querySelector('.saveBtn').addEventListener('click', async () => {
                    const editedData = gatherEditedData(clientDiv);
                    if (editedData) {
                        const success = await saveEditedData(client._id, editedData);
                        if (success) {
                            alert('Data saved successfully');
                        } else {
                            alert('Failed to save data');
                        }
                    }
                });

                clientDiv.querySelector('.sendApprovalBtn').addEventListener('click', () => {
                    sendApprovalRequest(client._id, 'Approval request sent');
                });

                clientDiv.querySelector('.backBtn').addEventListener('click', () => {
                    disableEditing(clientDiv);
                });

                clientDiv.querySelector('.more_info').addEventListener('click', async () => {
                    const email = client.email;
                    try {
                        const response = await fetch(`${API_BASE_URL}/generate-email-auth-token`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ email })
                        });

                        const result = await response.json();
                        if (response.ok) {
                            localStorage.setItem('emailAuthToken', result.token);
                            window.location.href = `client_field_data.html?email=${email}`;
                        } else {
                            alert('Failed to create email auth token');
                        }
                    } catch (error) {
                        console.error('Error creating email auth token:', error);
                        alert('Error creating email auth token');
                    }
                });

                clientsContainer.appendChild(clientDiv);
            });
        } else {
            console.error('Failed to fetch syndicate data:', data);
            alert('Failed to fetch syndicate data');
        }
    } catch (error) {
        console.error('Error fetching syndicate data:', error);
        alert('Error fetching syndicate data');
    }
});

// Function to extract and format titles from client field data
function extractClientFieldDataTitles(clientFieldData) {
    let titles = '';
    Object.keys(clientFieldData).forEach(option => {
        if (Array.isArray(clientFieldData[option])) {
            clientFieldData[option].forEach(item => {
                if (item.title) {
                    titles += `<div class="client-field-title">${option.toUpperCase()}: ${item.title}</div>`;
                }
            });
        }
    });
    return titles || 'No titles available';
}

function enableEditing(clientDiv) {
    const clientSummary = clientDiv.querySelector('.client-summary');
    const clientDetails = clientDiv.querySelector('.client-details');

    clientSummary.querySelectorAll('.editable').forEach(item => {
        item.contentEditable = true;
        item.style.border = '1px solid #ccc';
        item.style.padding = '5px';
        item.style.backgroundColor = '#fff';
    });

    clientDetails.style.display = 'block';
    clientDetails.querySelectorAll('pre').forEach(item => {
        item.contentEditable = true;
        item.style.border = '1px solid #ccc';
        item.style.padding = '5px';
        item.style.backgroundColor = '#fff';
        item.style.whiteSpace = 'pre-wrap';
    });

    clientSummary.querySelector('.editBtn').style.display = 'none';
    clientSummary.querySelector('.saveBtn').style.display = 'inline';
    clientSummary.querySelector('.backBtn').style.display = 'inline';
}

function disableEditing(clientDiv) {
    const clientSummary = clientDiv.querySelector('.client-summary');
    const clientDetails = clientDiv.querySelector('.client-details');

    clientSummary.querySelectorAll('.editable').forEach(item => {
        item.contentEditable = false;
        item.style.border = 'none';
        item.style.padding = '0';
        item.style.backgroundColor = 'transparent';
    });

    clientDetails.style.display = 'none';
    clientDetails.querySelectorAll('pre').forEach(item => {
        item.contentEditable = false;
        item.style.border = 'none';
        item.style.padding = '0';
        item.style.backgroundColor = 'transparent';
    });

    clientSummary.querySelector('.editBtn').style.display = 'inline';
    clientSummary.querySelector('.saveBtn').style.display = 'none';
    clientSummary.querySelector('.backBtn').style.display = 'none';
}

function gatherEditedData(clientDiv) {
    const clientSummary = clientDiv.querySelector('.client-summary');
    const clientDetails = clientDiv.querySelector('.client-details');

    try {
        const name = clientSummary.querySelector('.client-name')?.textContent.trim() || '';
        const syndicateName = clientSummary.querySelector('.syndicate-name')?.textContent.trim().replace('Syndicate Name: ', '') || '';
        const phone = clientSummary.querySelector('.phone')?.textContent.trim().replace('Phone: ', '') || '';
        const email = clientSummary.querySelector('.email')?.textContent.trim().replace('Email: ', '') || '';
        const companyName = clientSummary.querySelector('.companyName')?.textContent.trim().replace('Company Name: ', '') || '';

        const marketAccess = JSON.parse(clientDetails.querySelector('.market-access')?.textContent.trim() || '{}');
        const expertTalent = JSON.parse(clientDetails.querySelector('.expert-talent')?.textContent.trim() || '{}');
        const productCreation = JSON.parse(clientDetails.querySelector('.product-creation')?.textContent.trim() || '{}');

        let manufacturing = {}; // Initialize manufacturing object

        // Check if manufacturing data exists and parse it
        const manufacturingData = clientDetails.querySelector('.manufacturing');
        if (manufacturingData) {
            manufacturing = JSON.parse(manufacturingData.textContent.trim() || '{}');
            // Ensure office_space is set properly or default to empty string
            manufacturing.office_space = clientDetails.querySelector('.office-space')?.textContent.trim() || '';
        }

        const funding = JSON.parse(clientDetails.querySelector('.funding')?.textContent.trim() || '{}');

        return {
            name,
            syndicate_name: syndicateName,
            phone,
            email,
            address,
            market_access: marketAccess,
            expert_talent: expertTalent,
            product_creation: productCreation,
            manufacturing: manufacturing,
            funding: funding
        };
    } catch (error) {
        console.error('Error gathering edited data:', error);
        alert('Invalid JSON format in editable fields');
        return null;
    }
}

async function saveEditedData(clientId, data) {
    const token = localStorage.getItem('syndicateToken');
    console.log(`Saving data for client ID: ${clientId}`, data); // Log client ID and data
    try {
        const response = await fetch(`${API_BASE_URL}/update-client-data/${clientId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            return true;
        } else {
            const responseData = await response.json(); // Parse response JSON
            console.error('Failed to save data:', responseData);
            return false;
        }
    } catch (error) {
        console.error('Error saving data:', error);
        return false;
    }
}
async function sendApprovalRequest(clientId, adminComments) {
    const token = localStorage.getItem('syndicateToken');
    console.log('Sending approval request for client:', clientId);
    console.log('Admin comments:', adminComments);
    console.log('Token:', token);

    try {
        const response = await fetch(`${API_BASE_URL}/${clientId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ adminComments })
        });

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response text:', responseText);

        if (response.ok) {
            alert('Approval request sent successfully');
            const clientDiv = document.querySelector(`.client[data-id="${clientId}"]`);
            clientDiv.classList.add('approved');
            const approvalStatus = clientDiv.querySelector('.approval-status');
            approvalStatus.textContent = 'Approved';
            approvalStatus.style.backgroundColor = '#4CAF50'; // Update to green
        } else {
            console.error('Failed to send approval request:', responseText);
            alert('Failed to send approval request');
        }
    } catch (error) {
        console.error('Error sending approval request:', error);
        alert('Error sending approval request');
    }
}
