document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const leadId = urlParams.get('leadId') || localStorage.getItem('leadId');

    if (leadId) {
        await fetchLeadDetails(leadId);
        await fetchMoMs(leadId); // Fetch MoMs when the page loads
    } else {
        console.error('Lead ID not found in URL or local storage.');
    }
});

async function fetchLeadDetails(leadId) {
    try {
        const response = await fetch(`/api/visitors/${leadId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        if (response.ok) {
            const lead = await response.json();
            displayLeadDetails(lead);
        } else {
            console.error('Error fetching lead details:', await response.text());
        }
    } catch (error) {
        console.error('Error fetching lead details:', error);
    }
}

function displayLeadDetails(lead) {
    const userInfoCard = document.querySelector('.bg-gray-900.p-4.rounded-md.mb-6');
    const faceImageUrl = lead.faceImage ? `/images/${lead.faceImage}` : 'https://via.placeholder.com/80';

    userInfoCard.innerHTML = `
                        <div class="flex items-center">
                            <img src="${faceImageUrl}" alt="Profile" class="w-16 h-16 rounded-full object-cover" style="width: 64px; height: 64px;">
                            <div class="ml-4">
                                <p>Name: ${client.name}</p>
                                <p>Email: ${client.email}</p>
                                <p>Domain: ${client.domain || 'N/A'}</p>
                                <p>Phone: ${client.phone}</p>
                            </div>
                        </div>

    `;
}

// Function to handle form submission for creating a new MoM
document.getElementById('momForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const leadId = localStorage.getItem('leadId');
    const heading = document.getElementById('heading').value;
    const summary = document.getElementById('summary').value;
    const dateTime = document.getElementById('dateTime').value;

    try {
        const response = await fetch('/api/mom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ clientId: leadId, heading, summary, dateTime })
        });

        if (!response.ok) {
            throw new Error('Error creating MoM');
        }

        const result = await response.json();
        alert('MoM created successfully');
        fetchMoMs(leadId); // Refresh the MoMs after creating one
        resetMoMForm(); // Reset the form after submission
        closeMoMModal(); // Close the modal after submission
    } catch (error) {
        console.error('Error submitting MoM:', error);
    }
});

// Fetch and display all MoMs for the current lead
async function fetchMoMs(leadId) {
    try {
        const response = await fetch(`/api/mom/${leadId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        if (response.ok) {
            const moms = await response.json();
            displayMoMs(moms);
        } else {
            console.error('Error fetching MoMs:', await response.text());
        }
    } catch (error) {
        console.error('Error fetching MoMs:', error);
    }
}

// Display MoMs in the table with a "View" button for each
function displayMoMs(moms) {
    const momTable = document.getElementById('momTable');
    momTable.innerHTML = ''; // Clear existing rows

    moms.forEach((mom, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${mom.heading}</td>
            <td>${new Date(mom.dateTime).toLocaleString()}</td>
            <td><button class="view-button" data-id="${mom._id}">View</button></td>
        `;
        momTable.appendChild(row);
    });

    // Add event listeners for the view buttons
    document.querySelectorAll('.view-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const momId = e.target.dataset.id;
            viewMoM(momId);
        });
    });
}

// Fetch and display details of a specific MoM when "View" button is clicked
async function viewMoM(momId) {
    try {
        const response = await fetch(`/api/mom/view/${momId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        if (response.ok) {
            const mom = await response.json();
            displayMoMDetails(mom); // Call a function to display the MoM data
        } else {
            console.error('Error fetching MoM:', await response.text());
        }
    } catch (error) {
        console.error('Error fetching MoM:', error);
    }
}

// Display MoM details in a new modal
function displayMoMDetails(mom) {
    // Create a separate modal for viewing MoM details
    const viewMoMModal = document.createElement('div');
    viewMoMModal.id = 'viewMoMModal';
    viewMoMModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center';
    viewMoMModal.innerHTML = `
            <div class="bg-gray-900 p-8 rounded-lg" style="width: 100% !important; max-width: px !important;">
                <h2 class="text-lg font-bold mb-4">View Minutes of Meeting</h2>
                <p><strong>Heading:</strong> ${mom.heading}</p>
                <p><strong>Summary:</strong> ${mom.summary}</p>
                <p><strong>Date and Time:</strong> ${new Date(mom.dateTime).toLocaleString()}</p>
                <div class="flex justify-end mt-4">
                    <button id="closeViewButton" class="bg-blue-500 py-2 px-4 rounded-md">Close</button>
                </div>
            </div>


    `;

    document.body.appendChild(viewMoMModal);

    // Add event listener to close the modal
    document.getElementById('closeViewButton').addEventListener('click', function () {
        viewMoMModal.remove();
    });
}

// Show the modal when the "Create a MoM" button is clicked
document.getElementById('createMoMButton').addEventListener('click', function () {
    document.getElementById('createMoMModal').classList.remove('hidden');
});

// Hide the modal when the "Cancel" button is clicked
document.getElementById('cancelButton').addEventListener('click', function () {
    closeMoMModal();
});

// Function to reset the form after submission
function resetMoMForm() {
    document.getElementById('heading').value = '';
    document.getElementById('summary').value = '';
    document.getElementById('dateTime').value = '';
}

// Function to close the "Create MoM" modal
function closeMoMModal() {
    document.getElementById('createMoMModal').classList.add('hidden');
}
