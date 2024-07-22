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
                console.log('Welcome Card Element:', welcomeCard);  // Debugging statement
                if (welcomeCard) {
                    welcomeCard.textContent = adminData && adminData.username ? `Welcome ${adminData.username},` : 'Welcome,';
                } else {
                    console.error('Element .welcome-card h2 not found');
                }
                const welcomeParagraph = document.querySelector('.welcome-card p');
                console.log('Welcome Paragraph Element:', welcomeParagraph);  // Debugging statement
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
                console.log('Client Count Data:', countData); // Add this line to debug
                const totalClientsElement = document.getElementById('visitorsTotalClients');
                console.log('Total Clients Element:', totalClientsElement);  // Debugging statement
                if (totalClientsElement) {
                    totalClientsElement.textContent = countData.totalClientsCount;
                } else {
                    console.error('Element #visitorsTotalClients not found');
                }
                const todayClientsElement = document.getElementById('visitorsTodayClients');
                console.log('Today Clients Element:', todayClientsElement);  // Debugging statement
                if (todayClientsElement) {
                    todayClientsElement.textContent = countData.todayClientsCount;
                } else {
                    console.error('Element #visitorsTodayClients not found');
                }
                const weekClientsElement = document.getElementById('visitorsWeekClients');
                console.log('Week Clients Element:', weekClientsElement);  // Debugging statement
                if (weekClientsElement) {
                    weekClientsElement.textContent = countData.weekClientsCount;
                } else {
                    console.error('Element #visitorsWeekClients not found');
                }
                const monthClientsElement = document.getElementById('visitorsMonthClients');
                console.log('Month Clients Element:', monthClientsElement);  // Debugging statement
                if (monthClientsElement) {
                    monthClientsElement.textContent = countData.monthClientsCount;
                } else {
                    console.error('Element #visitorsMonthClients not found');
                }

                // Update circle charts with fetched data
                updateCircleCharts(countData);

            } else {
                console.error('Error fetching client count:', countData.error);
            }
        } catch (error) {
            console.error('Error fetching client count:', error);
        }
    }
    
    fetchAdminDetails();
    fetchClientCount();
});

