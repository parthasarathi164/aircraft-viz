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

// Mode and Tab Selection
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

// 3D View Buttons
document.getElementById('btn-view-home').onclick = () => setCameraView('home');
document.getElementById('btn-view-front').onclick = () => setCameraView('front');
document.getElementById('btn-view-side').onclick = () => setCameraView('side');
document.getElementById('btn-view-top').onclick = () => setCameraView('top');

// Play / Stop Controls
const playBtn = document.getElementById('btn-play-pause');
playBtn.addEventListener('click', () => {
    if (isRunning) {
        isRunning = false;
        playBtn.innerText = "Start Simulation";
        playBtn.classList.remove('stopped');
    } else {
        const maxTime = parseFloat(document.getElementById('sim-duration').value);
        if (currentTimeTracker >= maxTime) {
            resetSimulation();
        }
        
        isRunning = true;
        playBtn.innerText = "Stop Simulation";
        playBtn.classList.add('stopped');
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

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const dt = clock.getDelta();
    
    if (isRunning) {
        const maxDuration = parseFloat(document.getElementById('sim-duration').value);
        
        if (currentTimeTracker < maxDuration) {
            const data = sim.getFrameData(currentMode, responseType, dt);
            currentTimeTracker = data.time;

            // Apply rotations
            aircraftGroup.rotation.x = data.pitch;
            aircraftGroup.rotation.z = data.roll;
            aircraftGroup.rotation.y = data.yaw;

            // Chart updates
            chartManager.updateData(data.time, data.varValue, data.varName);
        } else {
            isRunning = false;
            playBtn.innerText = "Restart Simulation";
            playBtn.classList.remove('stopped');
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();