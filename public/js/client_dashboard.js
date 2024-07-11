import { API_BASE_URL } from './apiconfig';
document.addEventListener('DOMContentLoaded', loadForms);

function loadForms() {
    loadMarketAccessForm();
    loadExpertTalentForm();
    loadProductForm();
    loadManufacturingForm();
    loadFundsForm();
}

function loadMarketAccessForm() {
    document.getElementById('formContainer').innerHTML += `
            
        <div class="details market-access">
            <span class="title">Market Access</span>
            <div class="fields">
                <div class="input-field">
                    <label>Region</label>
                    <select id="region" required>
                        <option disabled selected>Select Region</option>
                        <option>North</option>
                        <option>South</option>
                        <option>East</option>
                        <option>West</option>
                        <option>Pan India</option>
                        <option>International Market</option>
                        <option>Others</option>
                    </select>
                </div>
                <div class="input-field">
                    <label>Business Model</label>
                    <input id="businessModel" type="text" placeholder="Eg: B2B, B2C, B2G, D2C etc" required>
                </div>
                <div class="input-field">
                    <label>Industry/Domain</label>
                    <input id="industryDomain" type="text" placeholder="Ex: Automobile, Agri, Food, etc" required>
                </div>
                <div class="input-field">
                    <label>Sub-Category</label>
                    <input id="subCategory" type="text" placeholder="Mention if any">
                </div>
            </div>
        </div>
    `;
}

function loadExpertTalentForm() {
    document.getElementById('formContainer').innerHTML += `
        <div class="details expert">
            <span class="title">Expert Services</span>
            <div class="fields">
                <div class="input-field">
                    <label>Talent Procurement</label>
                    <input id="talentProcurement" type="checkbox">
                </div>
                <div class="input-field">
                    <label>Website</label>
                    <input id="website" type="checkbox">
                </div>
                <div class="input-field">
                    <label>Branding</label>
                    <input id="branding" type="checkbox">
                </div>
                <div class="input-field">
                    <label>Intellectual Property</label>
                    <input id="intellectualProperty" type="checkbox">
                </div>
                <div class="input-field">
                    <label>HR and Accounts</label>
                    <input id="hrAccounts" type="checkbox">
                </div>
                <div class="input-field">
                    <label>Other</label>
                    <input id="otherExpertServices" type="text" placeholder="Specify other services">
                </div>
            </div>
        </div>
    `;
}

function loadProductForm() {
    document.getElementById('formContainer').innerHTML += `
        <div class="details product">
            <span class="title">Product Creation</span>
            <div class="fields">
                <div class="input-field">
                    <label>Product Design</label>
                    <input id="productDesign" type="checkbox">
                </div>
                <div class="input-field">
                    <label>Prototype</label>
                    <input id="prototype" type="checkbox">
                </div>
                <div class="input-field">
                    <label>Testing and Certification</label>
                    <input id="testingCertification" type="checkbox">
                </div>
                <div class="input-field">
                    <label>Cost estimation and Optimization</label>
                    <input id="costEstimation" type="checkbox">
                </div>
                <div class="input-field">
                    <label>Indeginization</label>
                    <input id="indeginization" type="checkbox">
                </div>
                <div class="input-field">
                    <label>Other</label>
                    <input id="otherProductCreation" type="text" placeholder="Specify other services">
                </div>
            </div>
        </div>
    `;
}

function loadManufacturingForm() {
    document.getElementById('formContainer').innerHTML += `
        <div class="details manufacturing">
            <span class="title">Manufacturing</span>
            <div class="fields">
                <div class="input-field">
                    <label>Licensing Inward</label>
                    <input id="licensingInward" type="checkbox">
                </div>
                <div class="input-field">
                    <label>Licensing Outward</label>
                    <input id="licensingOutward" type="checkbox">
                </div>
                <div class="input-field">
                    <label>Other Licensing</label>
                    <input id="otherLicensing" type="text" placeholder="Specify other licensing">
                </div>
                <div class="input-field">
                    <label>Office Space</label>
                    <input id="officeSpace" type="text" placeholder="Specify office space requirement" required>
                </div>
            </div>
        </div>
    `;
}

