document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('adminToken');
    const adminId = localStorage.getItem('adminId');

    if (!token || !adminId) {
        window.location.href = 'index.html';
        return;
    }

    const handleUnauthorized = () => {
        alert('Login session expired, please login again');
        logout();
    };

    const updateNavbar = (activeItem) => {
        document.querySelectorAll('.sidebar .nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeElement = [...document.querySelectorAll('.sidebar .nav-item')].find(item => item.textContent.includes(activeItem));
        if (activeElement) {
            activeElement.classList.add('active');
        } else {
            console.error('Navbar item not found:', activeItem);
        }
    };

    const displayVisitorDetails = async (visitorId) => {
        try {
            const response = await fetch(`/api/visitors/${visitorId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                const error = await response.json();
                console.error('Error fetching visitor details:', error.message);
                return;
            }
    
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const visitor = await response.json();
                if (response.ok) {
                    localStorage.setItem('visitorId', visitor._id);
                    const faceImageURL = visitor.faceImage ? `/uploads/${visitor.faceImage}` : 'default-avatar.png';
                    document.getElementById('qualified-leads').innerHTML = `
                        <header>
                            <div class="user-info">
                                  <img id="visitor-avatar" src="${faceImageURL}" alt="Visitor Avatar" />
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
                            <div class="nav-item active" data-tab="projects">Projects</div>
                            <div class="nav-item" data-tab="products">Products</div>
                            <div class="nav-item" data-tab="services">Services</div>
                            <div class="nav-item" data-tab="solutions">Solutions</div>
                        </nav>
                        <div id="projects" class="subcontent active">
                           <h3>Projects</h3>
                        <section class="content">
                            <div class="input-group">
                                <label for="project-title">Title:</label>
                                <input type="text" id="project-title" name="project-title">
                            </div>
                            <div class="input-group">
                                <label for="project-description">Description:</label>
                                <textarea id="project-description" name="project-description" rows="5"></textarea>
                            </div>
                            <div class="button-group">
                                <button class="btn back-btn" id="backBtnProjects">BACK</button>
                                <button class="btn next-btn" id="nextBtnProjects">NEXT ></button>
                            </div> 
                        </section>
                        </div>
                        <div id="products" class="subcontent">
                            <h3>Products</h3>
                        <form class="content">
                            <div class="input-group">
                                <label for="product-title">Title:</label>
                                <input type="text" id="product-title" name="product-title">
                            </div>
                            <div class="input-group">
                                <label for="product-description">Description:</label>
                                <textarea id="product-description" name="product-description" rows="3"></textarea>
                            </div>
                            <div class="input-group">
                                <label>Type of Product:</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" name="product-type" value="consumer"> Consumer Product</label>
                                    <label><input type="checkbox" name="product-type" value="industrial"> Industrial Product</label>
                                    <label><input type="checkbox" name="product-type" value="software"> Software Product</label>
                                    <label><input type="checkbox" name="product-type" value="hardware"> Hardware Product</label>
                                </div>
                            </div>
                            <div class="input-group">
                                <label for="key-features">Key Features and Specifications:</label>
                                <textarea id="key-features" name="key-features" rows="3"></textarea>
                            </div>
                            <div class="input-group">
                                <label for="target-audience">Target Audience:</label>
                                <textarea id="target-audience" name="target-audience" rows="3"></textarea>
                            </div>
                            <div class="input-group">
                                <label for="competitive-analysis">Competitive Analysis:</label>
                                <textarea id="competitive-analysis" name="competitive-analysis" rows="3"></textarea>
                            </div>
                            <div class="input-group">
                                <label for="usp">Unique Selling Proposition:</label>
                                <textarea id="usp" name="usp" rows="3"></textarea>
                            </div>
                            <div class="input-group">
                                <label>Development Stage:</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" name="dev-stage" value="concept"> Concept Stage</label>
                                    <label><input type="checkbox" name="dev-stage" value="design"> Design Phase</label>
                                    <label><input type="checkbox" name="dev-stage" value="prototype"> Prototype Phase</label>
                                    <label><input type="checkbox" name="dev-stage" value="testing"> Testing Phase</label>
                                    <label><input type="checkbox" name="dev-stage" value="manufacture"> Ready to Manufacture</label>
                                    <label><input type="checkbox" name="dev-stage" value="others"> Others:</label>
                                </div>
                                <textarea id="dev-stage-others" name="dev-stage-others" placeholder="Type here/optional"></textarea>
                            </div>
                            <div class="input-group">
                                <label>Required Services:</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" name="services" value="market-research"> Market Research</label>
                                    <label><input type="checkbox" name="services" value="product-design"> Product Design</label>
                                    <label><input type="checkbox" name="services" value="prototype-dev"> Prototype Development</label>
                                    <label><input type="checkbox" name="services" value="testing"> Testing and Validation</label>
                                    <label><input type="checkbox" name="services" value="manufacturing"> Manufacturing Support</label>
                                    <label><input type="checkbox" name="services" value="branding"> Branding and Packaging</label>
                                    <label><input type="checkbox" name="services" value="space"> Space</label>
                                </div>
                            </div>
                            <div class="button-group">
                                <button class="btn back-btn" id="backBtnProducts">BACK</button>
                                <button class="btn next-btn" id="nextBtnProducts">NEXT ></button>
                            </div> 
                        </form>
                    </div>
                        <div id="services" class="subcontent">
                            <h3>Services</h3>
                        <form class="content">
                            <h2>Required Services</h2>
                            <div class="services-grid">
                                <div class="service-column">
                                    <h3>Description :</h3>
                                    <label><input type="checkbox" checked> 2D</label>
                                    <label><input type="checkbox" checked> 3D</label>
                                    <label><input type="checkbox" checked> Mechanical</label>
                                    <label><input type="checkbox" checked> Electronic</label>
                                    <label><input type="checkbox" checked> Civil</label>
                                    <label><input type="checkbox" checked> Animation</label>
                                    <label><input type="checkbox" checked> Website</label>
                                    <label><input type="checkbox" checked> Marketing Collaterals</label>
                                    <label><input type="checkbox" checked> Interior</label>
                                </div>
                                <div class="service-column">
                                    <h3>Manufacturing</h3>
                                    <label><input type="checkbox" checked> Casting</label>
                                    <label><input type="checkbox" checked> Fabrication</label>
                                    <label><input type="checkbox" checked> Moulding</label>
                                    <label><input type="checkbox" checked> Additive</label>
                                    <label><input type="checkbox" checked> Hydraulics</label>
                                    <label><input type="checkbox" checked> Pneumatics</label>
                                    <label><input type="checkbox" checked> Process Control</label>
                                </div>
                                <div class="service-column">
                                    <h3>Supply Chain</h3>
                                    <label><input type="checkbox" checked> Sourcing</label>
                                    <label><input type="checkbox" checked> Logistics</label>
                                    <label><input type="checkbox" checked> Facility</label>
                                    <h3>Prototyping</h3>
                                    <label><input type="checkbox" checked> Ergonomics</label>
                                    <label><input type="checkbox" checked> Testing</label>
                                    <label><input type="checkbox" checked> Golden Sample</label>
                                    <label><input type="checkbox" checked> Mass Production</label>
                                </div>
                            </div>
                            <div class="text-inputs">
                                <div class="input-group">
                                    <label>Market Survey</label>
                                    <textarea id="market-survey" placeholder="Type here"></textarea>
                                </div>
                                <div class="input-group">
                                    <label>Brand Building and Packaging</label>
                                    <textarea id="branding" placeholder="Type here"></textarea>
                                </div>
                                <div class="input-group">
                                    <label>Certification</label>
                                    <textarea id="certification" placeholder="Type here"></textarea>
                                </div>
                                <div class="input-group">
                                    <label>Strategy</label>
                                    <textarea id="strategy" placeholder="Type here"></textarea>
                                </div>
                                <div class="input-group">
                                    <label>Sales and Marketing</label>
                                    <textarea id="sales-marketing" placeholder="Type here"></textarea>
                                </div>
                            </div>
                            <div class="funding">
                                <h3>Funding</h3>
                                <label><input type="checkbox" checked> Equity</label>
                                <label><input type="checkbox" checked> Debt</label>
                                <label><input type="checkbox" checked> Project Finance</label>
                                <label><input type="checkbox" checked> Royalty & License Fee</label>
                                <label><input type="checkbox" checked> Subsidy (DLI/PLI etc.)</label>
                                <label><input type="checkbox" checked> BG/LC</label>
                            </div>
                            <div class="button-group">
                                <button class="btn back-btn" id="backBtnServices">BACK</button>
                                <button class="btn next-btn" id="nextBtnServices">NEXT ></button>
                            </div> 
                        </form>
                    </div>
                        <div id="solutions" class="subcontent">
                          
                         <h3>Solutions</h3>
                        <form class="content">
                            <div class="input-group">
                                <label for="solution-title">Title:</label>
                                <input type="text" id="solution-title" name="solution-title">
                            </div>
                            <div class="input-group">
                                <label for="solution-description">Description:</label>
                                <textarea id="solution-description" name="solution-description" rows="5"></textarea>
                            </div>
                            <div class="button-group">
                                <button class="btn back-btn" id="backBtnSolutions">BACK</button>
                                <button class="btn submit-btn" id="submitBtnSolutions">SUBMIT</button>
                                <button class="btn hold-btn" id="holdBtnSolutions">ON HOLD</button>

                    <!-- Popup Modal -->
                        <div id="holdPopup" class="popup">
                        <div class="popup-content">
                         <span class="close">&times;</span>
                         <p>This profile is under hold.</p>
                        </div>
                        </div>
                                <button class="btn send-btn" id="sendBtnSolutions">SEND APPROVAL</button>
                            </div> 
                        </form>
                </div>
            </div>
                    `;
                    document.querySelector('.metrics-container').style.display = 'none';
                    document.querySelector('.table-container').style.display = 'none';
                    document.getElementById('qualified-leads').style.display = 'block';
                    document.getElementById('backBtnProjects').addEventListener('click', () => updateNavbar('Projects'));
                    document.getElementById('nextBtnProjects').addEventListener('click', () => updateNavbar('Products'));
                    document.getElementById('backBtnProducts').addEventListener('click', () => updateNavbar('Products'));
                    document.getElementById('nextBtnProducts').addEventListener('click', () => updateNavbar('Services'));
                    document.getElementById('backBtnServices').addEventListener('click', () => updateNavbar('Services'));
                    document.getElementById('nextBtnServices').addEventListener('click', () => updateNavbar('Solutions'));
                    document.getElementById('sendBtnSolutions').addEventListener('click', () => {
                        event.preventDefault(); 
                        document.getElementById('qualified-leads').style.display = 'none';
                        document.getElementById('business-proposal').style.display = 'block';
                        // Optionally, you can add additional logic here for sending approval
                        // For example, making an API call to notify someone about the approval request
                    });


                    // Submit all data
                    document.getElementById('submitBtnSolutions').addEventListener('click', async (e) => {
                        e.preventDefault();
                    
                        const projectTitle = document.getElementById('project-title').value;
                        const projectDescription = document.getElementById('project-description').value;
                        
                        const productTitle = document.getElementById('product-title').value;
                        const productDescription = document.getElementById('product-description').value;
                        const productTypes = [...document.querySelectorAll('input[name="product-type"]:checked')].map(cb => cb.value);
                        const keyFeatures = document.getElementById('key-features').value;
                        const targetAudience = document.getElementById('target-audience').value;
                        const competitiveAnalysis = document.getElementById('competitive-analysis').value;
                        const usp = document.getElementById('usp').value;
                        const developmentStages = [...document.querySelectorAll('input[name="dev-stage"]:checked')].map(cb => cb.value);
                        const devStageOthers = document.getElementById('dev-stage-others').value;
                        const requiredServices = [...document.querySelectorAll('input[name="services"]:checked')].map(cb => cb.value);
                    
                        const solutionTitle = document.getElementById('solution-title').value;
                        const solutionDescription = document.getElementById('solution-description').value;
                    
                        const serviceSelections = {};
                        document.querySelectorAll('#services .services-grid input[type="checkbox"]').forEach(checkbox => {
                            serviceSelections[checkbox.nextSibling.textContent.trim()] = checkbox.checked;
                        });
                    
                        const allData = {
                            visitorId: visitor._id,
                            projects: {
                                title: projectTitle,
                                description: projectDescription
                            },
                            products: {
                                title: productTitle,
                                description: productDescription,
                                types: productTypes,
                                keyFeatures: keyFeatures,
                                targetAudience: targetAudience,
                                competitiveAnalysis: competitiveAnalysis,
                                usp: usp,
                                developmentStages: developmentStages,
                                devStageOthers: devStageOthers,
                                requiredServices: requiredServices
                            },
                            services: serviceSelections,
                            solutions: {
                                title: solutionTitle,
                                description: solutionDescription
                            }
                        };
                    
                        console.log('Submitting data:', allData);
                    
                        try {
                            const saveResponse = await fetch(`/api/visitors/${visitorId}/details`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify(allData)
                            });
                    
                            if (saveResponse.ok) {
                                alert('Data saved successfully!');
                            } else {
                                const error = await saveResponse.json();
                                console.error('Failed to save data:', error.message);
                                alert(`Error: ${error.message}`);
                            }
                        } catch (error) {
                            console.error('An error occurred:', error);
                            alert(`An error occurred: ${error.message}`);
                        }
                    });
                   

                    
                    // Wait for the next frame to ensure the DOM has updated
                    requestAnimationFrame(() => {
                        bindTabEvents();
                        initializeTabs();
                    });
                } else {
                    console.error('Error fetching visitor details:', visitor.error);
                }
            } else {
                console.error('Unexpected response format');
                const text = await response.text();
                console.error(text);
            }
        } catch (error) {
            console.error('Error fetching visitor details:', error);
        }
    };

    document.querySelectorAll('.visitor-name').forEach(item => {
        item.addEventListener('click', () => {
            const visitorId = item.dataset.visitorId; // Assuming data-visitor-id attribute is set
            displayVisitorDetails(visitorId);
            updateNavbar('Qualified Leads');
        });
    });

    const fetchAndDisplayVisitorData = async (visitorId) => {
        try {
            const response = await fetch(`/api/visitors/${visitorId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                const error = await response.json();
                console.error('Error fetching visitor details:', error.message);
                return;
            }

            const visitor = await response.json();
            console.log(visitor);

            document.getElementById('client-name').textContent = visitor.name;
            document.getElementById('client-company').textContent = visitor.companyName;
            document.getElementById('client-domain').textContent = visitor.domain;
            document.getElementById('client-email').textContent = visitor.email;
            document.getElementById('client-phone').textContent = visitor.phone;
            document.querySelector('.avatar').style.backgroundImage = `url(${visitor.faceImage})`;

            if (visitor.projects) {
                document.getElementById('project-description').textContent = visitor.projects.description || '';
            }
            if (visitor.products) {
                document.getElementById('product-type').textContent = visitor.products.types?.join(', ') || '';
                document.getElementById('product-description').textContent = visitor.products.description || '';
                document.getElementById('product-features').textContent = visitor.products.keyFeatures || '';
                document.getElementById('product-audience').textContent = visitor.products.targetAudience || '';
                document.getElementById('product-analysis').textContent = visitor.products.competitiveAnalysis || '';
                document.getElementById('product-usp').textContent = visitor.products.usp || '';
                document.getElementById('product-stage').textContent = visitor.products.developmentStages?.join(', ') || '';
                document.getElementById('product-services').textContent = visitor.products.requiredServices?.join(', ') || '';
            }
            if (visitor.services) {
                document.getElementById('service-branding').textContent = visitor.services.branding || '';
                document.getElementById('service-certification').textContent = visitor.services.certification || '';
                document.getElementById('service-design').textContent = visitor.services.design || '';
                document.getElementById('service-funding').textContent = visitor.services.funding || '';
                document.getElementById('service-manufacturing').textContent = visitor.services.manufacturing || '';
                document.getElementById('service-survey').textContent = visitor.services.survey || '';
                document.getElementById('service-prototyping').textContent = visitor.services.prototyping || '';
                document.getElementById('service-sales').textContent = visitor.services.sales || '';
                document.getElementById('service-supply').textContent = visitor.services.supply || '';
            }
            if (visitor.solutions) {
                document.getElementById('solution-description').textContent = visitor.solutions.description || '';
            }

        } catch (error) {
            console.error('Error fetching visitor details:', error);
        }
    };

    const toggleSection = (sectionId) => {
        const sections = document.querySelectorAll('.content');
        sections.forEach(section => {
            if (section.id === sectionId) {
                section.style.display = 'block';
                if (sectionId === 'customer') {
                    const visitorId = localStorage.getItem('visitorId');
                    if (visitorId) {
                        fetchAndDisplayVisitorData(visitorId);
                    }
                }
            } else {
                section.style.display = 'none';
            }
        });
    };
    
document.getElementById('signDealButton').addEventListener('click', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('adminToken');
    const visitorId = localStorage.getItem('visitorId'); // Fetch the visitorId from local storage

    if (!token || !visitorId) {
        alert('Login session expired, please login again');
        window.location.href = 'index.html';
        return;
    }

    // Fetch the visitor ID from the API
    try {
        const response = await fetch(`/api/visitors/${visitorId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

        if (!response.ok) {
            const error = await response.json();
            console.error('Error fetching visitor details:', error.message);
            return;
        }

        const visitor = await response.json();

        const financialCapacity = document.getElementById('financial-capacity').value || '';
        const annualTurnover = document.getElementById('annual-turnover').value || '';
        const netWorth = document.getElementById('net-worth').value || '';
        const decisionMakers = [
            document.getElementById('decision-maker-1').value || '',
            document.getElementById('decision-maker-2').value || '',
            document.getElementById('decision-maker-3').value || ''
        ];
        const leadTime = document.getElementById('lead-time').value || '';
        const leadTimeUnit = document.getElementById('lead-time-unit').value || '';

        const moreData = {
            financialCapacity,
            annualTurnover,
            netWorth,
            decisionMakers,
            leadTime,
            leadTimeUnit
        };

        try {
            const saveResponse = await fetch(`/api/visitors/${visitorId}/details/more`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(moreData)
            });

            if (saveResponse.ok) {
                alert('Proposal submitted successfully!');
                // Show the Customer section
                toggleSection('customer');
            } else {
                const error = await saveResponse.json();
                console.error('Failed to save data:', error.message);
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('An error occurred:', error);
            alert(`An error occurred: ${error.message}`);
        }
    } catch (error) {
        console.error('Error fetching visitor details:', error);
    }
});


    const tabs = ['projects', 'products', 'services', 'solutions'];

    const initializeTabs = () => {
        tabs.forEach(tabId => {
            const tabElement = document.getElementById(tabId);
            if (tabElement) {
                tabElement.style.display = tabId === 'projects' ? 'block' : 'none';
            } else {
                console.error(`Tab element not found: ${tabId}`);
            }
        });
    };

    const updateTab = (currentTab, direction) => {
        console.log(`Updating tab: ${currentTab}, Direction: ${direction}`);
        const navItems = document.querySelectorAll('.main-nav .nav-item');
        const currentIndex = Array.from(navItems).findIndex(item => item.classList.contains('active'));
        const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
        if (newIndex >= 0 && newIndex < navItems.length) {
            const currentTabElement = document.getElementById(currentTab);
            const newTabId = navItems[newIndex].getAttribute('data-tab');
            const newTabElement = document.getElementById(newTabId);
            
            console.log('Current Tab Element:', currentTabElement);
            console.log('New Tab Element:', newTabElement);
    
            if (currentTabElement && newTabElement) {
                currentTabElement.style.display = 'none';
                currentTabElement.classList.remove('active');
                newTabElement.style.display = 'block';
                newTabElement.classList.add('active');
                
                // Update nav item active state
                navItems[currentIndex].classList.remove('active');
                navItems[newIndex].classList.add('active');
    
                localStorage.setItem('currentTab', newTabId);
                console.log(`Tab updated to: ${newTabId}`);
            } else {
                console.error('One or both tab elements not found:', currentTab, newTabId);
            }
        } else {
            console.log('Invalid tab index:', newIndex);
        }
    };
    const bindTabEvents = () => {
        document.querySelectorAll('.next-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault(); 
                const currentTab = button.closest('.subcontent').id;
                updateTab(currentTab, 'next');
            });
        });
    
        document.querySelectorAll('.back-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault(); 
                const currentTab = button.closest('.subcontent').id;
                updateTab(currentTab, 'back');
            });
        });
    
        document.querySelectorAll('.main-nav .nav-item').forEach(item => {
            item.addEventListener('click', (event) => {
                const tabId = event.target.getAttribute('data-tab');
                const currentTab = document.querySelector('.subcontent.active').id;
                document.getElementById(currentTab).style.display = 'none';
                document.getElementById(currentTab).classList.remove('active');
                document.getElementById(tabId).style.display = 'block';
                document.getElementById(tabId).classList.add('active');
                
                document.querySelectorAll('.main-nav .nav-item').forEach(navItem => {
                    navItem.classList.remove('active');
                });
                event.target.classList.add('active');
            });
        });
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


// Get the popup
var popup = document.getElementById("holdPopup");

// Get the button that opens the popup
var btn = document.getElementById("holdBtnSolutions");

// Get the <span> element that closes the popup
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the popup
btn.onclick = function() {
  popup.style.display = "block";
  putProfileOnHold(); // Call function to push to the database
}

// When the user clicks on <span> (x), close the popup
span.onclick = function() {
  popup.style.display = "none";
}

// When the user clicks anywhere outside of the popup, close it
window.onclick = function(event) {
  if (event.target == popup) {
    popup.style.display = "none";
  }
}

// Function to handle putting the profile on hold and updating the database
function putProfileOnHold() {
  // Replace with your profile ID and AJAX request
  const profileId = 'uniqueProfileId';
  
  fetch('/putOnHold', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ profileId: profileId })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Update the count of on-hold profiles
      updateOnHoldCount(1);
    } else {
      console.error('Error putting profile on hold');
    }
  });
}

// Function to handle updating the on-hold count
function updateOnHoldCount(change) {
  fetch('/getOnHoldCount')
    .then(response => response.json())
    .then(data => {
      const newCount = data.count + change;
      document.getElementById('onHoldCount').textContent = newCount;
    });
}

// Function to handle sending approval and updating the count
function sendApproval(profileId) {
  fetch('/sendApproval', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ profileId: profileId })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Decrease the on-hold count
      updateOnHoldCount(-1);
    } else {
      console.error('Error sending approval');
    }
  });
}


