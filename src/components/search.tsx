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
    const keywordInputRef = useRef<HTMLInputElement>(null);
    const keywordFieldInputRef = useRef<HTMLSelectElement>(null);

    function handleSubmit(event: FormEvent) {
        if (!keywordInputRef.current) {
            return;
        }
        event.preventDefault();
        const keywordPrefix = keywordFieldInputRef.current
            ? `--${keywordFieldInputRef.current.value}--`
            : "";
        queryManager.changeKeyword(
            keywordPrefix + keywordInputRef.current.value.trim(),
        );
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
            className="ctrl"
            defaultValue={keywordFields.length > 0 ? keywordFields[0] : ""}
            ref={keywordFieldInputRef}
        >
            {keywordFields.map((name, idx) => (
                <option key={idx} value={name}>
                    {name}
                </option>
            ))}
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
                ref={keywordInputRef}
                placeholder="search..."
            />
            {keywordFieldInput}
            <input className="ctrl" type="reset" />
            <input className="ctrl" type="submit" />
        </form>
    );
}
