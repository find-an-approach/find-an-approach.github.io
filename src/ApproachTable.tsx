import Chip, { ChipProps } from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
  MRT_Row,
} from "material-react-table";

import React, { useMemo } from "preact/compat";
import {
  DmeArcIcon,
  HoldInLieuIcon,
  ProcedureTurnIcon,
} from "./ProcedureIcons";
import { AirportsMap, Approach, ApproachMinimums, ApproachTypeString, MinimumsValue } from "./Approach";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import Alert from "@mui/material/Alert";


const HeaderWithTooltip = ({
  text,
  tooltip,
}: {
  text: string;
  tooltip: string;
}) => (
  <Tooltip placement="bottom" title={tooltip}>
    <span>{text}</span>
  </Tooltip>
);

const FAA_PLATE_URL = "https://aeronav.faa.gov/d-tpp/";

const ApproachTitle = ({
  title,
  plate_file,
  dttpCycleNumber,
}: {
  title: React.ReactNode;
  plate_file: string;
  dttpCycleNumber: string;
}) => {
  // dttpCycleNumber looks like `240711`, the FAA plate urls use just the year
  // and month bit like `2407` so take out the last 2 characters.
  dttpCycleNumber = dttpCycleNumber.substring(0, dttpCycleNumber.length - 2);

  const plateUrl = `${FAA_PLATE_URL}${dttpCycleNumber}/${plate_file}`;
  return (
    <span>
      {title}{" "}
      <a target="_blank" href={plateUrl}>
        <PictureAsPdfIcon />
      </a>
    </span>
  );
};

const ApproachTypesCell = ({ types }: { types: ApproachTypeString[] }) => (
  <Stack direction="row" spacing={1}>
    {types.map((type) => {
      const appearance = APPROACH_TYPE_TO_APPEARANCE[type] || {};
      return <Chip size="small" label={type} {...appearance} />;
    })}
  </Stack>
);

const MinimumsCell = (props: {mins: MinimumsValue | "NA" | undefined}) => {
    const mins = props.mins;

    if (mins === "NA") {
        return <Alert variant="outlined" severity="error">NA</Alert>
    } else if (mins && mins.altitude) {
        return <span>{mins.altitude}ft</span>
    }

    return <i>(Parsing error)</i>;
}

