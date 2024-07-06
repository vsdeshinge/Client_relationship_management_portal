document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn-option');
    const popup = document.getElementById('popup');
    const saveButton = document.getElementById('saveButton');
    const addMoreButton = document.getElementById('addMoreButton');
    const submitButton = document.getElementById('submitButton');
    const popupFields = document.getElementById('popupFields');
    const logoutButton = document.getElementById('logoutButton');
    const savedDataContainer = document.getElementById('savedDataContainer'); // Corrected ID

    let currentOption = '';

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            currentOption = button.getAttribute('data-option');
            popup.classList.add('active');
            loadSavedData(currentOption);
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

        localStorage.setItem(currentOption, JSON.stringify(data));
        popup.classList.remove('active');
    });

    submitButton.addEventListener('click', () => {
        const allData = {};
        buttons.forEach(button => {
            const option = button.getAttribute('data-option');
            const data = JSON.parse(localStorage.getItem(option));
            if (data) {
                allData[option.toLowerCase()] = data;
            }
        });

        const emailAuthToken = localStorage.getItem('emailAuthToken');
        if (!emailAuthToken) {
            alert('No email auth token found. Please try again.');
            return;
        }

        fetch('http://localhost:3000/api/clientFieldData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${emailAuthToken}`
            },
            body: JSON.stringify(allData)
        })
        .then(response => response.json())
        .then(result => {
            console.log('Success:', result);
            if (result.message) {
                localStorage.clear();
                alert('Data submitted successfully');
            } else {
                console.error('Submission error:', result.error);
                alert('Failed to submit data');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to submit data');
        });
    });

    // Logout button functionality
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('emailAuthToken');
        window.location.href = '/syndicate-dashboard.html';
    });

    function loadSavedData(option) {
        const savedData = JSON.parse(localStorage.getItem(option));
        if (savedData) {
            popupFields.innerHTML = '';
            savedData.forEach(item => {
                const titleInput = document.createElement('input');
                titleInput.type = 'text';
                titleInput.className = 'popupTitle';
                titleInput.placeholder = 'Title';
                titleInput.value = item.title;

                const descriptionTextarea = document.createElement('textarea');
                descriptionTextarea.className = 'popupDescription';
                descriptionTextarea.placeholder = 'Description';
                descriptionTextarea.value = item.description;

                popupFields.appendChild(titleInput);
                popupFields.appendChild(descriptionTextarea);
            });
        }
    }
// Function to fetch client field data from server
function fetchClientFieldData() {
    fetch('http://localhost:3000/api/clientdata', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('emailAuthToken')}`
        }
    })
    .then(response => {
        console.log('Response status:', response.status); // Log response status
        console.log('Response headers:', response.headers); // Log response headers
        return response.text(); // Use text() to log raw response
    })
    .then(rawData => {
        console.log('Raw response data:', rawData); // Log raw response data
        try {
            const data = JSON.parse(rawData); // Parse JSON
            displayClientFieldData(data);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            alert('Failed to fetch client field data');
        }
    })
    .catch(error => {
        console.error('Error fetching client field data:', error);
        alert('Failed to fetch client field data');
    });
}

// Function to display fetched client field data
function displayClientFieldData(clientFieldData) {
    savedDataContainer.innerHTML = ''; // Clear existing data

    // Iterate through each option and display its data
    Object.keys(clientFieldData).forEach(option => {
        const optionData = clientFieldData[option];
        if (Array.isArray(optionData) && optionData.length > 0) { // Check if optionData is an array and has elements
            const optionContainer = document.createElement('div');
            optionContainer.classList.add('option-container');

            const optionHeader = document.createElement('h3');
            optionHeader.textContent = option.toUpperCase();
            optionContainer.appendChild(optionHeader);

            optionData.forEach(item => {
                const itemContainer = document.createElement('div');
                itemContainer.classList.add('item-container');

                const titleElement = document.createElement('p');
                titleElement.textContent = `Title: ${item.title}`;

                const descriptionElement = document.createElement('p');
                descriptionElement.textContent = `Description: ${item.description}`;

                itemContainer.appendChild(titleElement);
                itemContainer.appendChild(descriptionElement);

                optionContainer.appendChild(itemContainer);
            });

            savedDataContainer.appendChild(optionContainer);
        }
    });
}

// Initial fetch of client field data when the page loads
fetchClientFieldData();

});
