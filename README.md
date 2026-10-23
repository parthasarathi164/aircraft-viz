# Aircraft Flight Dynamics Visualization

A modular, browser-based flight dynamics visualization tool. This project simulates aircraft state-space responses in the time domain and synchronizes them with a 3D visualization of the aircraft's movement.

## Features
* **Physics Engine:** Python-based state-space simulation (SciPy) for longitudinal and lateral-directional modes (Short-Period, Phugoid, Dutch-Roll, Roll-Subsidence, Spiral).
* **3D Visualization:** Real-time 3D aircraft rendering using Three.js with interactive orbit controls and dynamic view switching.
* **Live Analytics:** Synchronized interactive graphs using Chart.js with panning and zooming capabilities.

## Prerequisites
* **Python 3.x**
* **Node.js & npm**

## Setup and Installation

1. **Install Python Dependencies:**
   ```bash
   pip install -r requirements.txt