const ApproachMinimumsTable = (props: {minimums: ApproachMinimums[]}) => (
    <TableContainer component={Paper}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>A</TableCell>
                    <TableCell>B</TableCell>
                    <TableCell>C</TableCell>
                    <TableCell>D</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {props.minimums.map((mins, i) => (
                    <TableRow key={i}>
                        <TableCell>{mins.minimums_type}</TableCell>
                        <TableCell><MinimumsCell mins={mins.cat_a} /></TableCell>
                        <TableCell><MinimumsCell mins={mins.cat_b} /></TableCell>
                        <TableCell><MinimumsCell mins={mins.cat_c} /></TableCell>
                        <TableCell><MinimumsCell mins={mins.cat_d} /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
);

const ApproachDetailPanel = (row: MRT_Row<Approach>, airports: AirportsMap) => {
    const approach = row.original;
    const airport = airports[approach.airport];

    const runway = airport.runways.filter(r => r.name == approach.runway).shift();

    return <Grid container spacing={2}>
        <Grid item xs={5}>
            <Typography variant="h4">{approach.approach_name}</Typography>
            <Typography variant="subtitle1">{airport.name} ({approach.airport})</Typography>

            {runway && 
                <Typography variant="subtitle2">
                    <Tooltip title="Runway Threshold Elevation"><span>RTE </span></Tooltip>
                    {runway.threshold_elevation.toFixed(0)}ft MSL
                </Typography>}

            {approach.text_comments.length > 0 &&
                <Paper sx={{p: 2, m: 2}} elevation={3}>
                    <Typography variant="subtitle1">Comments</Typography>
                    <Typography variant="body2">
                        {approach.text_comments}
                    </Typography>
                </Paper>}
        </Grid>

        {approach.minimums.length > 0 &&
            <Grid item xs={7}>
                <Typography variant="subtitle1">Minimums</Typography>
                <ApproachMinimumsTable minimums={approach.minimums} />
            </Grid>
        }
    </Grid>;
};

const columnHelper = createMRTColumnHelper<Approach>();

export default function ApproachTable(props: { dttpCycleNumber: string, data: Approach[], approachTypes: string[], airports: AirportsMap }) {
  const data = useMemo(() => props.data, [props.data]);

  const columns = useMemo(() => [
    columnHelper.group({
      id: "approach",
      header: "Approach",
      columns: [
        columnHelper.accessor("airport", {
          header: "Airport",
          size: 50,
          muiFilterTextFieldProps: {
            sx: {minWidth: '50px'}
          },
        }),
        columnHelper.accessor("approach_name", {
          header: "Approach Title",
          enableSorting: false,
          // Render the title with a link to the plate file.
          Cell: ({ renderedCellValue, row }) => (
            <ApproachTitle
              dttpCycleNumber={props.dttpCycleNumber}
              title={renderedCellValue}
              plate_file={row.original.plate_file}
            />
          ),
        }),
        columnHelper.accessor("types", {
          header: "Types",
          enableSorting: false,
          filterVariant: "multi-select",
          filterSelectOptions: props.approachTypes,
          Cell: ({ cell }) => <ApproachTypesCell types={cell.getValue()} />,
        }),
        columnHelper.accessor("distance", {
            id: "distance",
            header: "Distance",
            size: 40,
            Cell: ({ cell }) => {
                const val = cell.getValue<number | undefined>();
                if (val !== undefined) {
                    return `${val.toFixed(1)} NM`;
                }
            },
            enableColumnFilter: false,
        }),
      ],
    }),
    columnHelper.group({
      id: "app_features",
      header: "Approach Features",
      columns: [
        columnHelper.accessor("has_procedure_turn", {
          header: "PT",
          size: 40,
          Header: <HeaderWithTooltip text="PT" tooltip="Procedure Turn" />,
          enableSorting: false,
          filterVariant: "checkbox",
          muiFilterCheckboxProps: { title: "" },
          Cell: ({ cell }) => (
            <ProcedureTurnIcon
              fontSize="medium"
              color={cell.getValue<boolean>() ? "inherit" : "disabled"}
            />
          ),
        }),
        columnHelper.accessor("has_hold_in_lieu_of_procedure_turn", {
          header: "HILPT",
          size: 40,
          Header: (
            <HeaderWithTooltip
              text="HILPT"
              tooltip="Hold-In-Lieu of Procedure Turn"
            />
          ),
          enableSorting: false,
          filterVariant: "checkbox",
          muiFilterCheckboxProps: { title: "" },
          Cell: ({ cell }) => (
            <HoldInLieuIcon
              fontSize="medium"
              color={cell.getValue<boolean>() ? "inherit" : "disabled"}
            />
          ),
        }),
        columnHelper.accessor("has_dme_arc", {
          header: "Arc",
          size: 40,
          Header: <HeaderWithTooltip text="Arc" tooltip="DME Arc" />,
          enableSorting: false,
          filterVariant: "checkbox",
          muiFilterCheckboxProps: { title: "" },
          Cell: ({ cell }) => (
            <DmeArcIcon
              fontSize="medium"
              color={cell.getValue<boolean>() ? "inherit" : "disabled"}
            />
          ),
        }),
      ],
    }),
  ], [props.dttpCycleNumber, props.approachTypes]);

  const table = useMaterialReactTable({
    columns,
    data: data,
    enableTopToolbar: false,
    enableColumnActions: false,
    initialState: { 
        showColumnFilters: true,
        density: "compact",
        sorting: [{ id: 'distance', desc: false }]
    },
    renderDetailPanel: ({ row }) => ApproachDetailPanel(row, props.airports),
  });

  return <MaterialReactTable table={table} />;
}

const APPROACH_TYPE_TO_APPEARANCE: { [key in ApproachTypeString]: ChipProps } =
  {
    ILS: { color: "primary" },
    LOC: { color: "warning" },
    "LOC/DME": { color: "warning", variant: "outlined" },
    "LOC/NDB": { color: "warning", variant: "outlined" },
    "LOC Backcourse": { color: "warning", variant: "outlined" },
    "LOC/DME Backcourse": { color: "warning", variant: "outlined" },

    LDA: { color: "warning", variant: "outlined" },
    "LDA/DME": { color: "warning", variant: "outlined" },
    SDF: { color: "warning", variant: "outlined" },

    RNAV: { color: "success" },
    "RNAV (GPS)": { color: "success" },
    "RNAV (RNP)": { color: "success" },
    GPS: { color: "success" },
    GBAS: { color: "success" },

    TACAN: { color: "info" },

    NDB: { color: "info" },
    "NDB/DME": { color: "info" },
    VOR: { color: "info" },
    "VOR/DME": { color: "info" },

    "High Altitude ILS": { color: "secondary" },
    "High Altitude LOC": { color: "secondary" },
    "High Altitude LOC/DME": { color: "secondary" },
    "High Altitude LOC/DME Backcourse": { color: "secondary" },
    "High Altitude RNAV (GPS)": { color: "secondary" },
    "High Altitude VOR": { color: "secondary" },
    "High Altitude VOR/DME": { color: "secondary" },
    "High Altitude TACAN": { color: "secondary" },
  };
