document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('syndicateToken'); // Get the syndicate token

  if (token) {
      fetchSyndicateDetails(token);
      fetchSyndicateClients(token);
  } else {
      console.error('Token not found in local storage.');
  }
});

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
                  <p class="text-sm">Department: ${user.department}</p>
              </div>
          </div>
      `;
  } else {
      console.error('Profile card element not found.');
  }
}

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

function populateTable(clients) {
  const tableBody = document.getElementById('client-table-body');
  tableBody.innerHTML = ''; // Clear existing table rows

  clients.forEach((client) => {
      const row = `
          <tr>
              <td class="py-2 px-4">${client.name || 'N/A'}</td>
              <td class="py-2 px-4">${client.email || 'N/A'}</td>
              <td class="py-2 px-4">${client.phone || 'N/A'}</td>
              <td class="py-2 px-4">${client.syndicate_name || 'N/A'}</td>
              <td class="py-2 px-4">${new Date(client.createdAt).toLocaleString()}</td>
              <td class="py-2 px-4">
                  <button class="bg-blue-500 px-2 py-1 rounded" onclick="handleViewClient('${client._id}')">View</button>
              </td>
              <td class="py-2 px-4">
                  <a href="#" onclick="handleAddDetailsClick(event, '${client._id}')" class="bg-green-500 px-2 py-1 rounded">Add Details</a>
              </td>
          </tr>
      `;
      tableBody.insertAdjacentHTML('beforeend', row);
  });
}

// Assign handleViewClient to window object to ensure it is globally accessible
window.handleViewClient = function (clientId) {
    localStorage.setItem('clientId', clientId); // Store the clientId in localStorage
    window.location.href = './syndicate_client_side_customerview.html'; // Redirect to the client view page
};

// Function to handle adding details
window.handleAddDetailsClick = function (event, clientId) {
    event.preventDefault(); // Prevent default anchor behavior
    localStorage.setItem('clientId', clientId); // Store the clientId in localStorage
    window.location.href = './syndicate_client_data_entry.html'; // Redirect to the data entry page
};


function storeClientId(clientId) {
    localStorage.setItem('clientId', clientId); // Store clientId in localStorage
}

function showClientDetails(clientId) {
  console.log('Client ID:', clientId); // You can implement more details here
}
