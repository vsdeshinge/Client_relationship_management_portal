document.addEventListener('DOMContentLoaded', () => {

    async function fetchAdminDetails() {
        const token = localStorage.getItem('adminToken');
        const adminId = localStorage.getItem('adminId');
        try {
            const response = await fetch(`/admin/${adminId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const adminData = await response.json();
                console.log('Admin Data:', adminData);
                const welcomeCard = document.querySelector('.welcome-card h2');
                if (welcomeCard) {
                    welcomeCard.textContent = adminData && adminData.username ? `Welcome ${adminData.username},` : 'Welcome,';
                } else {
                    console.error('Element .welcome-card h2 not found');
                }
                const welcomeParagraph = document.querySelector('.welcome-card p');
                if (welcomeParagraph) {
                    welcomeParagraph.textContent = 'Welcome to the admin panel';
                } else {
                    console.error('Element .welcome-card p not found');
                }
            } else if (response.status === 401) {
                handleUnauthorized();
            } else {
                console.error('Error fetching admin details:', await response.json());
            }
        } catch (error) {
            console.error('Error fetching admin details:', error);
        }
    }

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminId');
            window.location.href = 'index.html';
        });
    }

    async function fetchClientCount() {
        const token = localStorage.getItem('adminToken');
        try {
            const response = await fetch('/clients-count', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const countData = await response.json();
            if (response.ok) {
                updateClientCounts(countData);
            } else {
                console.error('Error fetching client count:', countData.error);
            }
        } catch (error) {
            console.error('Error fetching client count:', error);
        }
    }

    function updateClientCounts(countData) {
        const totalClientsElement = document.getElementById('visitorsTotalClients');
        if (totalClientsElement) {
            totalClientsElement.textContent = countData.totalClientsCount;
        } else {
            console.error('Element #visitorsTotalClients not found');
        }
        const todayClientsElement = document.getElementById('visitorsTodayClients');
        if (todayClientsElement) {
            todayClientsElement.textContent = countData.todayClientsCount;
        } else {
            console.error('Element #visitorsTodayClients not found');
        }
        const weekClientsElement = document.getElementById('visitorsWeekClients');
        if (weekClientsElement) {
            weekClientsElement.textContent = countData.weekClientsCount;
        } else {
            console.error('Element #visitorsWeekClients not found');
        }
        const monthClientsElement = document.getElementById('visitorsMonthClients');
        if (monthClientsElement) {
            monthClientsElement.textContent = countData.monthClientsCount;
        } else {
            console.error('Element #visitorsMonthClients not found');
        }

        // Update circle charts with fetched data
        updateCircleCharts(countData);
    }

    
    async function fetchVisitorDetails(filter) {
        const token = localStorage.getItem('adminToken');
        try {
            const response = await fetch(`/visitor-details?filter=${filter}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const visitorDetails = await response.json();
                console.log('Visitor Details:', visitorDetails); // Log visitor details to verify faceImage
                renderVisitorDetails(visitorDetails);
            } else {
                console.error('Error fetching visitor details');
            }
        } catch (error) {
            console.error('Error fetching visitor details:', error);
        }
    }
   // Function to render visitor details in the table
function renderVisitorDetails(visitorDetails) {
    const tableBody = document.getElementById('visitorsTableBody');
    tableBody.innerHTML = ''; // Clear existing rows
    visitorDetails.forEach((visitor, index) => {
        const createdAt = new Date(visitor.createdAt);
        const formattedDate = `${String(createdAt.getDate()).padStart(2, '0')}/${String(createdAt.getMonth() + 1).padStart(2, '0')}/${createdAt.getFullYear()}`;

        // Use visitor's faceImage if available, otherwise use a placeholder image
        const faceImageUrl = visitor.faceImage ? `/images/${visitor.faceImage}` : 'https://via.placeholder.com/80';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="py-2 px-4">
                <img src="${faceImageUrl}" alt="Profile" class="profile-img" style="width: 50px; height: 50px; border-radius: 50%;">
            </td>
            <td class="p-2">${visitor.name}</td>
            <td class="p-2">${formattedDate}</td>
            <td class="p-2">${visitor.companyName || 'N/A'}</td>
            <td class="p-2">${visitor.phone}</td>
            <td class="p-2">${visitor.email}</td>
            <td class="p-2">
                <select id="status-${index}" class="bg-gray-700 p-1 rounded" data-visitor-id="${visitor._id}">
                    <option value="qualified" ${visitor.status === 'qualified' ? 'selected' : ''}>Qualified</option>
                    <option value="on-hold" ${visitor.status === 'on-hold' ? 'selected' : ''}>On Hold</option>
                    <option value="not-relevant" ${visitor.status === 'not-relevant' ? 'selected' : ''}>Not Relevant</option>
                </select>
            </td>
            <td class="p-2">
                <button class="save-button" data-visitor-id="${visitor._id}" style="padding: 5px 10px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">Save</button>
            </td>
        `;
        tableBody.appendChild(row);
    });


    // Add event listeners to save buttons
    document.querySelectorAll('.save-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            const visitorId = event.target.dataset.visitorId;
            const selectElement = document.querySelector(`select[data-visitor-id="${visitorId}"]`);
            if (!selectElement) {
                console.error('Select element not found for visitorId:', visitorId);
                return;
            }
            const newStatus = selectElement.value;
            try {
                const response = await fetch(`/visitors/${visitorId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    },
                    body: JSON.stringify({ status: newStatus })
                });
                if (response.ok) {
                    alert('Status updated successfully');
                } else {
                    console.error('Error updating status');
                }
            } catch (error) {
                console.error('Error updating status:', error);
            }
        });
    });
}


