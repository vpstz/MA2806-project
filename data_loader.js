function gen_config(type, data, options) {
    return {
        type: type,
        data: data,
        options: options
    }
}

function gen_dataset(label) {
    return {
        label: label,
        data: []
    }
}

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

function gen_usage_options(min, max, max_y) {
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
    // console.log(csv.meta.fields);

    for (const key of csv.meta.fields.splice(1)) {
        totals[key] = 0;
        datasets[key] = [gen_dataset(key.charAt(0).toUpperCase() + key.slice(1))]
    }


    // let totals = {
    //     men: 0,
    //     women: 0,
    //     total: 0,
    // }
    //
    // let datasets = {
    //     total: [gen_dataset('Total')],
    //     men: [gen_dataset('Men')],
    //     women: [gen_dataset('Women')],
    //
    // }
    let labels = [];
    let column_key = csv.meta.fields[0];

    for (let item of result) {
        // console.log(item);
        if (!by_date) labels.push(item[column_key]);
        // deaths.labels.push(item['cause']);
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

async function readData(uri, data_type) {
    let result = await fetch(uri);
    result = Papa.parse(await result.text(), {
        header: true,
    })
    if (data_type === null || data_type === undefined|| data_type === 'usage') {
        const out = parse_data(result, "line", true, false, true);
        return out;
    } else if (data_type === 'deaths') {
        const out =  parse_data(result, "doughnut");
        console.log("deaths");
        console.log(out);
        console.log('bottom');
        return out;
    }
}

async function load_datasets() {
    const datasets = {
        usage: {
            ethnicity: await readData("datasets/ethnicity-usage.csv", 'usage'),
            country: await readData("datasets/usage-by-country.csv", 'usage'),
            region: await readData("datasets/regional-usage.csv", 'usage'),
            sex: await readData("datasets/usage-by-sex.csv", 'usage'),
            age: await readData("datasets/by-age.csv", 'usage'),
        },
        deaths: await readData("datasets/death-rate.csv", "deaths"),
    };
    // console.log(datasets.usage.age);
    return datasets;
    // regional dataset

}