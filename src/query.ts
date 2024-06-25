import {clamp} from "zenux";
import {PageData, QueryParams} from "./types";

export class QueryManager {
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
        this.setPageData(await this.queryPageData(queryParams));
    }

    async reload(){
        this.setPageData(await this.queryPageData(this.queryParams));
    }

    prevPage() {
        const pageNum = Math.max(1, this.queryParams.pageNum - 1);
        this.changePageNum(pageNum);
    }

    nextPage() {
        const pageNum = Math.min(this.queryParams.pageNum + 1, this.pageData.pageNumTotal);
        this.changePageNum(pageNum);
    }

    changePageNum(pageNum: number) {
        pageNum = clamp(pageNum, 1, this.pageData.pageNumTotal);
        const queryParams = {...this.queryParams, pageNum};
        this.setQueryParams(queryParams);
        this.apply(queryParams).catch(console.error);
    }

    changeKeyword(keyword: string) {
        const queryParams = {...this.queryParams, keyword};
        this.setQueryParams(queryParams);
        this.apply(queryParams).catch(console.error);
    }

    changePageSize(pageSize: number) {
        if (pageSize === this.queryParams.pageSize) {
            return;
        }
        const queryParams = {
            ...this.queryParams,
            pageNum: 1,
            pageSize: pageSize,
        };
        this.setQueryParams(queryParams);
        this.apply(queryParams).catch(console.error);
    }
}