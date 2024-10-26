import React, { createElement } from "react";
import { SelectionManager } from "./selection";
import { CellComponentMap, CellProps, Column, Row, TdProps } from "./types";

function ErrorTd({ column, row }: CellProps) {
    console.log("ErrorTd, column =", column);
    console.log("ErrorTd, row =", row);
    return <td className="error">{JSON.stringify(column)}</td>;
}

export function Td({ ccm, column, row }: TdProps) {
    if (!column.key) {
        return <td className={column.type}></td>;
    }

    const fc = ccm[column.type];
    if (!fc) {
        return <ErrorTd column={column} row={row} />;
    }
    const child = createElement(fc, { column, row });
    return <td className={column.type}>{child}</td>;
}

export interface TrProps {
    ccm: CellComponentMap;
    columns: Column[];
    row: Row;
    selectionManager: SelectionManager;
}

export interface TbodyProps {
    ccm: CellComponentMap;
    columns: Column[];
    rows: Row[];
    selectionManager: SelectionManager;
}

export function Tr({ ccm, columns, row, selectionManager }: TrProps) {
    const tds = columns.map((column, idx) => (
        <Td key={idx} ccm={ccm} column={column} row={row} />
    ));

    function _select() {
        selectionManager.add([row.id]);
    }

    function _deselect() {
        selectionManager.remove([row.id]);
    }

    if (selectionManager.selection.has(row.id)) {
        return (
            <tr className="selected" onClick={_deselect}>
                {tds}
            </tr>
        );
    } else {
        return <tr onClick={_select}>{tds}</tr>;
    }
}

export function Tbody({ ccm, columns, rows, selectionManager }: TbodyProps) {
    const trs = rows.map((row) => (
        <Tr
            key={row.id}
            ccm={ccm}
            columns={columns}
            row={row}
            selectionManager={selectionManager}
        />
    ));
    return <tbody>{trs}</tbody>;
}

export function Table({ ccm, columns, rows, selectionManager }: TbodyProps) {
    if (!rows.length) {
        return <div>No result found.</div>;
    }
    return (
        <table className="table">
            <thead>
                <tr>
                    {columns.map((column, idx) => (
                        <th key={idx} title={column.key}>
                            {column.name}
                        </th>
                    ))}
                </tr>
            </thead>
            <Tbody
                ccm={ccm}
                columns={columns}
                rows={rows}
                selectionManager={selectionManager}
            />
        </table>
    );
}
