document.addEventListener('DOMContentLoaded', () => {
    const clientId = localStorage.getItem('clientId'); // Get clientId from localStorage for syndicate module
    const syndicateToken = localStorage.getItem('syndicateToken'); // Get syndicateToken from localStorage

    if (clientId && syndicateToken) {
        fetchSyndicateClientDetails(clientId, syndicateToken); // Fetch client details for displayClientDetails
        fetchSyndicateClientData(clientId, syndicateToken); // Fetch client data for displayClientData
    } else {
        console.error('Client ID or syndicate token not found in local storage.');
    }
});

// Fetch client details (for profile display) for syndicate module
async function fetchSyndicateClientDetails(clientId, token) {
    try {
        const response = await fetch(`/api/syndicateclient/${clientId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Pass syndicateToken for authorization
            }
        });

        if (response.ok) {
            const client = await response.json();
            console.log('Client details fetched:', client);
            displayClientDetails(client);
        } else {
            console.error('Error fetching client details:', await response.text());
        }
    } catch (error) {
        console.error('Error fetching client details:', error);
    }
}

// Display client profile details in the syndicate module
function displayClientDetails(client) {
    console.log('Displaying client details:', client);
    const clientDetails = document.querySelector('.container2');
    if (clientDetails) {
        const faceImageUrl = client.faceImage ? `/images/${client.faceImage}` : 'https://via.placeholder.com/80';
        clientDetails.innerHTML = `
            <div class="rounded-card">
                <div class="flex items-center">
                    <img src="${faceImageUrl}" alt="Profile" class="profile-img">
                    <div>
                        <p class="text-lg font-bold">Name: ${client.name}</p>
                        <p class="text-sm">Company: ${client.companyName}</p>
                        <p class="text-sm">Domain: ${client.domain || 'N/A'}</p>
                        <p class="text-sm">Email: ${client.email}</p>
                        <p class="text-sm">Phone no.: ${client.phone}</p>
                    </div>
                </div>
            </div>
        `;
    } else {
        console.error('Element for client details not found.');
    }
}

// Fetch all client data for syndicate module (for detailed sections)
async function fetchSyndicateClientData(clientId, token) {
    try {
        const response = await fetch(`/api/customer/clients/${clientId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Pass the syndicate token in the header
            }
        });

        if (response.ok) {
            const clientData = await response.json();
            displaySyndicateClientData(clientData); // Call the function to display the client data
        } else {
            console.error('Error fetching client data:', await response.text());
        }
    } catch (error) {
        console.error('Error fetching client data:', error);
    }
}

// Render individual field in the client data
function renderField(key, value) {
    return `<div class="field-container">
        <span class="field-label"><strong>${key}:</strong></span>
        <div class="field-value-container">
            <textarea class="field-value" readonly>${value}</textarea>
        </div>
    </div>`;
}

// Render sections such as customer, service, etc.
function renderSection(title, data) {
    let html = `<div class="section-container">
        <h2 class="section-title"><strong>${title.toUpperCase()}</strong></h2>`;

    if (title === 'project') {
        const { titles, descriptions } = data;
        if (Array.isArray(titles) && Array.isArray(descriptions)) {
            for (let i = 0; i < titles.length; i++) {
                html += `<div class="field-container">
                    <span class="field-label"><strong>Title:</strong></span>
                    <div class="field-value-container">
                        <textarea class="field-value" readonly>${titles[i]}</textarea>
                    </div>
                </div>`;
                html += `<div class="field-container">
                    <span class="field-label"><strong>Description:</strong></span>
                    <div class="field-value-container">
                        <textarea class="field-value" readonly>${descriptions[i]}</textarea>
                    </div>
                </div>`;
            }
        }
    } else {
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                html += renderSection(key, value); // Recursively render nested objects
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
                html += renderField(key, value); // Render simple fields
            }
        }
    }

    html += '</div>';
    return html;
}

// Display the fetched client data in sections
function displaySyndicateClientData(clientData) {
    const container = document.getElementById('clientData');
    container.innerHTML = '';  // Clear existing content

    // Define the sections relevant to the syndicate module
    const sectionsToDisplay = [
        'customer',  
        'serviceProvider',  
        'project',  
        'domainExpert', 
        'manufacturer',  
        'investor',  
        'channelPartner' 
    ];

    // Display only the specified sections
    for (const section of sectionsToDisplay) {
        if (clientData[section]) {
            container.innerHTML += renderSection(section, clientData[section]);
        }
    }
}