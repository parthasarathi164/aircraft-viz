import * as THREE from 'three';
import { init3D } from './scene3d.js';
import { initChart } from './charts.js';
import { Simulation } from './simulation.js';

const { renderer, scene, camera, aircraftGroup, controls, setCameraView } = init3D('canvas-container');
const chartManager = initChart('liveChart');
const sim = new Simulation();

let currentMode = 'short-period';
let responseType = 'free';
let isRunning = false;
let currentTimeTracker = 0;

// --- UI EVENT LISTENERS ---

// 1. Simulation Modes
document.getElementById('mode-select').addEventListener('change', (e) => {
    currentMode = e.target.value;
    resetSimulation();
});
document.getElementById('tab-free').addEventListener('click', (e) => setTab('free', e.target));
document.getElementById('tab-step').addEventListener('click', (e) => setTab('step', e.target));

function setTab(type, element) {
    responseType = type;
    document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    resetSimulation();
}

// 2. 3D View Buttons
document.getElementById('btn-view-home').onclick = () => setCameraView('home');
document.getElementById('btn-view-front').onclick = () => setCameraView('front');
document.getElementById('btn-view-side').onclick = () => setCameraView('side');
document.getElementById('btn-view-top').onclick = () => setCameraView('top');

// 3. Play / Pause Button
const playBtn = document.getElementById('btn-play-pause');
playBtn.addEventListener('click', () => {
    if (isRunning) {
        isRunning = false;
        playBtn.innerText = "Start Simulation";
        playBtn.classList.remove('stopped');
    } else {
        // If we reached the end previously, reset before playing again
        const maxTime = parseFloat(document.getElementById('sim-duration').value);
        if (currentTimeTracker >= maxTime) {
            resetSimulation();
        }
        
        isRunning = true;
        playBtn.innerText = "Stop Simulation";
        playBtn.classList.add('stopped');
        
        // Ensure chart axes scale to fit the duration
        chartManager.setMaxTime(maxTime);
    }
});

function resetSimulation() {
    isRunning = false;
    playBtn.innerText = "Start Simulation";
    playBtn.classList.remove('stopped');
    
    sim.reset();
    chartManager.clearData();
    aircraftGroup.rotation.set(0, 0, 0);
    currentTimeTracker = 0;
}

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const dt = clock.getDelta();
    
    // Only fetch new data if the simulation is running
    if (isRunning) {
        const maxDuration = parseFloat(document.getElementById('sim-duration').value);
        
        if (currentTimeTracker < maxDuration) {
            const data = sim.getFrameData(currentMode, responseType, dt);
            currentTimeTracker = data.time;

            // Apply rotation
            aircraftGroup.rotation.x = data.pitch;
            aircraftGroup.rotation.z = data.roll;
            aircraftGroup.rotation.y = data.yaw;

            // Update Chart
            chartManager.updateData(data.time, data.varValue, data.varName);
        } else {
            // Reached the end of the specified time
            isRunning = false;
            playBtn.innerText = "Restart Simulation";
            playBtn.classList.remove('stopped');
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();