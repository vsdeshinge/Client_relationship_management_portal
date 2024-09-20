document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('syndicateToken'); // Get the syndicate token
    const clientId = localStorage.getItem('clientId'); // Get clientId from localStorage

    if (token && clientId) {
        fetchClientDetails(clientId, token);
    } else {
        console.error('Client ID or syndicate token not found.');
    }
});


// Function to fetch the client details from the API
async function fetchClientDetails(clientId, token) {
    try {
        const response = await fetch(`/api/syndicateclient/${clientId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Pass the token for authorization
            }
        });

        // Check if the response is successful
        if (response.ok) {
            const client = await response.json(); // Parse the response JSON to get thde client data
            displayClientDetails(client); // Call function to display client details
        } else {
            console.error('Error fetching client details:', await response.text()); // Log error if the fetch fails
        }
    } catch (error) {
        console.error('Error fetching client details:', error); // Catch and log any unexpected errors
    }
}


function displayClientDetails(client) {
    const profileCard = document.getElementById('profile-card'); // Get the profile-card container

    // Check if the profileCard element exists
    if (profileCard) {
        // Log the faceImage to verify it's present
        console.log('client.faceImage:', client.faceImage);

        // If the client has a faceImage, use the correct route to retrieve it; otherwise, use a placeholder image
        const profileImage = client.faceImage ? `/images/${client.faceImage}` : 'https://via.placeholder.com/80';
        
        // Log the profileImage URL for debugging
        console.log('profileImage URL:', profileImage);

        // Populate the profile card with client details
        profileCard.innerHTML = `
            <div class="flex items-center">
                <img id="profile-img" src="${profileImage}" alt="Profile" class="profile-img">
                <div>
                    <p class="text-lg font-bold">Name: ${client.name || 'N/A'}</p>
                    <p class="text-sm">Company: ${client.companyName || 'N/A'}</p>
                    <p class="text-sm">Person To Meet: ${client.personToMeet || 'N/A'}</p>
                    <p class="text-sm">Referred By: ${client.personReferred || 'N/A'}</p>
                    <p class="text-sm">Email: ${client.email || 'N/A'}</p>
                    <p class="text-sm">Phone No.: ${client.phone || 'N/A'}</p>
                </div>
            </div>
        `;
    } else {
        console.error('Profile card element not found.');
    }
}


function investorvalidatedata() {
    const requiredFields = [
        '#investor-domain',
    ];

    let isValid = true;

    requiredFields.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            if (element.value.trim() === '' && (element.tagName !== 'SELECT' || element.selectedIndex === -1)) {
                element.classList.add('highlight-error');
                isValid = false;
            } else {
                element.classList.remove('highlight-error');
            }
        });
    });

    return isValid;
}

// investor validate form
function submitInvestorForm(event) {
    event.preventDefault();

    if (!investorvalidatedata()) {
        alert('Please fill in all required fields.');
        return;
    }
    const clientId = localStorage.getItem('clientId');
    const token = localStorage.getItem('syndicateToken');

    const title = document.getElementById('investor-title').value;
    const companyName = document.getElementById('investor-companyName').value;
    const domain = document.getElementById('investor-domain').value;
    const networth = document.getElementById('investor-networth').value;
    const previousInvestments = document.getElementById('investor-previousInvestments').value;
    const keyNotes = document.getElementById('investor-keyNotes').value;

    const investmentPortfolio = Array.from(document.querySelectorAll('input[name="investmentPortfolio"]:checked')).map(cb => cb.value);

    const investorData = {
        title,
        companyName,
        investordomain: domain,
        networth,
        investmentPortfolio,
        previousInvestments,
        keyNotes
    };

    fetch(`/api/investors/${clientId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(investorData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        alert('Investor data submitted successfully!');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error submitting investor data');
    });
}



// customer data form
function cusformData() {
    const requiredFields = [
        '#project-content input[type="text"]',
        '#solution-fields [type="text"]',
    ];

    let isValid = true;

    requiredFields.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            if (element.value.trim() === '' && (element.tagName !== 'SELECT' || element.selectedIndex === -1)) {
                element.classList.add('highlight-error');
                isValid = false;
            } else {
                element.classList.remove('highlight-error');
            }
        });
    });

    return isValid;
}

