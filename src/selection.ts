export class SelectionManager {
    selection: Set<string>;
    setSelection: (selection: Set<string>) => void;
    selectable: boolean;
    setSelectable: (selectable: boolean) => void;

    constructor(
        selection: Set<string>,
        setSelection: (selection: Set<string>) => void,
        selectable: boolean,
        setSelectable: (selectable: boolean) => void,
    ) {
        this.selection = selection;
        this.setSelection = setSelection;
        this.selectable = selectable;
        this.setSelectable = setSelectable;
    }

    add(ids: string[]) {
        if (!this.selectable) return;
        const selection = new Set(this.selection);
        ids.forEach((id: string) => selection.add(id));
        this.setSelection(selection);
    }

    remove(ids: string[]) {
        if (!this.selectable) return;
        const selection = new Set(this.selection);
        ids.forEach((id: string) => selection.delete(id));
        this.setSelection(selection);
    }

    clear() {
        if (!this.selectable) return;
        this.selection = new Set();
        this.setSelection(this.selection);
    }
}
