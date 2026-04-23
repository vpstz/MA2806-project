function drawChart(element, data) {
    // TODO: finish draw chart function
    new Chart(element, {
        type: 'line',
        data: data
    });

}

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

async function readData(uri) {
    let result = await fetch(uri)
    let csv = await result.text();
    return csvToJson(csv);
}


async function main() {
    let elements = document.getElementsByClassName('chart');
    const json = await readData("datasets/cigarette-smoking-among-adults-2011-to-2022.csv");
    console.log(json);
    const data = toChartReadable(json);
    console.log(data)
    drawChart(elements[0], data);

}

main();