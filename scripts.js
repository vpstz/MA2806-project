function drawChart(element) {
    // TODO: finish draw chart function

}

function readData(data) {

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

function main() {
    let elements = document.getElementsByClassName('chart');
    fetch("datasets/cigarette-smoking-among-adults-2011-to-2022.csv")
        .then(res => res.text())
        .then(csv => {
            const data = csvToJson(csv);
            console.log(data);
        });

}

main();