function submitForm(event) {
    event.preventDefault();

    const clientId = localStorage.getItem('clientId');
    const token = localStorage.getItem('syndicateToken');

    if (!cusformData()) {
        alert('Please fill in all required fields.');
        return;
    }

    const projectTitles = Array.from(document.querySelectorAll('#project-content input[type="text"]')).map(input => input.value.trim());
    const projectDescriptions = Array.from(document.querySelectorAll('#project-content textarea')).map(textarea => textarea.value.trim());

    const projectData = {
        titles: projectTitles.filter(title => title !== ''),
        descriptions: projectDescriptions.filter(description => description !== '')
    };

    const solutionTitles = Array.from(document.querySelectorAll('#solution-fields [type="text"]')).map(input => input.value.trim());
    const solutionDescriptions = Array.from(document.querySelectorAll('#solution-fields textarea')).map(textarea => textarea.value.trim());

    const solutionData = {
        titles: solutionTitles.filter(title => title !== ''),
        descriptions: solutionDescriptions.filter(description => description !== '')
    };

    const othersTitles = Array.from(document.querySelectorAll('#others-fields input[type="text"]')).map(input => input.value.trim());
    const othersDescriptions = Array.from(document.querySelectorAll('#others-fields textarea')).map(textarea => textarea.value.trim());

    const othersData = {
        titles: othersTitles.filter(title => title !== ''),
        descriptions: othersDescriptions.filter(description => description !== '')
    };

    const serviceData = {
        lookingFor: getCheckedValues('#service-looking-for .options'),
        design: getCheckedValues('#service-design .options'),
        itServices: getCheckedValues('#service-it-services .options'),
        architecture: getCheckedValues('#service-architecture .options'),
        marketAccessReach: getCheckedValues('#service-market-access-reach .options'),
        productLaunch: getCheckedValues('#service-product-launch .options'),
        marketing: getCheckedValues('#service-marketing .options'),
        marketIntelligence: getCheckedValues('#service-market-intelligence .options'),
        expertTalent: getCheckedValues('#service-expert-talent .options'),
        workstationRequired: getSingleCheckedValue('#service-workstation .options'),
        productDisplayRequired: getSingleCheckedValue('#service-product-display .options'),
        afterSales: getCheckedValues('#service-after-sales .options'),
        funding: getCheckedValues('#service-funding .options'),
        designOthersDescription: getValue('#design-others-description textarea'),
        architectureOthersDescription: getValue('#architecture-others-description textarea'),
        productOthersDescription: getValue('#product-others-description textarea'),
        marketingOthersDescription: getValue('#marketing-others-description textarea'),
        marketIntelligenceOthersDescription: getValue('#market-intelligence-others-description textarea'),
        expertTalentOthersDescription: getValue('#expert-talent-others-description textarea'),
        afterSalesOthersDescription: getValue('#after-sales-others-description textarea')
    };

    const productData = {
        title: getValue('#product-content input[type="text"]'),
        description: getValue('#product-content textarea'),
        typeOfProduct: getCheckedValues('#Type-of-Product .options'),
        developmentStage: getCheckedValues('#Development-Stage .options'),
        stageOthersDescription: getValue('#stage-others-description textarea'),
        productDescription: getValue('#Product-Description textarea'),
        uspOfProduct: getValue('#USP-of-Product textarea'),
        keyFeatures: getValue('#key textarea'),
        targetAudience: getValue('#target textarea'),
        competitiveAnalysis: getValue('#Competitive-Analysis textarea'),
        competitors: getValue('#Competitors textarea'),
        uniqueSellingProposition: getValue('#Unique textarea'),
        manufacturingSupport: getCheckedValues('#Manufacturing .options')
    };

    const customerData = {};
    if (Object.values(projectData).some(value => value.length)) customerData.project = projectData;
    if (Object.values(serviceData).some(value => Array.isArray(value) ? value.length : value)) customerData.service = serviceData;
    if (Object.values(productData).some(value => Array.isArray(value) ? value.length : value)) customerData.product = productData;
    if (Object.values(solutionData).some(value => value.length)) customerData.solution = solutionData;
    if (Object.values(othersData).some(value => value.length)) customerData.others = othersData;

    const dataToSend = {
        customer: customerData,
    };

    console.log('Data to send:', dataToSend);

    fetch(`/api/customers/${clientId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        alert('Customer data submitted successfully!');
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Error submitting customer data');
    });
}


function validateServiceProviderData() {
    const requiredFields = [
        '#service-provider-domain input[type="text"]',
    ];

    let isValid = true;

    requiredFields.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            if (element.value.trim() === '' && (element.tagName !== 'SELECT' || element.selectedIndex === -1)) {
                element.classList.add('highlight-error');
                isValid = false;
            } else {
                element.classList.remove('highlight-error');
            }
        });
    });

    return isValid;
}

function submitServiceProviderForm(event) {
    event.preventDefault();
    const clientId = localStorage.getItem('clientId');
    const token = localStorage.getItem('syndicateToken');

    if (!validateServiceProviderData()) {
        alert('Please fill in all required fields.');
        return;
    }

    const serviceProviderData = {
        services: Array.from(document.querySelectorAll('#service-provider-services input[type="text"]'))
            .map(input => input.value.trim())
            .filter(value => value !== ''),
        domain: getValue('#service-provider-domain input[type="text"]') || undefined,
        establishedYear: getValue('#service-provider-establishment input[type="text"]') || undefined,
        teamSize: getValue('#service-provider-teamsize input[type="text"]') || undefined,
        turnover: getValue('#service-provider-turnover input[type="text"]') || undefined,
        branches: getValue('#service-provider-branches input[type="text"]') || undefined,
        expertise: getValue('#service-provider-expertise input[type="text"]') || undefined,
        existingClients: getValue('#service-provider-existing input[type="text"]') || undefined,
        onHandProjects: getValue('#service-provider-onhand input[type="text"]') || undefined,
        companyType: getValue('#service-provider-companytypes select') || undefined,
        experience: getValue('#service-provider-experience input[type="text"]') || undefined,
        usp: getValue('#service-provider-usp input[type="text"]') || undefined,
        certifications: getValue('#service-provider-certifications input[type="text"]') || undefined,
        milestones: getValue('#service-provider-milestones input[type="text"]') || undefined,
        others: getValue('#service-provider-others input[type="text"]') || undefined
    };
    
    const dataToSend = { serviceProvider: serviceProviderData };

    console.log('Data to send:', dataToSend);

    fetch(`/api/service-providers/${clientId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        alert('Service provider data submitted successfully!');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error submitting service provider data');
    });
}



