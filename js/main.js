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

APPROACH_TYPE_TO_COLOR = {
    "ILS": "text-bg-primary",
    "LOC": "text-bg-light",

    "RNAV": "text-bg-success",
    "RNAV (GPS)": "text-bg-success",
    "RNAV (RNP)": "text-bg-success",
    "GPS": "text-bg-success",
}

const formatApproachTypes = (approach_types) => {
    return approach_types.value.join(', ')
}

const approachTypeRenderer = (approach_type) => {
    let html = "";
    for (const type of approach_type.value) {
        const color = APPROACH_TYPE_TO_COLOR[type] || "text-bg-light";

        html += `<span class="badge rounded-pill ${color}">${type}</span>`;
    }
    return html;
}

function initializeGrid() {
    // Grid Options: Contains all of the Data Grid configurations
    const gridOptions = {
        pagination: true,
        paginationPageSize: 20,

        rowData: [
            {
                "airport": "KPDK", "approach_name": "ILS OR LOC RWY 21L", "types": ["ILS", "LOC"],
                "has_procedure_turn": false, "has_hold_in_lieu_of_procedure_turn": true, "has_dme_arc": false
            }
        ],

        // Column Definitions: Defines the columns to be displayed.
        columnDefs: [
            { field: "airport", filter: true, floatingFilter: true },
            { field: "approach_name", headerName: "Approach Title" },
            { field: "types", filter: true, cellRenderer: approachTypeRenderer },
            {
                headerName: "Approach Features",
                children: [
                    { field: "has_procedure_turn", headerTooltip: "Procedure Turn", headerName: "PT", width: 80, "sortable": false },
                    { field: "has_hold_in_lieu_of_procedure_turn", headerTooltip: "Hold-In-Lieu of Procedure Turn", headerName: "HILPT", width: 80, "sortable": false },
                    { field: "has_dme_arc", headerTooltip: "DME Arc", headerName: "Arc", width: 80, "sortable": false },
                ]
            }
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
