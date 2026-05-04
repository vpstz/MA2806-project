// Updates the chart using the config loaded by data_loader to a new dataset
function smart_update(chart, config) {
    const keys = Object.keys(config);
    if (keys.includes('options')) {
        Object.assign(chart.options, config.options);
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

function changeUsageGraph(chart, buttons, key , data, descriptions) {
    for (const button of buttons.children) {
        const i = button.classList[1];
        let description;
        if (descriptions !== undefined) description =  descriptions.getElementsByClassName(i)[0];
        if (i === key) {
            button.disabled = true;
            if (descriptions !== undefined) description.style.display = 'block';
        } else {
            button.disabled = false;
            if (descriptions !== undefined) description.style.display = 'none';
        }
    }
    change_hash('#' + key+'-button');

    smart_update(chart, data[key]);

}

function load_usage(datasets, has_description = true, category, type) {
    // Generates the chart which will allow it to be updated later on by the buttons
    const chart = new Chart(document.getElementById(category + '-chart'), {
        type: type, // Has to be set to the type of graph it's going to be later on otherwise chart.js gets confused
        data: {},
        options: { // Has an empty options area otherwise chart.js doesn't like how my update function works.
            aspectRatio: 1,
            legend: {
                position: 'right',
                alight: 'middle'
            }
        }
    });

    // This is for if it's the usage chart where it has dynamic descriptions.
    let descriptions;
    if (has_description)  descriptions = document.getElementById(category + '-descriptions');// get_elements_of(keys, '-description');
    const buttons = document.getElementById(category + '-buttons');

    // Loops through the buttons in the button group
    for (const button of buttons.children) {
        const key = button.classList[1];  // uses classList[1] as it has two classes.
        button.onclick = () => {changeUsageGraph(chart, buttons, key, datasets, descriptions);};
    }
    buttons.children[0].click(); // By default, clicks the button which is first in the button group.


}

// Used to change the hash part of the url without calling the event listener.
function change_hash(hash) {
    history.replaceState(null, null, document.location.pathname  +hash);
}


// This is used for when a link to a specific graph which is behind a button is used, so a link can open up specific graphs.
function process_dynamic_hash() {
    const fragment = location.hash;

    if (fragment.includes('button')) {
        const button = document.getElementById(fragment.slice(1));
        if (button) {
            button.click();
        }
    }
}

async function main() {
    const datasets = await load_datasets();

    const old_hash = location.hash;

    load_usage(datasets.usage, true, "usage", "line");
    load_usage(datasets.deaths, false, "death", "doughnut");


    change_hash(old_hash);
    process_dynamic_hash();
    addEventListener('hashchange', () => {
        process_dynamic_hash();
        console.log('changed')
    });
}

main();