
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
            gen_options(undefined, "Total deaths: " + format.format(totals[item]))
        );
    }

    // deaths.datasets = Object.values(datasets);

    return configs;
}

function multi_chart(csv, type) {
    const result = csv.data;
    if (type === undefined) {
        type = 'doughnut'
    }
    let data = {
        labels: [],
        datasets: [

        ]
    }
    let datasets = {
        total: {
            label: 'Total',
            data: []
        },
        women: {
            label: 'Women',
            data: []
        },
        men: {
            label: 'Men',
            data: []
        },

    }
    for (let item of result) {
        console.log(item);
        // deaths.labels.push(item['cause']);
        for (let i in datasets) {
            datasets[i].data.push(item[i]);
            data.labels.push(item['cause']);
        }
    }
    data.datasets = Object.values(datasets);
    const config = {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        generateLabels: function(chart) {
                            // Get the default label list
                            const original = Chart.overrides.pie.plugins.legend.labels.generateLabels;
                            const labelsOriginal = original.call(this, chart);

                            // Build an array of colors used in the datasets of the chart
                            let datasetColors = chart.data.datasets.map(function(e) {
                                return e.backgroundColor;
                            });
                            datasetColors = datasetColors.flat();

                            // Modify the color and hide state of each label
                            labelsOriginal.forEach(label => {
                                // There are twice as many labels as there are datasets. This converts the label index into the corresponding dataset index
                                label.datasetIndex = (label.index - label.index % 2) / 2;

                                // The hidden state must match the dataset's hidden state
                                label.hidden = !chart.isDatasetVisible(label.datasetIndex);

                                // Change the color to match the dataset
                                label.fillStyle = datasetColors[label.index];
                            });

                            return labelsOriginal;
                        }
                    },
                    onClick: function(mouseEvent, legendItem, legend) {
                        // toggle the visibility of the dataset from what it currently is
                        legend.chart.getDatasetMeta(
                            legendItem.datasetIndex
                        ).hidden = legend.chart.isDatasetVisible(legendItem.datasetIndex);
                        legend.chart.update();
                    }
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const labelIndex = (context[0].datasetIndex * 2) + context[0].dataIndex;
                            return context[0].chart.data.labels[labelIndex] + ': ' + context[0].formattedValue;
                        }
                    }
                }
            }
        }

    }
    return config;


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
            regional: await readData("datasets/regional-usage.csv"),
            sex: await readData("datasets/usage-by-sex.csv"),
            age: await readData("datasets/by-age.csv"),
        },
        deaths: await readData("datasets/death-rate.csv", "deaths"),
    };
    console.log(datasets.usage.age);
    return datasets;
    // regional dataset

}