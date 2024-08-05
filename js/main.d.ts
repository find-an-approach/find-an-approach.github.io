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
};

declare type Runway = {
    name: string,
    bearing: number,
    threshold_elevation: number,
};
