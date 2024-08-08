import "./styles/main.scss";
import React, {useEffect, useState} from 'react';
import {Grid, GridOptions, GridWires} from "./grid";
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
import {SimpleGrid} from "./simple";


function YesNo({value}: RawProps) {
    const status = value ? "success" : "failure";
    const text = value ? "Yes" : "No";
    return <span className={`status ${status}`}>{text}</span>
}


cellComponents['yesno'] = YesNo;


async function getColumns(): Promise<Column[]> {
    const response = await fetch("/api/columns");
    const json = await response.json();
    return json.data;
}


async function _getPageData(apiQueryParams: APIQueryParams): Promise<APIPageData> {
    const keyword = encodeURIComponent(apiQueryParams.keyword || "");
    const qs = `limit=${apiQueryParams.limit}&skip=${apiQueryParams.skip}&keyword=${keyword}`;
    const url = `/api/search?${qs}`;
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

interface DemoProps {
    columns: Column[];
}

function Demo({columns}: DemoProps) {
    window.zenuxGridWires = {};
    const options1: GridOptions = {
        initialQueryParams: {
            keyword: '',
            pageNum: 1,
            pageSize: 20,
        },
        withSearchForm: true,
        withSelectionButtons: true,
        withStickyEndColumns: false,
    }
    const options2: GridOptions = {
        withSearchForm: true,
        withSelectionButtons: true,
        withStickyEndColumns: true,
    }
    const options3: GridOptions = {
        withSearchForm: false,
        withSelectionButtons: false,
        withStickyEndColumns: true,
    }

    const [pageData, setPageData] = useState<PageData>();
    useEffect(() => {
        queryPageData({pageNum: 1, pageSize: 10, keyword: ''}).then((_pageData) => {
            setPageData(_pageData);
        });

    }, []);
    return <div>
        <h1>Grid 1:</h1>
        <Grid columns={columns} options={options1} queryPageData={queryPageData} wires={window.zenuxGridWires}/>

        <h1>Grid 2:</h1>
        <Grid columns={columns} options={options2} queryPageData={queryPageData}/>

        <h1>Grid 3:</h1>
        <Grid columns={columns} options={options3} queryPageData={queryPageData}/>

        <h1>SimpleGrid:</h1>
        {
            pageData ? <SimpleGrid columns={columns} options={options3} pageData={pageData}/> : <></>
        }
    </div>
}


async function main() {
    const columns = await getColumns();
    ReactDOM.createRoot(document.getElementById("root")!).render(<Demo columns={columns}/>);
}

main().catch(console.error);
