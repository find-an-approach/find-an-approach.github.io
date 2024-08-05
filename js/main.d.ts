// Should be kept in sync with https://github.com/ammaraskar/faa-instrument-approach-db/blob/master/plate_analyzer/schema.py
declare type ApproachAnalysis = {
    dtpp_cycle_number: string,
    airports: Record<string, Airport>,
    x: string,
};


declare type Airport = {
    id: string,
    name: string,
    latitude: string,
    longitude: string,
    runways: [Runway],
    approaches: [Approach],
};

declare type Runway = {
    name: string,
    bearing: number,
    threshold_elevation: number,
};

declare type Approach = {
    name: string,

    types: [string],

    runway_approach_offset_angle: number,
    plate_file: string,

    has_dme_arc: boolean,
    has_hold_in_lieu_of_procedure_turn: boolean,
    has_procedure_turn: boolean,

    comments: {
        has_non_standard_alternative_requirements: boolean,
        has_non_standard_takeoff_minimums: boolean,
    }
};
