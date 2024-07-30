document.addEventListener('DOMContentLoaded', () => {
    const leadId = localStorage.getItem('leadId');
    const clientId = localStorage.getItem('clientId');
    if (leadId) {
        fetchVisitorDetails(leadId);
    } else {
        console.error('Lead ID not found in local storage.');
    }

    if (clientId) {
        fetchClientData(clientId);
    } else {
        console.error('Client ID not found in local storage.');
    }
});
async function fetchVisitorDetails(leadId) {
    const token = localStorage.getItem('adminToken');
    try {
        const response = await fetch(`/api/visitors/${leadId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const visitor = await response.json();
            console.log('Visitor details fetched:', visitor);
            displayVisitorDetails(visitor);
        } else {
            console.error('Error fetching visitor details:', await response.text());
        }
    } catch (error) {
        console.error('Error fetching visitor details:', error);
    }
}

function displayVisitorDetails(visitor) {
    console.log('Displaying visitor details:', visitor);
    const visitorDetails = document.querySelector('.container2');
    if (visitorDetails) {
        const faceImageUrl = visitor.faceImage ? `/images/${visitor.faceImage}` : 'https://via.placeholder.com/80';
        visitorDetails.innerHTML = `
            <div class="rounded-card">
                <div class="flex items-center">
                    <img src="${faceImageUrl}" alt="Profile" class="profile-img">
                    <div>
                        <p class="text-lg font-bold">Name: ${visitor.name}</p>
                        <p class="text-sm">Company: ${visitor.companyName}</p>
                        <p class="text-sm">Domain: ${visitor.domain}</p>
                        <p class="text-sm">Email: ${visitor.email}</p>
                        <p class="text-sm">Phone no.: ${visitor.phone}</p>
                    </div>
                </div>
            </div>
        `;
    } else {
        console.error('Element for visitor details not found.');
    }
}

async function fetchClientData(clientId) {
    const token = localStorage.getItem('adminToken');
    try {
        const response = await fetch(`/api/customer/clients/${clientId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const client = await response.json();
            displayClientData(client);
        } else {
            console.error('Error fetching client data:', await response.text());
        }
    } catch (error) {
        console.error('Error fetching client data:', error);
    }
}

function renderField(key, value) {
    return `<div class="mb-2">
        <label class="block text-sm font-medium mb-1">${key}</label>
        <input type="text" class="w-full p-2 custom-input rounded" value="${value}" readonly>
    </div>`;
}

function renderSection(title, data) {
    let html = `<div class="section-container">
        <h2 class="section-title">${title}</h2>`;
    
    if (title === 'project') {
        const { titles, descriptions } = data;
        if (Array.isArray(titles) && Array.isArray(descriptions)) {
            for (let i = 0; i < titles.length; i++) {
                html += `<div class="field-container">
                    <span class="field-label">title:</span>
                    <span class="field-value">${titles[i]}</span>
                </div>`;
                html += `<div class="field-container">
                    <span class="field-label">description:</span>
                    <span class="field-value">${descriptions[i]}</span>
                </div>`;
            }
        }

    } else {
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                html += renderSection(key, value);
            } else if (Array.isArray(value)) {
                if (title === 'project' && (key === 'titles' || key === 'descriptions')) {
                    continue; // Skip rendering here, handled above
                }
                html += `<div class="field-container">
                    <span class="field-label">${key}:</span>
                    <span class="field-value">${value.join(', ')}</span>
                </div>`;
            } else if (key.endsWith('OthersDescription')) {
                html += `<div class="field-container">
                    <span class="field-label">${key.replace('OthersDescription', ' (Other Description)')}:</span>
                    <span class="other-description">${value}</span>
                </div>`;
            } else {
                html += renderField(key, value);
            }
        }
    }

    html += '</div>';
    return html;
}

function displayClientData(clientData) {
    const container = document.getElementById('clientData');
    container.innerHTML = '';  // Clear existing content

    // Define the sections to be displayed
    const sectionsToDisplay = [
        'customer', 
        'serviceProvider', 
        'channelPartner', 
        'investor', 
        'manufacturer', 
        'domainExpert'
    ];

    // Display only the specified sections
    for (const section of sectionsToDisplay) {
        if (clientData[section]) {
            container.innerHTML += renderSection(section, clientData[section]);
        }
    }
}
