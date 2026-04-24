

function drawChart(element, data) {
    // TODO: finish draw chart function
    return new Chart(element, {
        type: 'line',
        data: data,
        options: {
            parsing: false,

            scales: {
                x: {
                    type: "time",
                    time: {
                        unit: "year"
                    },
                    min: new Date('2007-01-01'),
                    max: new Date('2024-12-31'),
                    title: {
                        display: true,
                        text: "Year"
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: "Percentage"
                    }
                }
            }
        }
        });
}


function updateChart(chart, data) {
    chart.data = {datasets: data.dataset};
    chart.options.scales.x.min = data.min
    chart.options.scales.x.max = data.max
    chart.update();
}

function changeUsageGraph(button, chart, data) {
    const buttons = document.getElementsByClassName('region-button');
    for (const button of buttons) {
        if (button.disabled) {
            button.disabled = false;
        }
    }
    console.log(data);
    updateChart(chart, data);
    button.disabled = true;
}

async function main() {
    let chart_elements = document.getElementsByClassName('chart');
    const datasets = await load_datasets();

    const usage_chart = drawChart(chart_elements[0], datasets.usage.ethnicity)
    // console.log(data)
    // drawChart(chart_elements[0], data);

    const ethnicity_btn = document.getElementById('ethnicity-button');
    const region_btn = document.getElementById('region-button');

    ethnicity_btn.onclick = () => {changeUsageGraph(ethnicity_btn, usage_chart, datasets.usage.ethnicity);};
    region_btn.onclick = () => {changeUsageGraph(region_btn, usage_chart, datasets.usage.regional);};
    region_btn.click();
    // ethnicity_btn.click();

}

main();