import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import {
    MRT_Table,
    useMaterialReactTable,
    createMRTColumnHelper,
} from 'material-react-table';

import React from 'preact/compat';


//TData
type Approach = {
    airport: string
    approach_name: string
    plate_file: string
    types: string[]

    has_procedure_turn: boolean
    has_hold_in_lieu_of_procedure_turn: boolean
    has_dme_arc: boolean
}

const testData: Approach[] = [
    {
        "airport": "KPDK", "approach_name": "ILS OR LOC RWY 21L",
        "plate_file": "00469IL21L.PDF",
        "types": ["ILS", "LOC"],
        "has_procedure_turn": false,
        "has_hold_in_lieu_of_procedure_turn": true,
        "has_dme_arc": false,
    }
];


const HeaderWithTooltip = ({ text, tooltip }: { text: string, tooltip: string }) =>
    <Tooltip placement="bottom" title={tooltip}><span>{text}</span></Tooltip>;


const FAA_PLATE_URL = "https://aeronav.faa.gov/d-tpp/";
// TODO: don't hardcode this
const CYCLE_NUMBER = "2407";

const ApproachTitle = ({ title, plate_file }: { title: string, plate_file: string }) => {
    const plateUrl = `${FAA_PLATE_URL}${CYCLE_NUMBER}/${plate_file}`;
    return <span>{title} <a target="_blank" href={plateUrl}><PictureAsPdfIcon/></a></span>
}


const APPROACH_TYPE_TO_COLOR: { [key: string]: string } = {
    "ILS": "primary",
    "LOC": "warning",

    "RNAV": "success",
    "RNAV (GPS)": "success",
    "RNAV (RNP)": "success",
    "GPS": "success",
}

const ApproachTypes = ({ types }: { types: string[] }) =>
    <Stack direction="row" spacing={1}>
        {types.map(type => {
            const color = APPROACH_TYPE_TO_COLOR[type] || "secondary";
            return <Chip label={type} color={color as any} />
        })}
    </Stack>;


const columnHelper = createMRTColumnHelper<Approach>();

const columns = [
    columnHelper.accessor('airport', {
        header: 'Airport'
    }),
    columnHelper.accessor('approach_name', {
        header: 'Approach Title',
        // Render the title with a link to the plate file.
        Cell: ({ cell, row }) => <ApproachTitle title={cell.getValue()} plate_file={row.original.plate_file} />
    }),
    columnHelper.accessor('types', {
        header: 'Types',
        enableSorting: false,
        filterVariant: 'multi-select',
        filterSelectOptions: ["ILS", "LOC"],
        Cell: ({ cell }) => <ApproachTypes types={cell.getValue()} />,
    }),
    columnHelper.group({
        id: 'app_features',
        header: 'Approach Features',
        columns: [
            columnHelper.accessor('has_procedure_turn', {
                header: "PT",
                Header: <HeaderWithTooltip text="PT" tooltip="Procedure Turn" />,
                enableSorting: false,
                // TODO: show an icon of PT/HILPT/Arc here
                Cell: ({ cell }) => <span>Hi</span>,
            }),
            columnHelper.accessor('has_hold_in_lieu_of_procedure_turn', {
                header: "HILPT",
                Header: <HeaderWithTooltip text="HILPT" tooltip="Hold-In-Lieu of Procedure Turn" />,
                enableSorting: false,
            }),
            columnHelper.accessor('has_dme_arc', {
                header: "Arc",
                Header: <HeaderWithTooltip text="Arc" tooltip="DME Arc" />,
                enableSorting: false,
            })
        ]
    }),
];


export default function ApproachTable() {
    const [data, _setData] = React.useState(() => [...testData]);
    const table = useMaterialReactTable({
        columns,
        data,
        columnFilterDisplayMode: 'popover',
        enableColumnActions: false,
    });

    return <MRT_Table table={table} />;
}
