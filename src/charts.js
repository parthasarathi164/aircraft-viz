import Chart from 'chart.js/auto';
import 'hammerjs';
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
                borderColor: '#00e5ff',
                backgroundColor: 'rgba(0, 229, 255, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: {
                x: { 
                    type: 'linear', 
                    title: { 
                        display: true, 
                        text: 'Time (s)',
                        color: '#a0a0a0',
                        font: { weight: 'bold' }
                    },
                    min: 0,
                    grid: { color: '#333333' },
                    ticks: { color: '#e0e0e0' }
                },
                y: { 
                    title: { 
                        display: true, 
                        text: 'Value',
                        color: '#a0a0a0',
                        font: { weight: 'bold' }
                    },
                    grid: { color: '#333333' },
                    ticks: { color: '#e0e0e0' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#00e5ff', font: { weight: 'bold' } }
                },
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
            chart.options.scales.y.title.text = label;
            chart.update();
        },
        clearData() {
            chart.data.labels = [];
            chart.data.datasets[0].data = [];
            chart.resetZoom();
            chart.update();
        },
        setMaxTime(maxTime) {
            chart.options.scales.x.max = parseFloat(maxTime);
            chart.update();
        }
    };
}