

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
    change_hash('#' + buttons[category].id);

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

function changeUsageGraph(chart, buttons, descriptions, key , data) {
    for (const button of buttons.children) {
        const i = button.classList[1];
        const description =  descriptions.getElementsByClassName(i)[0];
        if (i === key) {
            button.disabled = true;
            description.style.display = 'block';
        } else {
            button.disabled = false;
            description.style.display = 'none';
        }
    }
    change_hash('#' + key+'-button');

    updateChart(chart, data[key]);

}

function load_usage(datasets) {
    const usage_chart = drawChart(document.getElementById("cigarette-usage-chart"), {})
    // console.log(data)
    // drawChart(chart_elements[0], data);

    const descriptions = document.getElementById('usage-descriptions');// get_elements_of(keys, '-description');
    const buttons = document.getElementById('usage-buttons');// get_elements_of(keys, '-button');
    // for (const key of keys) {
    //     buttons[key].onclick = () => {changeUsageGraph(usage_chart, buttons, descriptions, key, datasets)}
    // }
    for (const button of buttons.children) {
        const key = button.classList[1];
        button.onclick = () => {changeUsageGraph(usage_chart, buttons, descriptions, key, datasets);};
    }
    buttons.children[0].click();

    console.log(datasets.sex);

}

function change_hash(hash) {
    history.replaceState(null, null, document.location.pathname  +hash);
}

function load_death_chart(datasets) {
    const death_buttons = {
        total: document.getElementById('total-death-button'),
        women: document.getElementById('women-death-button'),
        men: document.getElementById('men-death-button'),
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

function process_dynamic_hash() {
    const fragment = location.hash;

    if (fragment.includes('button')) {
        console.log(fragment)
        const button = document.getElementById(fragment.slice(1));
        console.log(button);
        if (button) {
            console.log("click")
            button.click();
        }
    }
}

async function main() {
    // let chart_elements = document.getElementsByClassName('chart');
    const datasets = await load_datasets();

    const old_hash = location.hash;

    load_usage(datasets.usage);
    load_death_chart(datasets.deaths);
    change_hash(old_hash);
    process_dynamic_hash();
    addEventListener('hashchange', () => {
        process_dynamic_hash();
        console.log('changed')
    });
}

main();