// Dropdown menu functionality
const dropdownButton = document.getElementById('dropdownButton');
const dropdownMenu = document.getElementById('dropdownMenu');

dropdownButton.addEventListener('click', function() {
    dropdownMenu.classList.toggle('hidden');
});

// Handle dropdown item click
dropdownMenu.addEventListener('click', function(event) {
    const filter = event.target.getAttribute('data-filter');
    if (filter) {
        fetchVisitorDetails(filter);
        dropdownMenu.classList.add('hidden');
    }
});

// Close the dropdown when clicking outside of it
document.addEventListener('click', function(event) {
    if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.classList.add('hidden');
    }
});

fetchAdminDetails(); 
fetchVisitorDetails('all'); 
    fetchAdminDetails();
    fetchClientCount();
    // fetchVisitorDetails('total'); 
 
    
});

// document.addEventListener('DOMContentLoaded', () => {
//     async function fetchClientCounts() {
//         const token = localStorage.getItem('adminToken');
//         try {
//             const response = await fetch('/api/client-counts', {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 }
//             });

//             if (response.ok) {
//                 const counts = await response.json();
//                 createCharts(counts);
//             } else {
//                 console.error('Error fetching client counts');
//             }
//         } catch (error) {
//             console.error('Error fetching client counts:', error);
//         }
//     }

//     function createCharts(counts) {
//         const categories = [
//             { id: 'customers', label: 'Customers', value: counts.customers, color: '#7221FD' },
//             { id: 'manufacturers', label: 'Manufacturers', value: counts.manufacturers, color: '#7221FD' },
//             { id: 'serviceProviders', label: 'Service Providers', value: counts.serviceProviders, color: '#7221FD' },
//             { id: 'channelPartners', label: 'Channel Partners', value: counts.channelPartners, color: '#7221FD' },
//             { id: 'investors', label: 'Investors', value: counts.investors, color: '#7221FD' },
//             { id: 'domainExperts', label: 'Domain Experts', value: counts.domainExperts, color: '#7221FD' },
//         ];

//         categories.forEach(category => {
//             createCircleChart(category.id, category.value, category.color);
//         });
//     }
//     fetchClientCounts();
    
    
    
//     // Initialize qualified lead page
//     function initQualifiedLeadPage(status) {
//         showContent('content-qualified-lead');
//         populateQualifiedLeadTable(status);
//     }

//     // Function to render qualified leads in the table
//     async function populateQualifiedLeadTable(status) {
//         const tableBody = document.getElementById('qualifiedLeadTableBody');
//         if (!tableBody) {
//             console.error('Table body with ID "qualifiedLeadTableBody" not found.');
//             return;
//         }

//         const token = localStorage.getItem('adminToken');
//         try {
//             console.log('Fetching qualified leads with status:', status);
//             const response = await fetch(`/api/clients?status=${status}`, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 }
//             });

//             if (response.ok) {
//                 const qualifiedLeads = await response.json();
//                 renderQualifiedLeads(qualifiedLeads);
//             } else {
//                 console.error('Error fetching qualified leads');
//             }
//         } catch (error) {
//             console.error('Error fetching qualified leads:', error);
//         }
//     }

