import React, { FormEvent, useRef } from "react";
import { QueryManager } from "../query";

interface PageSizeWidgetProps {
    queryManager: QueryManager;
}

function sortNumbers(nums: number[]) {
    return [...new Set(nums)].sort((n1, n2) => n1 - n2);
}

function fmtPageNumText(
    pageNum: number,
    pageNumTotal: number,
    total: number | undefined,
) {
    if (!total) {
        return `Page ${pageNum} of ${pageNumTotal}`;
    } else if (total < 2) {
        return `Page ${pageNum} of ${pageNumTotal} (${total} item)`;
    } else {
        return `Page ${pageNum} of ${pageNumTotal} (${total} items)`;
    }
}

export function PageNumWidget({ queryManager }: PageSizeWidgetProps) {
    return (
        <div className="ctrl">
            {fmtPageNumText(
                queryManager.queryParams.pageNum,
                queryManager.pageData.pageNumTotal,
                queryManager.pageData.total,
            )}
        </div>
    );
}

export function PageSizeWidget({ queryManager }: PageSizeWidgetProps) {
    const pageSizeInput = useRef<HTMLSelectElement>(null);

    function handlePageSizeInputChange(event: FormEvent) {
        if (!pageSizeInput.current) {
            return;
        }
        const pageSize = parseInt(pageSizeInput.current.value);
        queryManager.changePageSize(pageSize);
    }

    const pageSize = queryManager.queryParams.pageSize;
    let pageSizes = sortNumbers([5, 10, 20, 50, 100, pageSize]);
    return (
        <select
            name="pagesize"
            id="pagesize"
            className="ctrl"
            ref={pageSizeInput}
            onChange={handlePageSizeInputChange}
            defaultValue={queryManager.queryParams.pageSize}
        >
            {pageSizes.map((val, idx) => {
                return (
                    <option key={idx} value={val}>
                        {val} rows
                    </option>
                );
            })}
        </select>
    );
}
