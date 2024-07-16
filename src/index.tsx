import React, {FormEvent, useEffect, useRef, useState} from "react";
import {Column, PageData, QueryParams, Row} from "./types";
import {Td} from "./cells";
import {QueryManager} from "./query";
import {SelectionManager} from "./selection";
import {joinClassNames} from "./utils";
import {SearchForm} from "./components/search";
import "./styles/main.scss";
import {SelectionWidget} from "./components/selection";
import {PageSwitchWidget} from "./components/pageswitch";
import {PageSizeWidget} from "./components/pagesize";

export type {Column, PageData, APIPageData, QueryParams, APIQueryParams, Row} from "./types";
export {translateQueryParams, untranslatePageData} from "./types";
export type {RawProps, LinkProps, Td} from "./cells";
export {cellComponents} from "./cells";


interface TrProps {
    columns: Column[];
    row: Row;
    selectionManager: SelectionManager;
}

interface TbodyProps {
    columns: Column[];
    rows: Row[];
    selectionManager: SelectionManager;
}


function Tr({columns, row, selectionManager}: TrProps) {
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

function Tbody({columns, rows, selectionManager}: TbodyProps) {
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


export interface GridWires {
    selectionManager?: SelectionManager;
    queryManager?: QueryManager;
}

export interface GridOptions {
    initialPageData?: PageData;
    initialQueryParams?: QueryParams;
    withSearchForm?: boolean;
    withStickyEndColumns?: boolean;
    withSelectionButtons?: boolean;
}


export interface GridProps {
    columns: Column[];
    options: GridOptions;
    queryPageData: (_queryParams: QueryParams) => Promise<PageData>;
    wires?: GridWires;
}

export function Grid({columns, options, queryPageData, wires}: GridProps) {
    const initialPageData: PageData = options.initialPageData || {
        rows: [], pageNumTotal: 1,
    }
    const initialQueryParams: QueryParams = options.initialQueryParams || {
        pageNum: 1, pageSize: 10, keyword: "",
    };
    const [pageData, setPageData] = useState<PageData>(initialPageData);
    const [queryParams, setQueryParams] = useState<QueryParams>(initialQueryParams);
    const [selection, setSelection] = useState<Set<string>>(new Set());
    const [selectable, setSelectable] = useState(false);
    const selectionManager = new SelectionManager(selection, setSelection, selectable, setSelectable);
    const pageSizeInput = useRef<HTMLSelectElement>(null);
    const queryManager = new QueryManager(pageData, setPageData, queryParams, setQueryParams, queryPageData);

    useEffect(() => {
        // console.log('in Grid(), in useEffect');
        queryManager.apply(initialQueryParams).catch(console.error);
    }, []);

    // TODO: better loading UI
    if (!pageData) {
        return <div>Loading ... (react)</div>
    }

    function handlePageSizeInputChange(event: FormEvent) {
        if (!pageSizeInput.current) {
            return;
        }
        const pageSize = parseInt(pageSizeInput.current.value);
        queryManager.changePageSize(pageSize);
    }

    if (wires) {
        wires.queryManager = queryManager;
        wires.selectionManager = selectionManager;
    }
    let className = 'zenux-grid';
    if (options.withStickyEndColumns) {
        className = joinClassNames(className, 'sticky-end-columns')!;
    }
    return <div className={className}>
        <div className="page-control">

            {
                options.withSelectionButtons ?
                    <SelectionWidget {...{pageData, selectionManager}}/>
                    : <></>
            }

            {
                options.withSearchForm ?
                    <SearchForm queryManager={queryManager} selectionManager={selectionManager}/>
                    : <></>
            }
        </div>

        <div className="table">
            <Table columns={columns} rows={pageData.rows} selectionManager={selectionManager}/>
        </div>
        <div className="page-control">
            <div className="ctrl">Page {queryParams.pageNum} of {pageData.pageNumTotal}</div>
            <PageSwitchWidget queryManager={queryManager}/>
            <PageSizeWidget queryManager={queryManager}/>
        </div>
    </div>
}