//     function renderQualifiedLeads(qualifiedLeads) {
//         const tableBody = document.getElementById('qualifiedLeadTableBody');
//         tableBody.innerHTML = ''; // Clear existing rows
//         qualifiedLeads.forEach((lead, index) => {
//             const createdAt = new Date(lead.createdAt);
//             const formattedDate = `${String(createdAt.getDate()).padStart(2, '0')}/${String(createdAt.getMonth() + 1).padStart(2, '0')}/${createdAt.getFullYear()}`;
    
//             // Use lead's faceImage if available, otherwise use a placeholder image
//             const faceImageUrl = lead.faceImage ? `/images/${lead.faceImage}` : 'https://via.placeholder.com/80';
            
//             const row = document.createElement('tr');
//             row.innerHTML = `
//                 <td class="py-2 px-4">
//                     <img src="${faceImageUrl}" alt="Profile" class="profile-img" style="width: 50px; height: 50px; border-radius: 50%;">
//                 </td>
//                 <td class="p-2">${lead.name}</td>
//                 <td class="p-2">${formattedDate}</td>
//                 <td class="p-2">${lead.companyName || 'N/A'}</td>
//                 <td class="p-2">${lead.phone}</td>
//                 <td class="p-2">${lead.email}</td>
//                 <td class="p-2">
//                     <select id="lead-status-${index}" class="bg-gray-700 p-1 rounded" data-lead-id="${lead._id}">
//                         <option value="qualified" ${lead.status === 'qualified' ? 'selected' : ''}>Qualified</option>
//                         <option value="on-hold" ${lead.status === 'on-hold' ? 'selected' : ''}>On Hold</option>
//                         <option value="not-relevant" ${lead.status === 'not-relevant' ? 'selected' : ''}>Not Relevant</option>
//                     </select>
//                 </td>
//                 <td class="p-2">
//                     ${lead.status === 'qualified' ? `
//                         <button class="add-fields-button" data-lead-id="${lead._id}" style="margin-right: 10px; padding: 5px 10px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Add Fields</button>
//                     ` : ''}
//                     <button class="lead-save-button" data-lead-id="${lead._id}" style="padding: 5px 10px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">Save</button>
//                     <button class="go-to-mom-button" data-lead-id="${lead._id}" style="padding: 5px 10px; background-color: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer;">LOG_MOM</button>
//                 </td>
//             `;
//             tableBody.appendChild(row);
//         });
    
    
//         // Add event listeners to "Add Fields" buttons
//         document.querySelectorAll('.add-fields-button').forEach(button => {
//             button.addEventListener('click', function(event) {
//                 const leadId = event.target.dataset.leadId;
//                 localStorage.setItem('leadId', leadId);
//                 window.location.href = `/profile_data_entry.html?leadId=${leadId}`;
//             });
//         });
    
//         // Add event listeners to "Go to MoM" buttons
// document.querySelectorAll('.go-to-mom-button').forEach(button => {
//     button.addEventListener('click', function(event) {
//         const leadId = event.target.dataset.leadId;
//         localStorage.setItem('leadId', leadId);
//         window.location.href = `/mom.html?leadId=${leadId}`;
//     });
// });

    

//         // Add event listeners to save buttons
//         document.querySelectorAll('.lead-save-button').forEach(button => {
//             button.addEventListener('click', async (event) => {
//                 const leadId = event.target.dataset.leadId;
//                 // Find the select element by its unique ID
//                 const selectElement = document.querySelector(`select[data-lead-id="${leadId}"]`);
//                 if (!selectElement) {
//                     console.error('Select element not found for leadId:', leadId);
//                     return;
//                 }
//                 const newStatus = selectElement.value;
//                 try {
//                     const response = await fetch(`/clients/${leadId}/status`, {
//                         method: 'PUT',
//                         headers: {
//                             'Content-Type': 'application/json',
//                             'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
//                         },
//                         body: JSON.stringify({ status: newStatus })
//                     });
//                     if (response.ok) {
//                         alert('Status updated successfully');
//                     } else {
//                         console.error('Error updating status');
//                     }
//                 } catch (error) {
//                     console.error('Error updating status:', error);
//                 }
//             });
//         });
//     }


//     // Set up sidebar dropdown for Qualified Leads
//     function setupQualifiedLeadsDropdown() {
//         const qualifiedLeadItem = document.getElementById('nav-qualified-lead');
//         if (!qualifiedLeadItem) {
//             console.error('Element with ID "nav-qualified-lead" not found.');
//             return;
//         }
//         qualifiedLeadItem.classList.add('has-submenu');

