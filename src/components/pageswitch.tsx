import { QueryManager } from "../query";
import { getVisiblePageNums } from "../utils";
import React from "react";

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

    return (
        <>
            <div className="btn-group page-num-control">
                <button onClick={prevPage} disabled={pageNum === 1}>
                    Prev
                </button>
                {pageLinks}
                <button onClick={nextPage} disabled={pageNum === pageNumTotal}>
                    Next
                </button>
            </div>
        </>
    );
}
