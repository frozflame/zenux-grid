import React from "react";

export interface Column {
    key?: string;
    name: string;
    type: string;
}

export interface Row {
    id: string;
    item: any;
}


export interface CellProps {
    column: Column;
    row: Row;
}

export type CellComponent = (props: CellProps) => React.JSX.Element;
export type CellComponentMap = Record<string, CellComponent>;


export interface TdProps {
    ccm: CellComponentMap;
    column: Column;
    row: Row;
}


export interface APIPageData {
    items: any[];
    total: number;
}

export interface PageData {
    rows: Row[];
    pageNumTotal: number;
}

export interface APIQueryParams {
    limit: number;
    skip: number;
    keyword: string;
}

export interface QueryParams {
    pageNum: number;
    pageSize: number;
    keyword: string;
}


export function translateQueryParams(queryParams: QueryParams): APIQueryParams {
    return {
        limit: queryParams.pageSize,
        skip: (queryParams.pageNum - 1) * queryParams.pageSize,
        keyword: queryParams.keyword,
    }
}

export function untranslatePageData(apiPageData: APIPageData, pageSize: number): PageData {
    const rows = apiPageData.items.map((item: any) => {
        return {
            id: item._id,
            item: item,
        }
    });
    return {
        rows: rows,
        pageNumTotal: Math.ceil(apiPageData.total / pageSize),
    }
}
