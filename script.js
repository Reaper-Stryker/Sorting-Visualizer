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
    
    // Media Player Controls
    const pauseBtn = document.getElementById('pause-btn');
    const prevStepBtn = document.getElementById('prev-step-btn');
    const stepNextBtn = document.getElementById('step-next-btn');
    const playBtn = document.getElementById('play-btn');
    const stopBtn = document.getElementById('stop-btn');

    let array = [];
    let audioCtx = null;

    // --- Snapshot Architecture Variables ---
    let frames = [];
    let currentFrame = 0;
    let isPlaying = false;
    let animationTimer = null;
    let currentNote = null; 

    // --- Audio Engine ---
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Mock play function to record the intended audio pitch into the snapshot
    function playNote(height) {
        currentNote = height;
    }

    // Real playback function that actually synthesizes the sound
    function playNoteAudio(height) {
        if (!audioCtx) return;
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
        allTheorySections.forEach(section => section.style.display = "none");
    }

    function showTheory(value, type) {
        hideAllSections();
        if (!value) return; 
        const targetClass = `.${value}-${type}`;
        const targetSection = document.querySelector(targetClass);
        if (targetSection) targetSection.style.display = "block";
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
            bar.style.backgroundColor = '#3498db'; // Reset color
            visualizationContainer.appendChild(bar);
        }
    }

    function generateArray() {
        stopAnimation(); 
        let size = parseInt(sizeSlider.value);
        array = [];
        for (let i = 0; i < size; i++) {
            array.push(Math.floor(Math.random() * 370) + 10);
        }
        renderArrayToDOM();

        if(targetInput && array.length > 0) {
            targetInput.value = array[Math.floor(Math.random() * array.length)];
        }
    }

    loadCustomBtn.addEventListener('click', () => {
        stopAnimation();
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

        if(targetInput) targetInput.value = array[Math.floor(Math.random() * array.length)];
    });

    generateArrayBtn.addEventListener('click', generateArray);
    sizeSlider.addEventListener('input', generateArray);
    generateArray(); 

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
    }

    // --- The Snapshot Recorder ---
    // Grabs the current heights and colors and saves it to the timeline
    function captureFrame() {
        const bars = document.querySelectorAll('.bar');
        let snapshot = [];
        for (let i = 0; i < bars.length; i++) {
            snapshot.push({
                height: bars[i].style.height,
                color: bars[i].style.backgroundColor
            });
        }
        frames.push({ bars: snapshot, note: currentNote });
        currentNote = null;
    }

    // The algorithms invoke this function to "yield". Instead of a real delay, we instantly capture the frame.
    async function sleep() {
        captureFrame();
    }

    // --- The Media Player Engine ---
    // Repaints the DOM exactly as it looked at a specific recorded frame
    function renderFrame(index) {
        if(index < 0 || index >= frames.length) return;
        const frame = frames[index];
        const bars = document.querySelectorAll('.bar');
        
        for(let i = 0; i < bars.length; i++) {
            bars[i].style.height = frame.bars[i].height;
            bars[i].style.backgroundColor = frame.bars[i].color;
        }
        
        if(frame.note) playNoteAudio(frame.note);
    }

    function playAnimation() {
        if (isPlaying) return;
        isPlaying = true;
        toggleUI(true); // Lock inputs while playing
        
        function loop() {
            if (!isPlaying) return;
            if (currentFrame < frames.length - 1) {
                currentFrame++;
                renderFrame(currentFrame);
                animationTimer = setTimeout(loop, getDelay());
            } else {
                isPlaying = false;
                toggleUI(false); // Unlock UI when finished
            }
        }
        loop();
    }

    function pauseAnimation() {
        isPlaying = false;
        clearTimeout(animationTimer);
    }

    function stopAnimation() {
        pauseAnimation();
        currentFrame = 0;
        if (frames.length > 0) {
            renderFrame(currentFrame); // Resets visually back to the starting array state
        }
        toggleUI(false); 
    }

    // --- Player Button Listeners ---
    playBtn.addEventListener('click', () => {
        initAudio();
        if(frames.length > 0 && currentFrame < frames.length - 1) {
            playAnimation();
        }
    });

    pauseBtn.addEventListener('click', () => {
        pauseAnimation();
    });

    stepNextBtn.addEventListener('click', () => {
        initAudio();
        pauseAnimation(); // Stop any automation loop so we can manually step
        if (frames.length > 0 && currentFrame < frames.length - 1) {
            currentFrame++;
            renderFrame(currentFrame);
        }
    });

    prevStepBtn.addEventListener('click', () => {
        initAudio();
        pauseAnimation(); // Stop any automation loop so we can manually step
        if (frames.length > 0 && currentFrame > 0) {
            currentFrame--;
            renderFrame(currentFrame);
        }
    });

    stopBtn.addEventListener('click', () => {
        stopAnimation();
    });


    // --- Sorting Algorithms ---
    async function bubbleSort() {
        const bars = document.querySelectorAll('.bar');
        for (let i = 0; i < bars.length - 1; i++) {
            for (let j = 0; j < bars.length - i - 1; j++) {
                bars[j].style.backgroundColor = '#e74c3c'; 
                bars[j + 1].style.backgroundColor = '#e74c3c';

                let height1 = parseInt(bars[j].style.height);
                let height2 = parseInt(bars[j + 1].style.height);

                playNote(height1); 
                await sleep();

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
        for (let i = 0; i < bars.length; i++) {
            let minIdx = i;
            bars[minIdx].style.backgroundColor = '#e74c3c'; 
            for (let j = i + 1; j < bars.length; j++) {
                bars[j].style.backgroundColor = '#f1c40f'; 
                let height1 = parseInt(bars[j].style.height);
                let height2 = parseInt(bars[minIdx].style.height);
                playNote(height1);
                await sleep();

                if (height1 < height2) {
                    if (minIdx !== i) bars[minIdx].style.backgroundColor = '#3498db';
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
        bars[0].style.backgroundColor = '#2ecc71'; 
        for (let i = 1; i < bars.length; i++) {
            let j = i - 1;
            let keyHeight = parseInt(bars[i].style.height);
            bars[i].style.backgroundColor = '#e74c3c'; 
            playNote(keyHeight);
            await sleep();

            while (j >= 0 && parseInt(bars[j].style.height) > keyHeight) {
                bars[j].style.backgroundColor = '#e74c3c';
                bars[j + 1].style.height = bars[j].style.height; 
                playNote(parseInt(bars[j].style.height));
                await sleep();
                for(let k = i; k >= 0; k--) bars[k].style.backgroundColor = '#2ecc71'; 
                j--;
            }
            bars[j + 1].style.height = `${keyHeight}px`; 
            for(let k = 0; k <= i; k++) bars[k].style.backgroundColor = '#2ecc71'; 
        }
    }

    async function partition(bars, low, high) {
        let pivot = parseInt(bars[high].style.height);
        bars[high].style.backgroundColor = '#e74c3c'; 
        let i = low - 1;
        for (let j = low; j <= high - 1; j++) {
            bars[j].style.backgroundColor = '#f1c40f'; 
            playNote(parseInt(bars[j].style.height));
            await sleep();

            if (parseInt(bars[j].style.height) < pivot) {
                i++;
                let tempHeight = bars[i].style.height;
                bars[i].style.height = bars[j].style.height;
                bars[j].style.height = tempHeight;
                bars[i].style.backgroundColor = '#e67e22'; 
                await sleep();
            }
            if(i !== j) bars[j].style.backgroundColor = '#3498db';
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
        for(let k = 0; k < bars.length; k++) bars[k].style.backgroundColor = '#2ecc71'; 
    }

    async function merge(bars, left, mid, right) {
        let n1 = mid - left + 1;
        let n2 = right - mid;
        let leftArray = new Array(n1);
        let rightArray = new Array(n2);

        for (let i = 0; i < n1; i++) {
            await sleep();
            bars[left + i].style.backgroundColor = '#e67e22'; 
            leftArray[i] = parseInt(bars[left + i].style.height);
        }
        for (let j = 0; j < n2; j++) {
            await sleep();
            bars[mid + 1 + j].style.backgroundColor = '#f1c40f'; 
            rightArray[j] = parseInt(bars[mid + 1 + j].style.height);
        }
        await sleep();
        let i = 0, j = 0, k = left;
        while (i < n1 && j < n2) {
            playNote(leftArray[i] || rightArray[j]);
            await sleep();
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
            await sleep();
            bars[k].style.height = `${leftArray[i]}px`;
            bars[k].style.backgroundColor = '#2ecc71';
            i++; k++;
        }
        while (j < n2) {
            playNote(rightArray[j]);
            await sleep();
            bars[k].style.height = `${rightArray[j]}px`;
            bars[k].style.backgroundColor = '#2ecc71';
            j++; k++;
        }
    }

    async function mergeSortRecursive(bars, left, right) {
        if (left >= right) return;
        let mid = left + Math.floor((right - left) / 2);
        await mergeSortRecursive(bars, left, mid);
        await mergeSortRecursive(bars, mid + 1, right);
        await merge(bars, left, mid, right);
    }

    async function mergeSort() {
        const bars = document.querySelectorAll('.bar');
        await mergeSortRecursive(bars, 0, bars.length - 1);
        for(let k = 0; k < bars.length; k++) bars[k].style.backgroundColor = '#2ecc71';
    }

    async function heapify(bars, n, i) {
        let largest = i;
        let left = 2 * i + 1;
        let right = 2 * i + 2;
        if (left < n && parseInt(bars[left].style.height) > parseInt(bars[largest].style.height)) largest = left;
        if (right < n && parseInt(bars[right].style.height) > parseInt(bars[largest].style.height)) largest = right;
        if (largest !== i) {
            bars[i].style.backgroundColor = '#e74c3c'; 
            bars[largest].style.backgroundColor = '#e74c3c';
            playNote(parseInt(bars[i].style.height));
            await sleep();
            let temp = bars[i].style.height;
            bars[i].style.height = bars[largest].style.height;
            bars[largest].style.height = temp;
            bars[i].style.backgroundColor = '#3498db'; 
            bars[largest].style.backgroundColor = '#3498db';
            await heapify(bars, n, largest);
        }
    }

    async function heapSort() {
        const bars = document.querySelectorAll('.bar');
        let n = bars.length;
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await heapify(bars, n, i);
        for (let i = n - 1; i > 0; i--) {
            bars[0].style.backgroundColor = '#f1c40f'; 
            playNote(parseInt(bars[0].style.height));
            await sleep();
            let temp = bars[0].style.height;
            bars[0].style.height = bars[i].style.height;
            bars[i].style.height = temp;
            bars[i].style.backgroundColor = '#2ecc71'; 
            await heapify(bars, i, 0);
        }
        if(bars[0]) bars[0].style.backgroundColor = '#2ecc71';
    }

    async function shellSort() {
        const bars = document.querySelectorAll('.bar');
        let n = bars.length;
        for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
            for (let i = gap; i < n; i += 1) {
                let temp = parseInt(bars[i].style.height);
                bars[i].style.backgroundColor = '#e74c3c'; 
                playNote(temp);
                await sleep();
                let j;
                for (j = i; j >= gap && parseInt(bars[j - gap].style.height) > temp; j -= gap) {
                    bars[j].style.backgroundColor = '#f1c40f';
                    bars[j - gap].style.backgroundColor = '#f1c40f';
                    playNote(parseInt(bars[j - gap].style.height));
                    await sleep();
                    bars[j].style.height = bars[j - gap].style.height;
                    bars[j].style.backgroundColor = '#3498db';
                    bars[j - gap].style.backgroundColor = '#3498db';
                }
                bars[j].style.height = `${temp}px`;
                bars[i].style.backgroundColor = '#3498db';
            }
        }
        for (let i = 0; i < n; i++) bars[i].style.backgroundColor = '#2ecc71';
    }

    async function countingSort() {
        const bars = document.querySelectorAll('.bar');
        let n = bars.length;
        if (n === 0) return;
        let max = 0;
        for (let i = 0; i < n; i++) {
            let h = parseInt(bars[i].style.height);
            if (h > max) max = h;
            bars[i].style.backgroundColor = '#f1c40f'; 
            playNote(h);
            await sleep();
            bars[i].style.backgroundColor = '#3498db';
        }
        let count = new Array(max + 1).fill(0);
        for (let i = 0; i < n; i++) {
            let h = parseInt(bars[i].style.height);
            count[h]++;
            bars[i].style.backgroundColor = '#e74c3c'; 
            playNote(h);
            await sleep();
            bars[i].style.backgroundColor = '#3498db';
        }
        let index = 0;
        for (let i = 0; i <= max; i++) {
            while (count[i] > 0) {
                bars[index].style.height = `${i}px`;
                bars[index].style.backgroundColor = '#2ecc71'; 
                playNote(i);
                await sleep();
                index++; count[i]--;
            }
        }
    }

    async function countingSortForRadix(bars, n, exp) {
        let output = new Array(n);
        let count = new Array(10).fill(0);
        for (let i = 0; i < n; i++) {
            let h = parseInt(bars[i].style.height);
            let digit = Math.floor(h / exp) % 10;
            count[digit]++;
            bars[i].style.backgroundColor = '#f1c40f'; 
            playNote(h);
            await sleep();
            bars[i].style.backgroundColor = '#3498db';
        }
        for (let i = 1; i < 10; i++) count[i] += count[i - 1];
        for (let i = n - 1; i >= 0; i--) {
            let h = parseInt(bars[i].style.height);
            let digit = Math.floor(h / exp) % 10;
            output[count[digit] - 1] = h;
            count[digit]--;
        }
        for (let i = 0; i < n; i++) {
            bars[i].style.height = `${output[i]}px`;
            bars[i].style.backgroundColor = '#e67e22'; 
            playNote(output[i]);
            await sleep();
            bars[i].style.backgroundColor = '#3498db';
        }
    }

    async function radixSort() {
        const bars = document.querySelectorAll('.bar');
        let n = bars.length;
        if (n === 0) return;
        let max = 0;
        for (let i = 0; i < n; i++) {
            let h = parseInt(bars[i].style.height);
            if (h > max) max = h;
        }
        for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) await countingSortForRadix(bars, n, exp);
        for (let i = 0; i < n; i++) bars[i].style.backgroundColor = '#2ecc71';
    }

    async function bucketSort() {
        const bars = document.querySelectorAll('.bar');
        let n = bars.length;
        if (n === 0) return;
        let max = 0, min = Infinity;
        for (let i = 0; i < n; i++) {
            let h = parseInt(bars[i].style.height);
            if (h > max) max = h;
            if (h < min) min = h;
        }
        let bucketCount = Math.floor(Math.sqrt(n));
        let buckets = Array.from({length: bucketCount}, () => []);
        for (let i = 0; i < n; i++) {
            let h = parseInt(bars[i].style.height);
            let bucketIndex = Math.floor((h - min) / ((max - min + 1) / bucketCount));
            if(bucketIndex >= bucketCount) bucketIndex = bucketCount - 1; 
            buckets[bucketIndex].push(h);
            bars[i].style.backgroundColor = '#e74c3c'; 
            playNote(h);
            await sleep();
            bars[i].style.backgroundColor = '#3498db';
        }
        let index = 0;
        for (let i = 0; i < bucketCount; i++) {
            buckets[i].sort((a, b) => a - b);
            for (let j = 0; j < buckets[i].length; j++) {
                bars[index].style.height = `${buckets[i][j]}px`;
                bars[index].style.backgroundColor = '#2ecc71'; 
                playNote(buckets[i][j]);
                await sleep();
                index++;
            }
        }
    }

    // --- Searching Algorithms ---
    async function linearSearch() {
        const bars = document.querySelectorAll('.bar');
        let targetVal = document.getElementById('search-target').value;
        let target = targetVal ? parseInt(targetVal) : -1;
        for (let i = 0; i < bars.length; i++) {
            bars[i].style.backgroundColor = '#f1c40f'; 
            let currentHeight = parseInt(bars[i].style.height);
            playNote(currentHeight);
            await sleep();
            if (currentHeight === target) {
                bars[i].style.backgroundColor = '#2ecc71'; 
                return; 
            } else {
                bars[i].style.backgroundColor = '#e74c3c'; 
            }
        }
    }

    async function binarySearch() {
        const bars = document.querySelectorAll('.bar');
        let targetVal = document.getElementById('search-target').value;
        let target = targetVal ? parseInt(targetVal) : -1;
        let heights = Array.from(bars).map(bar => parseInt(bar.style.height));
        heights.sort((a, b) => a - b);
        for(let i = 0; i < bars.length; i++) {
            bars[i].style.height = `${heights[i]}px`;
            bars[i].style.backgroundColor = '#3498db'; 
        }
        await sleep(); 
        let left = 0, right = bars.length - 1;
        while (left <= right) {
            let mid = Math.floor((left + right) / 2);
            bars[left].style.backgroundColor = '#9b59b6'; 
            bars[right].style.backgroundColor = '#9b59b6'; 
            bars[mid].style.backgroundColor = '#f1c40f'; 
            let midHeight = parseInt(bars[mid].style.height);
            playNote(midHeight);
            await sleep(); 
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
    }

    async function jumpSearch() {
        const bars = document.querySelectorAll('.bar');
        let targetVal = document.getElementById('search-target').value;
        let target = targetVal ? parseInt(targetVal) : -1;
        let n = bars.length;
        let heights = Array.from(bars).map(bar => parseInt(bar.style.height));
        heights.sort((a, b) => a - b);
        for(let i = 0; i < n; i++) {
            bars[i].style.height = `${heights[i]}px`;
            bars[i].style.backgroundColor = '#3498db'; 
        }
        await sleep(); 
        let step = Math.floor(Math.sqrt(n));
        let prev = 0;
        while (parseInt(bars[Math.min(step, n) - 1].style.height) < target) {
            for(let k = prev; k < Math.min(step, n); k++) bars[k].style.backgroundColor = '#f1c40f'; 
            playNote(parseInt(bars[Math.min(step, n) - 1].style.height));
            await sleep();
            for(let k = prev; k < Math.min(step, n); k++) bars[k].style.backgroundColor = '#e74c3c'; 
            prev = step;
            step += Math.floor(Math.sqrt(n));
            if (prev >= n) return;
        }
        while (parseInt(bars[prev].style.height) < target) {
            bars[prev].style.backgroundColor = '#e67e22'; 
            playNote(parseInt(bars[prev].style.height));
            await sleep();
            prev++;
            if (prev === Math.min(step, n)) return;
        }
        if (parseInt(bars[prev].style.height) === target) {
            bars[prev].style.backgroundColor = '#2ecc71';
            playNote(target);
        }
    }

    async function interpolationSearch() {
        const bars = document.querySelectorAll('.bar');
        let targetVal = document.getElementById('search-target').value;
        let target = targetVal ? parseInt(targetVal) : -1;
        let n = bars.length;
        let heights = Array.from(bars).map(bar => parseInt(bar.style.height));
        heights.sort((a, b) => a - b);
        for(let i = 0; i < n; i++) {
            bars[i].style.height = `${heights[i]}px`;
            bars[i].style.backgroundColor = '#3498db'; 
        }
        await sleep(); 
        let lo = 0, hi = (n - 1);
        while (lo <= hi && target >= parseInt(bars[lo].style.height) && target <= parseInt(bars[hi].style.height)) {
            if (lo === hi) {
                if (parseInt(bars[lo].style.height) === target) {
                    bars[lo].style.backgroundColor = '#2ecc71';
                    playNote(target);
                }
                return;
            }
            let loHeight = parseInt(bars[lo].style.height);
            let hiHeight = parseInt(bars[hi].style.height);
            let pos = lo + Math.floor(((hi - lo) / (hiHeight - loHeight)) * (target - loHeight));
            bars[pos].style.backgroundColor = '#f1c40f'; 
            playNote(parseInt(bars[pos].style.height));
            await sleep();
            if (parseInt(bars[pos].style.height) === target) {
                bars[pos].style.backgroundColor = '#2ecc71';
                return;
            }
            if (parseInt(bars[pos].style.height) < target) {
                for(let i = lo; i <= pos; i++) bars[i].style.backgroundColor = '#e74c3c';
                lo = pos + 1;
            } else {
                for(let i = pos; i <= hi; i++) bars[i].style.backgroundColor = '#e74c3c';
                hi = pos - 1;
            }
        }
    }

    async function exponentialSearch() {
        const bars = document.querySelectorAll('.bar');
        let targetVal = document.getElementById('search-target').value;
        let target = targetVal ? parseInt(targetVal) : -1;
        let n = bars.length;
        let heights = Array.from(bars).map(bar => parseInt(bar.style.height));
        heights.sort((a, b) => a - b);
        for(let i = 0; i < n; i++) {
            bars[i].style.height = `${heights[i]}px`;
            bars[i].style.backgroundColor = '#3498db'; 
        }
        await sleep(); 
        if (parseInt(bars[0].style.height) === target) {
            bars[0].style.backgroundColor = '#2ecc71';
            playNote(target);
            return;
        }
        let i = 1;
        while (i < n && parseInt(bars[i].style.height) <= target) {
            bars[i].style.backgroundColor = '#f1c40f'; 
            playNote(parseInt(bars[i].style.height));
            await sleep();
            bars[i].style.backgroundColor = '#3498db'; 
            i = i * 2;
        }
        let left = Math.floor(i / 2);
        let right = Math.min(i, n - 1);
        while (left <= right) {
            let mid = Math.floor((left + right) / 2);
            bars[left].style.backgroundColor = '#9b59b6'; 
            bars[right].style.backgroundColor = '#9b59b6'; 
            bars[mid].style.backgroundColor = '#e67e22'; 
            let midHeight = parseInt(bars[mid].style.height);
            playNote(midHeight);
            await sleep(); 
            if (midHeight === target) {
                bars[mid].style.backgroundColor = '#2ecc71'; 
                if(left !== mid) bars[left].style.backgroundColor = '#3498db';
                if(right !== mid) bars[right].style.backgroundColor = '#3498db';
                return;
            }
            if (midHeight < target) {
                for(let k = left; k <= mid; k++) bars[k].style.backgroundColor = '#e74c3c';
                left = mid + 1;
            } else {
                for(let k = mid; k <= right; k++) bars[k].style.backgroundColor = '#e74c3c';
                right = mid - 1;
            }
        }
    }


    // --- Core Action Button Hooks ---
    sortBtn.addEventListener('click', async () => {
        initAudio(); 
        const selectedAlgo = sortSelect.value;
        if (!selectedAlgo) {
            alert("Please select a sorting algorithm first.");
            return;
        }
        
        // Stop any running animations and lock the UI
        stopAnimation(); 
        toggleUI(true);

        // Pre-compute frames synchronously
        renderArrayToDOM(); // Ensure DOM reflects 'array' before starting
        frames = [];
        currentFrame = 0;
        captureFrame(); // Save Frame 0

        if (selectedAlgo === 'bubble') await bubbleSort();
        else if (selectedAlgo === 'selection') await selectionSort();
        else if (selectedAlgo === 'insertion') await insertionSort();
        else if (selectedAlgo === 'quick') await quickSort();
        else if (selectedAlgo === 'merge') await mergeSort();
        else if (selectedAlgo === 'heap') await heapSort();
        else if (selectedAlgo === 'shell') await shellSort();
        else if (selectedAlgo === 'counting') await countingSort();
        else if (selectedAlgo === 'radix') await radixSort();
        else if (selectedAlgo === 'bucket') await bucketSort();
        
        captureFrame(); // Save Final Frame

        // Trigger automatic playback
        playAnimation();
    });

    searchBtn.addEventListener('click', async () => {
        initAudio(); 
        const selectedSearch = searchSelect.value;
        if (!selectedSearch) {
            alert("Please select a searching algorithm first.");
            return;
        }
        
        stopAnimation(); 
        toggleUI(true);

        renderArrayToDOM();
        frames = [];
        currentFrame = 0;
        captureFrame(); 

        if (selectedSearch === 'linear') await linearSearch();
        else if (selectedSearch === 'binary') await binarySearch();
        else if (selectedSearch === 'jump') await jumpSearch();
        else if (selectedSearch === 'interpolation') await interpolationSearch();
        else if (selectedSearch === 'exponential') await exponentialSearch();
        
        captureFrame(); 
        playAnimation();
    });
});