
# Aircraft Flight Dynamics Visualization

A modular, browser-based flight dynamics visualization tool that simulates aircraft state-space responses in the time domain and synchronizes them with a 3D visualization of aircraft motion.

## Features

- **Physics Engine:** Python-based state-space simulation using SciPy for longitudinal and lateral-directional flight modes.
- **Flight Dynamics Modes:** Supports Short-Period, Phugoid, Dutch-Roll, Roll-Subsidence, and Spiral modes.
- **3D Visualization:** Real-time aircraft rendering using Three.js, featuring interactive orbit controls and dynamic camera views.
- **Live Analytics:** Interactive, synchronized response graphs powered by Chart.js, with panning and zooming capabilities.
- **Simulation Controls:** Configure simulation duration, select response types, and control playback.
- **Interactive Camera Views:** Switch between Home, Front, Side, and Top views.

## Project Structure

```text
aircraft-viz/
├── public/
│   ├── models/
│   │   ├── scene.gltf
│   │   ├── scene.bin
│   │   └── textures/
│   └── simulation_data.json
├── src/
│   ├── charts.js
│   ├── main.js
│   ├── scene3d.js
│   └── simulation.js
├── generate_flight_data.py
├── index.html
├── package.json
├── requirements.txt
└── README.md
```

## Prerequisites

Make sure the following software is installed on your system:

- **Python 3.x**
- **Node.js**
- **npm** (Node Package Manager)

## Setup and Installation

Follow these steps to set up and run the project locally.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd aircraft-viz
```

Replace `<your-repository-url>` with your Git repository URL.

### 2. Install Python Dependencies

Install the required Python packages:

```bash
pip install -r requirements.txt
```

### 3. Generate Simulation Data

Run the Python script to generate the flight dynamics simulation data:

```bash
python generate_flight_data.py
```

The generated `simulation_data.json` file will be stored in the `public/` directory.

### 4. Install Node.js Dependencies

Install the frontend dependencies:

```bash
npm install
```

### 5. Start the Development Server

Launch the development server:

```bash
npm run dev
```

Open the URL displayed in your terminal. By default, the application is available at:

```text
http://localhost:5173/
```

## How to Use

### 1. Select a Flight Dynamics Mode

Use the mode selection dropdown to choose the desired flight dynamics mode, such as:

- Short-Period
- Phugoid
- Dutch-Roll
- Roll-Subsidence
- Spiral

The available modes depend on the longitudinal or lateral-directional configuration.

### 2. Choose a Response Type

Switch between the following response types:

- **Free Response:** Observe the aircraft's dynamic response from its initial conditions.
- **Unit-Step Response:** Analyze the system's response to a unit-step input.

### 3. Configure and Run the Simulation

- Enter the desired simulation duration.
- Click **Start Simulation** to begin the simulation or playback.
- Observe the aircraft motion and corresponding response graphs.

### 4. Navigate the 3D Scene

Use the interactive 3D canvas to explore the aircraft:

- **Rotate:** Left-click and drag.
- **Zoom:** Scroll the mouse wheel.
- **Home:** Return to the default camera view.
- **Front:** View the aircraft from the front.
- **Side:** View the aircraft from the side.
- **Top:** View the aircraft from above.

### 5. Interact with the Response Graphs

Use the Chart.js graphs to analyze the simulated flight dynamics:

- **Pan:** Click and drag across the graph.
- **Zoom:** Use the mouse wheel to zoom into specific time intervals.
- **Compare:** Observe how the aircraft's 3D motion corresponds to its time-domain response.

## Technologies Used

| Technology | Purpose |
|---|---|
| Python | Flight dynamics simulation |
| SciPy | State-space modeling and numerical computation |
| JavaScript | Frontend application logic |
| Three.js | 3D aircraft visualization |
| Chart.js | Interactive response graphs |
| Node.js and npm | Frontend dependency management and development tools |

## Applications

This project can be used for:

- Understanding aircraft stability and dynamic response.
- Visualizing longitudinal and lateral-directional flight modes.
- Exploring free and unit-step responses of state-space systems.
- Learning the fundamentals of flight dynamics and control systems.
- Demonstrating the integration of numerical simulation, interactive graphs, and 3D visualization.

## Future Improvements

Potential enhancements include:

- Adding support for custom aircraft parameters.
- Introducing additional control inputs and response variables.
- Improving synchronization between the simulation and 3D animation.
- Supporting downloadable simulation results.
- Adding more aircraft models and visualization options.

## License

Add a license to this project if you intend to distribute or share it publicly. For example, you can use the MIT License by adding a `LICENSE` file to the repository.

---

**Aircraft Flight Dynamics Visualization** — Simulate, visualize, and analyze aircraft dynamic behavior in an interactive 3D environment.
