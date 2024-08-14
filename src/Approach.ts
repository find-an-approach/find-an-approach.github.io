// Keep in sync with `ApproachType` in https://github.com/ammaraskar/faa-instrument-approach-db/blob/master/plate_analyzer/schema.py
export const ApproachTypes = [
    "ILS",
    "LOC",
    "LOC/DME",
    "LOC/NDB",
    "LOC Backcourse",
    "LOC/DME Backcourse",

    "LDA",
    "LDA/DME",
    "SDF",

    "RNAV",
    "RNAV (GPS)",
    "RNAV (RNP)",
    "GPS",
    "GBAS",
    "TACAN",

    "NDB",
    "NDB/DME",
    "VOR",
    "VOR/DME",

    "High Altitude ILS",
    "High Altitude LOC",
    "High Altitude LOC/DME",
    "High Altitude LOC/DME Backcourse",
    "High Altitude RNAV (GPS)",
    "High Altitude VOR",
    "High Altitude VOR/DME",
    "High Altitude TACAN",
] as const;
export type ApproachTypeString = typeof ApproachTypes[number];


//TData
export type Approach = {
    airport: string
    approach_name: string
    plate_file: string
    types: string[]

    has_procedure_turn: boolean
    has_hold_in_lieu_of_procedure_turn: boolean
    has_dme_arc: boolean
}