//         const submenu = document.createElement('ul');
//         submenu.className = 'pl-4 mt-2 space-y-2 hidden';
//         submenu.innerHTML = `
//             <li id="nav-qualified-lead-qualified" class="cursor-pointer">Qualified</li>
//             <li id="nav-qualified-lead-on-hold" class="cursor-pointer">On Hold</li>
//             <li id="nav-qualified-lead-not-relevant" class="cursor-pointer">Not Relevant</li>
//         `;

//         qualifiedLeadItem.appendChild(submenu);

//         qualifiedLeadItem.addEventListener('click', function(e) {
//             e.stopPropagation();
//             submenu.classList.toggle('hidden');
//         });

//         ['qualified', 'on-hold', 'not-relevant'].forEach(status => {
//             const element = document.getElementById(`nav-qualified-lead-${status}`);
//             if (element) {
//                 element.addEventListener('click', function(e) {
//                     e.stopPropagation();
//                     initQualifiedLeadPage(status);
//                 });
//             } else {
//                 console.error(`Element with ID "nav-qualified-lead-${status}" not found.`);
//             }
//         });
//     }

//     setupQualifiedLeadsDropdown();
// });


// <--------------Stratergy partner content start ---->

document.addEventListener('DOMContentLoaded', () => {

    // Function to initialize and show the "Stratergy Partner" page
    function initStratergyPartnerPage() {
        // Show the 'Stratergy Partner' content (remove hidden class)
        showContent('content-stratergy-partner');

        // Populate the strategy partner table
        fetchStrategyPartnerData();
    }

    // Function to show the content by ID (remove the hidden class from the div)
    function showContent(contentId) {
        // Hide other content if necessary
        document.querySelectorAll('.content').forEach(content => {
            content.classList.add('hidden');  // Hide all other sections
        });

        // Show the target content
        const targetContent = document.getElementById(contentId);
        if (targetContent) {
            targetContent.classList.remove('hidden');  // Show the selected section
        }
    }

    // Set up the event listener for the "Stratergy Partners" sidebar item
    const strategyPartnerNavItem = document.getElementById('nav-stratergy-partner');
    if (strategyPartnerNavItem) {
        strategyPartnerNavItem.addEventListener('click', initStratergyPartnerPage);
    }

    // Function to fetch and populate strategy partner data (adjust as per previous instructions)
    async function fetchStrategyPartnerData() {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/syndicates?=id', {  // Replace with correct API endpoint
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                populateStrategyPartnerTable(data);
            } else {
                console.error('Error fetching strategy partner data');
            }
        } catch (error) {
            console.error('Error fetching strategy partner data:', error);
        }
    }

    // Function to populate the strategy partner table (already defined above)
    function populateStrategyPartnerTable(data) {
        const tableBody = document.getElementById('strategyPartnerTableBody');
        tableBody.innerHTML = ''; // Clear any existing rows

        data.forEach(syndicates => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="p-2 border border-gray-700">${syndicates._id.$oid}</td>
                <td class="p-2 border border-gray-700">${syndicates.user_id}</td>
                <td class="p-2 border border-gray-700">${syndicates.syndicate_name}</td>
                <td class="p-2 border border-gray-700">${syndicates.password}</td>
                <td class="p-2 border border-gray-700">${syndicates.department}</td>
                <td class="p-2 border border-gray-700">${syndicates.__v}</td>
            `;
            tableBody.appendChild(row);
        });
    }
});


// <--------------Stratergy partner content ends ---->


// Navigation functionality
function showContent(contentId) {
    document.querySelectorAll('[id^="content-"]').forEach(el => el.style.display = 'none');
    const contentElement = document.getElementById(contentId);
    if (contentElement) {
        console.log('Displaying content:', contentId); // Add this line
        contentElement.style.display = 'block';
    }
}


document.querySelectorAll('nav li').forEach(el => {
    el.addEventListener('click', function() {
        console.log('Navigation item clicked:', this.id); // Add this line
        if (!this.classList.contains('has-submenu')) {
            document.querySelectorAll('nav li').forEach(item => item.classList.remove('bg-gray-700'));
            this.classList.add('bg-gray-700');
            const contentId = 'content-' + this.id.split('-')[1];
            showContent(contentId);
            if (contentId === 'content-business-proposal') {
                initBusinessProposalPage();
            }
        }
    });
});

    function createCircleChart(id, value, color) {
        const canvas = document.getElementById(id);
        if (!canvas) {
            console.error(`Canvas element with id ${id} not found`);
            return;
        }
    
        console.log(`Creating chart for ${id} with value ${value}`); // Add this line
    
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before drawing
    
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
    
        // Background circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#333';
        ctx.stroke();
    
        // Progress arc
        const startAngle = -0.5 * Math.PI;
        const endAngle = startAngle + (2 * Math.PI * value / 100);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.strokeStyle = color;
        ctx.lineWidth = 10;
        ctx.stroke();
    
        // Center text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(value.toString(), centerX, centerY);
    }
    

function updateCircleCharts(countData) {
    createCircleChart('totalClients', countData.totalClientsCount, '#7221FD');
    createCircleChart('todayClients', countData.todayClientsCount, '#7221FD');
    createCircleChart('weekClients', countData.weekClientsCount, '#7221FD');
    createCircleChart('monthClients', countData.monthClientsCount, '#7221FD');
    createCircleChart('visitorsTotalClients', countData.totalClientsCount, '#7221FD');
    createCircleChart('visitorsTodayClients', countData.todayClientsCount, '#7221FD');
    createCircleChart('visitorsWeekClients', countData.weekClientsCount, '#7221FD');
    createCircleChart('visitorsMonthClients', countData.monthClientsCount, '#7221FD');
}

// Header functionality
document.getElementById('notificationButton').addEventListener('click', function() {
    var dropdown = document.getElementById('notificationDropdown');
    dropdown.classList.toggle('hidden');
});

document.getElementById('profileButton').addEventListener('click', function() {
    var dropdown = document.getElementById('profileDropdown');
    dropdown.classList.toggle('hidden');
});

document.addEventListener('click', function(event) {
    var isClickInsideNotification = document.getElementById('notificationButton').contains(event.target);
    var isClickInsideProfile = document.getElementById('profileButton').contains(event.target);

    if (!isClickInsideNotification) {
        document.getElementById('notificationDropdown').classList.add('hidden');
    }

    if (!isClickInsideProfile) {
        document.getElementById('profileDropdown').classList.add('hidden');
    }
});

document.addEventListener('DOMContentLoaded', async function () {
    const token = localStorage.getItem('adminToken');

    // Function to fetch client counts from the backend
    async function fetchClientCounts() {
        try {
            const response = await fetch('/api/client-counts', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const counts = await response.json();
                createCharts(counts);
                createBarGraph(counts);
            } else {
                console.error('Error fetching client counts');
            }
        } catch (error) {
            console.error('Error fetching client counts:', error);
        }
    }

    // Function to create the bar graph
    function createBarGraph(counts) {
        const data = [
            { label: "Customers", value: counts.customers, max: Math.max(counts.customers, 25) },
            { label: "Service Providers", value: counts.serviceProviders, max: Math.max(counts.serviceProviders, 25) },
            { label: "Manufacturers", value: counts.manufacturers, max: Math.max(counts.manufacturers, 25) },
            { label: "Channel Partners", value: counts.channelPartners, max: Math.max(counts.channelPartners, 25) },
            { label: "Investors", value: counts.investors, max: Math.max(counts.investors, 25) },
            { label: "Domain Experts", value: counts.domainExperts, max: Math.max(counts.domainExperts, 25) },
        ];

        const container = document.getElementById('barGraph');
        container.innerHTML = ''; // Clear the existing content

        data.forEach(item => {
            const percentage = (item.value / item.max) * 100;
            const barElement = `
                <div class="mb-4 custom_size">
                    <div class="flex justify-between mb-2">
                        <span class="text-white">${item.label}</span>
                        <span class="text-white">${item.value}</span>
                    </div>
                    <div class="w-full bg-white rounded-full" style="height: 5px;">
                        <div class="bg-purple-500 rounded-full" style="height: 5px; width: ${percentage}%;"></div>
                    </div>
                </div>
            `;
            container.innerHTML += barElement;
        });
    }

    // Function to create and update the donut chart
    function createCharts(counts) {
        const chartOptions = getChartOptions();

        // Update the series and labels to include all categories
        chartOptions.series = [
            counts.customers || 0,
            counts.serviceProviders || 0,
            counts.manufacturers || 0,
            counts.channelPartners || 0,
            counts.investors || 0,
            counts.domainExperts || 0
        ];

        chartOptions.labels = [
            "Customers", "Service Providers", "Manufacturers", "Channel Partners", "Investors", "Domain Experts"
        ];

        const chartElement = document.querySelector("#pieChart");
        const chart = new ApexCharts(chartElement, chartOptions);
        chart.render();

        // Handle checkbox updates for the donut chart
        handleCheckboxUpdates(chart);
    }

    // Function to get chart options
    function getChartOptions() {
        return {
            series: [],
            colors: ["#369FFF", "#2D246B", "#51546F", "#4154FF", "#FF5733", "#FFBD33"], // Add more colors for additional series
            chart: {
                height: 320,
                width: "100%",
                type: "donut",
            },
            stroke: {
                colors: ['#1F2937'],
                width: 4
            },
            plotOptions: {
                pie: {
                    donut: {
                        labels: {
                            show: true,
                            name: {
                                show: true,
                                fontFamily: "Poppins, sans-serif",
                                offsetY: 20,
                                color: "white",
                                className: "apexcharts-datalabel-label"
                            },
                            total: {
                                showAlways: true,
                                show: true,
                                label: "Proposal Status",
                                fontSize: "17px",
                                fontFamily: "Poppins, sans-serif",
                                fontWeight: "bold",
                                color: "white",
                                formatter: function (w) {
                                    const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                    return sum + ' visitors';
                                },
                            },
                            value: {
                                show: false,
                                fontFamily: "Poppins, sans-serif",
                                offsetY: -0,
                                formatter: function (value) {
                                    return value + " visitors";
                                },
                            },
                        },
                        size: "80%",
                    },
                },
            },
            grid: {
                padding: {
                    top: -2,
                }
            },
            labels: [],
            dataLabels: {
                enabled: false,
                color: "white"
            },
            legend: {
                position: "bottom",
                fontFamily: "Poppins, sans-serif",
                color: "white",
            },
            yaxis: {
                labels: {
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: "bold",
                    color: "white",
                    formatter: function (value) {
                        return value + " visitors";
                    },
                },
            },
            xaxis: {
                labels: {
                    color: "white",
                    formatter: function (value) {
                        return value + " visitors";
                    },
                },
                axisTicks: {
                    show: false,
                },
                axisBorder: {
                    show: false,
                },
            },
        };
    }

    // Function to handle checkbox updates for the donut chart
    function handleCheckboxUpdates(chart) {
        // Get all the checkboxes by their class name
        const checkboxes = document.querySelectorAll('#devices input[type="checkbox"]');

        // Function to handle the checkbox change event
        function handleCheckboxChange(event) {
            const checkbox = event.target;
            if (checkbox.checked) {
                switch (checkbox.value) {
                    case 'desktop':
                        chart.updateSeries([15.1, 22.5, 4.4, 8.4, 5.1, 3.3]); // Update series to match all categories
                        break;
                    case 'tablet':
                        chart.updateSeries([25.1, 26.5, 1.4, 3.4, 2.0, 4.0]);
                        break;
                    case 'mobile':
                        chart.updateSeries([45.1, 27.5, 8.4, 2.4, 3.1, 1.8]);
                        break;
                    default:
                        chart.updateSeries([55.1, 28.5, 1.4, 5.4, 4.5, 2.2]);
                }
            } else {
                chart.updateSeries([35.1, 23.5, 2.4, 5.4, 1.9, 3.2]);
            }
        }

        // Attach the event listener to each checkbox
        checkboxes.forEach((checkbox) => {
            checkbox.addEventListener('change', handleCheckboxChange);
        });
    }

    await fetchClientCounts();
});

// create circle charts
function setProgress(element, percent) {
    const progressRing = element.querySelector('.progress-ring');
    const progressText = element.querySelector('.progressText');
    const circumference = 2 * Math.PI * 15.91549430918954;
    const offset = circumference - (percent / 100) * circumference;
    progressRing.style.strokeDashoffset = offset;
    progressText.textContent = percent.toString().padStart(2, '0');
}


// Populate business proposal table
function populateBusinessProposalTable() {
    const tableBody = document.getElementById('businessProposalTableBody');
    const token = localStorage.getItem('adminToken');
    
    fetch('/api/clients?status=qualified', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        tableBody.innerHTML = ''; // Clear existing rows
        data.forEach((proposal, index) => {
            // Use proposal's faceImage if available, otherwise use a placeholder image
            const faceImageUrl = proposal.faceImage ? `/images/${proposal.faceImage}` : 'https://via.placeholder.com/80';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-2 px-4">
                    <img src="${faceImageUrl}" alt="Profile" class="profile-img" style="width: 50px; height: 50px; border-radius: 50%;">
                </td>
                <td class="p-2">${proposal.name}</td>
                <td class="p-2">${formatDate(proposal.createdAt)}</td>
                <td class="p-2">${proposal.companyName}</td>
                <td class="p-2">${proposal.phone}</td>
                <td class="p-2">${proposal.email}</td>
                <td class="p-2">
                    <button class="make-proposal-button text-blue-400 hover:text-blue-300" data-proposal-id="${proposal._id}">Make Proposal</button>
                </td>
                <td class="p-2 ${getStatusColor(proposal.buisnessproposalstatus)}">
                    <select id="status-${index}" class="bg-gray-700 p-1 rounded" data-proposal-id="${proposal._id}">
                        <option value="Accepted" ${proposal.buisnessproposalstatus === 'Accepted' ? 'selected' : ''}>Accepted</option>
                        <option value="In Progress" ${proposal.buisnessproposalstatus === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="In Discussion" ${proposal.buisnessproposalstatus === 'In Discussion' ? 'selected' : ''}>In Discussion</option>
                        <option value="Offered" ${proposal.buisnessproposalstatus === 'Offered' ? 'selected' : ''}>Offered</option>
                    </select>
                </td>
                <td class="p-2">
                    <button class="save-button " data-proposal-id="${proposal._id}" >Save</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

           // Add event listener to all Make Proposal buttons
           document.querySelectorAll('.make-proposal-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const proposalId = event.target.getAttribute('data-proposal-id');
                localStorage.setItem('proposalId', proposalId);
                window.location.href = 'buisness_proposal_entry.html';
            });
        });
        

  // Add event listeners to save buttons
document.querySelectorAll('.save-button').forEach(button => {
    button.addEventListener('click', async (event) => {
        const proposalId = event.target.dataset.proposalId;
        const selectElement = document.querySelector(`select[data-proposal-id="${proposalId}"]`);
        const newStatus = selectElement.value;

        try {
            const response = await fetch(`/api/buisness/clients/${proposalId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({ buisnessproposalstatus: newStatus })
            });
            if (response.ok) {
                alert('Status updated successfully');
            } else {
                console.error('Error updating status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    });
});

    })
    .catch(error => {
        console.error('Error fetching business proposals:', error);
    });
}
// Fetch and update the counts
function fetchBusinessProposalCounts() {
    fetch('/api/clients/counts', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
    })
    .then(response => response.json())
    .then(countData => {
        const counts = {
            'Accepted': 0,
            'In Progress': 0,
            'In Discussion': 0,
            'Offered': 0
        };

        countData.forEach(item => {
            counts[item._id] = item.count;
        });

        createCircleChart('acceptedClients', counts['Accepted'], '#7221FD');
        createCircleChart('inProgressClients', counts['In Progress'], '#7221FD');
        createCircleChart('inDiscussionClients', counts['In Discussion'], '#7221FD');
        createCircleChart('OfferedClients', counts['Offered'], '#7221FD');
          // Update the donut chart series
          if (typeof ApexCharts !== 'undefined' && document.getElementById("donut-chart")) {
            const chart = new ApexCharts(document.getElementById("donut-chart"), getChartOptions(counts));
            chart.render();
        }
    })
    .catch(error => {
        console.error('Error fetching counts:', error);
    });
}

