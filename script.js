document.addEventListener("DOMContentLoaded", () => {
    const sortSelect = document.getElementById("sorting-algorithm");
    const searchSelect = document.getElementById("search-algorithm");
    const allTheorySections = document.querySelectorAll('div[class$="-sort"], div[class$="-search"]');
    const visualizationContainer = document.querySelector('.visualization');
    const generateArrayBtn = document.getElementById('generate-array');
    const sortBtn = document.getElementById('sort-btn');

    let array = [];

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

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function getDelay() {
        const speedSelect = document.getElementById('speed-select');
        if (!speedSelect) return 50; 
        
        const speed = speedSelect.value;
        if (speed === 'slow') return 150; 
        if (speed === 'fast') return 10;  
        return 50; 
    }

    async function bubbleSort() {
        const bars = document.querySelectorAll('.bar');
        let delay = getDelay();

        for (let i = 0; i < bars.length - 1; i++) {
            for (let j = 0; j < bars.length - i - 1; j++) {
                
                bars[j].style.backgroundColor = '#e74c3c'; 
                bars[j + 1].style.backgroundColor = '#e74c3c';

                await sleep(delay);

                let height1 = parseInt(bars[j].style.height);
                let height2 = parseInt(bars[j + 1].style.height);

                if (height1 > height2) {
                    bars[j].style.height = `${height2}px`;
                    bars[j + 1].style.height = `${height1}px`;
                }

                bars[j].style.backgroundColor = '#3498db'; 
                bars[j + 1].style.backgroundColor = '#3498db';
            }
            bars[bars.length - 1 - i].style.backgroundColor = '#2ecc71'; 
        }
        bars[0].style.backgroundColor = '#2ecc71';
    }

    async function selectionSort() {
        const bars = document.querySelectorAll('.bar');
        let delay = getDelay();

        for (let i = 0; i < bars.length; i++) {
            let minIdx = i;
            bars[minIdx].style.backgroundColor = '#e74c3c'; 

            for (let j = i + 1; j < bars.length; j++) {
                bars[j].style.backgroundColor = '#f1c40f'; 
                
                await sleep(delay);

                let height1 = parseInt(bars[j].style.height);
                let height2 = parseInt(bars[minIdx].style.height);

                if (height1 < height2) {
                    if (minIdx !== i) {
                        bars[minIdx].style.backgroundColor = '#3498db';
                    }
                    minIdx = j;
                    bars[minIdx].style.backgroundColor = '#e74c3c'; 
                } else {
                    bars[j].style.backgroundColor = '#3498db'; 
                }
            }

            if (minIdx !== i) {
                let tempHeight = bars[minIdx].style.height;
                bars[minIdx].style.height = bars[i].style.height;
                bars[i].style.height = tempHeight;
            }

            bars[minIdx].style.backgroundColor = '#3498db';
            bars[i].style.backgroundColor = '#2ecc71'; 
        }
    }

    async function insertionSort() {
        const bars = document.querySelectorAll('.bar');
        let delay = getDelay();

        bars[0].style.backgroundColor = '#2ecc71'; 

        for (let i = 1; i < bars.length; i++) {
            let j = i - 1;
            let keyHeight = parseInt(bars[i].style.height);
            
            bars[i].style.backgroundColor = '#e74c3c'; 
            await sleep(delay);

            while (j >= 0 && parseInt(bars[j].style.height) > keyHeight) {
                bars[j].style.backgroundColor = '#e74c3c';
                
                bars[j + 1].style.height = bars[j].style.height; 
                
                await sleep(delay);
                
                for(let k = i; k >= 0; k--){
                    bars[k].style.backgroundColor = '#2ecc71'; 
                }
                j--;
            }
            
            bars[j + 1].style.height = `${keyHeight}px`; 
            
            for(let k = 0; k <= i; k++){
                bars[k].style.backgroundColor = '#2ecc71'; 
            }
        }
    }

    async function partition(bars, low, high) {
        let delay = getDelay();
        
        let pivot = parseInt(bars[high].style.height);
        bars[high].style.backgroundColor = '#e74c3c'; 

        let i = low - 1;

        for (let j = low; j <= high - 1; j++) {
            bars[j].style.backgroundColor = '#f1c40f'; 
            await sleep(delay);

            if (parseInt(bars[j].style.height) < pivot) {
                i++;
                let tempHeight = bars[i].style.height;
                bars[i].style.height = bars[j].style.height;
                bars[j].style.height = tempHeight;
                
                bars[i].style.backgroundColor = '#e67e22'; 
                await sleep(delay);
            }
            
            if(i !== j) {
                bars[j].style.backgroundColor = '#3498db';
            }
        }

        let tempHeight = bars[i + 1].style.height;
        bars[i + 1].style.height = bars[high].style.height;
        bars[high].style.height = tempHeight;

        bars[high].style.backgroundColor = '#3498db';
        bars[i + 1].style.backgroundColor = '#2ecc71'; 

        return i + 1;
    }

    async function quickSortRecursive(bars, low, high) {
        if (low < high) {
            let pivotIndex = await partition(bars, low, high);
            
            await quickSortRecursive(bars, low, pivotIndex - 1);
            await quickSortRecursive(bars, pivotIndex + 1, high);
        } else if (low >= 0 && high >= 0 && low < bars.length && high < bars.length) {
            bars[low].style.backgroundColor = '#2ecc71';
            bars[high].style.backgroundColor = '#2ecc71';
        }
    }

    async function quickSort() {
        const bars = document.querySelectorAll('.bar');
        await quickSortRecursive(bars, 0, bars.length - 1);
        
        for(let k = 0; k < bars.length; k++){
            bars[k].style.backgroundColor = '#2ecc71'; 
        }
    }

    sortBtn.addEventListener('click', async () => {
        const selectedAlgo = sortSelect.value;

        sortBtn.disabled = true;
        generateArrayBtn.disabled = true;
        sortSelect.disabled = true;
        document.getElementById('speed-select').disabled = true;

        if (selectedAlgo === 'bubble') {
            await bubbleSort();
        } else if (selectedAlgo === 'selection') {
            await selectionSort();
        } else if (selectedAlgo === 'insertion') {
            await insertionSort();
        } else if (selectedAlgo === 'quick') {
            await quickSort();
        }

        sortBtn.disabled = false;
        generateArrayBtn.disabled = false;
        sortSelect.disabled = false;
        document.getElementById('speed-select').disabled = false;
    });
});