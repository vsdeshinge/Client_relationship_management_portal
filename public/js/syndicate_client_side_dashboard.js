document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('syndicateToken'); // Get the syndicate token
  
    if (token) {
        fetchSyndicateDetails(token);
        fetchSyndicateClients(token);
    } else {
        console.error('Token not found in local storage.');
    }

    // Fetch syndicate details
    async function fetchSyndicateDetails(token) {
      try {
        const response = await fetch('/api/syndicate-details', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const syndicateUser = await response.json();
          displaySyndicateDetails(syndicateUser);
        } else {
          console.error('Error fetching syndicate details:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching syndicate details:', error);
      }
    }

    function displaySyndicateDetails(user) {
      const profileCard = document.getElementById('profile-card');
      if (profileCard) {
        profileCard.innerHTML = `
            <div class="flex items-center">
                <div>
                    <p class="text-lg font-bold">Strategy Partner: ${user.syndicate_name}</p>
                    <p class="text-sm">User ID: ${user.user_id}</p>
                    <p class="text-sm">Designation: ${user.designation}</p>
                </div>
            </div>
        `;
      } else {
        console.error('Profile card element not found.');
      }
    }

    // Fetch syndicate clients
    async function fetchSyndicateClients(token) {
      try {
        const response = await fetch('/api/syndicateclients', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const syndicateClients = await response.json();
          populateTable(syndicateClients);
        } else {
          console.error('Error fetching syndicate clients:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching syndicate clients:', error);
      }
    }

    // Populate the client table with data
    function populateTable(clients) {
      const tableBody = document.getElementById('client-table-body');
      tableBody.innerHTML = ''; // Clear existing table rows

      clients.forEach((client) => {
        const profileImage = client.faceImage ? `/images/${client.faceImage}` : 'https://via.placeholder.com/80';

        const row = `
        <tr>
          <td class="py-2 px-4">
            <img id="profile-img" src="${profileImage}" alt="Profile" class="profile-img cursor-pointer" style="width: 50px; height: 50px; border-radius: 50%;" onclick="openImagePopup('${profileImage}')">
          </td>
          <td class="py-2 px-4">${client.name || 'N/A'}</td>
          <td class="py-2 px-4">${client.domain || 'N/A'}</td>
          <td class="py-2 px-4">${new Date(client.createdAt).toLocaleString()}</td>
          <td class="py-2 px-4">
            <div class="relative inline-block text-left">
              <button onclick="toggleDropdown('${client._id}', event)" class="bg-blue-500 px-2 py-1 rounded">Actions</button>
              <div id="dropdown-${client._id}" class="dropdown-content hidden bg-white text-black absolute z-10">
                <a href="#" onclick="handleViewClient('${client._id}')">View</a>
                <a href="#" onclick="handleEditClient('${client._id}')">Edit</a>
                <a href="#" onclick="handleDeleteClient('${client._id}')">Delete</a>
              </div>
            </div>
          </td>
          <td class="py-2 px-4">
            <button onclick="handleAddDetailsClick(event, '${client._id}')" class="bg-green-500 px-2 py-1 rounded">Add</button>
          </td>
          <td class="py-2 px-4">
            <button href="./mom.html" onclick="handleAddDetailsClick1(event, '${client._id}')" class="bg-green-500 px-2 py-1 rounded">Log</button>
          </td>
          <td class="py-2 px-4">
            <button href="./schedule_meeting.html" onclick="handleAddDetailsClick2(event, '${client._id}')" class="bg-green-500 px-2 py-1 rounded">Schedule</button>
          </td>
          <td class="py-2 px-4">
            <select id="priority-${client._id}" class="priority-select" onchange="updatePriorityColor('${client._id}')">
              <option value="low" ${client.priority === 'low' ? 'selected' : ''}>Low</option>
              <option value="medium" ${client.priority === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="high" ${client.priority === 'high' ? 'selected' : ''}>High</option>
            </select>
          </td>
          <td class="py-2 px-4">
            <button class="bg-green-500 px-2 py-1 rounded" onclick="handleSavePriority('${client._id}')">Save</button>
          </td>
        </tr>
      `;
      
        tableBody.insertAdjacentHTML('beforeend', row);
      });
    }

 // Toggle the dropdown menu
window.toggleDropdown = function(clientId, event) {
    event.stopPropagation(); // Prevent click from bubbling to document

    // Hide any other open dropdowns
    document.querySelectorAll('.dropdown-content').forEach(dropdown => {
        if (dropdown.id !== `dropdown-${clientId}`) {
            dropdown.classList.add('hidden');
        }
    });

    // Toggle the clicked dropdown
    const dropdown = document.getElementById(`dropdown-${clientId}`);
    dropdown.classList.toggle('hidden');
};

// Close the dropdown if clicked outside
document.addEventListener('click', (event) => {
    document.querySelectorAll('.dropdown-content').forEach(dropdown => {
        if (!dropdown.contains(event.target)) {
            dropdown.classList.add('hidden');
        }
    });
});


    // Function to open the image popup with the clicked image
    function openImagePopup(imageUrl) {
      const imagePopup = document.getElementById('imagePopup');
      const popupImage = document.getElementById('popupImage');

      popupImage.src = imageUrl;
      imagePopup.classList.remove('hidden');
    }

    window.openImagePopup = openImagePopup;

    document.getElementById('closePopup').addEventListener('click', () => {
      document.getElementById('imagePopup').classList.add('hidden');
    });

    // Handle client view, edit, and delete actions
    window.handleViewClient = function (clientId) {
      localStorage.setItem('clientId', clientId);
      window.location.href = './syndicate_client_side_customerview.html';
    };

    // Handle Delete Client
    window.handleDeleteClient = async function(clientId) {
        if (confirm('Are you sure you want to delete this client?')) {
          try {
            const response = await fetch(`/api/client/${clientId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('syndicateToken')}`,
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              alert('Client deleted successfully');
              fetchSyndicateClients(localStorage.getItem('syndicateToken')); // Reload the client list
            } else {
              alert('Error deleting client');
            }
          } catch (error) {
            console.error('Error deleting client:', error);
            alert('Server error while deleting client');
          }
        }
    };
    
    let currentClientId = null; // Declare globally

    // Handle Edit Client button click
    window.handleEditClient = async function (clientId) {
        currentClientId = clientId; // Set the global clientId
        console.log('Edit button clicked, clientId:', clientId);
        
        const client = await fetchClientDetails(clientId);
        if (client) {
            console.log('Client details fetched:', client);
            populateEditForm(client); // Populate the form with client details
            
            // Fetch and populate syndicate names for the dropdown
            await fetchSyndicateNames(); 
    
            const detailsSection = document.getElementById('client-details-section');
            detailsSection.classList.remove('hidden'); // Show the section
        } else {
            console.error('Failed to fetch client details');
        }
    };
    
   // Hide the client details section (close modal)
function hideClientDetails() {
    console.log("hideClientDetails function called"); // Check if function is called
    const detailsSection = document.getElementById('client-details-section');
    if (detailsSection) {
        detailsSection.classList.add('hidden'); // Hide the section
    } else {
        console.error('Details section not found');
    }
}

// Example to trigger the function:
document.getElementById('close-btn').addEventListener('click', hideClientDetails);

    // Close the modal when clicking outside the modal content
    window.onclick = function(event) {
        const detailsSection = document.getElementById('client-details-section');
        if (event.target === detailsSection) {
            hideClientDetails(); // Hide modal if user clicks outside the content
        }
    };
    
    // Function to fetch client details
    async function fetchClientDetails(clientId) {
        try {
            const response = await fetch(`/api/client/${clientId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('syndicateToken')}`
                }
            });
            if (response.ok) {
                const client = await response.json();
                console.log('Fetched client:', client);
                return client;
            } else {
                const errorData = await response.json();
                console.error('Error fetching client details:', errorData);
            }
        } catch (error) {
            console.error('Error fetching client details:', error);
        }
        alert('Error fetching client details');
        return null;
    }
    
    // Function to populate form with client details
    function populateEditForm(client) {
        document.getElementById('edit-personToMeet').value = client.personToMeet;
        document.getElementById('edit-name').value = client.name;
        document.getElementById('edit-phone').value = client.phone;
        document.getElementById('edit-email').value = client.email;
        document.getElementById('edit-companyName').value = client.companyName;
        document.getElementById('edit-domain-input').value = client.domain;
        document.getElementById('edit-personReferred').value = client.personReferred; // Make sure to set this value
    }
    
    // Function to fetch syndicate names and populate the personReferred dropdown
    async function fetchSyndicateNames() {
        try {
            const response = await fetch('/api/syndicates'); // Adjust the path according to your backend route
            if (response.ok) {
                const syndicates = await response.json();
                populateSyndicateDropdown(syndicates);
            } else {
                console.error('Error fetching syndicate names');
            }
        } catch (error) {
            console.error('Error fetching syndicate names:', error);
        }
    }
    
    function populateSyndicateDropdown(syndicates) {
        const personReferredField = document.getElementById('edit-personReferred');
        personReferredField.innerHTML = ''; // Clear any existing options
    
        // Add a default "Select" option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'I am referred by?';
        personReferredField.appendChild(defaultOption);
    
        // Add each syndicate's name as an option
        syndicates.forEach(syndicate => {
            const option = document.createElement('option');
            option.value = syndicate.syndicate_name;
            option.textContent = syndicate.syndicate_name;
            personReferredField.appendChild(option);
        });
    }
    
    window.updateClientDetails = async function () {
        const updatedClient = {
            name: document.getElementById('edit-name').value,
            phone: document.getElementById('edit-phone').value,
            companyName: document.getElementById('edit-companyName').value,
            email: document.getElementById('edit-email').value,
            personToMeet: document.getElementById('edit-personToMeet').value,
            personReferred: document.getElementById('edit-personReferred').value, // Updated value from dropdown
            domain: document.getElementById('edit-domain-input').value
        };
    
        try {
            const response = await fetch(`/api/client/update/${currentClientId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('syndicateToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedClient) // Send the updated client details
            });
    
            if (response.ok) {
                alert('Client details updated successfully');
                hideClientDetails(); // Hide the section after saving
                fetchSyndicateClients(localStorage.getItem('syndicateToken')); // Refresh the client list
            } else {
                const errorData = await response.json();
                console.error('Error updating client:', errorData.message);
                alert('Error updating client details. Please try again.');
            }
        } catch (error) {
            console.error('Error updating client details:', error);
            alert('Error updating client details. Please try again.');
        }
    };
    

    // Add details click handlers for other actions
    window.handleAddDetailsClick = function (event, clientId) {
        event.preventDefault(); // Prevent default anchor behavior
        localStorage.setItem('clientId', clientId); // Store the clientId in localStorage
        window.location.href = './syndicate_client_data_entry.html'; // Redirect to the data entry page
    };

    window.handleAddDetailsClick1 = function (event, clientId) {
        event.preventDefault(); // Prevent default anchor behavior
        localStorage.setItem('clientId', clientId); // Store the clientId in localStorage
        window.location.href = './mom.html'; // Redirect to the MoM log page
    };

    window.handleAddDetailsClick2 = function (event, clientId) {
        event.preventDefault(); // Prevent default anchor behavior
        localStorage.setItem('clientId', clientId); // Store the clientId in localStorage
        window.location.href = './schedule_meeting.html'; // Redirect to the schedule meeting page
    };

    // Function to update the priority color dynamically
    window.updatePriorityColor = function (clientId) {
        const selectElement = document.getElementById(`priority-${clientId}`);
        const selectedPriority = selectElement.value;

        // Update background color based on selected priority
        if (selectedPriority === 'high') {
            selectElement.style.backgroundColor = '#FF6347'; // Red for high priority
        } else if (selectedPriority === 'medium') {
            selectElement.style.backgroundColor = '#FFD700'; // Yellow for medium priority
        } else {
            selectElement.style.backgroundColor = '#90EE90'; // Green for low priority
        }
    };

    // Function to handle saving the updated priority
    window.handleSavePriority = async function (clientId) {
        const selectElement = document.getElementById(`priority-${clientId}`);
        const newPriority = selectElement.value;

        try {
            const response = await fetch(`/api/syndicateclients/${clientId}/priority`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('syndicateToken')}`
                },
                body: JSON.stringify({ priority: newPriority })
            });

            if (response.ok) {
                alert('Priority updated successfully');
            } else {
                const errorData = await response.json();
                console.error('Error updating priority:', errorData.message);
                alert('Error updating priority. Please try again.');
            }
        } catch (error) {
            console.error('Error updating priority:', error);
            alert('Error updating priority. Please try again.');
        }
    };
});

  
document.addEventListener('DOMContentLoaded', function() {
  // Trigger the hidden file input when the "Upload Image" button is clicked
  document.getElementById('uploadImageButton').addEventListener('click', function() {
      document.getElementById('uploadImage').click(); // Trigger the hidden file input
  });

  // Event listener for when a file is selected
  document.getElementById('uploadImage').addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = function(e) {
              // Display the uploaded image in the image container
              const imageDisplay = document.getElementById('faceImageDisplay');
              imageDisplay.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image">`;
              imageDisplay.style.display = 'flex'; 
          };
          reader.readAsDataURL(file); // Read the file as a Data URL for preview
      }
  });
});


  
const domains = [
{ name: "Health Care", popularity: 90 },
{ name: "Food", popularity: 85 },
{ name: "Agriculture", popularity: 70 },
{ name: "IT Software", popularity: 95 },
{ name: "Electronics", popularity: 75 },
{ name: "Government Agencies", popularity: 60 },
{ name: "NGO", popularity: 65 },
{ name: "Investors", popularity: 80 },
{ name: "Civil Infrastructure", popularity: 68 },
{ name: "Future Mobility", popularity: 72 },
{ name: "Fintech", popularity: 90 },
{ name: "Architecture", popularity: 78 },
{ name: "Interior Design", popularity: 74 },
{ name: "Real Estate", popularity: 83 },
{ name: "Education", popularity: 88 },
{ name: "Biotech", popularity: 85 },
{ name: "Bio Informatics", popularity: 67 },
{ name: "Electrical", popularity: 76 },
{ name: "Semiconductors", popularity: 80 },
{ name: "Corporate", popularity: 82 },
{ name: "MNC", popularity: 77 },
{ name: "Promoters", popularity: 58 },
{ name: "B2B", popularity: 79 },
{ name: "Designers", popularity: 68 },
{ name: "IT Hardware", popularity: 75 },
{ name: "Manufacturer", popularity: 66 },
{ name: "Researcher", popularity: 85 },
{ name: "Others", popularity: 50 },
{ name: "Scientist", popularity: 70 },
{ name: "Defence", popularity: 78 },
{ name: "Energy", popularity: 84 },
{ name: "Telecommunications", popularity: 81 },
{ name: "Retail", popularity: 87 },
{ name: "Banking", popularity: 93 },
{ name: "E-commerce", popularity: 88 },
{ name: "Marketing", popularity: 82 },
{ name: "Logistics", popularity: 76 },
{ name: "Aerospace", popularity: 75 },
{ name: "Automotive", popularity: 83 },
{ name: "Healthcare IT", popularity: 89 },
{ name: "Pharmaceuticals", popularity: 90 },
{ name: "Cybersecurity", popularity: 91 },
{ name: "Data Analytics", popularity: 92 },
{ name: "Machine Learning", popularity: 94 },
{ name: "AI & Robotics", popularity: 96 },
{ name: "Climate Tech", popularity: 82 },
{ name: "Blockchain", popularity: 88 },
{ name: "Smart Cities", popularity: 74 },
{ name: "SaaS", popularity: 85 },
{ name: "Insurance", popularity: 81 },
{ name: "Investment Banking", popularity: 87 },
{ name: "Capital Markets", popularity: 78 },
{ name: "Venture Capital", popularity: 83 },
{ name: "Environmental", popularity: 73 },
{ name: "Public Relations", popularity: 70 },
{ name: "Hospitality", popularity: 72 },
{ name: "Entertainment", popularity: 76 },
{ name: "Media & Journalism", popularity: 78 },
{ name: "Consumer Goods", popularity: 79 },
{ name: "Textile", popularity: 68 },
{ name: "Legal", popularity: 69 },
{ name: "Human Resources", popularity: 67 },
{ name: "Renewable Energy", popularity: 82 },
{ name: "Mining", popularity: 65 },
{ name: "Chemical Industry", popularity: 66 },
{ name: "Apparel & Fashion", popularity: 73 },
{ name: "Social Services", popularity: 60 },
{ name: "Transportation", popularity: 80 },
{ name: "Maritime", popularity: 59 },
{ name: "Photography", popularity: 55 },
{ name: "Construction", popularity: 71 },
{ name: "Waste Management", popularity: 63 },
{ name: "Animal Health", popularity: 61 },
{ name: "Luxury Goods", popularity: 69 },
{ name: "Tourism", popularity: 64 },
{ name: "Oceanography", popularity: 62 },
{ name: "Nanotechnology", popularity: 75 },
{ name: "Personal Finance", popularity: 72 },
{ name: "Behavioral Science", popularity: 68 },
{ name: "Human Rights", popularity: 66 },
{ name: "Urban Development", popularity: 77 },
{ name: "Renewable Resources", popularity: 74 },
{ name: "Drone Technology", popularity: 70 },
{ name: "Augmented Reality", popularity: 83 },
{ name: "Virtual Reality", popularity: 84 },
{ name: "Gaming", popularity: 85 },
{ name: "Event Management", popularity: 65 },
{ name: "Pension Funds", popularity: 62 },
{ name: "Agritech", popularity: 71 },
{ name: "Health Informatics", popularity: 80 },
{ name: "Ocean Conservation", popularity: 58 },
{ name: "Culinary Arts", popularity: 60 },
{ name: "Consumer Electronics", popularity: 81 },
{ name: "Digital Marketing", popularity: 83 },
{ name: "Product Development", popularity: 79 },
{ name: "Sustainable Development", popularity: 82 },
{ name: "Home Automation", popularity: 76 },
{ name: "Agronomy", popularity: 64 },
{ name: "Biometrics", popularity: 68 },
{ name: "Material Science", popularity: 78 },
{ name: "Petroleum Engineering", popularity: 66 },
{ name: "Music Production", popularity: 72 },
{ name: "Veterinary Sciences", popularity: 67 },
{ name: "Clinical Trials", popularity: 73 },
{ name: "Public Policy", popularity: 69 },
{ name: "Optics & Photonics", popularity: 62 },
{ name: "Home Security", popularity: 63 },
{ name: "Forestry", popularity: 60 },
{ name: "Speech Recognition", popularity: 76 },
{ name: "Smart Manufacturing", popularity: 79 },
{ name: "Genetics", popularity: 81 },
{ name: "Hydrology", popularity: 64 },
{ name: "Microbiology", popularity: 69 },
{ name: "Neurology", popularity: 75 },
{ name: "Renewable Infrastructure", popularity: 77 },
{ name: "Hydrogen Technology", popularity: 78 },
{ name: "Biofuel", popularity: 70 },
{ name: "Sports Science", popularity: 71 },
{ name: "Telemedicine", popularity: 82 },
{ name: "Telecommunications Equipment", popularity: 73 },
{ name: "Child Welfare", popularity: 59 },
{ name: "Behavioral Analytics", popularity: 72 }
];

