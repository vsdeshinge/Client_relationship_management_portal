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
    return `<div class="field-container">
        <span class="field-label"><strong>${key}:</strong></span>
        <div class="field-value-container">
            <textarea class="field-value" readonly>${value}</textarea>
        </div>
    </div>`;
}

function renderSection(title, data) {
    let html = `<div class="section-container">
        <h2 class="section-title"><strong>${title.toUpperCase()}</strong></h2>`;

    if (title === 'project') {
        const { titles, descriptions } = data;
        if (Array.isArray(titles) && Array.isArray(descriptions)) {
            for (let i = 0; i < titles.length; i++) {
                html += `<div class="field-container">
                    <span class="field-label"><strong>title:</strong></span>
                    <div class="field-value-container">
                        <textarea class="field-value" readonly>${titles[i]}</textarea>
                    </div>
                </div>`;
                html += `<div class="field-container">
                    <span class="field-label"><strong>description:</strong></span>
                    <div class="field-value-container">
                        <textarea class="field-value" readonly>${descriptions[i]}</textarea>
                    </div>
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
                    <span class="field-label"><strong>${key}:</strong></span>
                    <div class="field-value-container">
                        <textarea class="field-value" readonly>${value.join(', ')}</textarea>
                    </div>
                </div>`;
            } else if (key.endsWith('OtherDescription')) {
                html += `<div class="field-container">
                    <span class="field-label"><strong>${key.replace('OtherDescription', ' (Other Description)')}:</strong></span>
                    <div class="field-value-container">
                        <textarea class="field-value" readonly>${value}</textarea>
                    </div>
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