function createCircleChart(id, value, color) {
    const canvas = document.getElementById(id);
    if (!canvas) {
        console.error(`Canvas element with id ${id} not found`);
        return;
    }

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



// Business Proposal data
const businessProposalData = [
    { name: 'John Doe', date: '15/07', company: 'ABC Corp', phone: '1234567890', email: 'john@example.com', status: 'Accepted' },
    { name: 'Jane Smith', date: '16/07', company: 'XYZ Ltd', phone: '9876543210', email: 'jane@example.com', status: 'In Progress' },
    { name: 'Bob Johnson', date: '17/07', company: '123 Inc', phone: '5555555555', email: 'bob@example.com', status: 'In Discussion' },
    { name: 'Alice Brown', date: '18/07', company: 'Tech Co', phone: '1112223333', email: 'alice@example.com', status: 'Offered' },
    { name: 'Charlie Davis', date: '19/07', company: 'Innovate Inc', phone: '4445556666', email: 'charlie@example.com', status: 'Accepted' },
];


// Navigation functionality
function showContent(contentId) {
    document.querySelectorAll('[id^="content-"]').forEach(el => el.style.display = 'none');
    document.getElementById(contentId).style.display = 'block';
}

document.querySelectorAll('nav li').forEach(el => {
    el.addEventListener('click', function() {
        if (!this.classList.contains('has-submenu')) {
            document.querySelectorAll('nav li').forEach(item => item.classList.remove('bg-gray-700'));
            this.classList.add('bg-gray-700');
            showContent('content-' + this.id.split('-')[1]);
        }
    });
});


//Header 
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




// Projects Chart
document.addEventListener('DOMContentLoaded', function () {
       // Data for the horizontal bar chart
       const data = [
        { label: "Customers", value: 5, max: 25 },
        { label: "Service Providers", value: 5, max: 25 },
        { label: "Manufacturers", value: 15, max: 25 },
        { label: "Channel Providers", value: 20, max: 25 },
        { label: "Investors", value: 20, max: 25 },
        { label: "Domain Expert", value: 20, max: 25 },
    ];
    
    const container = document.getElementById('barGraph');
    
    data.forEach(item => {
        const percentage = (item.value / item.max) * 100;
        const barElement = `
            <div class="mb-4 custom_size">
                <div class="flex justify-between mb-2">
                    <span class="text-white">${item.label}</span>
                    <span class="text-white">${item.value}</span>
                </div>
                <div class="w-full bg-white rounded-full " style="height: 5px;"> <!-- Decrease the height here -->
                    <div class="bg-purple-500 rounded-full" style="height: 5px; width: ${percentage}%;"></div> <!-- Decrease the height here -->
                </div>
            </div>
        `;
        container.innerHTML += barElement;
    });
    
    // circle - pie chart
    const getChartOptions = () => {
        return {
            series: [5.1, 4.5, 4.4, 5.4 ],
            colors: ["#369FFF", "#2D246B", "#51546F", "#4154FF" ],
            chart: {
                height: 320,
                width: "100%",
                type: "donut",
            },
            stroke: {
                colors: ['#1F2937'],  // Set the stroke color to match your background color
                width: 4 // Set the stroke width to create the spacing effect
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
                                    const sum = w.globals.seriesTotals.reduce((a, b) => {
                                        return a + b
                                    }, 0)
                                    return sum + ' visitors'
                                },
                            },
                            value: {
                                show: false,
                                fontFamily: "Poppins, sans-serif",
                                offsetY: -0,
                                formatter: function (value) {
                                    return value + " " + "visitors"
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
            labels: ["Discussion",
                "Offered",
                "Rejected",
                "Accepted",
            ],
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
                        return value + " " + "visitors"
                    },
                },
            },
            xaxis: {
                labels: {
                    color: "white",
                    formatter: function (value) {
                        return value + " " + "visitors"
                    },
                },
                axisTicks: {
                    show: false,
                },
                axisBorder: {
                    show: false,
                },
            },
        }
    }
    
    if (document.getElementById("donut-chart") && typeof ApexCharts !== 'undefined') {
        const chart = new ApexCharts(document.getElementById("donut-chart"), getChartOptions());
        chart.render();
    
        // Get all the checkboxes by their class name
        const checkboxes = document.querySelectorAll('#devices input[type="checkbox"]');
    
        // Function to handle the checkbox change event
        function handleCheckboxChange(event, chart) {
            const checkbox = event.target;
            if (checkbox.checked) {
                switch (checkbox.value) {
                    case 'desktop':
                        chart.updateSeries([15.1, 22.5, 4.4, 8.4]);
                        break;
                    case 'tablet':
                        chart.updateSeries([25.1, 26.5, 1.4, 3.4]);
                        break;
                    case 'mobile':
                        chart.updateSeries([45.1, 27.5, 8.4, 2.4]);
                        break;
                    default:
                        chart.updateSeries([55.1, 28.5, 1.4, 5.4]);
                }
    
            } else {
                chart.updateSeries([35.1, 23.5, 2.4, 5.4]);
            }
        }
    
        // Attach the event listener to each checkbox
        checkboxes.forEach((checkbox) => {
            checkbox.addEventListener('change', (event) => handleCheckboxChange(event, chart));
        });
    }
    
});


// Visitors data
const visitorsData = [
    { name: 'John Doe', date: '15/07', company: 'ABC Corp', phone: '1234567890', email: 'john@example.com', status: 'qualified' },
    { name: 'Bob Johnson', date: '15/07', company: '123 Inc', phone: '5555555555', email: 'bob@example.com', status: 'notnow' },
    { name: 'Jane Smith', date: '15/07', company: 'XYZ Ltd', phone: '9876543210', email: 'jane@example.com', status: 'onhold' },
    // ... other visitors data
];

