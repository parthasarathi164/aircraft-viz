export class Simulation {
    constructor(jsonPath = '/simulation_data.json') {
        this.time = 0;
        this.data = null;
        this.jsonPath = jsonPath;
        this.isLoaded = false;
        
        // Promise tracking load status
        this.ready = this.loadData();
    }

    async loadData() {
        try {
            const response = await fetch(this.jsonPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
            this.isLoaded = true;
            console.log("Simulation data loaded successfully.");
            return true;
        } catch (error) {
            console.error("Failed to load simulation data:", error);
            return false;
        }
    }

    getVariables(mode = 'short-period') {
        if (!this.isLoaded || !this.data || !this.data[mode]) {
            return [];
        }
        return this.data[mode].variables || [];
    }

    getFrameData(mode = 'short-period', responseType = 'free', targetVar = 'alpha (deg)', dt = 0.016, maxDuration = 350) {
        this.time += dt;

        if (!this.isLoaded || !this.data || !this.data[mode]) {
            return { pitch: 0, roll: 0, yaw: 0, time: this.time, varValue: 0, varName: targetVar };
        }

        const modeData = this.data[mode][responseType] || this.data[mode]['free'];
        if (!modeData || modeData.length === 0) {
            return { pitch: 0, roll: 0, yaw: 0, time: this.time, varValue: 0, varName: targetVar };
        }

        const cappedTime = Math.min(this.time, maxDuration);
        
        // Fast index calculation assuming 0.1s dt
        const frameIndex = Math.min(Math.floor(cappedTime / 0.1), modeData.length - 2);
        const idx = Math.max(0, frameIndex);

        const f0 = modeData[idx];
        const f1 = modeData[idx + 1] || f0;

        const tSpan = f1.time - f0.time;
        const alpha = tSpan > 0 ? (cappedTime - f0.time) / tSpan : 0;
        const lerp = (v0, v1) => v0 + alpha * (v1 - v0);

        const pitchDeg = lerp(f0.pitch, f1.pitch);
        const rollDeg = lerp(f0.roll, f1.roll);
        const yawDeg = lerp(f0.yaw, f1.yaw);

        const v0 = f0.states[targetVar] !== undefined ? f0.states[targetVar] : 0;
        const v1 = f1.states[targetVar] !== undefined ? f1.states[targetVar] : 0;
        const varValue = lerp(v0, v1);

        const toRad = Math.PI / 180;

        return {
            pitch: pitchDeg * toRad,
            roll: rollDeg * toRad,
            yaw: yawDeg * toRad,
            pitchDeg: pitchDeg,
            rollDeg: rollDeg,
            yawDeg: yawDeg,
            time: cappedTime,
            varValue: varValue,
            varName: targetVar
        };
    }

    reset() {
        this.time = 0;
    }
}