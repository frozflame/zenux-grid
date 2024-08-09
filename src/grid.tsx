import React, {useEffect, useState} from "react";
import {CellComponentMap, Column, PageData, QueryParams} from "./types";
import {QueryManager} from "./query";
import {SelectionManager} from "./selection";
import {joinClassNames} from "./utils";
import {SearchForm} from "./components/search";
import {SelectionWidget} from "./components/selection";
import {PageSwitchWidget} from "./components/pageswitch";
import {PageSizeWidget} from "./components/pagesize";
import {Table} from "./table";
import {defaultCellComponentMap} from "./cells";

export type {Column, PageData, APIPageData, QueryParams, APIQueryParams, Row} from "./types";
export {translateQueryParams, untranslatePageData} from "./types";
export type {Td} from "./table";
export {defaultCellComponentMap} from "./cells";


export interface GridWires {
    selectionManager?: SelectionManager;
    queryManager?: QueryManager;
}

export interface GridOptions {
    initialPageData?: PageData;
    initialQueryParams?: QueryParams;
    withPageWidgets?: boolean;
    withSearchForm?: boolean;
    withStickyEndColumns?: boolean;
    withSelectionButtons?: boolean;
}


export interface GridProps {
    ccm?: CellComponentMap;
    columns: Column[];
    options: GridOptions;
    queryPageData: (_queryParams: QueryParams) => Promise<PageData>;
    wires?: GridWires;
}

export function Grid({ccm, columns, options, queryPageData, wires}: GridProps) {
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
    const queryManager = new QueryManager(pageData, setPageData, queryParams, setQueryParams, queryPageData);

    useEffect(() => {
        // console.log('in Grid(), in useEffect');
        queryManager.apply(initialQueryParams).catch(console.error);
    }, []);

    // TODO: better loading UI
    if (!pageData) {
        return <div>Loading ... (react)</div>
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
            <Table ccm={ccm || defaultCellComponentMap}
                   columns={columns} rows={pageData.rows}
                   selectionManager={selectionManager}/>
        </div>
        {
            options.withPageWidgets ?
                <div className="page-control">
                    <div className="ctrl">Page {queryParams.pageNum} of {pageData.pageNumTotal}</div>
                    <PageSwitchWidget queryManager={queryManager}/>
                    <PageSizeWidget queryManager={queryManager}/>
                </div>
                : <></>
        }
    </div>
}
