// This file acts as your physics engine placeholder. 
// Later, you can swap this to read JSON data exported from your Python scripts.
export class Simulation {
    constructor() { this.time = 0; }
    
    getFrameData(mode, responseType, dt) {
        this.time += dt;
        let pitch = 0, roll = 0, yaw = 0, varName = "Angle (deg)", varValue = 0;

        // Mathematical approximations for visualization
        if (mode === 'short-period') {
            pitch = Math.exp(-0.8 * this.time) * Math.sin(3 * this.time) * 0.2;
            varValue = pitch * (180/Math.PI);
            varName = "Pitch Rate (q)";
        } else if (mode === 'phugoid') {
            pitch = Math.exp(-0.05 * this.time) * Math.sin(0.5 * this.time) * 0.3;
            varValue = pitch * (180/Math.PI);
            varName = "Pitch Angle (theta)";
        } else if (mode === 'dutch-roll') {
            yaw = Math.exp(-0.2 * this.time) * Math.sin(2 * this.time) * 0.2;
            roll = Math.exp(-0.2 * this.time) * Math.sin(2 * this.time + 1.5) * 0.1;
            varValue = yaw * (180/Math.PI);
            varName = "Yaw Angle (psi)";
        }
        
        return { pitch, roll, yaw, time: this.time, varValue, varName };
    }
    
    reset() { this.time = 0; }
}