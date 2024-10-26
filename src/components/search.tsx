import React, { FormEvent, useRef } from "react";
import { QueryManager } from "../query";
import { SelectionManager } from "../selection";

interface SearchFormProps {
    queryManager: QueryManager;
    selectionManager: SelectionManager;
    keywordFields?: string[];
}

export function SearchForm({
    queryManager,
    selectionManager,
    keywordFields,
}: SearchFormProps) {
    const keywordInput = useRef<HTMLInputElement>(null);

    function handleSubmit(event: FormEvent) {
        if (!keywordInput.current) {
            return;
        }
        event.preventDefault();
        queryManager.changeKeyword(keywordInput.current.value.trim());
        selectionManager.clear();
    }

    function handleReset(event: FormEvent) {
        queryManager.changeKeyword("");
        selectionManager.clear();
    }

    const keywordFieldInput = keywordFields ? (
        <select
            name="field"
            id="input-field"
            disabled={true}
            className="ctrl"
            defaultValue=""
        >
            <option value="">&#10033;</option>
        </select>
    ) : (
        <></>
    );
    return (
        <form
            action=""
            onSubmit={handleSubmit}
            onReset={handleReset}
            className="search-form"
        >
            <input
                className="ctrl"
                type="text"
                name="keyword"
                ref={keywordInput}
                placeholder="search..."
            />
            {keywordFieldInput}
            <input className="ctrl" type="reset" />
            <input className="ctrl" type="submit" />
        </form>
    );
}
