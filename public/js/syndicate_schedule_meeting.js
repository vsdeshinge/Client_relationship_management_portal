document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('clientId') || localStorage.getItem('clientId'); // Changed leadId to clientId

    if (clientId) {
        await fetchClientDetails(clientId); // Fetch client details using clientId
        await fetchschedulemeetings(clientId); // Fetch schedulemeetings using clientId
    } else {
        console.error('Client ID not found in URL or local storage.');
    }
});

async function fetchClientDetails(clientId) {
    try {
        const response = await fetch(`/api/syndicateclient/${clientId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('syndicateToken')}` // Use syndicateToken instead of adminToken
            }
        });

        if (response.ok) {
            const client = await response.json();
            displayClientDetails(client);
        } else {
            console.error('Error fetching client details:', await response.text());
        }
    } catch (error) {
        console.error('Error fetching client details:', error);
    }
}

function displayClientDetails(client) {
    const userInfoCard = document.querySelector('.bg-gray-900.p-4.rounded-md.mb-6');
    const profileImage = client.faceImage ? `/images/${client.faceImage}` : 'https://via.placeholder.com/80';

    userInfoCard.innerHTML = `
         <div class="flex items-center">
                <img id="profile-img" src="${profileImage}" alt="Profile" class="profile-img">
                <div>
                    <p class="text-lg font-bold">Name: ${client.name || 'N/A'}</p>
                    <p class="text-sm">Company: ${client.companyName || 'N/A'}</p>
                      <p class="text-sm">Domain: ${client.domain || 'N/A'}</p> 
                    <p class="text-sm">Person To Meet: ${client.personToMeet || 'N/A'}</p>
                    <p class="text-sm">Referred By: ${client.personreferred || 'N/A'}</p>
                    <p class="text-sm">Email: ${client.email || 'N/A'}</p>
                    <p class="text-sm">Phone No.: ${client.phone || 'N/A'}</p>
                </div>
            </div>
    `;
}

// Function to handle form submission for creating a new schedulemeeting
document.getElementById('schedulemeetingForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const clientId = localStorage.getItem('clientId'); // Use clientId instead of leadId
    const heading = document.getElementById('heading').value;
    const summary = document.getElementById('summary').value;
    const dateTime = document.getElementById('dateTime').value;

    try {
        const response = await fetch('/api/schedulemeeting', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ clientId, heading, summary, dateTime }) // Send clientId
        });

        if (!response.ok) {
            throw new Error('Error creating schedulemeeting');
        }

        const result = await response.json();
        alert('schedulemeeting created successfully');
        fetchschedulemeetings(clientId); // Refresh the schedulemeetings after creating one
        resetschedulemeetingForm(); // Reset the form after submission
        closeschedulemeetingModal(); // Close the modal after submission
    } catch (error) {
        console.error('Error submitting schedulemeeting:', error);
    }
});

// Fetch and display all schedulemeetings for the current client
async function fetchschedulemeetings(clientId) {
    try {
        const response = await fetch(`/api/schedulemeeting/${clientId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('syndicateToken')}` // Use syndicateToken instead of adminToken
            }
        });

        if (response.ok) {
            const schedulemeetings = await response.json();
            displayschedulemeetings(schedulemeetings);
        } else {
            console.error('Error fetching schedulemeetings:', await response.text());
        }
    } catch (error) {
        console.error('Error fetching schedulemeetings:', error);
    }
}

// Display schedulemeetings in the table with a "View" button for each
function displayschedulemeetings(schedulemeetings) {
    const schedulemeetingTable = document.getElementById('schedulemeetingTable');
    schedulemeetingTable.innerHTML = ''; // Clear existing rows

    schedulemeetings.forEach((schedulemeeting, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${schedulemeeting.heading}</td>
            <td>${new Date(schedulemeeting.dateTime).toLocaleString()}</td>
            <td><button class="view-button" data-id="${schedulemeeting._id}">View</button></td>
        `;
        schedulemeetingTable.appendChild(row);
    });

    // Add event listeners for the view buttons
    document.querySelectorAll('.view-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const schedulemeetingId = e.target.dataset.id;
            viewschedulemeeting(schedulemeetingId);
        });
    });
}

// Fetch and display details of a specific schedulemeeting when "View" button is clicked
async function viewschedulemeeting(schedulemeetingId) {
    try {
        const response = await fetch(`/api/schedulemeeting/view/${schedulemeetingId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('syndicateToken')}` // Use syndicateToken instead of adminToken
            }
        });

        if (response.ok) {
            const schedulemeeting = await response.json();
            displayschedulemeetingDetails(schedulemeeting); // Call a function to display the schedulemeeting data
        } else {
            console.error('Error fetching schedulemeeting:', await response.text());
        }
    } catch (error) {
        console.error('Error fetching schedulemeeting:', error);
    }
}

// Display schedulemeeting details in a new modal
function displayschedulemeetingDetails(schedulemeeting) {
    const viewschedulemeetingModal = document.createElement('div');
    viewschedulemeetingModal.id = 'viewschedulemeetingModal';
    viewschedulemeetingModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center';
    viewschedulemeetingModal.innerHTML = `
        <div class="bg-gray-900 p-8 rounded-lg">
            <h2 class="text-lg font-bold mb-4">View Minutes of Meeting</h2>
            <p><strong>Heading:</strong> ${schedulemeeting.heading}</p>
            <p><strong>Summary:</strong> ${schedulemeeting.summary}</p>
            <p><strong>Date and Time:</strong> ${new Date(schedulemeeting.dateTime).toLocaleString()}</p>
            <div class="flex justify-end mt-4">
                <button id="closeViewButton" class="bg-blue-500 py-2 px-4 rounded-md">Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(viewschedulemeetingModal);

    // Add event listener to close the modal
    document.getElementById('closeViewButton').addEventListener('click', function () {
        viewschedulemeetingModal.remove();
    });
}

// Show the modal when the "Create a schedulemeeting" button is clicked
document.getElementById('createschedulemeetingButton').addEventListener('click', function () {
    document.getElementById('createschedulemeetingModal').classList.remove('hidden');
});

// Hide the modal when the "Cancel" button is clicked
document.getElementById('cancelButton').addEventListener('click', function () {
    closeschedulemeetingModal();
});

// Function to reset the form after submission
function resetschedulemeetingForm() {
    document.getElementById('heading').value = '';
    document.getElementById('summary').value = '';
    document.getElementById('dateTime').value = '';
}

// Function to close the "Create schedulemeeting" modal
function closeschedulemeetingModal() {
    document.getElementById('createschedulemeetingModal').classList.add('hidden');
}
