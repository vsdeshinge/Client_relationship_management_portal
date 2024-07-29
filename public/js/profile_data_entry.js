document.addEventListener('DOMContentLoaded', () => {
    const leadId = localStorage.getItem('leadId');
    if (leadId) {
        fetchVisitorDetails(leadId);
    } else {
        console.error('Lead ID not found in local storage.');
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

    const investorSubmitButton = document.getElementById('investor-submit-button');
    if (investorSubmitButton) {
        investorSubmitButton.addEventListener('click', submitInvestorForm);
    }

    const domainExpertSubmitButton = document.getElementById('domain-expert-submit');
    if (domainExpertSubmitButton) {
        domainExpertSubmitButton.addEventListener('click', submitDomainExpertForm);
    }
});

async function fetchVisitorDetails(leadId) {
    const token = localStorage.getItem('adminToken');
    try {
        const response = await fetch(`/api/visitors/${leadId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const visitor = await response.json();
            console.log('Visitor details fetched:', visitor);
            displayVisitorDetails(visitor);
        } else {
            console.error('Error fetching visitor details:', await response.text());
        }
    } catch (error) {
        console.error('Error fetching visitor details:', error);
    }
}

function displayVisitorDetails(visitor) {
    console.log('Displaying visitor details:', visitor);
    const visitorDetails = document.querySelector('.container2');
    if (visitorDetails) {
        const faceImageUrl = visitor.faceImage ? `/uploads/blob/${visitor.faceImage}` : 'https://via.placeholder.com/80';
        visitorDetails.innerHTML = `
            <div class="rounded-card">
                <div class="flex items-center">
                    <img src="${faceImageUrl}" alt="Profile" class="profile-img">
                    <div>
                        <p class="text-lg font-bold">Name: ${visitor.name}</p>
                        <p class="text-sm">Company: ${visitor.companyName}</p>
                        <p class="text-sm">Domain: ${visitor.domain}</p>
                        <p class="text-sm">Email: ${visitor.email}</p>
                        <p class="text-sm">Phone no.: ${visitor.phone}</p>
                    </div>
                </div>
            </div>
        `;
    } else {
        console.error('Element for visitor details not found.');
    }
}


function submitForm(event) {
    event.preventDefault(); 

    const leadId = localStorage.getItem('leadId');
    const token = localStorage.getItem('adminToken');

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
        workstationRequired: getSingleCheckedValue('#service-workstation-required .options'),
        productDisplayRequired: getSingleCheckedValue('#service-product-display-required .options'),
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

    fetch(`/api/clients/${leadId}`, {
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
        alert('Project submitted successfully!');
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Error submitting project');
    });
}



function submitServiceProviderForm(event) {
    event.preventDefault();
    const leadId = localStorage.getItem('leadId');
    const token = localStorage.getItem('adminToken');

const serviceProviderData = {
    services: Array.from(document.querySelectorAll('#service-provider-services input[type="text"]')).map(input => input.value.trim()).filter(value => value !== ''),
    domain: getValue('#service-provider-domain input[type="text"]'),
    establishedYear: getValue('#service-provider-establishment input[type="text"]'),
    teamSize: getValue('#service-provider-teamsize input[type="text"]'),
    turnover: getValue('#service-provider-turnover input[type="text"]'),
    branches: getValue('#service-provider-branches input[type="text"]'),
    expertise: getValue('#service-provider-experties input[type="text"]'),
    existingClients: getValue('#service-provider-exsisting input[type="text"]'),
    onHandProjects: getValue('#service-provider-onhand input[type="text"]'),
    companyType: getValue('#service-provider-companytypes select'),
    experience: getValue('#service-provider-experiences input[type="text"]'),
    usp: getValue('#service-provider-usp input[type="text"]'),
    certifications: getValue('#service-provider-certifications input[type="text"]'),
    milestones: getValue('#service-provider-milestones input[type="text"]'),
    others: getValue('#service-provider-others input[type="text"]')
};
const dataToSend = { serviceProvider: serviceProviderData };

console.log('Data to send:', dataToSend);

fetch(`/api/clients/${leadId}`, {
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

// function submitManufacturerForm(event) {
//     event.preventDefault();

//     const leadId = localStorage.getItem('leadId');
//     const token = localStorage.getItem('adminToken');

//     const manufacturerData = {
//         manufacturerdomain: getValue('#domain'),
//         manufacturerestablishedYear: getValue('#establishedYear'),
//         facility: getValue('#facility'),
//         area: getValue('#area'),
//         talent: getValue('#talent'),
//         engineers: getValue('#engineers'),
//         productLine: getValue('#productLine'),
//         assemblyLine: getValue('#assemblyLine'),
//         equipments: getValue('#equipments'),
//         certifications: getValue('#certifications'),
//         locations: getValue('#locations'),
//         machineDetails: getValue('#machineDetails')
//     };

//     const formData = new FormData();
//     formData.append('manufacturer', JSON.stringify(manufacturerData));

//     const facilityInventoryFile = document.getElementById('facility-inventory').files[0];
//     if (facilityInventoryFile) {
//         formData.append('facilityInventory', facilityInventoryFile);
//     }

//     console.log('Data to send:', Array.from(formData.entries()));

//     fetch(`/api/clients/${leadId}`, {
//         method: 'PATCH',
//         headers: {
//             'Authorization': `Bearer ${token}`
//         },
//         body: formData
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         return response.json();
//     })
//     .then(data => {
//         console.log('Success:', data);
//         alert('Manufacturer data submitted successfully!');
//     })
//     .catch(error => {
//         console.error('Error:', error);
//         alert('Error submitting manufacturer data');
//     });
// }
function submitManufacturerForm(event) {
    event.preventDefault();
  
    const leadId = localStorage.getItem('leadId');
    const token = localStorage.getItem('adminToken');
  
    const manufacturerData = {
      manufacturerdomain: getValue('#domain'),
      manufacturerestablishedYear: getValue('#established-year'),  // Ensure correct naming
      facility: getValue('#facility'),
      area: getValue('#area'),
      talent: getValue('#talent'),
      engineers: getValue('#engineers'),
      productLine: getValue('#product-line'),
      assemblyLine: getValue('#assembly-line'),
      equipments: getValue('#equipments'),
      locations: getValue('#locations'),
      machineDetails: getValue('#machine-details')
    };
  
    const fileInput = document.querySelector('#facility-inventory');
    const formData = new FormData();
  
    for (const key in manufacturerData) {
      if (manufacturerData.hasOwnProperty(key)) {
        formData.append(`manufacturer.${key}`, manufacturerData[key]);
      }
    }
  
    // Check if file input is used
    if (fileInput && fileInput.files.length > 0) {
      formData.append('facilityInventory', fileInput.files[0]);
    } else {
      console.warn('No file selected for upload.');
    }
  
    fetch(`/api/manufacture/${leadId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Success:', data);
      alert('Manufacturer data submitted successfully!');
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error submitting manufacturer data');
    });
  }
  

function submitMarketAccessForm(event) {
    event.preventDefault();

    const leadId = localStorage.getItem('leadId');
    const token = localStorage.getItem('adminToken');

    const marketAccessData = {
        title: getValue('#title_market_access'),
        salesCoverage: getValue('#sales-coverage'),
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

    fetch(`/api/clients/${leadId}`, {
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


function submitInvestorForm(event) {
    event.preventDefault();

    const leadId = localStorage.getItem('leadId');
    const token = localStorage.getItem('adminToken');

    const title = document.getElementById('investor-title').value;
    const companyName = document.getElementById('investor-companyName').value;
    const domain = document.getElementById('investor-domain').value;
    const networth = document.getElementById('investor-networth').value;
    const previousInvestments = document.getElementById('investor-previousInvestments').value;
    const keyNotes = document.getElementById('investor-keyNotes').value;

    // Get all selected checkboxes
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

    // Send data to the backend
    fetch(`/api/investor/${leadId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Include token for authentication
        },
        body: JSON.stringify(investorData)
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).then(data => {
        console.log('Success:', data);
        alert('Investor data submitted successfully!');
    }).catch(error => {
        console.error('Error:', error);
        alert('Error submitting investor data');
    });
}


function submitDomainExpertForm(event) {
    event.preventDefault();

    const leadId = localStorage.getItem('leadId');
    const token = localStorage.getItem('adminToken');

    const domainExpertData = {
        role: getValue('#domain-expert-role input[type="text"]'),
        position: getValue('#domain-expert-position select'),
        expertdomain: getValue('#domain-expert-domain input[type="text"]'),
        academics: getValue('#domain-expert-academics textarea'),
        field: getValue('#domain-expert-field textarea'),
        experience: getValue('#domain-expert-experience textarea'),
        recognition: getValue('#domain-expert-recognition textarea'),
        patentsInvention: getValue('#domain-expert-patents textarea'),
        network: getValue('#domain-expert-network textarea'),
        keynotes: getValue('#domain-expert-keynotes textarea')
    };

    const dataToSend = { domainExpert: domainExpertData };

    console.log('Data to send:', dataToSend);

    fetch(`/api/domain/${leadId}`, {
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

function getCheckboxValues(selector) {
    const checkboxes = document.querySelectorAll(selector);
    return Array.from(checkboxes).filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
}
function getValue(selector) {
    const element = document.querySelector(selector);
    return element ? element.value : '';
}