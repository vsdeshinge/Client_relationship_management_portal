document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".tab-button");
    const contentDivs = document.querySelectorAll(".content");
    const subtabButtons = document.querySelectorAll(".subtab-button");
    const subcontentDivs = document.querySelectorAll(".subcontent");

    const tabs = {
        "visitors": document.getElementById("visitors"),
        "qualified-leads": document.getElementById("qualified-leads"),
        "business-proposals": document.getElementById("business-proposals"),
        "customers": document.getElementById("customers")
    };

    const subtabs = {
        "projects": document.getElementById("projects"),
        "products": document.getElementById("products"),
        "services": document.getElementById("services"),
        "solutions": document.getElementById("solutions")
    };

    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            tabButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const tabId = button.getAttribute("data-tab");
            contentDivs.forEach(div => div.classList.remove("active"));
            tabs[tabId].classList.add("active");
        });
    });

    subtabButtons.forEach(button => {
        button.addEventListener("click", () => {
            subtabButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const subtabId = button.getAttribute("data-subtab");
            subcontentDivs.forEach(div => div.classList.remove("active"));
            subtabs[subtabId].classList.add("active");
        });
    });

    const backButtonActions = {
        "projects": () => { /* define what happens when back button is clicked for projects */ },
        "products": () => subtabs["projects"].classList.add("active"),
        "services": () => subtabs["products"].classList.add("active"),
        "solutions": () => subtabs["services"].classList.add("active")
    };

    const nextButtonActions = {
        "projects": () => subtabs["products"].classList.add("active"),
        "products": () => subtabs["services"].classList.add("active"),
        "services": () => subtabs["solutions"].classList.add("active"),
        "solutions": () => { /* define what happens when next button is clicked for solutions */ }
    };

    document.getElementById("backBtnProjects").addEventListener("click", () => backButtonActions["projects"]());
    document.getElementById("nextBtnProjects").addEventListener("click", () => nextButtonActions["projects"]());
    document.getElementById("backBtnProducts").addEventListener("click", () => backButtonActions["products"]());
    document.getElementById("nextBtnProducts").addEventListener("click", () => nextButtonActions["products"]());
    document.getElementById("backBtnServices").addEventListener("click", () => backButtonActions["services"]());
    document.getElementById("nextBtnServices").addEventListener("click", () => nextButtonActions["services"]());
    document.getElementById("backBtnSolutions").addEventListener("click", () => backButtonActions["solutions"]());
    document.getElementById("nextBtnSolutions").addEventListener("click", () => nextButtonActions["solutions"]());
});






document.addEventListener('DOMContentLoaded', function() {
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');
    const sections = document.querySelectorAll('.content');
    let currentIndex = 0;

    function showSection(index) {
        sections.forEach((section, i) => {
            section.style.display = i === index ? 'block' : 'none';
        });
    }

    nextBtn.addEventListener('click', function() {
        if (currentIndex < sections.length - 1) {
            currentIndex++;
            showSection(currentIndex);
        }
    });

    backBtn.addEventListener('click', function() {
        if (currentIndex > 0) {
            currentIndex--;
            showSection(currentIndex);
        }
    });

    submitBtn.addEventListener('click', function() {
        if (currentIndex > 0) {
            currentIndex--;
            showSection(currentIndex);
        }
    });

    showSection(currentIndex);
});