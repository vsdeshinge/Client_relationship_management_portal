function showVisitingCardPopup() {
    document.getElementById('visiting-card-popup').classList.remove('hidden');
}

function hideVisitingCardPopup() {
    document.getElementById('visiting-card-popup').classList.add('hidden');
}

function showNeedFormPopup() {
    document.getElementById('need-form-popup').classList.remove('hidden');
}

function hideNeedFormPopup() {
    document.getElementById('need-form-popup').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    const proposalId = localStorage.getItem('proposalId');
    if (proposalId) {
        fetchProposalDetails(proposalId);
    } else {
        console.error('Proposal ID not found in local storage.');
    }

    const proposalForm = document.getElementById('business-proposal-form');
    if (proposalForm) {
        proposalForm.addEventListener('submit', submitBusinessProposalForm);
    }
});

async function fetchProposalDetails(proposalId) {
    const token = localStorage.getItem('adminToken');
    try {
        const response = await fetch(`/api/visitors/${proposalId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const proposal = await response.json();
            console.log('Proposal details fetched:', proposal);
            displayProposalDetails(proposal);
        } else {
            console.error('Error fetching proposal details:', await response.text());
        }
    } catch (error) {
        console.error('Error fetching proposal details:', error);
    }
}

function displayProposalDetails(proposal) {
    console.log('Displaying proposal details:', proposal);
    const proposalDetails = document.querySelector('.container2');
    if (proposalDetails) {
        const faceImageUrl = proposal.faceImage ? `/uploads/blob/${proposal.faceImage}` : 'https://via.placeholder.com/80';
        proposalDetails.innerHTML = `
            <div class="rounded-card">
                <div class="flex items-center">
                    <img src="${faceImageUrl}" alt="Profile" class="profile-img">
                    <div>
                        <p class="text-lg font-bold">Name: ${proposal.name}</p>
                        <p class="text-sm">Company: ${proposal.companyName}</p>
                        <p class="text-sm">Domain: ${proposal.domain}</p>
                        <p class="text-sm">Email: ${proposal.email}</p>
                        <p class="text-sm">Phone no.: ${proposal.phone}</p>
                    </div>
                </div>
            </div>
        `;
    } else {
        console.error('Element for proposal details not found.');
    }
}
async function submitBusinessProposalForm(event) {
    event.preventDefault();
    const proposalId = localStorage.getItem('proposalId');
    const token = localStorage.getItem('adminToken');

    const businessProposalData = {
        typeOfRegistration: document.getElementById('typeOfRegistration').value || '',
        gstNo: document.getElementById('gstNo').value || '',
        panNo: document.getElementById('panNo').value || '',
        annualTurnover: document.getElementById('annualTurnover').value || '',
        decisionMakers: document.getElementById('decisionMakers').value || ''
    };

    try {
        const response = await fetch(`/api/business-proposals/${proposalId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ businessProposal: businessProposalData })
        });
        if (response.ok) {
            const data = await response.json();
            console.log('Business proposal data submitted successfully:', data);
            alert('Business proposal data submitted successfully!');
        } else {
            console.error('Error submitting business proposal data:', await response.text());
            alert('Error submitting business proposal data');
        }
    } catch (error) {
        console.error('Error submitting business proposal data:', error);
        alert('Error submitting business proposal data');
    }
}
