import React, {createElement} from "react";
import {Column, Row} from "./types";


export interface RawProps {
    value: any;
}

export interface LinkProps {
    text: string;
    href: string;
}

function Num({value}: RawProps) {
    return <span className="num">{value}</span>
}

function Text({value}: RawProps) {
    if (typeof value !== "string") {
        return <span>{JSON.stringify(value)}</span>
    }
    if (value.length < 24) {
        return <>{value}</>;
    }
    return <span title={value}>{value.slice(0, 24)} ... </span>
}


function Code({value}: RawProps) {
    return <span className="code">{value}</span>
}

function Link(props: LinkProps) {
    return <a href={props.href} target="_blank">{props.text}</a>
}


export const cellComponents: Record<string, ((props: any) => React.JSX.Element)> = {
    "num": Num,
    "code": Code,
    "text": Text,
    "date": Text,
    "link": Link,
}


export function getCellComponent(type: string): (props: any) => React.JSX.Element {
    type = type || "text";
    return cellComponents[type];
}

export interface TdProps {
    column: Column;
    row: Row;
}


function ErrorTd({column, row}: TdProps) {
    console.log('ErrorTd, column =', column);
    console.log('ErrorTd, row =', row);
    return <td className="error">
        {JSON.stringify(column)}
    </td>
}

export function Td({column, row}: TdProps) {
    if (!column.key) {
        return <td className={column.type}></td>
    }
    const fc = getCellComponent(column.type);
    if (!fc) {
        return <ErrorTd column={column} row={row}/>
    }
    let cellProps = row.item[column.key];
    if (typeof cellProps !== "object" || Array.isArray(cellProps) || cellProps === null) {
        cellProps = {value: cellProps}
    }
    const child = createElement(fc, cellProps);
    return <td className={column.type}>{child}</td>
}
