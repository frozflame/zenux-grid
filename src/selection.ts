export class SelectionManager {
    selection: Set<string>;
    setSelection: (selection: Set<string>) => void;

    constructor(selection: Set<string>, setSelection: (selection: Set<string>) => void) {
        this.selection = selection;
        this.setSelection = setSelection;
    }

    add(ids: string[]) {
        const selection = new Set(this.selection);
        ids.forEach((id: string) => selection.add(id));
        this.setSelection(selection);
    }

    remove(ids: string[]) {
        const selection = new Set(this.selection);
        ids.forEach((id: string) => selection.delete(id));
        this.setSelection(selection);
    }

    clear() {
        this.selection = new Set();
        this.setSelection(this.selection);
    }
}