function validateManufacturerData() {
    const requiredFields = ['#manufacturedomain'];
  
    let isValid = true;
  
    requiredFields.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        if (element.value.trim() === '' && (element.tagName !== 'SELECT' || element.selectedIndex === -1)) {
          element.classList.add('highlight-error');
          isValid = false;
        } else {
          element.classList.remove('highlight-error');
        }
      });
    });
  
    return isValid;
  }
  
  function submitManufacturerForm(event) {
    event.preventDefault();
  
    if (!validateManufacturerData()) {
      alert('Please fill in all required fields.');
      return;
    }
  
    const clientId = localStorage.getItem('clientId');
    const token = localStorage.getItem('syndicateToken');
  
    const manufacturerData = {
      manufacturerdomain: getValue('#manufacturedomain'),
      manufacturerestablishedYear: getValue('#establishedyear'),
      facility: getValue('#facility'),
      area: getValue('#area'),
      talent: getValue('#talent'),
      engineers: getValue('#engineers'),
      productLine: getValue('#product-line'),
      assemblyLine: getValue('#assembly-line'),
      equipments: getValue('#equipments'),
      certifications: getValue('#certification'),
      locations: getValue('#locations'),
      machineDetails: getValue('#machine-details'),
    };
  
    // Filter out empty values
    const filteredManufacturerData = Object.fromEntries(
      Object.entries(manufacturerData).filter(([_, value]) => value !== "")
    );
  
    // Send manufacturer data to the correct API endpoint
    fetch(`/api/manufacturers/${clientId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(filteredManufacturerData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Manufacturer data submitted successfully:', data);
  
        // Check if there is a file to upload
        const fileInput = document.querySelector('#facility-inventory');
        if (fileInput && fileInput.files.length > 0) {
          const formData = new FormData();
          formData.append('facilityInventory', fileInput.files[0]);
  
          // Send the file data to the correct API endpoint
          fetch(`/api/manufacturers/${clientId}/file`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              return response.json();
            })
            .then((data) => {
              console.log('File uploaded successfully:', data);
              alert('Manufacturer data and file submitted successfully!');
            })
            .catch((error) => {
              console.error('Error uploading file:', error);
              alert('Error uploading file');
            });
        } else {
          alert('Manufacturer data submitted successfully without file!');
        }
      })
      .catch((error) => {
        console.error('Error submitting manufacturer data:', error);
        alert('Error submitting manufacturer data');
      });
  }
  



function marketData() {
    const requiredFields = [
        '#channeldomain',
    ];

    let isValid = true;

    requiredFields.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            if (element.value.trim() === '' && (element.tagName !== 'SELECT' || element.selectedIndex === -1)) {
                element.classList.add('highlight-error');
                isValid = false;
            } else {
                element.classList.remove('highlight-error');
            }
        });
    });

    return isValid;
}

function submitMarketAccessForm(event) {
    event.preventDefault();

    const clientId = localStorage.getItem('clientId');
    const token = localStorage.getItem('syndicateToken');

    if (!marketData()) {
        alert('Please fill in all required fields.');
        return;
    }

    const marketAccessData = {
        title: getValue('#title_market_access'),
        salesCoverage: getValue('#sales-coverages'),
        channeldomain: getValue('#channeldomain'),
        turnover: getValue('#turn-over'),
        reach: getCheckedValues('#market-access-reach'),
        field: getCheckedValues('#market-access-field'),
        itemsList: getValue('#items-list'),
        channelexperience: getValue('#channelexperience'),
        network: getValue('#network'),
        channelmilestones: getValue('#channelmilestones'),
        keyNotes: getValue('#key-notes')
    };

    // Log each field for debugging
    Object.keys(marketAccessData).forEach(key => {
        console.log(`Field "${key}":`, marketAccessData[key]);
    });

    const dataToSend = { channelPartner: marketAccessData };

    console.log('Data to send:', dataToSend);

    // Send data to the backend API endpoint for channel partner
    fetch(`/api/channel-partners/${clientId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        alert('Market access data submitted successfully!');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error submitting market access data');
    });
}


