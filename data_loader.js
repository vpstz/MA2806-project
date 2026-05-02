
function parse_csv(csv) {
    // const parsed = Papa.parse(text, {header: true});
    // results = {}
    //
    // console.log(parsed.data);
    //
    // parsed.data.forEach(row => {
    //
    //     for (const field in row) {
    //         if (!results[field]) (
    //             results[field] = []
    //         )
    //         results[field].push(row[field])
    //     }
    //
    //
    // })
    // console.log(results);
    // return results;
    // let results = Papa.parse(text, {
    //     header: true,
    //     // dynamicTyping: true,
    // });
    const data = csv.data;


    // Detect columns
    const columns = Object.keys(data[0]);
    const dateKey = columns[0]; // assume first column is date
    const seriesKeys = columns.slice(1);
    let min = new Date("2030");
    let max = new Date("2000");

    // Build datasets for Chart.js
    const datasets = seriesKeys.map(key => {
        // const date = new Date(row[dateKey])
        // if (date > max) max = date;
        // if (date < min) min = date;
        const out = {
            label: key,
            data: data
                // .filter(row => row[dateKey] && row[key] != null)
                .map(row => {
                    const date = new Date(row[dateKey]);
                    if (date > max) max = date;
                    if (date < min) min = date;
                    return {
                        x: date,
                        y: Number(row[key])
                    }
                }),
            // borderWidth: 2,
            fill: false,
            tension: 0.25
        };

        return out;
    });

    return {dataset: datasets, min: min, max: max};
}

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
    return {
        aspectRatio: 0,
            responsive: true,
        plugins: {
            legend: {
                position: 'right',
                align: 'start'
            },
            title: {
                display: true,
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
                display: true,
                align: 'start',
                text: subtitle
        }
    }
    }
}

function read_death(csv) {
    const result = csv.data;


    let totals = {
        men: 0,
        women: 0,
        total: 0,
    }

    let datasets = {
        total: [gen_dataset('Total')],
        men: [gen_dataset('Men')],
        women: [gen_dataset('Women')],

    }
    let labels = [];

    for (let item of result) {
        console.log(item);
        labels.push(item['cause']);
        // deaths.labels.push(item['cause']);
        for (let i in datasets) {
            datasets[i][0].data.push(item[i]);
            totals[i] += Number(item[i]);
        }
    }
    let configs = {};
    let format = new Intl.NumberFormat('en-GB')
    for (let item in datasets) {
        configs[item] = gen_config('pie', {labels: labels, datasets:datasets[item]},
            gen_options("Smoking related deaths in 2019", "Total smoking related deaths: " + format.format(totals[item]))
        );
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
        return parse_csv(result);
    } else if (data_type === 'deaths') {
        return read_death(result);
    }
}

async function load_datasets() {
    const datasets = {
        usage: {
            ethnicity: await readData("datasets/ethnicity-usage.csv"),
            country: await readData("datasets/usage-by-country.csv"),
            region: await readData("datasets/regional-usage.csv"),
            sex: await readData("datasets/usage-by-sex.csv"),
            age: await readData("datasets/by-age.csv"),
        },
        deaths: await readData("datasets/death-rate.csv", "deaths"),
    };
    console.log(datasets.usage.age);
    return datasets;
    // regional dataset

}