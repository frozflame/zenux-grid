import React from "react";
import {SelectionManager} from "./selection";
import {Column, Row} from "./types";
import {Td} from "./cells";

export interface TrProps {
    columns: Column[];
    row: Row;
    selectionManager: SelectionManager;
}

export interface TbodyProps {
    columns: Column[];
    rows: Row[];
    selectionManager: SelectionManager;
}

export function Tr({columns, row, selectionManager}: TrProps) {
    const tds = columns.map(
        (column, idx) => <Td key={idx} column={column} row={row}/>
    );

    function _select() {
        selectionManager.add([row.id]);
    }

    function _deselect() {
        selectionManager.remove([row.id]);
    }

    if (selectionManager.selection.has(row.id)) {
        return <tr className="selected" onClick={_deselect}>{tds}</tr>
    } else {
        return <tr onClick={_select}>{tds}</tr>
    }
}

export function Tbody({columns, rows, selectionManager}: TbodyProps) {
    const trs = rows.map(
        (row, idx) => <Tr key={idx} columns={columns} row={row} selectionManager={selectionManager}/>
    );
    return <tbody>{trs}</tbody>
}

export function Table({columns, rows, selectionManager}: TbodyProps) {
    if (!rows.length) {
        return <div>No result found.</div>
    }
    return <table className="table">
        <thead>
        <tr>
            {
                columns.map(
                    (column, idx) =>
                        <th key={idx} title={column.key}>{column.name}</th>
                )
            }
        </tr>
        </thead>
        <Tbody columns={columns} rows={rows} selectionManager={selectionManager}/>
    </table>
}