import React from 'react';
import {Grid, GridWires} from "./index";
import ReactDOM from "react-dom/client";

import {
    APIPageData,
    APIQueryParams,
    Column,
    PageData,
    QueryParams,
    translateQueryParams,
    untranslatePageData
} from "./types";
import {cellComponents, RawProps} from "./cells";
import "./styles/main.scss";


function YesNo({value}: RawProps) {
    const status = value ? "success" : "failure";
    const text = value ? "Yes" : "No";
    return <span className={`status ${status}`}>{text}</span>
}


cellComponents['yesno'] = YesNo;


async function getColumns(): Promise<Column[]> {
    const response = await fetch("/test-api/columns");
    const json = await response.json();
    return json.data;
}


async function _getPageData(apiQueryParams: APIQueryParams): Promise<APIPageData> {
    const keyword = encodeURIComponent(apiQueryParams.keyword || "");
    const qs = `limit=${apiQueryParams.limit}&skip=${apiQueryParams.skip}&keyword=${keyword}`;
    const url = `/test-api/search?${qs}`;
    const response = await fetch(url);
    const json = await response.json();
    return json.data;
}

async function queryPageData(queryParams: QueryParams): Promise<PageData> {
    const apiPageData = await _getPageData(translateQueryParams(queryParams));
    return untranslatePageData(apiPageData, queryParams.pageSize);
}

declare global {
    interface Window {
        zenuxGridWires?: GridWires;
    }
}


async function main() {
    const columns = await getColumns();
    window.zenuxGridWires = {};
    const grid = <Grid queryPageData={queryPageData} columns={columns} wires={window.zenuxGridWires}/>;
    ReactDOM.createRoot(document.getElementById("root")!).render(grid);
}

main().catch(console.error);
