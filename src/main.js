import * as THREE from 'three';
import { init3D } from './scene3d.js';
import { initChart } from './charts.js';
import { Simulation } from './simulation.js';

const { renderer, scene, camera, aircraftGroup, controls, setCameraView } = init3D('canvas-container');
const chartManager = initChart('liveChart');
const sim = new Simulation();

let currentMode = 'short-period';
let responseType = 'free';
let selectedVar = '';
let isRunning = false;
let currentTimeTracker = 0;

const modeSelect = document.getElementById('mode-select');
const varSelect = document.getElementById('var-select');
const durationInput = document.getElementById('sim-duration');
const playBtn = document.getElementById('btn-play-pause');

function updateVariableDropdown() {
    const vars = sim.getVariables(currentMode);
    varSelect.innerHTML = '';
    vars.forEach((v) => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        varSelect.appendChild(opt);
    });
    if (vars.length > 0) {
        selectedVar = vars[0];
    }
}

// Populate dropdown once simulation data finishes fetching asynchronously
sim.ready.then(() => {
    updateVariableDropdown();
});

modeSelect.addEventListener('change', (e) => {
    currentMode = e.target.value;
    updateVariableDropdown();
    resetSimulation();
});

varSelect.addEventListener('change', (e) => {
    selectedVar = e.target.value;
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

durationInput.addEventListener('change', () => {
    let val = parseFloat(durationInput.value);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 350) val = 350;
    durationInput.value = val;
    resetSimulation();
});

document.getElementById('btn-view-home').onclick = () => setCameraView('home');
document.getElementById('btn-view-front').onclick = () => setCameraView('front');
document.getElementById('btn-view-side').onclick = () => setCameraView('side');
document.getElementById('btn-view-top').onclick = () => setCameraView('top');

playBtn.addEventListener('click', () => {
    if (isRunning) {
        isRunning = false;
        playBtn.innerText = "Start Simulation";
        playBtn.classList.remove('stopped');
    } else {
        const maxTime = Math.min(parseFloat(durationInput.value) || 350, 350);
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
        const maxDuration = Math.min(parseFloat(durationInput.value) || 350, 350);
        
        if (currentTimeTracker < maxDuration) {
            const data = sim.getFrameData(currentMode, responseType, selectedVar, dt, maxDuration);
            currentTimeTracker = data.time;

            aircraftGroup.rotation.x = data.pitch;
            aircraftGroup.rotation.z = data.roll;
            aircraftGroup.rotation.y = data.yaw;

            chartManager.updateData(data.time, data.varValue, selectedVar);
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