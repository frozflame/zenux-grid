import React from "react";
import {CellComponentMap, Column, PageData, Row} from "./types";
import {defaultCellComponentMap} from "./cells";
import {Td} from "./table";
import {joinClassNames} from "zenux";

export interface TrProps {
    ccm: CellComponentMap;
    columns: Column[];
    row: Row;
}

export interface TbodyProps {
    ccm: CellComponentMap;
    columns: Column[];
    rows: Row[];
}

export function Tr({ccm, columns, row}: TrProps) {
    const tds = columns.map(
        (column, idx) =>
            <Td key={idx} ccm={ccm} column={column} row={row}/>
    );
    return <tr>{tds}</tr>
}

export function Tbody({ccm, columns, rows}: TbodyProps) {
    const trs = rows.map(
        (row, idx) =>
            <Tr key={idx} ccm={ccm} columns={columns} row={row}/>
    );
    return <tbody>{trs}</tbody>
}

export function Table({ccm, columns, rows}: TbodyProps) {
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
        <Tbody ccm={ccm} columns={columns} rows={rows}/>
    </table>
}

export interface SimpleGridOptions {
    // withPageWidgets: not implemented yet
    withPageWidgets?: boolean;
    withStickyEndColumns?: boolean;
}


export interface SimpleGridProps {
    ccm?: CellComponentMap;
    columns: Column[];
    options?: SimpleGridOptions;
    pageData: PageData;
}


export function SimpleGrid({ccm, columns, options, pageData}: SimpleGridProps) {
    let className = 'zenux-grid';
    options = options || {};
    if (options.withStickyEndColumns) {
        className = joinClassNames(className, 'sticky-end-columns')!;
    }
    return <div className={className}>
        <div className="table">
            <Table ccm={ccm || defaultCellComponentMap} columns={columns} rows={pageData.rows}/>
        </div>
    </div>
}
