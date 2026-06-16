document.addEventListener("DOMContentLoaded", () => {
    // 1. Grab all UI Elements
    const sortSelect = document.getElementById("sorting-algorithm");
    const searchSelect = document.getElementById("search-algorithm");
    const allTheorySections = document.querySelectorAll('div[class$="-sort"], div[class$="-search"]');
    const visualizationContainer = document.querySelector('.visualization');
    const generateArrayBtn = document.getElementById('generate-array');
    const sortBtn = document.getElementById('sort-btn');
    const searchBtn = document.getElementById('search-btn');
    const sizeSlider = document.getElementById('size-slider');
    const targetInput = document.getElementById('search-target');
    const customArrayInput = document.getElementById('custom-array-input');
    const loadCustomBtn = document.getElementById('load-custom-btn');

    let array = [];
    
    // --- Audio Engine Setup ---
    let audioCtx = null;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function playNote(height) {
        if (!audioCtx) return;

        // Map the bar height (10-380) to a frequency range (200Hz - 800Hz)
        const minFreq = 200;
        const maxFreq = 800;
        const freq = minFreq + ((height / 380) * (maxFreq - minFreq));

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine'; 
        oscillator.frequency.value = freq;

        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1); 
    }

    // --- Theory Display Engine ---
    function hideAllSections() {
        allTheorySections.forEach(section => {
            section.style.display = "none";
        });
    }

    function showTheory(value, type) {
        hideAllSections();
        if (!value) return; 
        
        const targetClass = `.${value}-${type}`;
        const targetSection = document.querySelector(targetClass);
        
        if (targetSection) {
            targetSection.style.display = "block";
        }
    }

    sortSelect.addEventListener("change", (e) => {
        searchSelect.value = ""; 
        showTheory(e.target.value, "sort");
    });

    searchSelect.addEventListener("change", (e) => {
        sortSelect.value = ""; 
        showTheory(e.target.value, "search");
    });

    sortSelect.value = "bubble";  
    searchSelect.value = "";     
    showTheory("bubble", "sort");


    // --- Array Generation Engine ---
    function renderArrayToDOM() {
        visualizationContainer.innerHTML = ''; 
        for (let i = 0; i < array.length; i++) {
            const bar = document.createElement('div');
            bar.classList.add('bar');
            bar.style.height = `${array[i]}px`;
            visualizationContainer.appendChild(bar);
        }
    }

    function generateArray() {
        let size = parseInt(sizeSlider.value);
        array = [];
        for (let i = 0; i < size; i++) {
            const value = Math.floor(Math.random() * 370) + 10;
            array.push(value);
        }
        
        renderArrayToDOM();

        if(targetInput && array.length > 0) {
            const randomTargetIndex = Math.floor(Math.random() * array.length);
            targetInput.value = array[randomTargetIndex];
        }
    }

    loadCustomBtn.addEventListener('click', () => {
        const inputStr = customArrayInput.value;
        if (!inputStr) return;

        const parsedArr = inputStr.split(',')
            .map(num => parseInt(num.trim()))
            .filter(num => !isNaN(num) && num > 0); 

        if (parsedArr.length === 0) {
            alert("Please enter valid comma-separated numbers (e.g., 50, 120, 200).");
            return;
        }

        array = parsedArr;
        renderArrayToDOM();
        sizeSlider.value = array.length;

        if(targetInput) {
            const randomTargetIndex = Math.floor(Math.random() * array.length);
            targetInput.value = array[randomTargetIndex];
        }
    });

    generateArrayBtn.addEventListener('click', () => {
        generateArray();
    });

    sizeSlider.addEventListener('input', () => {
        generateArray();
    });

    generateArray(); 


    // --- Animation Utility Functions ---
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

    function toggleUI(disabled) {
        sortBtn.disabled = disabled;
        searchBtn.disabled = disabled;
        generateArrayBtn.disabled = disabled;
        loadCustomBtn.disabled = disabled;
        customArrayInput.disabled = disabled;
        sortSelect.disabled = disabled;
        searchSelect.disabled = disabled;
        sizeSlider.disabled = disabled;
        targetInput.disabled = disabled;
        document.getElementById('speed-select').disabled = disabled;
    }


    // --- Sorting Algorithms ---
    async function bubbleSort() {
        const bars = document.querySelectorAll('.bar');
        let delay = getDelay();

        for (let i = 0; i < bars.length - 1; i++) {
            for (let j = 0; j < bars.length - i - 1; j++) {
                bars[j].style.backgroundColor = '#e74c3c'; 
                bars[j + 1].style.backgroundColor = '#e74c3c';

                let height1 = parseInt(bars[j].style.height);
                let height2 = parseInt(bars[j + 1].style.height);

                playNote(height1); 
                await sleep(delay);

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
                
                let height1 = parseInt(bars[j].style.height);
                let height2 = parseInt(bars[minIdx].style.height);
                
                playNote(height1);
                await sleep(delay);

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
            playNote(keyHeight);
            await sleep(delay);

            while (j >= 0 && parseInt(bars[j].style.height) > keyHeight) {
                bars[j].style.backgroundColor = '#e74c3c';
                bars[j + 1].style.height = bars[j].style.height; 
                
                playNote(parseInt(bars[j].style.height));
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
            
            playNote(parseInt(bars[j].style.height));
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

    async function merge(bars, left, mid, right) {
        let delay = getDelay();
        let n1 = mid - left + 1;
        let n2 = right - mid;

        let leftArray = new Array(n1);
        let rightArray = new Array(n2);

        for (let i = 0; i < n1; i++) {
            await sleep(delay);
            bars[left + i].style.backgroundColor = '#e67e22'; 
            leftArray[i] = parseInt(bars[left + i].style.height);
        }
        for (let j = 0; j < n2; j++) {
            await sleep(delay);
            bars[mid + 1 + j].style.backgroundColor = '#f1c40f'; 
            rightArray[j] = parseInt(bars[mid + 1 + j].style.height);
        }

        await sleep(delay);

        let i = 0, j = 0, k = left;
        
        while (i < n1 && j < n2) {
            
            playNote(leftArray[i] || rightArray[j]);
            await sleep(delay);
            
            if (leftArray[i] <= rightArray[j]) {
                bars[k].style.height = `${leftArray[i]}px`;
                bars[k].style.backgroundColor = '#2ecc71'; 
                i++;
            } else {
                bars[k].style.height = `${rightArray[j]}px`;
                bars[k].style.backgroundColor = '#2ecc71'; 
                j++;
            }
            k++;
        }

        while (i < n1) {
            playNote(leftArray[i]);
            await sleep(delay);
            bars[k].style.height = `${leftArray[i]}px`;
            bars[k].style.backgroundColor = '#2ecc71';
            i++;
            k++;
        }

        while (j < n2) {
            playNote(rightArray[j]);
            await sleep(delay);
            bars[k].style.height = `${rightArray[j]}px`;
            bars[k].style.backgroundColor = '#2ecc71';
            j++;
            k++;
        }
    }

    async function mergeSortRecursive(bars, left, right) {
        if (left >= right) {
            return;
        }
        let mid = left + Math.floor((right - left) / 2);
        
        await mergeSortRecursive(bars, left, mid);
        await mergeSortRecursive(bars, mid + 1, right);
        await merge(bars, left, mid, right);
    }

    async function mergeSort() {
        const bars = document.querySelectorAll('.bar');
        await mergeSortRecursive(bars, 0, bars.length - 1);
        for(let k = 0; k < bars.length; k++){
            bars[k].style.backgroundColor = '#2ecc71';
        }
    }


    // --- Searching Algorithms ---
    async function linearSearch() {
        const bars = document.querySelectorAll('.bar');
        let delay = getDelay();
        let targetVal = document.getElementById('search-target').value;
        let target = targetVal ? parseInt(targetVal) : -1;

        for (let i = 0; i < bars.length; i++) {
            bars[i].style.backgroundColor = '#f1c40f'; 
            
            let currentHeight = parseInt(bars[i].style.height);
            playNote(currentHeight);
            await sleep(delay);

            if (currentHeight === target) {
                bars[i].style.backgroundColor = '#2ecc71'; 
                return; 
            } else {
                bars[i].style.backgroundColor = '#e74c3c'; 
            }
        }
        alert("Target not found in the array!");
    }

    async function binarySearch() {
        const bars = document.querySelectorAll('.bar');
        let delay = getDelay();
        let targetVal = document.getElementById('search-target').value;
        let target = targetVal ? parseInt(targetVal) : -1;

        let heights = Array.from(bars).map(bar => parseInt(bar.style.height));
        heights.sort((a, b) => a - b);
        for(let i = 0; i < bars.length; i++) {
            bars[i].style.height = `${heights[i]}px`;
            bars[i].style.backgroundColor = '#3498db'; 
        }
        await sleep(delay); 

        let left = 0;
        let right = bars.length - 1;

        while (left <= right) {
            let mid = Math.floor((left + right) / 2);

            bars[left].style.backgroundColor = '#9b59b6'; 
            bars[right].style.backgroundColor = '#9b59b6'; 
            bars[mid].style.backgroundColor = '#f1c40f'; 
            
            let midHeight = parseInt(bars[mid].style.height);
            playNote(midHeight);
            await sleep(delay * 2); 

            if (midHeight === target) {
                bars[mid].style.backgroundColor = '#2ecc71'; 
                
                if(left !== mid) bars[left].style.backgroundColor = '#3498db';
                if(right !== mid) bars[right].style.backgroundColor = '#3498db';
                return;
            }

            if (midHeight < target) {
                for(let i = left; i <= mid; i++) bars[i].style.backgroundColor = '#e74c3c';
                left = mid + 1;
            } else {
                for(let i = mid; i <= right; i++) bars[i].style.backgroundColor = '#e74c3c';
                right = mid - 1;
            }
        }
        alert("Target not found in the array!");
    }


    // --- Action Button Event Listeners ---
    sortBtn.addEventListener('click', async () => {
        initAudio(); // Initialize audio context on click
        const selectedAlgo = sortSelect.value;
        if (!selectedAlgo) {
            alert("Please select a sorting algorithm first.");
            return;
        }

        toggleUI(true);

        if (selectedAlgo === 'bubble') {
            await bubbleSort();
        } else if (selectedAlgo === 'selection') {
            await selectionSort();
        } else if (selectedAlgo === 'insertion') {
            await insertionSort();
        } else if (selectedAlgo === 'quick') {
            await quickSort();
        } else if (selectedAlgo === 'merge') { 
            await mergeSort();
        }

        toggleUI(false);
    });

    searchBtn.addEventListener('click', async () => {
        initAudio(); // Initialize audio context on click
        const selectedSearch = searchSelect.value;
        if (!selectedSearch) {
            alert("Please select a searching algorithm first.");
            return;
        }

        toggleUI(true);

        const bars = document.querySelectorAll('.bar');
        bars.forEach(bar => bar.style.backgroundColor = '#3498db');

        if (selectedSearch === 'linear') {
            await linearSearch();
        } else if (selectedSearch === 'binary') {
            await binarySearch();
        }

        toggleUI(false);
    });
});