const domainSet = new Set(domains.map(domain => domain.name)); // For validation

const input = document.getElementById('domain-input');
const suggestions = document.getElementById('suggestions');
const customDomainInput = document.getElementById('custom-domain');
const errorMessage = document.getElementById('error-message');

// Function to display suggestions
function displaySuggestions(list) {
suggestions.innerHTML = '';
list.forEach(domain => {
  const li = document.createElement('li');
  li.textContent = domain.name;
  li.style.padding = "10px";
  li.style.cursor = "pointer";
  suggestions.appendChild(li);
});
suggestions.style.display = 'block';
}

// Fuzzy matching for suggestions
function fuzzyMatch(query) {
const lowercaseQuery = query.toLowerCase();
return domains
  .filter(domain => domain.name.toLowerCase().includes(lowercaseQuery))
  .sort((a, b) => b.popularity - a.popularity);
}

// Debounce to handle excessive calls
function debounce(fn, delay) {
let timer;
return function(...args) {
  clearTimeout(timer);
  timer = setTimeout(() => fn.apply(this, args), delay);
};
}

// Display suggestions on input
input.addEventListener('input', debounce(function() {
const query = input.value.toLowerCase();
if (query) {
  const filteredDomains = fuzzyMatch(query);
  if (filteredDomains.length > 0) {
      displaySuggestions(filteredDomains);
  } else {
      suggestions.style.display = 'none';
  }
} else {
  displaySuggestions(domains.slice(0, 10)); // Show top suggestions
}
errorMessage.style.display = 'none';
customDomainInput.style.display = 'none'; // Hide custom input if typing something else
}, 300));

