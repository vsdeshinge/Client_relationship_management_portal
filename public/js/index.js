document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const formContainers = document.querySelectorAll('.form-container');
    const visitorRedirectBtn = document.getElementById('visitorRedirect');
    const clientForm = document.getElementById('clientForm');
    const syndicateForm = document.getElementById('syndicateForm');
    const adminForm = document.getElementById('adminForm');

    console.log('tabBtns:', tabBtns);
    console.log('formContainers:', formContainers);
    console.log('visitorRedirectBtn:', visitorRedirectBtn);
    console.log('clientForm:', clientForm);
    console.log('syndicateForm:', syndicateForm);
    console.log('adminForm:', adminForm);

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');

            tabBtns.forEach(b => b.classList.remove('active'));
            formContainers.forEach(f => f.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });

    if (visitorRedirectBtn) {
        visitorRedirectBtn.addEventListener('click', () => {
            window.location.href = 'visitor.html';
        });
    }

    if (clientForm) {
        clientForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Client login submitted');
            // Add your client login logic here
        });
    }

    if (syndicateForm) {
        syndicateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Syndicate login submitted');
            // Add your syndicate login logic here
        });
    }

    if (adminForm) {
        adminForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Admin login submitted');
            // Add your admin login logic here
        });
    }
});