// Helper function to get status color
function getStatusColor(status) {
    switch (status) {
        case 'Accepted':
            return 'text-green-400';
        case 'In Progress':
            return 'text-yellow-400';
        case 'In Discussion':
            return 'text-blue-400';
        case 'Offered':
            return 'text-purple-400';
        default:
            return 'text-gray-400';
    }
}

// Initialize business proposal page
function initBusinessProposalPage() {
    showContent('content-business-proposal');
    fetchBusinessProposalCounts();
    populateBusinessProposalTable();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nav-business-proposal').addEventListener('click', initBusinessProposalPage);
});

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    return `${day}/${month}`;
}


// customer



// Customer data
// Create circle charts
function createCircleChart(id, value, color) {
    const canvas = document.getElementById(id);
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Progress arc
    const startAngle = -0.5 * Math.PI;
    const endAngle = startAngle + (2 * Math.PI * value / 100);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = 10;
    ctx.stroke();

    // Center text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value.toString().padStart(2, '0'), centerX, centerY);
}

// Fetch and update customer counts
function fetchCustomerCounts() {
    fetch('/api/clients/counts', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
    })
    .then(response => response.json())
    .then(countData => {
        const counts = {
            'Accepted': 0,
            'In Progress': 0,
            'In Discussion': 0,
            'Offered': 0
        };

        countData.forEach(item => {
            counts[item._id] = item.count;
        });

        createCircleChart('customerAccepted', counts['Accepted'], '#7221FD');
        createCircleChart('customerDiscussion', counts['In Discussion'], '#7221FD');
        createCircleChart('customerOffered', counts['Offered'], '#7221FD');
        createCircleChart('customerProgress', counts['In Progress'], '#7221FD');
    })
    .catch(error => {
        console.error('Error fetching counts:', error);
    });
}
// Populate customer table
function populateCustomerTable() {
    const tableBody = document.getElementById('customerTableBody');
    const token = localStorage.getItem('adminToken');
    
    fetch('/api/clients?status=qualified', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        tableBody.innerHTML = ''; // Clear existing rows
        data.forEach((client) => {
            // Use client's faceImage if available, otherwise use a placeholder image
            const faceImageUrl = client.faceImage ? `/images/${client.faceImage}` : 'https://via.placeholder.com/80';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-2 px-4">
                    <img src="${faceImageUrl}" alt="Profile" class="profile-img" style="width: 50px; height: 50px; border-radius: 50%;">
                </td>
                <td class="p-2">${client.name}</td>
                <td class="p-2">${new Date(client.createdAt).toLocaleDateString()}</td>
                <td class="p-2">${client.companyName}</td>
                <td class="p-2">${client.phone}</td>
                <td class="p-2">${client.email}</td>
                <td class="p-2">
                    <button class="view-profile-button text-blue-400 hover:text-blue-300" data-client-id="${client._id}">View Profile</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
 

        // Add event listener to all View Profile buttons
        document.querySelectorAll('.view-profile-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const clientId = event.target.getAttribute('data-client-id');
                localStorage.setItem('clientId', clientId); // Store clientId in localStorage
                window.location.href = 'customer_view.html'; // Redirect to customerview.html
            });
        });
    })
    .catch(error => {
        console.error('Error fetching clients:', error);
    });
}