// Handle suggestion click
suggestions.addEventListener('click', function(e) {
if (e.target.tagName === 'LI') {
  input.value = e.target.textContent;
  suggestions.style.display = 'none';

  if (e.target.textContent === "Others") {
      customDomainInput.style.display = 'block'; // Show custom input if "Others" is selected
      customDomainInput.focus();
  } else {
      customDomainInput.style.display = 'none';
  }
  errorMessage.style.display = 'none';
}
});

// Validate input on blur
input.addEventListener('blur', function() {
const userInput = input.value.trim();
if (userInput === "Others") {
  // Ensure custom domain input is shown and not empty for "Others" selection
  if (customDomainInput.value.trim() === "") {
      errorMessage.textContent = "Please specify your domain.";
      errorMessage.style.display = 'block';
  }
} else if (userInput && !domainSet.has(userInput)) {
  errorMessage.textContent = "Please select a valid domain from the list.";
  errorMessage.style.display = 'block';
  input.value = ''; // Clear invalid input
}
});
document.getElementById('copyInviteLinkButton').addEventListener('click', async () => {
  const syndicateToken = localStorage.getItem('syndicateToken'); // Fetch the token

  try {
      // Get the user's syndicate_name or user_id from the backend
      const response = await fetch('/api/getSyndicateInfo', {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${syndicateToken}` // Send token in Authorization header
          }
      });

      const userData = await response.json();
      const syndicateName = userData.syndicate_name; // Get the syndicate_name from the response

      const inviteLink = `http://localhost:3000/syndicate_client_side_visitorform.html?referrer=${syndicateName}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(inviteLink);
      alert("Invite link copied to clipboard!");
  } catch (error) {
      console.error("Failed to copy invite link:", error);
      alert("Failed to copy invite link.");
  }
});

