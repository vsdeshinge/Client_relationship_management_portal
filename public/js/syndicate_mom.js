document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('clientId') || localStorage.getItem('clientId'); // Changed leadId to clientId

    if (clientId) {
        await fetchClientDetails(clientId); // Fetch client details using clientId
        await fetchMoMs(clientId); // Fetch MoMs using clientId
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

// Function to handle form submission for creating a new MoM
document.getElementById('momForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const clientId = localStorage.getItem('clientId'); // Use clientId instead of leadId
    const heading = document.getElementById('heading').value;
    const summary = document.getElementById('summary').value;
    const dateTime = document.getElementById('dateTime').value;

    try {
        const response = await fetch('/api/mom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ clientId, heading, summary, dateTime }) // Send clientId
        });

        if (!response.ok) {
            throw new Error('Error creating MoM');
        }

        const result = await response.json();
        alert('MoM created successfully');
        fetchMoMs(clientId); // Refresh the MoMs after creating one
        resetMoMForm(); // Reset the form after submission
        closeMoMModal(); // Close the modal after submission
    } catch (error) {
        console.error('Error submitting MoM:', error);
    }
});

// Fetch and display all MoMs for the current client
async function fetchMoMs(clientId) {
    try {
        const response = await fetch(`/api/mom/${clientId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('syndicateToken')}` // Use syndicateToken instead of adminToken
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
                'Authorization': `Bearer ${localStorage.getItem('syndicateToken')}` // Use syndicateToken instead of adminToken
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
    const viewMoMModal = document.createElement('div');
    viewMoMModal.id = 'viewMoMModal';
    viewMoMModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center';
    viewMoMModal.innerHTML = `
        <div class="bg-gray-900 p-8 rounded-lg">
            <h2 class="text-lg font-bold mb-4">View Minutes of Meeting</h2>
            <p><strong>Heading:</strong> ${mom.heading}</p>
            <p><strong>Summary:</strong> ${mom.summary}</p>
            <p><strong>Date and Time:</strong> ${new Date(mom.dateTime).toLocaleString()}</p>
            <div class="flex justify-end mt-4">
            <button id="editViewButton" class="bg-blue-500 py-2 px-4 rounded-md">Edit</button>
                  <button id="deleteViewButton" class="bg-blue-500 py-2 px-4 rounded-md">Delete</button>
                <button id="closeViewButton" class="bg-blue-500 py-2 px-4 rounded-md">Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(viewMoMModal);

    // Add event listener to close the modal
    document.getElementById('closeViewButton').addEventListener('click', function () {
        viewMoMModal.remove();
    });
    // Add event listener to handle editing
    document.getElementById('editViewButton').addEventListener('click', () => editMoM(mom, viewMoMModal));

    // Add event listener to handle deleting
    document.getElementById('deleteViewButton').addEventListener('click', () => deleteMoM(mom._id, viewMoMModal));
}

// Fetch and display details of a specific MoM when "View" button is clicked
async function viewMoM(momId) {
    try {
        const response = await fetch(`/api/mom/view/${momId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('syndicateToken')}` // Use syndicateToken instead of adminToken
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
    const viewMoMModal = document.createElement('div');
    viewMoMModal.id = 'viewMoMModal';
    viewMoMModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center';
    viewMoMModal.innerHTML = `
        <div class="bg-gray-900 p-8 rounded-lg">
            <h2 class="text-lg font-bold mb-4">View Minutes of Meeting</h2>
            <p><strong>Heading:</strong> <span id="momHeading">${mom.heading}</span></p>
            <p><strong>Summary:</strong> <span id="momSummary">${mom.summary}</span></p>
            <p><strong>Date and Time:</strong> <span id="momDateTime">${new Date(mom.dateTime).toLocaleString()}</span></p>
            <div class="flex justify-end mt-4">
                <button id="editViewButton" class="bg-blue-500 py-2 px-4 rounded-md">Edit</button>
                <button id="deleteViewButton" class="bg-red-500 py-2 px-4 rounded-md ml-2">Delete</button>
                <button id="closeViewButton" class="bg-gray-500 py-2 px-4 rounded-md ml-2">Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(viewMoMModal);

    // Close the modal
    document.getElementById('closeViewButton').addEventListener('click', function () {
        viewMoMModal.remove();
    });

    // Add event listener to handle editing
    document.getElementById('editViewButton').addEventListener('click', () => editMoM(mom, viewMoMModal));

    // Add event listener to handle deleting
    document.getElementById('deleteViewButton').addEventListener('click', () => deleteMoM(mom._id, viewMoMModal));
}

// Edit MoM functionality
function editMoM(mom, modalElement) {
    // Convert current text fields to input fields for editing
    modalElement.innerHTML = `
        <div class="bg-gray-900 p-8 rounded-lg">
            <h2 class="text-lg font-bold mb-4">Edit Minutes of Meeting</h2>
            <p><strong>Heading:</strong> <input id="editHeading" value="${mom.heading}" class="w-full p-2 bg-gray-700 text-white rounded-md"/></p>
            <p><strong>Summary:</strong> <textarea id="editSummary" class="w-full p-2 bg-gray-700 text-white rounded-md">${mom.summary}</textarea></p>
            <p><strong>Date and Time:</strong> <input type="datetime-local" id="editDateTime" value="${new Date(mom.dateTime).toISOString().slice(0,16)}" class="w-full p-2 bg-gray-700 text-white rounded-md"/></p>
            <div class="flex justify-end mt-4">
                <button id="saveEditButton" class="bg-green-500 py-2 px-4 rounded-md">Save</button>
                <button id="cancelEditButton" class="bg-red-500 py-2 px-4 rounded-md ml-2">Cancel</button>
            </div>
        </div>
    `;

    // Save the edited MoM
    document.getElementById('saveEditButton').addEventListener('click', async () => {
        const updatedMoM = {
            heading: document.getElementById('editHeading').value,
            summary: document.getElementById('editSummary').value,
            dateTime: new Date(document.getElementById('editDateTime').value).toISOString()
        };

        try {
            const response = await fetch(`/api/mom/edit/${mom._id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('syndicateToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedMoM)
            });

            if (response.ok) {
                alert('MoM updated successfully');
                modalElement.remove(); // Close the modal after successful save
            } else {
                console.error('Error saving MoM:', await response.text());
                alert('Error saving MoM');
            }
        } catch (error) {
            console.error('Error updating MoM:', error);
            alert('Error updating MoM');
        }
    });

    // Cancel the edit operation
    document.getElementById('cancelEditButton').addEventListener('click', function () {
        modalElement.remove(); // Close the modal without saving
    });
}

// Delete MoM functionality
async function deleteMoM(momId, modalElement) {
    const confirmDelete = confirm("Are you sure you want to delete this MoM?");
    if (confirmDelete) {
        try {
            const response = await fetch(`/api/mom/delete/${momId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('syndicateToken')}`
                }
            });

            if (response.ok) {
                alert('MoM deleted successfully');
                modalElement.remove(); // Close the modal after deletion
            } else {
                console.error('Error deleting MoM:', await response.text());
                alert('Error deleting MoM');
            }
        } catch (error) {
            console.error('Error deleting MoM:', error);
            alert('Error deleting MoM');
        }
    }
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
