zenux-grid
==========

Yet another data grid react component.

Early stage. See `src/demo.tsx` for basic usage.

See also `docs/changelog.txt`.

### Table width control

Setting `width:100%` do not prevent tables from expanding beyond their parent container.

Here are 2 solutions, both have limitations.

Try to figure out the width of `div.table` and specify in CSS:

```css
.zenux-grid div.table {
    table-layout: fixed;
    width: calc(100vw - 240px);
}
```

Using `table-layout:fixed` may solve the problem in some cases:

```css
.zenux-grid table {
    table-layout: fixed;
    width: 100%;
}
```

But this will require you to specify column widths manually.

### Version History (changelog)

See `docs/changes.txt`.