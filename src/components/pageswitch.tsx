import { QueryManager } from "../query";
import { getVisiblePageNums } from "../utils";
import React, { useState } from "react";

export interface PageSwitchWidgetProps {
    queryManager: QueryManager;
}

function logInfo() {
    console.log("zenux-grid");
}

export function PageSwitchWidget({ queryManager }: PageSwitchWidgetProps) {
    const pageNum = queryManager.queryParams.pageNum;
    const pageNumTotal = queryManager.pageData.pageNumTotal;
    if (pageNumTotal < 2) {
        return <></>;
    }
    const [pageNumInputValue, setPageNumInputValue] = useState(
        queryManager.queryParams.pageNum,
    );

    const visiblePageNums = getVisiblePageNums(pageNum, pageNumTotal);
    const pageLinks = visiblePageNums.map((num: number | null, idx) => {
        if (!num) {
            return (
                <button
                    key={idx}
                    disabled
                    className="ellipsis"
                    onDoubleClick={logInfo}
                >
                    ...
                </button>
            );
        }
        const current = num === pageNum;
        return (
            <button
                className={current ? "current" : ""}
                key={idx}
                disabled={current}
                onClick={() => queryManager.changePageNum(num)}
            >
                {num}
            </button>
        );
    });

    function prevPage() {
        queryManager.prevPage();
    }

    function nextPage() {
        queryManager.nextPage();
    }

    function handlePageNumInputChange(
        event: React.FormEvent<HTMLInputElement>,
    ) {
        setPageNumInputValue(parseInt(event.currentTarget.value));
    }

    function handlePageNumFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        queryManager.changePageNum(pageNumInputValue);
    }

    return (
        <div style={{ display: "inline-flex", justifyContent: "center" }}>
            <div
                className="btn-group page-num-control"
                style={{ display: "inline-flex", justifyContent: "center" }}
            >
                <button onClick={prevPage} disabled={pageNum === 1}>
                    Prev
                </button>
                {pageLinks}
                <button onClick={nextPage} disabled={pageNum === pageNumTotal}>
                    Next
                </button>
            </div>
            <form
                className="btn-group"
                style={{ display: "inline-block" }}
                onSubmit={handlePageNumFormSubmit}
            >
                <input
                    type="number"
                    value={pageNumInputValue}
                    min={1}
                    max={queryManager.pageData.pageNumTotal}
                    className="ctrl page-num-input"
                    onChange={handlePageNumInputChange}
                />
            </form>
        </div>
    );
}