function loadFundsForm() {
    document.getElementById('formContainer').innerHTML += `
        <div class="details funding">
            <span class="title">Funding</span>
            <div class="fields">
                <div class="input-field">
                    <label>Equity</label>
                    <input id="equity" type="checkbox">
                </div>
                <div class="input-field">
                    <label>Debt</label>
                    <input id="debt" type="checkbox">
                </div>
                <div class="input-field">
                    <label>Project Finance</label>
                    <input id="projectFinance" type="checkbox">
                </div>
                <div class="input-field">
                    <label>Royalty and License Fee</label>
                    <input id="royaltyLicenseFee" type="checkbox">
                </div>
                <div class="input-field">
                    <label>Subsidy</label>
                    <input id="subsidy" type="checkbox">
                </div>
                <div class="input-field">
                    <label>BG / LC</label>
                    <input id="bgLc" type="checkbox">
                </div>
                <div class="input-field">
                    <label>Not Required</label>
                    <input id="notRequired" type="checkbox">
                </div>
                <div class="input-field">
                    <label>Other</label>
                    <input id="otherFunding" type="text" placeholder="Specify other funding options">
                </div>
            </div>
        </div>
    `;
}

document.getElementById('submitBtn').addEventListener('click', submitFormData);
// Function to save all form data and submit to backend
async function submitFormData() {
    try {
        // Prepare formData object
        const formData = {
            market_access: {
                region: document.getElementById('region').value,
                business_model: document.getElementById('businessModel').value,
                industry_domain: document.getElementById('industryDomain').value,
                sub_category: document.getElementById('subCategory').value
            },
            expert_talent: {
                talent_procurement: document.getElementById('talentProcurement').checked,
                website: document.getElementById('website').checked,
                branding: document.getElementById('branding').checked,
                intellectual_property: document.getElementById('intellectualProperty').checked,
                hr_accounts: document.getElementById('hrAccounts').checked,
                other_services: document.getElementById('otherExpertServices').value
            },
            product_creation: {
                product_design: document.getElementById('productDesign').checked,
                prototype: document.getElementById('prototype').checked,
                testing_certification: document.getElementById('testingCertification').checked,
                cost_estimation: document.getElementById('costEstimation').checked,
                indeginization: document.getElementById('indeginization').checked,
                other_services: document.getElementById('otherProductCreation').value
            },
            manufacturing: {
                licensing_inward: document.getElementById('licensingInward').checked,
                licensing_outward: document.getElementById('licensingOutward').checked,
                other_licensing: document.getElementById('otherLicensing').value,
                office_space: document.getElementById('officeSpace').value
            },
            funding: {
                equity: document.getElementById('equity').checked,
                debt: document.getElementById('debt').checked,
                project_finance: document.getElementById('projectFinance').checked,
                royalty_license_fee: document.getElementById('royaltyLicenseFee').checked,
                subsidy: document.getElementById('subsidy').checked,
                bg_lc: document.getElementById('bgLc').checked,
                not_required: document.getElementById('notRequired').checked,
                other_funding: document.getElementById('otherFunding').value
            }
        };

        // Store formData in localStorage
        localStorage.setItem('formData', JSON.stringify(formData));
        console.log('FormData saved to localStorage:', formData);

        // Now call submitAllData to handle the final submission
        await submitAllData(new Event('submit'));
        // Show success message
        alert('Data successfully submitted.');

        // Redirect to index.html
        window.location.href = 'client.html';

    } catch (error) {
        console.error('Error preparing form data:', error);
        alert('Error preparing form data. Please try again.');
    }
}


// Function to fetch user data and login
async function fetchUserData(email, password) {
    console.log('Attempting to log in with email:', email);
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            console.error(`Login failed - Status: ${response.status}`);
            throw new Error(`Invalid credentials - Status: ${response.status}`);
        }

        const userData = await response.json();
        console.log('Login successful:', userData);
        localStorage.setItem('accessToken', userData.token); // Store the token
        localStorage.setItem('userEmail', email); // Store user email for later use
        return userData; // Return user data object
    } catch (error) {
        console.error('Error logging in:', error);
        throw error; // Propagate the error so the caller can handle it
    }
}
async function submitAllData(event) {
    event.preventDefault();
    console.log('Submitting form data');

    // Retrieve formData and userEmail from localStorage
    const formData = JSON.parse(localStorage.getItem('formData')) || {};
    const userEmail = localStorage.getItem('userEmail');
    console.log('Retrieved formData from localStorage:', formData);
    console.log('Retrieved userEmail from localStorage:', userEmail);

    // Include userEmail in formData
    formData.email = userEmail;

    const token = localStorage.getItem('accessToken');
    if (!token) {
        console.error('No access token found in localStorage');
        return;
    }
    console.log('Retrieved access token from localStorage:', token);

    try {
        const response = await fetch(`${API_BASE_URL}/api/submit-form`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Include JWT token
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            console.error('Failed to submit form data - Status:', response.status);
            throw new Error('Failed to submit form data');
        }

        const data = await response.json();
        console.log('Form data submitted successfully:', data);
        // Handle success, e.g., show confirmation message
    } catch (error) {
        console.error('Error submitting form data:', error);
        // Handle error, e.g., show error message to user
    }
}

