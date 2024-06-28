import React, {ChangeEvent, FormEvent, useEffect, useRef, useState} from "react";
import {Column, PageData, QueryParams, Row} from "./types";
import {Td} from "./cells";
import {QueryManager} from "./query";
import {SelectionManager} from "./selection";
import {getVisiblePageNums} from "./utils";
import "./styles/main.scss";

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
                columns.map((column, idx) => <th key={idx}>{column.name}</th>)
            }
        </tr>
        </thead>
        <Tbody columns={columns} rows={rows} selectionManager={selectionManager}/>
    </table>
}


export interface SelectionWidgetProps {
    pageData: PageData;
    selectionManager: SelectionManager;
}

function SelectionWidget({pageData, selectionManager}: SelectionWidgetProps) {
    function selectAll() {
        selectionManager.add(pageData.rows.map(row => row.id));
    }

    function deselectAll() {
        selectionManager.remove(pageData.rows.map(row => row.id));
    }

    function logSelected(event: React.MouseEvent) {
        event.preventDefault();
        console.log('selected ids:', selectionManager.selection, selectionManager.selection.size);
    }

    function getFullSelectionStatus() {
        return pageData.rows.every((row: Row) => selectionManager.selection.has(row.id));
    }

    function handleSelectableChange(event: ChangeEvent<HTMLInputElement>) {
        selectionManager.setSelectable(event.target.checked);
    }

    function handleModeButtonClick() {
        selectionManager.setSelectable(!selectionManager.selectable);
    }

    const count: number = selectionManager.selection.size;
    return <>
        <div className="btn-group selection-control">
            <button onClick={selectAll} className="select-all"
                    disabled={!selectionManager.selectable || getFullSelectionStatus()}>Select All
            </button>
            <button onClick={logSelected} className="count"
                    disabled={!count}>{count}</button>
            <button onClick={deselectAll} className="deselect-all"
                    disabled={!selectionManager.selectable || !count}>Deselect All
            </button>
            <button
                className={selectionManager.selectable ? "mode on" : "mode off"}
                onClick={handleModeButtonClick}>✓
            </button>
        </div>

    </>
}


interface PageSwitchWidgetProps {
    queryManager: QueryManager;
}

function PageSwitchWidget({queryManager}: PageSwitchWidgetProps) {
    const pageNum = queryManager.queryParams.pageNum;
    const pageNumTotal = queryManager.pageData.pageNumTotal;

    const visiblePageNums = getVisiblePageNums(pageNum, pageNumTotal);
    const pageLinks = visiblePageNums.map((num: number | null, idx) => {
        if (!num) {
            return <button key={idx} disabled className="ellipsis">...</button>
        }
        const current = num === pageNum;
        return <button className={current ? 'current' : ''} key={idx} disabled={current}
                       onClick={() => queryManager.changePageNum(num)}>{num}</button>
    });

    function prevPage() {
        queryManager.prevPage();
    }

    function nextPage() {
        queryManager.nextPage();
    }

    return <>
        <div className="btn-group page-num-control">
            <button onClick={prevPage} disabled={pageNum === 1}>Prev</button>
            {pageLinks}
            <button onClick={nextPage} disabled={pageNum === pageNumTotal}>Next</button>
        </div>
    </>
}


export interface GridWires {
    selectionManager?: SelectionManager;
    queryManager?: QueryManager;
}


export interface GridProps {
    columns: Column[];
    rows?: Row[];
    queryPageData: (_queryParams: QueryParams) => Promise<PageData>;
    wires?: GridWires;
}

export function Grid({columns, rows, queryPageData, wires}: GridProps) {
    const initialPageData: PageData = {
        rows: rows || [],
        pageNumTotal: 1
    }
    const initialQueryParams: QueryParams = {
        pageNum: 1,
        pageSize: 10,
        keyword: "",
    }
    const [pageData, setPageData] = useState<PageData>(initialPageData);
    const [queryParams, setQueryParams] = useState<QueryParams>(initialQueryParams);
    const [selection, setSelection] = useState<Set<string>>(new Set());
    const [selectable, setSelectable] = useState(false);
    const selectionManager = new SelectionManager(selection, setSelection, selectable, setSelectable);
    const keywordInput = useRef<HTMLInputElement>(null);
    const pageSizeInput = useRef<HTMLSelectElement>(null);
    const queryManager = new QueryManager(pageData, setPageData, queryParams, setQueryParams, queryPageData);

    useEffect(() => {
        // console.log('in Grid(), in useEffect');
        queryManager.apply(initialQueryParams).catch(console.error);
    }, []);

    if (!pageData) {
        return <div>Loading ... (react)</div>
    }

    function handleSubmit(event: FormEvent) {
        if (!keywordInput.current) {
            return;
        }
        event.preventDefault();
        queryManager.changeKeyword(keywordInput.current.value);
        selectionManager.clear();
    }

    function handleReset(event: FormEvent) {
        queryManager.changeKeyword("");
        selectionManager.clear();
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

    return <div className="zenux-grid">
        <div className="page-control">
            <SelectionWidget {...{pageData, selectionManager}}/>
            <form action="" onSubmit={handleSubmit} onReset={handleReset} className="search-form">
                <input className="ctrl" type="text" name="keyword" ref={keywordInput} placeholder="search..."/>
                <input className="ctrl" type="submit"/>
                <input className="ctrl" type="reset"/>
            </form>
        </div>

        <div className="table">
            <Table columns={columns} rows={pageData.rows} selectionManager={selectionManager}/>
        </div>
        <div className="page-control">
            <div className="ctrl">Page {queryParams.pageNum} of {pageData.pageNumTotal}</div>
            <PageSwitchWidget queryManager={queryManager}/>
            <select name="pagesize" id="pagesize" className="ctrl"
                    ref={pageSizeInput} onChange={handlePageSizeInputChange}
                    defaultValue="10">
                <option value="5">5 rows</option>
                <option value="10">10 rows</option>
                <option value="20">20 rows</option>
                <option value="50">50 rows</option>
                <option value="100">100 rows</option>
            </select>
        </div>
    </div>
}
