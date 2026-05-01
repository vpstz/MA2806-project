

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

function smart_update(chart, config) {
    const keys = Object.keys(config);
    if (keys.includes('options')) {
        chart.options = config.options;
    }
    if (keys.includes('data')) {
        chart.data = config.data;
    }
    if (keys.includes('type')) {
        chart.type = config.type;
    }
    chart.update();
}

function button_action(chart, config, buttons, category) {
    smart_update(chart, config[category]);

    for (const btn in buttons) {
        if (buttons[btn].disabled) {
            buttons[btn].disabled = false;
        }
    }
    buttons[category].disabled = true;
}


function updateChart(chart, data) {
    chart.data = {datasets: data.dataset};
    chart.options.scales.x.min = data.min
    chart.options.scales.x.max = data.max
    chart.update();
}

function changeUsageGraph(button, chart, data) {
    const buttons = document.getElementsByClassName('usage-btn');
    for (const button of buttons) {
        if (button.disabled) {
            button.disabled = false;
        }
    }
    console.log(data);
    updateChart(chart, data);
    button.disabled = true;
}

function load_usage(datasets) {
    const usage_chart = drawChart(document.getElementById("cigarette-usage-chart"), datasets.ethnicity)
    // console.log(data)
    // drawChart(chart_elements[0], data);

    const ethnicity_btn = document.getElementById('ethnicity-button');
    const region_btn = document.getElementById('region-button');
    const sex_btn = document.getElementById('sex-button')
    const age_btn = document.getElementById('age-button');

    console.log(datasets.sex);

    ethnicity_btn.onclick = () => {changeUsageGraph(ethnicity_btn, usage_chart, datasets.ethnicity);};
    region_btn.onclick = () => {changeUsageGraph(region_btn, usage_chart, datasets.regional);};
    sex_btn.onclick = () => {changeUsageGraph(sex_btn, usage_chart, datasets.sex)}
    age_btn.onclick = () => {changeUsageGraph(age_btn, usage_chart, datasets.age);};
    ethnicity_btn.click();
}

function draw_pie(element, dataset, labels) {
    const data = {
        labels: labels,
        datasets: [dataset]
    }
    new Chart(element, {
        type: 'doughnut',
        data: data,
    })
}



function load_death_chart(datasets) {
    const chart_group = document.getElementById('death-charts');
    const chart_elements = {
        total: document.getElementById('total-death'),
        women: document.getElementById('women-death'),
        men: document.getElementById('men-death'),
    }

    const death_buttons = {
        total: document.getElementById('total-death-btn'),
        women: document.getElementById('women-death-btn'),
        men: document.getElementById('men-death-btn'),
    }

    let chart = new Chart(document.getElementById('smart-death-chart'), {
        type: 'doughnut',
        data: {},
        options: {
            aspectRatio: 1,
            legend: {
                position: 'right',
                alight: 'middle'
            }
        }
    });

    for (let i in death_buttons) {
        death_buttons[i].onclick = () => {button_action(chart, datasets, death_buttons, i)};
    }
    Object.values(death_buttons)[0].click();
    // for (let data in datasets.datasets) {
    //     // draw_pie(Object.values(chart_elements)[data], datasets.datasets[data], datasets.labels);
    //
    // }
    // Multi layer
    // let config = {
    //     type: 'pie',
    //     data: datasets,
    //     options: {
    //         responsive: true,
    //         // plugins: {
    //         //     legend: {
    //         //         labels: {
    //         //
    //         //         }
    //         //     }
    //         // }
    //     }
    // }
    // new Chart(chart_elements.men, config);

}

function load_multi_chart(datasets) {
    const element = document.getElementById('multi-chart');

    new Chart(element, datasets);
}

async function main() {
    // let chart_elements = document.getElementsByClassName('chart');
    const datasets = await load_datasets();

    load_usage(datasets.usage);
    load_death_chart(datasets.deaths);

}

main();