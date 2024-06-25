import "./styles.scss";
import React, {ChangeEvent, FormEvent, useEffect, useRef, useState} from "react";
import {Column, PageData, QueryParams, Row} from "./types";
import {Td} from "./cells";
import {QueryManager} from "./query";
import {SelectionManager} from "./selection";
import {getVisiblePageNums} from "./utils";

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

    const count: number = selectionManager.selection.size;
    return <>
        <input type="button" onClick={logSelected} value="Log Selected"/>
        {
            getFullSelectionStatus() ?
                <input type="button" onClick={deselectAll} value="Deselect All"/>
                : <input type="button" onClick={selectAll} value="Select All"/>
        }
        <input type="checkbox" value="selectable" onChange={handleSelectableChange}/>
        {
            count > 0 ? <span>{count} items selected.</span> : <span></span>
        }
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
            return <span key={idx}>...</span>
        }
        const disabled = num === pageNum;
        return <button key={idx} disabled={disabled} onClick={() => queryManager.changePageNum(num)}>{num}</button>
    });

    function prevPage() {
        queryManager.prevPage();
    }

    function nextPage() {
        queryManager.nextPage();
    }

    return <>
        <button onClick={prevPage} disabled={pageNum === 1}>Prev</button>
        {pageLinks}
        <button onClick={nextPage} disabled={pageNum === pageNumTotal}>Next</button>
        <span>Page {pageNum} of {pageNumTotal}</span>
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
        <div className="table">
            <Table columns={columns} rows={pageData.rows} selectionManager={selectionManager}/>
        </div>
        <div className="page-control">
            <PageSwitchWidget queryManager={queryManager}/>
            <form action="" onSubmit={handleSubmit} onReset={handleReset}>
                <input type="text" name="keyword" ref={keywordInput}/>
                <input type="submit"/>
                <input type="reset"/>
            </form>

            <select name="pagesize" id="pagesize"
                    ref={pageSizeInput} onChange={handlePageSizeInputChange}
                    defaultValue="10">
                <option value="5">5 rows</option>
                <option value="10">10 rows</option>
                <option value="20">20 rows</option>
                <option value="50">50 rows</option>
                <option value="100">100 rows</option>
            </select>

            <SelectionWidget {...{pageData, selectionManager}}/>
        </div>
    </div>
}
