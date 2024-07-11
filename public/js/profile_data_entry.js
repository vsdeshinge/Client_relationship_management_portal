import { API_BASE_URL } from './apiconfig';
document.addEventListener('DOMContentLoaded', () => {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const subSectionButtons = document.querySelectorAll('.sub-section-btn');
    const nextButtons = document.querySelectorAll('.next-btn');

    // Hide all category details sections initially
    const detailsSections = document.querySelectorAll('.details-content');
    detailsSections.forEach(section => section.style.display = 'none');

    // Hide all sub-section contents initially
    const subSectionContents = document.querySelectorAll('.sub-section-content');
    subSectionContents.forEach(subSection => subSection.style.display = 'none');

    // Show the default message
    document.querySelector('.main-content').insertAdjacentHTML('afterbegin', '<p class="default-message">Click the suitable tab which suits you</p>');

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Hide all category details sections
            detailsSections.forEach(section => section.style.display = 'none');

            // Show the selected category details section
            const category = button.getAttribute('data-category');
            document.getElementById(`${category}-details`).style.display = 'block';

            // Show the default message
            document.querySelector('.default-message').style.display = 'block';

            // Reset sub-section content visibility
            subSectionContents.forEach(subSection => subSection.style.display = 'none');
        });
    });

    subSectionButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Hide all sub-section contents
            subSectionContents.forEach(subSection => subSection.style.display = 'none');

            // Show the selected sub-section content
            const section = button.getAttribute('data-section');
            document.getElementById(`${section}-details`).style.display = 'block';

            // Hide the default message
            document.querySelector('.default-message').style.display = 'none';
        });
    });

    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Hide the current sub-section content
            const currentSection = button.closest('.sub-section-content');
            currentSection.style.display = 'none';

            // Show the next sub-section content
            const nextSectionId = button.getAttribute('data-next-section') + '-details';
            document.getElementById(nextSectionId).style.display = 'block';
        });
    });

    // Initially hide all sub-sections and show the first one when a category is selected
    subSectionContents.forEach(subSection => subSection.style.display = 'none');


    async function updateMetrics() {
        console.log('Updating metrics...');
        try {
            const response = await fetch(`${API_BASE_URL}/api/status-counts`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const counts = await response.json();
            console.log('Fetched counts:', counts);
    
            document.getElementById('accepted-leads').textContent = counts.qualified;
            document.getElementById('deferred-leads').textContent = counts.onHold;
            document.getElementById('not-now-leads').textContent = counts.notRelevant;
            console.log('Metrics updated:', counts);
        } catch (error) {
            console.error('Error updating metrics:', error);
        }
    }

    updateMetrics()
});

document.addEventListener('DOMContentLoaded', async () => {
    const clientId = localStorage.getItem('currentClientId');
    if (!clientId) {
        alert('No client ID found. Please try again.');
        return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
        alert('No token found. Please log in again.');
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/visitors/${clientId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const visitor = await response.json();
            document.getElementById('visitor-name').textContent = `Name: ${visitor.name}`;
            document.getElementById('visitor-company').textContent = `Company Name: ${visitor.companyName || 'N/A'}`;
            document.getElementById('visitor-phone').textContent = `Phone no: ${visitor.phone}`;
            document.getElementById('visitor-email').textContent = `Email: ${visitor.email}`;
        } else if (response.status === 404) {
            alert('Visitor not found.');
        } else {
            const errorData = await response.json();
            console.error('Error fetching visitor details:', errorData.error);
        }
    } catch (error) {
        console.error('Error fetching visitor details:', error);
    }
});

document.getElementById('submit-btn').addEventListener('click', async (e) => {
    e.preventDefault();

    // Helper function to get value or return undefined if empty
    const getValue = (selector) => {
        const value = document.querySelector(selector).value.trim();
        return value === '' ? undefined : value;
    };

    // Helper function to get checked options
    const getCheckedOptions = (selector) => {
        return Array.from(document.querySelectorAll(selector + ' input:checked')).map(el => el.parentElement.textContent.trim());
    };

    // Collect customer data
    const customer = {
        project: {
            title: getValue('#project-details input[placeholder="Title"]'),
            description: getValue('#project-details textarea[placeholder="Description"]')
        },
        service: {
            types: getCheckedOptions('#service-details .options')
            // Add other service fields similarly...
        },
        product: {
            title: getValue('#product-details input[placeholder="Title"]'),
            description: getValue('#product-details textarea[placeholder="Description"]'),
            typesOfProduct: getCheckedOptions('#product-details .options')
            // Add other product fields similarly...
        },
        solution: {
            title: getValue('#solution-details input[placeholder="Title"]'),
            description: getValue('#solution-details textarea[placeholder="Description"]')
        },
        others: {
            title: getValue('#othersSection-details input[placeholder="Title"]'),
            description: getValue('#othersSection-details textarea[placeholder="Description"]')
        }
    };

    // Collect service provider data
    const serviceProvider = {
        domain: getValue('#domain'),
        establishedYear: getValue('#established-year'),
        teamSize: getValue('#team-size'),
        turnover: getValue('#turnover'),
        branches: getValue('#branches'),
        expertise: getValue('#expertise'),
        clients: getValue('#clients'),
        projects: getValue('#projects'),
        companyType: getValue('#company-type'),
        experience: getValue('#experience'),
        usp: getValue('#usp'),
        certifications: getValue('#certifications'),
        milestones: getValue('#milestones'),
        others: getValue('#others')
    };

    // Collect manufacturer data
    const manufacturer = {
        domain: getValue('#domain'),
        establishedYear: getValue('#established-year'),
        productLine: getValue('#product-line'),
        assemblyLine: getValue('#assembly-line'),
        facility: getValue('#facility'),
        equipment: getValue('#equipment'),
        area: getValue('#area'),
        certifications: getValue('#certifications'),
        talent: getValue('#talent'),
        location: getValue('#location'),
        others: getValue('#others')
    };

    // Collect market access data
    const marketAccess = {
        title: getValue('#marketAccess-details input[placeholder="Title"]'),
        bandwidth: getCheckedOptions('#marketAccess-details input[type="checkbox"]'),
        field: getCheckedOptions('#marketAccess-details input[type="checkbox"]'),
        milestones: getValue('#marketAccess-details textarea[placeholder="Description"]'),
        keynotes: getValue('#marketAccess-details textarea[placeholder="Description"]')
    };

    // Collect other details
    const others = {
        title: getValue('#others-details input[placeholder="Title"]'),
        description: getValue('#others-details textarea[placeholder="Description"]')
    };

    // Combine all collected data
    const clientData = {
        customer: removeEmptyFields(customer),
        serviceProvider: removeEmptyFields(serviceProvider),
        manufacturer: removeEmptyFields(manufacturer),
        marketAccess: removeEmptyFields(marketAccess),
        others: removeEmptyFields(others)
    };

    // Function to remove empty fields
    function removeEmptyFields(obj) {
        return Object.fromEntries(
            Object.entries(obj).filter(([_, v]) => v !== undefined)
        );
    }

    const clientId = localStorage.getItem('currentClientId');
    if (!clientId) {
        alert('No client ID found. Please try again.');
        return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
        alert('No token found. Please log in again.');
        window.location.href = 'index.html';
        return;
    }

    // Send data to the server
    try {
        const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(clientData)
        });

        if (response.ok) {
            alert('Data saved successfully');
        } else {
            const error = await response.json();
            alert('Error saving data: ' + error.message);
        }
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Error saving data. Please try again later.');
    }
});
