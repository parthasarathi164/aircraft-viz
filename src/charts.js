import Chart from 'chart.js/auto';
import 'hammerjs'; // Required for chartjs-plugin-zoom panning
import zoomPlugin from 'chartjs-plugin-zoom';

Chart.register(zoomPlugin);

export function initChart(canvasId) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Response',
                data: [],
                borderColor: '#2196F3',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false, // Turn off animation for better real-time performance
            scales: {
                x: { 
                    type: 'linear', 
                    title: { display: true, text: 'Time (s)' },
                    min: 0
                },
                y: { 
                    title: { display: true, text: 'Value' }
                }
            },
            plugins: {
                zoom: {
                    pan: { enabled: true, mode: 'xy' },
                    zoom: { 
                        wheel: { enabled: true },
                        pinch: { enabled: true },
                        mode: 'xy' 
                    }
                }
            }
        }
    });

    return {
        updateData(time, value, label) {
            chart.data.labels.push(time);
            chart.data.datasets[0].data.push(value);
            chart.data.datasets[0].label = label;
            chart.update();
        },
        clearData() {
            chart.data.labels = [];
            chart.data.datasets[0].data = [];
            chart.resetZoom(); // Reset zoom on restart
            chart.update();
        },
        setMaxTime(maxTime) {
            // Set X axis to perfectly fit the user's requested time duration
            chart.options.scales.x.max = parseFloat(maxTime);
            chart.update();
        }
    };
}