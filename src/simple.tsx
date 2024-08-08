import React from "react";
import {Column, PageData, Row} from "./types";
import {Td} from "./cells";
import {joinClassNames} from "zenux";

export interface TrProps {
    columns: Column[];
    row: Row;
}

export interface TbodyProps {
    columns: Column[];
    rows: Row[];
}

export function Tr({columns, row}: TrProps) {
    const tds = columns.map(
        (column, idx) => <Td key={idx} column={column} row={row}/>
    );
    return <tr>{tds}</tr>
}

export function Tbody({columns, rows}: TbodyProps) {
    const trs = rows.map(
        (row, idx) => <Tr key={idx} columns={columns} row={row}/>
    );
    return <tbody>{trs}</tbody>
}

export function Table({columns, rows}: TbodyProps) {
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
        <Tbody columns={columns} rows={rows}/>
    </table>
}

export interface SimpleGridOptions {
    // withPageWidgets: not implemented yet
    withPageWidgets?: boolean;
    withStickyEndColumns?: boolean;
}



export interface SimpleGridProps {
    columns: Column[];
    options: SimpleGridOptions;
    pageData: PageData;
}



export function SimpleGrid({columns, options, pageData}: SimpleGridProps) {
    let className = 'zenux-grid';
    if (options.withStickyEndColumns) {
        className = joinClassNames(className, 'sticky-end-columns')!;
    }
    return <div className={className}>
        <div className="table">
            <Table columns={columns} rows={pageData.rows}/>
        </div>
    </div>
}
