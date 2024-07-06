document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('adminToken');
    const adminId = localStorage.getItem('adminId');
    
    console.log('Token:', token);
    console.log('Admin ID:', adminId);

    if (!token || !adminId) {
        window.location.href = 'index.html';
        return;
    }

    const handleUnauthorized = () => {
        alert('Login session expired, please login again');
        logout();
    };

    const fetchAdminDetails = async () => {
        try {
            const response = await fetch(`/admin/${adminId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const adminData = await response.json();
                console.log('Admin Data:', adminData); // Debugging line
                if (adminData && adminData.username) {
                    document.querySelector('.welcome-card h2').textContent = `Welcome ${adminData.username},`;
                } else {
                    console.error('Admin username is undefined or null');
                    document.querySelector('.welcome-card h2').textContent = 'Welcome,';
                }
                document.querySelector('.welcome-card p').textContent = 'Welcome to the admin panel';
            } else if (response.status === 401) {
                handleUnauthorized();
            } else {
                const errorData = await response.json();
                console.error('Error fetching admin details:', errorData.error);
            }
        } catch (error) {
            console.error('Error fetching admin details:', error);
        }
    };

    const fetchVisitorCounts = async () => {
        try {
            const response = await fetch('/visitors-count', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const counts = await response.json();
            if (response.ok) {
                document.getElementById('walkInClients').textContent = counts.walkInClients;
                document.getElementById('customers').textContent = counts.customers;
                document.getElementById('qualifiedLead').textContent = counts.qualifiedLead;
                document.getElementById('onHoldClients').textContent = counts.onHoldClients;
                document.getElementById('businessProposal').textContent = counts.businessProposal;
            } else {
                console.error('Error fetching visitor counts:', counts.error);
            }
        } catch (error) {
            console.error('Error fetching visitor counts:', error);
        }
    };

    const fetchVisitorDetails = async () => {
        try {
            const response = await fetch('/visitors', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const visitors = await response.json();
            if (response.ok) {
                displayVisitors(visitors);
            } else {
                console.error('Error fetching visitors:', visitors.error);
            }
        } catch (error) {
            console.error('Error fetching visitors:', error);
        }
    };

    const fetchClientCount = async () => {
        try {
            const response = await fetch('/clients-count', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const countData = await response.json();
            if (response.ok) {
                document.getElementById('walkInClients').textContent = countData.clientsCount;
            } else {
                console.error('Error fetching client count:', countData.error);
            }
        } catch (error) {
            console.error('Error fetching client count:', error);
        }
    };

    const displayVisitors = (visitors) => {
        const clientTable = document.getElementById('clientTable');
        clientTable.innerHTML = '';
        visitors.forEach(visitor => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a href="#" data-id="${visitor._id}" class="visitor-link">${visitor.name}</a></td>
                <td>${visitor.companyName}</td>
                <td>${visitor.domain}</td>
                <td>
                    <select class="status-dropdown">
                        <option value="yes" ${visitor.status === 'yes' ? 'selected' : ''}>✅</option>
                        <option value="maybe" ${visitor.status === 'maybe' ? 'selected' : ''}>⚠️</option>
                        <option value="no" ${visitor.status === 'no' ? 'selected' : ''}>❌</option>
                    </select>
                </td>
            `;
            row.querySelector('.status-dropdown').addEventListener('change', async (event) => {
                const newStatus = event.target.value;
                await updateVisitorStatus(visitor._id, newStatus);
            });
            clientTable.appendChild(row);
        });

        

        document.querySelectorAll('.visitor-link').forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const visitorId = event.target.dataset.id;
                displayVisitorDetails(visitorId);
            });
        });
    };
    
    const displayVisitorDetails = async (visitorId) => {
        try {
          const response = await fetch(`/api/visitors/${visitorId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const visitor = await response.json();
            if (response.ok) {
              document.getElementById('qualified-leads').innerHTML = `
                <div id="projects" class="subcontent active">
                  <header>
                    <div class="user-info">
                      <div class="avatar"></div>
                      <div class="details">
                        <p>Name: ${visitor.name}</p>
                        <p>Company: ${visitor.companyName}</p>
                        <p>Domain: ${visitor.domain}</p>
                        <p>Email: ${visitor.email}</p>
                        <p>Phone no.: ${visitor.phone}</p>
                      </div>
                    </div>
                    <div class="actions">
                      <button class="btn">Visiting Card</button>
                      <button class="btn">View Need Form</button>
                    </div>
                  </header>
                  <nav class="main-nav">
                    <div class="nav-item active">Projects</div>
                    <div class="nav-item">Products</div>
                    <div class="nav-item">Services</div>
                    <div class="nav-item">Solutions</div>
                  </nav>
                  <h3>Projects</h3>
                  <section class="content">
                    <div class="input-group">
                      <label for="title">Title:</label>
                      <input type="text" id="title" name="title" value="${visitor.projectTitle || ''}">
                    </div>
                    <div class="input-group">
                      <label for="description">Description:</label>
                      <textarea id="description" name="description" rows="5">${visitor.projectDescription || ''}</textarea>
                    </div>
                    <div class="button-group">
                      <button class="btn back-btn" id="backBtnProjects">BACK</button>
                      <button class="btn next-btn" id="nextBtnProjects">NEXT ></button>
                    </div>
                  </section>
                </div>
              `;
              document.querySelector('.metrics-container').style.display = 'none';
              document.querySelector('.table-container').style.display = 'none';
              document.getElementById('qualified-leads').style.display = 'block';
            } else {
              console.error('Error fetching visitor details:', visitor.error);
            }
          } else {
            console.error('Unexpected response format');
            const text = await response.text();
            console.error(text); // Log the full response for debugging
          }
        } catch (error) {
          console.error('Error fetching visitor details:', error);
        }
      };
      
      
    document.getElementById('logoutButton').style.display = 'block';


    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (event) => {
        const query = event.target.value.toLowerCase();
        const rows = document.querySelectorAll('#clientTable tr');
        rows.forEach(row => {
            const name = row.querySelector('td:first-child').textContent.toLowerCase();
            if (name.includes(query)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    await fetchAdminDetails();
    await fetchVisitorCounts();
    await fetchVisitorDetails();
    await fetchClientCount();

   document.getElementById('qualified-leads').style.display = 'none';
});

function logout() {
    localStorage.removeItem('adminToken');
    alert('You have been logged out.');
    window.location.href = 'index.html';
}

function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}


