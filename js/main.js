// Import jsdoc types.
/// <reference path="main.d.ts"/>

function initializeMap() {
    // Centered over KATL.
    const DEFAULT_MAP_LOCATION = [33.63, -84.42];

    var map = L.map('map').setView(DEFAULT_MAP_LOCATION, 10);

    /*
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    */

    // ifr low
    //const MAP_TYPE = 'ifrlc';
    // vfr combined
    const MAP_TYPE = 'vfrc';

    L.tileLayer('https://vfrmap.com/20240711/tiles/' + MAP_TYPE + '/{z}/{y}/{x}.jpg', {
        maxZoom: 11,
        attribution: '&copy; <a href="https://vfrmap.com/about.html">VFRMap</a>',
        tms: true,
    }).addTo(map);
}

function initializeGrid() {
    // Grid Options: Contains all of the Data Grid configurations
    const gridOptions = {
        pagination: true,
        paginationPageSize: 20,

        // Row Data: The data to be displayed.
        rowData: [
            { make: "Tesla", model: "Model Y", price: 64950, electric: true },
            { make: "Ford", model: "F-Series", price: 33850, electric: false },
            { make: "Toyota", model: "Corolla", price: 29600, electric: false },
        ],
        // Column Definitions: Defines the columns to be displayed.
        columnDefs: [
            { field: "make", filter: true },
            { field: "model" },
            { field: "price" },
            { field: "electric" }
        ]
    };

    const myGridElement = document.querySelector('#approach-grid');
    agGrid.createGrid(myGridElement, gridOptions);
}


/**
 * @returns {Promise<ApproachAnalysis>}
 */
function loadApproachData() {
    return fetch('./approaches.json')
        .then((response) => response.json());
}


initializeMap();
initializeGrid();
