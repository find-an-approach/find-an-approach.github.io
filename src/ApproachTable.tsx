import Table from 'react-bootstrap/Table';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Badge from 'react-bootstrap/Badge';
import Stack from 'react-bootstrap/Stack';

import { createColumnHelper, useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
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
    <OverlayTrigger placement="bottom" overlay={<Tooltip>{tooltip}</Tooltip>}>
        <span>{text}</span>
    </OverlayTrigger>;


const FAA_PLATE_URL = "https://aeronav.faa.gov/d-tpp/";
// TODO: don't hardcode this
const CYCLE_NUMBER = "2407";

const ApproachTitle = ({title, plate_file}: {title: string, plate_file: string}) => {
    const plateUrl = `${FAA_PLATE_URL}${CYCLE_NUMBER}/${plate_file}`;
    return <span>{title} <a target="_blank" href={plateUrl}><i class="bi bi-file-earmark-pdf"></i></a></span>
}


const APPROACH_TYPE_TO_COLOR: {[key: string]: string} = {
    "ILS": "primary",
    "LOC": "warning",

    "RNAV": "success",
    "RNAV (GPS)": "success",
    "RNAV (RNP)": "success",
    "GPS": "success",
}

const ApproachTypes = ({ types }: { types: string[] }) => 
    <Stack direction="horizontal" gap={1}>
        {types.map(type => {
            const color = APPROACH_TYPE_TO_COLOR[type] || "secondary";
            return <Badge pill bg={color} text={color == "warning" || color == "light" ? "dark" : "light"}>
                {type}
            </Badge>;
        })}
    </Stack>;

const columnHelper = createColumnHelper<Approach>();
const columns = [
    columnHelper.accessor('airport', {
        header: 'Airport'
    }),
    columnHelper.accessor('approach_name', {
        header: 'Approach Title',
        // Render the title with a link to the plate file.
        cell: (cell) => <ApproachTitle title={cell.getValue()} plate_file={cell.row.original.plate_file} />
    }),
    columnHelper.accessor('types', {
        header: 'Types',
        cell: (cell) => <ApproachTypes types={cell.getValue()} />
    }),
    columnHelper.group({
        header: 'Approach Features',
        columns: [
            columnHelper.accessor('has_procedure_turn', {
                header: () => <HeaderWithTooltip text="PT" tooltip="Procedure Turn" />,
            }),
            columnHelper.accessor('has_hold_in_lieu_of_procedure_turn', {
                header: () => <HeaderWithTooltip text="HILPT" tooltip="Hold-In-Lieu of Procedure Turn" />,
            }),
            columnHelper.accessor('has_dme_arc', {
                header: () => <HeaderWithTooltip text="Arc" tooltip="DME Arc" />,
            })
        ]
    }),
];


export default function ApproachTable() {
    const [data, _setData] = React.useState(() => [...testData]);
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return <div style={{ height: "50vh", minHeight: "300px" }}>
        <Table hover>
            <thead>
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <th key={header.id} colSpan={header.colSpan}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody>
                {table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                        {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </Table>
    </div>
}
