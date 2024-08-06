import Table from 'react-bootstrap/Table';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

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


const HeaderWithTooltip = ({text, tooltip}: {text: string, tooltip: string}) => 
    <OverlayTrigger placement="bottom" overlay={<Tooltip>{tooltip}</Tooltip>}>
        <span>{text}</span>
    </OverlayTrigger>;

const columnHelper = createColumnHelper<Approach>();
const columns = [
    columnHelper.accessor('airport', {
        header: 'Airport'
    }),
    columnHelper.accessor('approach_name', {
        header: 'Approach Title'
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
        <Table bordered>
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
