import React from "react";
import {CellComponentMap, CellProps} from "./types";


function Num({column, row}: CellProps) {
    const value = row.item[column.key!];
    return <span className="num">{value}</span>
}

function Text({column, row}: CellProps) {
    const value = row.item[column.key!];
    if (typeof value !== "string") {
        return <span>{JSON.stringify(value)}</span>
    }
    if (value.length < 24) {
        return <span>{value}</span>;
    }
    return <span title={value}>{value.slice(0, 24)} ... </span>
}


function Code({column, row}: CellProps) {
    const value = row.item[column.key!];
    return <span className="code">{value}</span>
}

export interface LinkDict {
    text: string;
    href: string;
}

function Link({column, row}: CellProps) {
    const value = row.item[column.key!] as LinkDict;
    return <a href={value.href} target="_blank">{value.text}</a>
}


function Labels({column, row}: CellProps) {
    const labels: string[] = row.item[column.key!];
    const elements = labels.map((label, idx) => {
        return <span style={{margin: '4px'}} key={idx}>{label}</span>
    })
    return <div>{elements}</div>
}


export const defaultCellComponentMap: CellComponentMap = {
    "num": Num,
    "code": Code,
    "text": Text,
    "date": Text,
    "link": Link,
    "labels": Labels,
}
