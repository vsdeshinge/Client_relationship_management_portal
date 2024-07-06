document.addEventListener('DOMContentLoaded', () => {
    // Form handling
    const form = document.querySelector("form");
    if (form) {
        const nextBtn = form.querySelector(".nextBtn");
        const backBtn = form.querySelector(".backBtn");
        const allInput = form.querySelectorAll(".first input");

        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                let allFilled = true;
                allInput.forEach(input => {
                    if (input.value === "") {
                        allFilled = false;
                    }
                });
                if (allFilled) {
                    form.classList.add('secActive');
                } else {
                    form.classList.remove('secActive');
                }
            });
        }

        if (backBtn) {
            backBtn.addEventListener("click", () => form.classList.remove('secActive'));
        }
    }

    // Syndicate login and data fetching
    const syndicateLoginForm = document.getElementById('syndicateLoginForm');
    if (syndicateLoginForm) {
        syndicateLoginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(syndicateLoginForm);
            const data = Object.fromEntries(formData.entries());
            console.log("Data being sent:", data); // Log the data to check if it contains syndicate_name and password
            try {
                const response = await fetch('/syndicate-login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                if (!response.ok) {
                    const result = await response.json();
                    alert(result.message);
                    return;
                }
                const result = await response.json();
                alert(result.message);
                if (result.message === 'Syndicate login successful') {
                    localStorage.setItem('syndicateToken', result.token);
                    localStorage.setItem('userType', 'syndicate'); 
                    window.location.href = '/welcome.html';
                }
            } catch (error) {
                console.error('Error logging in:', error);
                alert('Error logging in');
            }
        });
    } else {
        const token = localStorage.getItem('syndicateToken');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }

        const fetchData = async () => {
            try {
                const response = await fetch('/syndicate-data', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    const clientsContainer = document.getElementById('syndicateData');
                    clientsContainer.innerHTML = ''; // Clear any existing content
                    data.forEach(client => {
                        const clientDiv = document.createElement('div');
                        clientDiv.textContent = JSON.stringify(client, null, 2);
                        clientsContainer.appendChild(clientDiv);
                    });
                } else {
                    alert(data.message);
                    localStorage.removeItem('syndicateToken');
                    window.location.href = 'index.html';
                }
            } catch (error) {
                console.error('Error fetching syndicate data:', error);
                alert('Error fetching syndicate data');
                localStorage.removeItem('syndicateToken');
                window.location.href = 'index.html';
            }
        };

        fetchData();
    }
});
