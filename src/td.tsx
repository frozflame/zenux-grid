import {Column, Row} from "./types";
import React, {createElement} from "react";

export interface TdProps {
    column: Column;
    row: Row;
}

export function _Text({column, row}: TdProps) {
    if (!column.key) {
        return <td></td>
    }
    return <td>{row.item[column.key]}</td>
}

export function _Select(props: TdProps) {
    return <td className="select"></td>
}

export function _Link(props: TdProps) {
    return <td>
        <a href="https://stackoverflow.com/questions/2833027/vertically-aligning-css-before-and-after-content">vertical</a>
    </td>
}

export const registry: Record<string, (props: TdProps) => React.JSX.Element> = {
    "link": _Link,
    "text": _Text,
    "number": _Text,
    "select": _Select,
}

export function Td(props: TdProps) {
    const fc = registry[props.column.type];
    return createElement(fc, props)
}