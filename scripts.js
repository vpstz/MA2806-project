function drawChart(element) {
    // TODO: finish draw chart function

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

async function readData(uri) {
    let result = await fetch(uri)
    let csv = await result.text();
    return csvtoJson(csv);
}


function main() {
    let elements = document.getElementsByClassName('chart');
    const json = readData("datasets/cigarette-smoking-among-adults-2011-to-2022.csv");


}

main();