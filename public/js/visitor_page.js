document.addEventListener('DOMContentLoaded', async () => {
    // Simulating data fetch and population
    setTimeout(() => {
        document.getElementById('name').textContent = 'John Doe';
        document.getElementById('contact').textContent = 'johndoe@example.com';
        document.getElementById('company').textContent = 'Acme Corp';
        document.getElementById('domain').textContent = 'Technology';
        updateStatus(true); // or false for not approved
    }, 1000);

    function updateStatus(isApproved) {
        const statusElement = document.getElementById('status');
        if (isApproved) {
            statusElement.textContent = 'Status: Approved';
            statusElement.classList.add('approved');
            statusElement.classList.remove('not-approved');
        } else {
            statusElement.textContent = 'Status: Not Approved';
            statusElement.classList.add('not-approved');
            statusElement.classList.remove('approved');
        }
    }

    function showPopup(popupId) {
        document.getElementById(popupId).style.display = 'flex';
    }

    function closePopups() {
        document.querySelectorAll('.popup').forEach(popup => {
            popup.style.display = 'none';
        });
    }

    document.getElementById('viewVisitingCard').addEventListener('click', function(e) {
        e.preventDefault();
        showPopup('visitingCardPopup');
    });

    document.getElementById('viewNeedForm').addEventListener('click', function(e) {
        e.preventDefault();
        showPopup('needFormPopup');
    });

    document.getElementById('meetings').addEventListener('click', function(e) {
        e.preventDefault();
        showPopup('meetingsPopup');
    });

    document.getElementById('sendForApproval').addEventListener('click', function(e) {
        e.preventDefault();
        alert('Sending for Approval');
    });

    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closePopups);
    });

    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('popup')) {
            closePopups();
        }
    });

    const buttons = document.querySelectorAll('.btn-option');
    const popup = document.getElementById('popup');
    const saveButton = document.getElementById('saveButton');
    const addMoreButton = document.getElementById('addMoreButton');
    const submitButton = document.getElementById('submitButton');
    const popupFields = document.getElementById('popupFields');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            popup.classList.add('active');
        });
    });

    addMoreButton.addEventListener('click', () => {
        const newTitleInput = document.createElement('input');
        newTitleInput.type = 'text';
        newTitleInput.className = 'popupTitle';
        newTitleInput.placeholder = 'Title';

        const newDescriptionTextarea = document.createElement('textarea');
        newDescriptionTextarea.className = 'popupDescription';
        newDescriptionTextarea.placeholder = 'Description';

        popupFields.appendChild(newTitleInput);
        popupFields.appendChild(newDescriptionTextarea);
    });

    saveButton.addEventListener('click', () => {
        const titles = document.querySelectorAll('.popupTitle');
        const descriptions = document.querySelectorAll('.popupDescription');

        const data = [];
        titles.forEach((title, index) => {
            data.push({
                title: title.value,
                description: descriptions[index].value
            });
        });

        // Send data to the server
        fetch('your-server-endpoint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            console.log('Success:', result);
        })
        .catch(error => {
            console.error('Error:', error);
        });

        popup.classList.remove('active');
    });

    submitButton.addEventListener('click', () => {
        alert('Submitted');
        // Add submit functionality here
    });

    // Fetch visitor details
    const params = new URLSearchParams(window.location.search);
    const visitorId = params.get('id');
    const token = localStorage.getItem('adminToken');

    if (!visitorId || !token) {
        alert('Invalid visitor ID or missing token');
        return;
    }

    try {
        const response = await fetch(`/visitor/${visitorId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const visitorData = await response.json();
            document.getElementById('visitorName').textContent = visitorData.name;
            document.getElementById('visitorCompany').textContent = visitorData.companyName;
            document.getElementById('visitorStatus').textContent = visitorData.status;
        } else {
            const errorData = await response.json();
            console.error('Error fetching visitor details:', errorData.error);
        }
    } catch (error) {
        console.error('Error fetching visitor details:', error);
    }
});