// Initialize customer page
function initCustomerPage() {
    fetchCustomerCounts();
    populateCustomerTable();
}

// Call the function to initialize the customer page when the content is shown
document.getElementById('nav-customer').addEventListener('click', function() {
    initCustomerPage();
});



// advanced search filter 
document.addEventListener('DOMContentLoaded', () => {
    const advancedSearchButton = document.getElementById('advancedSearchButton');
    const searchModal = document.getElementById('searchModal');
    const closeModalButton = document.getElementById('closeModalButton');
    const advancedSearchForm = document.getElementById('advancedSearchForm');

    advancedSearchButton.addEventListener('click', () => {
        searchModal.classList.remove('hidden');
    });

    closeModalButton.addEventListener('click', () => {
        searchModal.classList.add('hidden');
    });

    advancedSearchForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const searchFields = Array.from(advancedSearchForm.elements['searchFields'])
            .filter(input => input.checked)
            .map(input => input.value);
        
        if (searchFields.length === 0) {
            alert('Please select at least one search criteria.');
            return;
        }

        await performAdvancedSearch(searchFields);
        searchModal.classList.add('hidden'); // Close modal after search
    });

    async function performAdvancedSearch(searchFields) {
        const token = localStorage.getItem('adminToken');
        try {
            const response = await fetch(`/advanced-search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ searchFields })
            });
            const result = await response.json();
            if (response.ok) {
                updateTableWithSearchResults(result);
            } else {
                console.error('Error performing advanced search:', result.error);
            }
        } catch (error) {
            console.error('Error performing advanced search:', error);
        }
    }

    function updateTableWithSearchResults(data) {
        const visitorsTableBody = document.getElementById('visitorsTableBody');
        visitorsTableBody.innerHTML = ''; // Clear existing table rows

        if (data.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="7" class="p-2 text-center">No clients available</td>
            `;
            visitorsTableBody.appendChild(row);
        } else {
            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="p-2">${item.name || ''}</td>
                    <td class="p-2">${new Date(item.createdAt).toLocaleDateString() || ''}</td>
                    <td class="p-2">${item.companyName || ''}</td>
                    <td class="p-2">${item.phone || ''}</td>
                    <td class="p-2">${item.email || ''}</td>
                    <td class="p-2">${item.action || ''}</td>
                    <td class="p-2">${item.status || ''}</td>
                `;
                visitorsTableBody.appendChild(row);
            });
        }
    }   
});



