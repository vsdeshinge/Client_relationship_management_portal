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
                        <p class="text-lg font-bold">Name: ${client.name || 'N/A'}</p>
                        <p class="text-sm">Company: ${client.companyName || 'N/A'}</p>
                        <p class="text-sm">Domain: ${client.domainName || 'N/A'}</p>
                        <p class="text-sm">Person To Meet: ${client.personToMeet || 'N/A'}</p>
                        <p class="text-sm">Referred By: ${client.personReferred || 'N/A'}</p>
                        <p class="text-sm">Email: ${client.email || 'N/A'}</p>
                        <p class="text-sm">Phone No.: ${client.phone || 'N/A'}</p>
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
        if (clientData[section] && Object.keys(clientData[section]).length > 0) {
            container.innerHTML += renderSection(section, clientData[section]);
        }
    }
}

// Render individual field in the client data
function renderField(key, value) {
    if (value && typeof value !== 'object') {
        return `<div class="field-container">
            <span class="field-label"><strong>${camelCaseToReadable(key)}:</strong></span>
            <div class="field-value-container">
                <textarea class="field-value" readonly>${value}</textarea>
            </div>
        </div>`;
    }
    return ''; // Skip empty or null fields
}

// Render sections such as project, service, product, etc.
function renderSection(title, data) {
    let html = `<div class="section-container">
        <h2 class="section-title"><strong>${camelCaseToReadable(title)}</strong></h2>`;

    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            html += renderSection(camelCaseToReadable(key), value); // Recursively render nested objects
        } else if (Array.isArray(value) && value.length > 0) {
            html += `<div class="field-container">
                <span class="field-label"><strong>${camelCaseToReadable(key)}:</strong></span>
                <div class="field-value-container">
                    <textarea class="field-value" readonly>${value.join(', ')}</textarea>
                </div>
            </div>`;
        } else if (value) {
            html += renderField(key, value); // Render simple fields with value
        }
    }

    html += '</div>';
    return html;
}

// Helper function to convert camelCase to human-readable format
function camelCaseToReadable(str) {
    return str
        .replace(/([A-Z])/g, ' $1')  // Insert space before each uppercase letter
        .replace(/^./, function(str) { return str.toUpperCase(); });  // Capitalize first letter
}
