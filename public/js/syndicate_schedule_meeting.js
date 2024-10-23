document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('clientId') || localStorage.getItem('clientId');

    if (clientId) {
        await fetchClientDetails(clientId);
        await fetchScheduleMeetings(clientId);
    } else {
        console.error('Client ID not found in URL or local storage.');
    }
});

// Fetch client details
async function fetchClientDetails(clientId) {
    try {
        const response = await fetch(`/api/syndicateclient/${clientId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('syndicateToken')}`
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

// Submit a new schedule meeting
document.getElementById('schedulemeetingForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const clientId = localStorage.getItem('clientId');
    const heading = document.getElementById('heading').value;
    const summary = document.getElementById('summary').value;
    const dateTime = document.getElementById('dateTime').value;

    try {
        const response = await fetch('/api/schedulemeeting', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ clientId, heading, summary, dateTime })
        });

        if (!response.ok) {
            throw new Error('Error creating schedule meeting');
        }

        alert('Schedule meeting created successfully');
        fetchScheduleMeetings(clientId);
        resetScheduleMeetingForm();
        closeScheduleMeetingModal();
    } catch (error) {
        console.error('Error submitting schedule meeting:', error);
    }
});

// Fetch and display all schedule meetings for the current client
async function fetchScheduleMeetings(clientId) {
    try {
        const response = await fetch(`/api/schedulemeeting/${clientId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('syndicateToken')}`
            }
        });

        if (response.ok) {
            const scheduleMeetings = await response.json();
            displayScheduleMeetings(scheduleMeetings);
        } else {
            console.error('Error fetching schedule meetings:', await response.text());
        }
    } catch (error) {
        console.error('Error fetching schedule meetings:', error);
    }
}

// Display schedule meetings in the table with "View", "Edit", and "Send Mail" buttons
function displayScheduleMeetings(scheduleMeetings) {
    const scheduleMeetingTable = document.getElementById('schedulemeetingTable');
    scheduleMeetingTable.innerHTML = ''; // Clear existing rows

    scheduleMeetings.forEach((meeting, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${meeting.heading}</td>
            <td>${new Date(meeting.dateTime).toLocaleString()}</td>
            <td>
                <button class="view-button bg-blue-500 text-white py-1 px-3 rounded-md mr-2" data-id="${meeting._id}">View</button>
                <button class="edit-button bg-yellow-500 text-white py-1 px-3 rounded-md mr-2" data-id="${meeting._id}">Edit</button>
                <button class="send-mail-button bg-green-500 text-white py-1 px-3 rounded-md" data-id="${meeting._id}">Send Mail</button>
            </td>
        `;
        scheduleMeetingTable.appendChild(row);
    });

    // Add event listeners for the buttons
    document.querySelectorAll('.view-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const meetingId = e.target.dataset.id;
            viewScheduleMeeting(meetingId);
        });
    });

    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const meetingId = e.target.dataset.id;
            editScheduleMeeting(meetingId);
        });
    });

    document.querySelectorAll('.send-mail-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const meetingId = e.target.dataset.id;
            sendScheduleMeetingEmail(meetingId);
        });
    });
}


// View a specific schedule meeting
async function viewScheduleMeeting(meetingId) {
    try {
        const response = await fetch(`/api/schedulemeeting/view/${meetingId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('syndicateToken')}`
            }
        });

        if (response.ok) {
            const meeting = await response.json();
            displayScheduleMeetingDetails(meeting);
        } else {
            console.error('Error fetching schedule meeting:', await response.text());
        }
    } catch (error) {
        console.error('Error fetching schedule meeting:', error);
    }
}

// Display schedule meeting details in a new modal
function displayScheduleMeetingDetails(meeting) {
    const viewModal = document.createElement('div');
    viewModal.id = 'viewschedulemeetingModal';
    viewModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center';
    viewModal.innerHTML = `
        <div class="bg-gray-900 p-8 rounded-lg">
            <h2 class="text-lg font-bold mb-4">View Meeting</h2>
            <p><strong>Heading:</strong> ${meeting.heading}</p>
            <p><strong>Summary:</strong> ${meeting.summary}</p>
            <p><strong>Date and Time:</strong> ${new Date(meeting.dateTime).toLocaleString()}</p>
            <div class="flex justify-end mt-4">
                <button id="closeViewButton" class="bg-blue-500 py-2 px-4 rounded-md">Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(viewModal);

    // Close modal
    document.getElementById('closeViewButton').addEventListener('click', function () {
        viewModal.remove();
    });
}

// Edit schedule meeting
async function editScheduleMeeting(meetingId) {
    try {
        const response = await fetch(`/api/schedulemeeting/view/${meetingId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('syndicateToken')}`
            }
        });

        if (response.ok) {
            const meeting = await response.json();
            document.getElementById('editHeading').value = meeting.heading;
            document.getElementById('editSummary').value = meeting.summary;
            document.getElementById('editDateTime').value = meeting.dateTime;

            // Show edit modal
            document.getElementById('editScheduleModal').classList.remove('hidden');

            // Add event listener for saving the edited meeting
            document.getElementById('saveEditButton').onclick = async function () {
                const heading = document.getElementById('editHeading').value;
                const summary = document.getElementById('editSummary').value;
                const dateTime = document.getElementById('editDateTime').value;

                const updateResponse = await fetch(`/api/schedulemeeting/${meetingId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ heading, summary, dateTime })
                });

                if (updateResponse.ok) {
                    alert('Meeting updated successfully');
                    fetchScheduleMeetings(meeting.clientId);
                    document.getElementById('editScheduleModal').classList.add('hidden');
                } else {
                    console.error('Error updating meeting:', await updateResponse.text());
                }
            };
        } else {
            console.error('Error fetching meeting details:', await response.text());
        }
    } catch (error) {
        console.error('Error editing schedule meeting:', error);
    }
}

// Send email for a specific schedule meeting
async function sendScheduleMeetingEmail(meetingId) {
    try {
        const response = await fetch(`/api/schedulemeeting/send-email/${meetingId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('syndicateToken')}`
            }
        });

        if (response.ok) {
            alert('Email sent successfully');
        } else {
            console.error('Error sending email:', await response.text());
        }
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// Reset the form after submission
function resetScheduleMeetingForm() {
    document.getElementById('heading').value = '';
    document.getElementById('summary').value = '';
    document.getElementById('dateTime').value = '';
}

// Close the "Create Schedule Meeting" modal
function closeScheduleMeetingModal() {
    document.getElementById('createschedulemeetingModal').classList.add('hidden');
}

// Show the modal when "Create a Schedule Meeting" button is clicked
document.getElementById('createschedulemeetingButton').addEventListener('click', function () {
    document.getElementById('createschedulemeetingModal').classList.remove('hidden');
});

// Hide the modal when the "Cancel" button is clicked
document.getElementById('cancelButton').addEventListener('click', function () {
    closeScheduleMeetingModal();
});

// Hide the modal for editing the schedule meeting
document.getElementById('cancelEditButton').addEventListener('click', function () {
    document.getElementById('editScheduleModal').classList.add('hidden');
});

