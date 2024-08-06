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

const APPROACH_TYPE_TO_COLOR = {
    "ILS": "text-bg-primary",
    "LOC": "text-bg-warning",

    "RNAV": "text-bg-success",
    "RNAV (GPS)": "text-bg-success",
    "RNAV (RNP)": "text-bg-success",
    "GPS": "text-bg-success",
};
const APPROACH_TYPES = Object.keys(APPROACH_TYPE_TO_COLOR);

const approachTypeRenderer = (cell, formatterParams, onRendered) => {
    let html = "<div class='approach-types'>";
    for (const type of cell.getValue()) {
        const color = APPROACH_TYPE_TO_COLOR[type] || "text-bg-secondary";

        html += `<span class="badge rounded-pill ${color}">${type}</span>`;
    }
    html += "</div>";
    return html;
};

const FAA_PLATE_URL = "https://aeronav.faa.gov/d-tpp/";
const getPlateUrl = (cycle_number, plate_file) => `${FAA_PLATE_URL}${cycle_number}/${plate_file}`;

// TODO: don't hardcode this
const CYCLE_NUMBER = "2407";

const approachTitleRenderer = (cell, formatterParams, onRendered) => {
    const plateFile = cell.getData()["plate_file"];
    const url = getPlateUrl(CYCLE_NUMBER, plateFile);

    const link = document.createElement('a');
    link.href = url;
    link.innerHTML = `<i class="bi bi-file-earmark-pdf"></i>`;

    const span = document.createElement('span');
    span.innerText = cell.getValue() + " ";
    span.appendChild(link);

    return span;
};

function initializeGrid() {
    const rowData = [
        {
            "airport": "KPDK", "approach_name": "ILS OR LOC RWY 21L", "types": ["ILS", "LOC"],
            "has_procedure_turn": false, "has_hold_in_lieu_of_procedure_turn": true, "has_dme_arc": false,
            "plate_file": "00469IL21L.PDF",
        }
    ]

    const table = new Tabulator("#approach-grid", {
        layout: "fitColumns",
        data: rowData,
        columns: [
            { title: "Airport", field: "airport", headerFilter: true, headerFilterPlaceholder: "KATL" },
            { title: "Approach Title", field: "approach_name", formatter: approachTitleRenderer },
            { title: "Types", field: "types", formatter: approachTypeRenderer, headerFilter: true, editor: "list", editorParams: { values: APPROACH_TYPES, multiselect: true } },
            {
                title: "Approach Features",
                columns: [
                    { title: "PT", tooltip: "Procedure Turn", tooltipHeader: true, field: "has_procedure_turn", formatter: "tickCross", headerSort: false },
                    { title: "HILPT", tooltip: "Hold-In-Lieu of Procedure Turn", tooltipHeader: true, field: "has_hold_in_lieu_of_procedure_turn", formatter: "tickCross", headerSort: false },
                    { title: "Arc", tooltip: "DME Arc", field: "has_dme_arc", tooltipHeader: true, formatter: "tickCross", headerSort: false }
                ]
            }
        ]
    });

    /*
    // Grid Options: Contains all of the Data Grid configurations
    const gridOptions = {
        pagination: true,
        paginationPageSize: 20,

        rowData: [

        ],

        // Column Definitions: Defines the columns to be displayed.
        columnDefs: [
            { field: "airport", filter: true, floatingFilter: true },
            { field: "approach_name", headerName: "Approach Title" },
            { field: "types", filter: true, cellRenderer: approachTypeRenderer, rowClass: "approach-types" },
            {
                headerName: "Approach Features",
                children: [
                    { field: "has_procedure_turn", headerTooltip: "Procedure Turn", headerName: "PT", width: 80, "sortable": false },
                    { field: "has_hold_in_lieu_of_procedure_turn", headerTooltip: "Hold-In-Lieu of Procedure Turn", headerName: "HILPT", width: 80, "sortable": false },
                    { field: "has_dme_arc", headerTooltip: "DME Arc", headerName: "Arc", width: 80, "sortable": false },
                ]
            },
        ]
    };*/
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
