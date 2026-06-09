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

const visualizationContainer = document.querySelector('.visualization');
const generateArrayBtn = document.getElementById('generate-array');
let array = [];

function generateArray(size = 30) {
    array = [];
    visualizationContainer.innerHTML = ''; 
    
    for (let i = 0; i < size; i++) {
        const value = Math.floor(Math.random() * 370) + 10;
        array.push(value);
        
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = `${value}px`;
        
        visualizationContainer.appendChild(bar);
    }
}

generateArrayBtn.addEventListener('click', () => {
    generateArray();
});

generateArray();