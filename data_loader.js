
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




async function readData(uri) {
    let result = await fetch(uri);
    result = await result.text();
    return load_csv(result);
}

async function load_datasets() {
    const datasets = {
        usage: {
            ethnicity: await readData("datasets/regional-usage.csv"),
            regional: await readData("datasets/ethnicity-usage.csv"),
            sex: await readData("datasets/usage-by-sex.csv"),

        }
    };
    return datasets;
    // regional dataset

}