// Template for the config to pass into chart.js
function gen_config(type, data, options) {
    return {
        type: type,
        data: data,
        options: options
    }
}

// Template for the datasets
function gen_dataset(label) {
    return {
        label: label,
        data: []
    }
}

// Return template for the options
function gen_options(title, subtitle) {
    let display_title, display_subtitle;
    display_subtitle = display_title = true;
    if (title === undefined) display_title = false;
    if (subtitle === undefined) subtitle = false;
    return {
        aspectRatio: 0,
            responsive: true,
        plugins: {
            legend: {
                position: 'right',
                align: 'start'
            },
            title: {
                display: display_title,
                text: title,
                align: 'start',
                font: {
                    size: 16,
                }
            },
            subtitle: {
                position: 'bottom',
                font: {
                    size: 16,
                },
                display: display_subtitle,
                align: 'start',
                text: subtitle
        }
    }
    }
}

// Generates options for the by usage graph
function gen_usage_options(min, max) {
    return {
        parsing: false,

        scales: {
            x: {
                type: "time",
                time: {
                    unit: "year"
                },
                min: min,
                max: max,
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
}

// Processes the data from the csv into a form that can be used by chart.js
// Originally had two methods for each graph type, but then managed to optimise it into one function
// As this allowed me to easily process datasets/configs in a standard format that would allow me to use
// the same functions to draw both charts.
function parse_data(csv, type,
                    by_date=false,
                    calc_totals=true,
                    combine_sets=false,
) {
    const result = csv.data;
    let totals = {}
    let datasets = {};
    let min_x = new Date("2090");
    let max_x = new Date("1989");

    for (const key of csv.meta.fields.splice(1)) {
        totals[key] = 0;
        datasets[key] = [gen_dataset(key.charAt(0).toUpperCase() + key.slice(1))]
    }

    let labels = [];
    let column_key = csv.meta.fields[0];

    for (let item of result) {
        if (!by_date) labels.push(item[column_key]);
        for (let i in datasets) {
            const date = new Date(item[column_key]);
            const y_val = Number(item[i]);
            if (date > max_x) {max_x = date;}
            if (date < min_x) {min_x = date;}
            if (by_date) {
                datasets[i][0].data.push({
                    x: date,
                    y: y_val
                })
            } else {
                datasets[i][0].data.push(item[i]);
            }
            if (calc_totals) totals[i] += Number(item[i]);
        }
    }
    let configs = {};
    let format = new Intl.NumberFormat('en-GB')
    if (combine_sets) {
        let output = [];
        for (let i in datasets) {
            output.push(datasets[i][0])
        }
        datasets = output;
        configs = gen_config(type, {labels: labels, datasets: datasets},
            gen_usage_options(min_x, max_x)
            );
    } else {
        for (let item in datasets) {
            configs[item] = gen_config(type, {labels: labels, datasets: datasets[item]},
                gen_options("Smoking related deaths in 2019", "Total smoking related deaths: " + format.format(totals[item]))
            );
        }
    }

    // deaths.datasets = Object.values(datasets);



    return configs;
}

// Configures how to call the parse_data function based on what type of graph it's for.
async function readData(uri, data_type) {
    let result = await fetch(uri);
    result = Papa.parse(await result.text(), {
        header: true,
    })
    if (data_type === null || data_type === undefined|| data_type === 'usage') {
        return parse_data(result, "line", true, false, true);
    } else if (data_type === 'deaths') {
        return parse_data(result, "doughnut");
    }
}

// Loads all the datasets
async function load_datasets() {
    return {
        usage: {
            ethnicity: await readData("datasets/ethnicity-usage.csv", 'usage'),
            country: await readData("datasets/usage-by-country.csv", 'usage'),
            region: await readData("datasets/regional-usage.csv", 'usage'),
            sex: await readData("datasets/usage-by-sex.csv", 'usage'),
            age: await readData("datasets/by-age.csv", 'usage'),
        },
        deaths: await readData("datasets/death-rate.csv", "deaths"),
    };
}