import "./styles.scss";
import React from 'react';
import {Grid} from "./index";
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


async function getColumns(): Promise<Column[]> {
    const response = await fetch("/api/meta/demo");
    const json = await response.json();
    return json.data.columns;
}


async function _getPageData(apiQueryParams: APIQueryParams): Promise<APIPageData> {
    const keyword = encodeURIComponent(apiQueryParams.keyword || "");
    const qs = `limit=${apiQueryParams.limit}&skip=${apiQueryParams.skip}&keyword=${keyword}`
    const url = `/api/query/sample?${qs}`;
    const response = await fetch(url);
    const json = await response.json();
    return json.data;
}

async function queryPageData(queryParams: QueryParams): Promise<PageData> {
    const apiPageData = await _getPageData(translateQueryParams(queryParams));
    return untranslatePageData(apiPageData, queryParams.pageSize);
}


async function main() {
    const columns = await getColumns();
    const grid = <Grid queryPageData={queryPageData} columns={columns}/>;
    ReactDOM.createRoot(document.getElementById("root")!).render(grid);
}

main().catch(console.error);
