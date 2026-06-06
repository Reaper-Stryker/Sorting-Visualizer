document.addEventListener("DOMContentLoaded", () => {
    const sortSelect = document.getElementById("sorting-algorithm");
    const searchSelect = document.getElementById("search-algorithm");
    
    const allTheorySections = document.querySelectorAll('div[class$="-sort"], div[class$="-search"]');

    function hideAllSections() {
        allTheorySections.forEach(section => {
            section.style.display = "none";
        });
    }

    function showTheory(value, type) {
        hideAllSections();
        const targetClass = `.${value}-${type}`;
        const targetSection = document.querySelector(targetClass);
        
        if (targetSection) {
            targetSection.style.display = "block";
        }
    }

    sortSelect.addEventListener("change", (e) => {
        showTheory(e.target.value, "sort");
    });

    searchSelect.addEventListener("change", (e) => {
        showTheory(e.target.value, "search");
    });

    showTheory(sortSelect.value, "sort");
});