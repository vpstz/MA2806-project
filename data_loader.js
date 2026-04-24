function csvToJson(csvText) {
    const parsed = Papa.parse(csvText, {header: true});

    const result = {};

    parsed.data.forEach(row => {
        const ethnicity = row.ethnicity;
        const year = Number(row.time);
        const percentage = Number(row.value);

        if (!result[ethnicity]) {
            result[ethnicity] = {year: [], percentage: []};
        }

        result[ethnicity].year.push(year);
        result[ethnicity].percentage.push(percentage);
    });

    return result;
}

function toChartReadable(json) {
    output = {datasets: [], labels: json['All'].year}
    for (let key in json) {

        output.datasets.push({
            label: key,
            data: json[key].percentage,
            fill: false,
            tension: 0.01,
        })
    }
    return output;
}

function jsonToChart(json) {
    output = {datasets: [], labels: json['date']}

    for (let key in json) {
        output.datasets.push({
            label: key,
            data: json[key],
            fill: false,
            tension: 0.01,
        })
    }
    console.log(output);
    return output;
}

function load_csv(text) {
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
    let results = Papa.parse(text, {
        header: true,
        // dynamicTyping: true,
    });
    const data = results.data;

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


async function readEthnicData(uri) {
    let result = await fetch(uri)
    let csv = await result.text();
    return csvToJson(csv);
}

async function readData(uri) {
    let result = await fetch(uri);
    result = await result.text();
    return load_csv(result);
}

async function load_ethnicity() {
    const json = await readData("datasets/ethnicity-usage.csv");
    // console.log(json);
    return json;
}

async function load_regional() {
    const data = await readData("datasets/regional-usage.csv");
    // data = jsonToChart(data);
    return data;
}

async function load_datasets() {
    const datasets = {
        usage: {
            ethnicity: await load_ethnicity(),
            regional: await load_regional()
        }
    };
    return datasets;
    // regional dataset

}