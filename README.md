# 📊 Advanced Sorting & Searching Visualizer

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-Deploy%20Status-success?style=for-the-badge&logo=github)](https://reaper-stryker.github.io/Sorting-Visualizer/)
[![Made with JavaScript](https://img.shields.io/badge/Vanilla-JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)]()

A highly interactive, high-performance web application built to visualize 15 different sorting and searching algorithms in real-time. 

Unlike standard live-animated visualizers, this project features a custom-built **Snapshot Architecture**. Algorithms pre-compute their state changes instantly, allowing the user to scrub forward, backward, pause, and automate the visualization through a custom media-player interface without dropping frames or losing state.

---

## 🔗 Live Demo
**[Experience the Visualizer Here](https://reaper-stryker.github.io/Sorting-Visualizer/)**

---

## ✨ Key Features

* **⏱️ Custom Snapshot Engine:** Time-travel debugging UI. Users can hit Play, Pause, Next Step, Previous Step, and Stop to manually scrub through the algorithm's execution timeline.
* **🎵 Audio Synthesis:** Web Audio API integration maps array values to oscillator frequencies, creating procedural, ascending soundscapes as the data becomes sorted.
* **📈 Live Analytics:** Real-time tracking of algorithmic efficiency, displaying exact mathematical counts for **Comparisons** and **Swaps / Writes** as the timeline plays.
* **🎨 Dynamic UI/UX:** A responsive, dark-mode IDE aesthetic featuring dynamic bar labeling, custom array data loading, and size/speed scalability.

---

## 🧰 The Algorithms

### Sorting Algorithms
* **$O(n^2)$ Complexity:** Bubble Sort, Selection Sort, Insertion Sort
* **$O(n \log n)$ Complexity:** Merge Sort, Quick Sort, Heap Sort
* **Non-Comparison / Distribution:** Radix Sort, Counting Sort, Bucket Sort
* **Gap-Based:** Shell Sort

### Searching Algorithms
* Linear Search
* Binary Search
* Jump Search
* Interpolation Search
* Exponential Search

---

## 💻 Tech Stack

* **HTML5:** Semantic structure and accessible media controls.
* **CSS3:** Modern UI with flexbox architecture, CSS variables, and native dark mode styling.
* **Vanilla JavaScript (ES6+):** Zero-dependency state management, async/await flow control, Web Audio API integration, and complex DOM manipulation.

---

## 🚀 How to Run Locally

If you want to run this project on your local machine, no build steps, bundlers, or local servers are required.

1. Clone the repository:
   ```bash
   git clone [https://github.com/Reaper-Stryker/Sorting-Visualizer.git](https://github.com/Reaper-Stryker/Sorting-Visualizer.git)