function domainData() {
    const requiredFields = [
        '#domain-expert-role input[type="text"]'
    ];

    let isValid = true;

    requiredFields.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            if (element.value.trim() === '' && (element.tagName !== 'SELECT' || element.selectedIndex === -1)) {
                element.classList.add('highlight-error');
                isValid = false;
            } else {
                element.classList.remove('highlight-error');
            }
        });
    });

    return isValid;
}

function submitDomainExpertForm(event) {
    event.preventDefault();

    const clientId = localStorage.getItem('clientId');
    const token = localStorage.getItem('syndicateToken');

    if (!domainData()) {
        alert('Please fill in all required fields.');
        return;
    }

    const domainExpertData = {
        domaintitle: getValue('#domain-expert-role input[type="text"]'),
        expertdomain: getValue('#domain-expert-domain input[type="text"]'),
        academics: getValue('#domain-expert-academics textarea'),
        field: getValue('#domain-expert-field textarea'),
        experience: getValue('#domain-expert-experience textarea'),
        recognition: getValue('#domain-expert-recognition textarea'),
        patentsInvention: getValue('#domain-expert-patents textarea'),
        network: getValue('#domain-expert-network textarea'),
        expertkeynotes: getValue('#domain-expert-keynotes textarea')
    };

    const dataToSend = { domainExpert: domainExpertData };

    console.log('Data to send:', dataToSend);

    // Send data to the backend API endpoint for domain expert
    fetch(`/api/domain-experts/${clientId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        alert('Domain expert data submitted successfully!');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error submitting domain expert data');
    });
}



function getCheckedValues(selector) {
return Array.from(document.querySelectorAll(`${selector} input[type="checkbox"]:checked`))
  .map(input => {
    const label = input.parentElement; // Assuming the label is the next sibling of the checkbox
    return label ? label.textContent.trim() : input.value.trim();
  });
}

function getSingleCheckedValue(selector) {
const checkedInput = document.querySelector(`${selector} input[type="checkbox"]:checked`);
return checkedInput ? checkedInput.value.trim() : '';
}


function getValue(selector) {
const element = document.querySelector(selector);
return element ? element.value : '';
}

document.addEventListener('DOMContentLoaded', () => {
    const investorSubmitButton = document.getElementById('investor-submit-button');
    if (investorSubmitButton) {
        investorSubmitButton.addEventListener('click', submitInvestorForm);
    }
    const submitButton = document.getElementById('submit-button');
    if (submitButton) {
        submitButton.addEventListener('click', submitForm);
    }

    const serviceProviderSubmitButton = document.getElementById('service-provider-submit-button');
    if (serviceProviderSubmitButton) {
        serviceProviderSubmitButton.addEventListener('click', submitServiceProviderForm);
    }

    const manufacturerSubmitButton = document.getElementById('manufacture-submit-button');
    if (manufacturerSubmitButton) {
        manufacturerSubmitButton.addEventListener('click', submitManufacturerForm);
    }

    const channelPartnerSubmitButton = document.getElementById('channel-submit-button');
    if (channelPartnerSubmitButton) {
        channelPartnerSubmitButton.addEventListener('click', submitMarketAccessForm);
    }
    
    const domainExpertSubmitButton = document.getElementById('domain-expert-submit');
    if (domainExpertSubmitButton) {
        domainExpertSubmitButton.addEventListener('click', submitDomainExpertForm);
    }

});
