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
            <img src="${faceImageUrl}" alt="Profile" class="w-16 h-16 rounded-full">
            <div class="ml-4">
                <p>Name: ${lead.name}</p>
                <p>Email: ${lead.email}</p>
                <p>Domain: ${lead.domain || 'N/A'}</p>
                <p>Phone: ${lead.phone}</p>
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
