

function drawChart(element, data) {
    // TODO: finish draw chart function
    return new Chart(element, {
        type: 'line',
        data: data
    });
}

function updateChart(chart, data) {
    chart.data = data;
    chart.update();
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

function changeUsageGraph(button, chart, data) {
    const buttons = document.getElementsByClassName('region-button');
    for (const button of buttons) {
        if (button.disabled) {
            button.disabled = false;
        }
    }
    updateChart(chart, data);
    button.disabled = true;
}

async function main() {
    let chart_elements = document.getElementsByClassName('chart');
    const json = await readData("datasets/cigarette-smoking-among-adults-2011-to-2022.csv");
    // console.log(json);
    const data = toChartReadable(json);

    const usage_chart = drawChart(chart_elements[0], data)
    // console.log(data)
    // drawChart(chart_elements[0], data);

    const ethnicity_btn = document.getElementById('ethnicity-button');
    const region_btn = document.getElementById('region-button');

    ethnicity_btn.onclick = () => {changeUsageGraph(ethnicity_btn, chart, data);};
    region_btn.onclick = () => {changeUsageGraph(ethnicity_btn, chart, data);};

    ethnicity_btn.click();

}

main();