document.addEventListener('DOMContentLoaded', function() {
    const dropdownButton = document.getElementById('dropdownButton');
    const dropdownMenu = document.getElementById('dropdownMenu');

    dropdownButton.addEventListener('click', function() {
        dropdownMenu.classList.toggle('hidden');
    });

    // Close the dropdown when clicking outside of it
    document.addEventListener('click', function(event) {
        if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });
});


// Populate visitors table
function populateVisitorsTable() {
    const tableBody = document.getElementById('visitorsTableBody');
    tableBody.innerHTML = '';
    visitorsData.forEach((visitor, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2">${visitor.name}</td>
            <td class="p-2">${visitor.date}</td>
            <td class="p-2">${visitor.company}</td>
            <td class="p-2">${visitor.phone}</td>
            <td class="p-2">${visitor.email}</td>
            <td class="p-2"><button class="text-blue-400 hover:text-blue-300">View Profile</button></td>
            <td class="p-2">
                <select id="status-${index}" class="bg-gray-700 p-1 rounded">
                    <option value="qualified" ${visitor.status === 'qualified' ? 'selected' : ''}>Qualified</option>
                    <option value="onhold" ${visitor.status === 'onhold' ? 'selected' : ''}>On Hold</option>
                    <option value="notnow" ${visitor.status === 'notnow' ? 'selected' : ''}>Not Now</option>
                </select>
            </td>
            <td class="p-2">
                <button onclick="updateStatus(${index})" class="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded">Save</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Update visitor status
function updateStatus(index) {
    const newStatus = document.getElementById(`status-${index}`).value;
    visitorsData[index].status = newStatus;
    populateVisitorsTable();
}

// Initialize visitors page
function initVisitorsPage() {
   
    populateVisitorsTable();
}


// Dummy data for categories
const categories = [
    { id: 'customers', label: 'Customers', value: 100, color: '#7221FD' },
    { id: 'manufacturers', label: 'Manufacturers', value: 50, color: '#7221FD' },
    { id: 'serviceProviders', label: 'Service Providers', value: 75, color: '#7221FD' },
    { id: 'channelPartners', label: 'Channel Partners', value: 30, color: '#7221FD' },
    { id: 'investors', label: 'Investors', value: 20, color: '#7221FD' },
    { id: 'domainExperts', label: 'Domain Experts', value: 10, color: '#7221FD' },
];

// Create charts for each category
categories.forEach(category => {
    createCircleChart(category.id, category.value, category.color);
});

// Qualified Lead data
const qualifiedLeadData = [
    { name: 'John Doe', date: '15/07',company: 'ABC Corp', phone: '1234567890', email: 'john@example.com', status: 'accepted' },
    { name: 'Jane Smith', date: '15/07',company: 'XYZ Ltd', phone: '9876543210', email: 'jane@example.com', status: 'onhold' },
    { name: 'Bob Johnson', date: '15/07',company: '123 Inc', phone: '5555555555', email: 'bob@example.com', status: 'notnow' },
    { name: 'Alice Brown', date: '15/07',company: 'Tech Co', phone: '1112223333', email: 'alice@example.com', status: 'accepted' },
    { name: 'Charlie Davis', date: '15/07',company: 'Innovate Inc', phone: '4445556666', email: 'charlie@example.com', status: 'onhold' },
];

// Populate qualified lead table
function populateQualifiedLeadTable(status) {
    const tableBody = document.getElementById('qualifiedLeadTableBody');
    tableBody.innerHTML = '';
    qualifiedLeadData.filter(lead => lead.status === status).forEach(lead => {
        const row = document.createElement('tr');
                    row.innerHTML = `
                <td class="p-2">${lead.name}</td>
                <td class="p-2">${lead.date}</td>
                <td class="p-2">${lead.company}</td>
                <td class="p-2">${lead.phone}</td>
                <td class="p-2">${lead.email}</td>
                <td class="p-2"><button class="add-edit-button text-blue-400 hover:text-blue-300">Add / Edit Details</button></td>
                <td class="p-2 ${lead.status === 'accepted' ? 'text-green-400' : lead.status === 'onhold' ? 'text-yellow-400' : 'text-red-400'}">
                    ${lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </td>
`;
        tableBody.appendChild(row);
    });
}


// add details button event listner 
document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.querySelector('table tbody'); // Adjust this selector if needed

    tableBody.addEventListener('click', function(event) {
        if (event.target.classList.contains('add-edit-button')) {
            window.location.href = '.subForms/vistor_data_entry_needfrom.html';
        }
    });
});


// Initialize qualified lead page
function initQualifiedLeadPage(status) {
    showContent('content-qualified-lead');
    populateQualifiedLeadTable(status);
}

// Set up sidebar dropdown for Qualified Leads
function setupQualifiedLeadsDropdown() {
    const qualifiedLeadItem = document.getElementById('nav-qualified-lead');
    qualifiedLeadItem.classList.add('has-submenu');
    
    const submenu = document.createElement('ul');
    submenu.className = 'pl-4 mt-2 space-y-2 hidden';
    submenu.innerHTML = `
        <li id="nav-qualified-lead-accepted" class="cursor-pointer">Accepted</li>
        <li id="nav-qualified-lead-onhold" class="cursor-pointer">On Hold</li>
        <li id="nav-qualified-lead-notnow" class="cursor-pointer">Not Now</li>
    `;
    
    qualifiedLeadItem.appendChild(submenu);
    
    qualifiedLeadItem.addEventListener('click', function(e) {
        e.stopPropagation();
        submenu.classList.toggle('hidden');
    });
    
    ['accepted', 'onhold', 'notnow'].forEach(status => {
        document.getElementById(`nav-qualified-lead-${status}`).addEventListener('click', function(e) {
            e.stopPropagation();
            initQualifiedLeadPage(status);
        });
    });
}

// Initialize all functionality
document.addEventListener('DOMContentLoaded', () => {
    setupQualifiedLeadsDropdown();
    document.getElementById('nav-home').click();
    initVisitorsPage();

    // Add event listeners for other nav items
    document.getElementById('nav-visitors').addEventListener('click', initVisitorsPage);
    document.getElementById('nav-business-proposal').addEventListener('click', initBusinessProposalPage);

        // Implement business proposal page functionality

    document.getElementById('nav-customer').addEventListener('click', function() {
        // Implement customer page functionality
    });
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

// document.querySelectorAll('.circle-chart').forEach(chart => {
//     const value = parseInt(chart.querySelector('.progressText').textContent);
//     setProgress(chart, value);
// });



// Populate business proposal table
function populateBusinessProposalTable() {
    const tableBody = document.getElementById('businessProposalTableBody');
    tableBody.innerHTML = '';
    businessProposalData.forEach(proposal => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2">${proposal.name}</td>
            <td class="p-2">${proposal.date}</td>
            <td class="p-2">${proposal.company}</td>
            <td class="p-2">${proposal.phone}</td>
            <td class="p-2">${proposal.email}</td>
            <td class="p-2"><button class="text-blue-400 hover:text-blue-300">View Details</button></td>
            <td class="p-2 ${getStatusColor(proposal.status)}">${proposal.status}</td>
        `;
        tableBody.appendChild(row);
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

// Create circle charts for business proposal
function createBusinessProposalCharts() {
    createCircleChart('acceptedClients', 60, '#7221FD');
    createCircleChart('inProgressClients', 5, '#7221FD');
    createCircleChart('inDiscussionClients', 15, '#7221FD');
    createCircleChart('OfferedClients', 40, '#7221FD');
}

// Initialize business proposal page
function initBusinessProposalPage() {
    showContent('content-business-proposal');
    createBusinessProposalCharts();
    populateBusinessProposalTable();
}
