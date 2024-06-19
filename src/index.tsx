import "./styles.scss";
import React, {FormEvent, useEffect, useRef, useState} from "react";
import {Column, PageData, QueryParams, Row} from "./types";
import {Td} from "./td";


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
    return <div className="table-responsive">
        <table className="table">
            <thead>
            <tr>
                {
                    columns.map((column, idx) => <th key={idx}>{column.name}</th>)
                }
            </tr>
            </thead>
            <Tbody columns={columns} rows={rows} selectionManager={selectionManager}/>
        </table>
    </div>
}

type NumOrNull = number | null;

function getVisiblePageNums(pageNum: number, pageNumTotal: number): NumOrNull[] {
    const nums: NumOrNull[] = [1];
    for (let num = 2; num < pageNumTotal; num++) {
        if (Math.abs(pageNum - num) < 4) {
            nums.push(num);
        } else if (nums[nums.length - 1]) {
            nums.push(null);
        }
    }
    if (pageNumTotal > 1) {
        nums.push(pageNumTotal);
    }
    return nums;
}


class SelectionManager {
    selection: Set<string>;
    setSelection: (selection: Set<string>) => void;

    constructor(selection: Set<string>, setSelection: (selection: Set<string>) => void) {
        this.selection = selection;
        this.setSelection = setSelection;
    }

    add(ids: string[]) {
        const selection = new Set(this.selection);
        ids.forEach((id: string) => selection.add(id));
        this.setSelection(selection);
    }

    remove(ids: string[]) {
        const selection = new Set(this.selection);
        ids.forEach((id: string) => selection.delete(id));
        this.setSelection(selection);
    }

    clear() {
        this.selection = new Set();
        this.setSelection(this.selection);
    }
}


export interface SelectionControlProps {
    pageData: PageData;
    selectionManager: SelectionManager;
}

function SelectionControl({pageData, selectionManager}: SelectionControlProps) {
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

    const count: number = selectionManager.selection.size;
    return <>
        <input type="button" onClick={logSelected} value="Log Selected"/>
        {
            getFullSelectionStatus() ?
                <input type="button" onClick={deselectAll} value="Deselect All"/>
                : <input type="button" onClick={selectAll} value="Select All"/>
        }
        {
            count > 0 ? <span>{count} items selected.</span> : <span></span>
        }
    </>
}


class QueryManager {
    pageData: PageData;
    setPageData: (pageData: PageData) => void;
    queryParams: QueryParams;
    setQueryParams: (queryParams: QueryParams) => void;
    queryPageData: (queryParams: QueryParams) => Promise<PageData>;


    constructor(
        pageData: PageData,
        setPageData: (pageData: PageData) => void,
        queryParams: QueryParams,
        setQueryParams: (queryParams: QueryParams) => void,
        queryPageData: (queryParams: QueryParams) => Promise<PageData>,
    ) {
        this.pageData = pageData;
        this.setPageData = setPageData;
        this.queryParams = queryParams;
        this.setQueryParams = setQueryParams;
        this.queryPageData = queryPageData;
    }

    async apply(queryParams: QueryParams) {
        console.log('applying queryParams:', queryParams);
        this.setPageData(await this.queryPageData(queryParams));
    }

    changePageNum(pageNum: number) {
        const queryParams = {...this.queryParams, pageNum: pageNum};
        this.setQueryParams(queryParams);
        this.apply(queryParams).catch(console.error);
    }

    changeKeyword(keyword: string) {
        const queryParams = {...this.queryParams, keyword: keyword};
        this.setQueryParams(queryParams);
        this.apply(queryParams).catch(console.error);
    }

    changePageSize(pageSize: number) {
        const queryParams = {...this.queryParams, pageSize: pageSize};
        this.setQueryParams(queryParams);
        this.apply(queryParams).catch(console.error);
    }
}


const initialQueryParams: QueryParams = {
    pageNum: 1,
    pageSize: 10,
    keyword: "",
}


export interface GridProps {
    columns: Column[];
    rows?: Row[];
    queryPageData: (_queryParams: QueryParams) => Promise<PageData>;
}

export function Grid({columns, rows, queryPageData}: GridProps) {
    const initialPageData: PageData = {
        rows: rows || [],
        pageNumTotal: 1
    }
    const [pageData, setPageData] = useState<PageData>(initialPageData);
    const [queryParams, setQueryParams] = useState<QueryParams>(initialQueryParams);
    const [selection, setSelection] = useState<Set<string>>(new Set());
    const selectionManager = new SelectionManager(selection, setSelection);

    const keywordInput = useRef<HTMLInputElement>(null);
    const pageSizeInput = useRef<HTMLSelectElement>(null);

    // console.log('rendering with pageData:', pageData);
    const queryManager = new QueryManager(pageData, setPageData, queryParams, setQueryParams, queryPageData);


    useEffect(() => {
        // console.log('in Grid(), in useEffect');
        queryManager.apply(initialQueryParams).catch(console.error);
    }, []);

    if (!pageData) {
        return <div>Loading ... (react)</div>
    }

    const visiblePageNums = getVisiblePageNums(queryParams.pageNum, pageData.pageNumTotal);
    const pageLinks = visiblePageNums.map((num: number | null, idx) => {
        if (!num) {
            return <span key={idx}>...</span>
        }
        const disabled = num === queryParams.pageNum;
        return <button key={idx} disabled={disabled} onClick={() => queryManager.changePageNum(num)}>{num}</button>
    });


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

    return <div className="zenux-grid">
        <Table columns={columns} rows={pageData.rows} selectionManager={selectionManager}/>
        <div className="page-control">
            {pageLinks}
            <span>Page {queryParams.pageNum} of {pageData.pageNumTotal}</span>
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

            <SelectionControl {...{pageData, selectionManager}}/>
        </div>
    </div>
}
