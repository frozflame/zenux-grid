import {SelectionManager} from "../selection";
import React, {ChangeEvent} from "react";
import {PageData, Row} from "../types";

export interface SelectionWidgetProps {
    pageData: PageData;
    selectionManager: SelectionManager;
}

export function SelectionWidget({pageData, selectionManager}: SelectionWidgetProps) {
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

    function handleSelectableChange(event: ChangeEvent<HTMLInputElement>) {
        selectionManager.setSelectable(event.target.checked);
    }

    function handleModeButtonClick() {
        selectionManager.setSelectable(!selectionManager.selectable);
    }

    const count: number = selectionManager.selection.size;
    return <>
        <div className="btn-group selection-control">
            <button onClick={selectAll} className="select-all"
                    disabled={!selectionManager.selectable || getFullSelectionStatus()}>Select All
            </button>
            <button onClick={logSelected} className="count"
                    disabled={!count}>{count}</button>
            <button onClick={deselectAll} className="deselect-all"
                    disabled={!selectionManager.selectable || !count}>Deselect All
            </button>
            <button
                className={selectionManager.selectable ? "mode on" : "mode off"}
                onClick={handleModeButtonClick}>✓
            </button>
        </div>

    </>
}