import { Log } from '@/helper/Logger';

let loadTimeout;

// Set font-size on grid
const setFontSize = (gridReference, size, rowHeight) => {
//    size = 14;
    const grid = gridReference.value.instance.value;
    // Font size and small transition for size changes to make it even smoother
    grid.element.style.cssText = `font-size: ${size}px !important; transition: font-size .1s`;
    // RowHeight is used internally in calculations and is required to be a px value for now
    grid.rowHeight = rowHeight;
};

const expandSelected = (record, gridReference) => {
    const gr = gridReference.value.instance.value;
    const selected = gr.selectedRecords;
    if (selected.length === 0) {
        return false;
    }
    for (let i = 0; i < selected.length; i++) {
        gr.expand(selected[i]);
    }
}

/**
 * intended to (only) run on a gridConfig's store being a tree store. We do not check if store is a tree store.
 * loads the leaf with id worktimesheetId.
 * loads leafs parent node, clears parent node's children and re-loads all children of parent node.
 * @param gridConfig
 * @param worktimesheetId
 */
const reloadNode = (gridConfig, worktimesheetId) => {
    /* TODO: clearing and reloading throws Filter Exceptions -> Bug Report Bryntum */
     Log.logDebug(gridConfig, worktimesheetId);
     if (worktimesheetId && gridConfig?.value?.store?.getById(worktimesheetId)?.parent) {
         const row = gridConfig.value.store.getById(worktimesheetId);
         const parent = row.parent;
         Log.logDebug(parent.descendantCount)
         const allChildren = parent.children;
         if (!allChildren || allChildren.length === 0) {
             return;
         }
         if (! gridConfig?.value?.store.isLoading) {
             parent.clearChildren(true);
             gridConfig.value.store.loadChildren(parent);
         }
     }
 }


 /**
  * intended to (only) run on a gridConfig's store being a tree store. We do not check if store is a tree store.
  * clears parent node's children and re-loads all children of parent node.
  * @param gridConfig
  * @param parent
  */
const reloadNodeByParent = (gridConfig, parent) => {
    /* TODO: clearing and reloading throws Filter Exceptions -> Bug Report Bryntum */
    if (parent && gridConfig?.value?.store && ! gridConfig?.value?.store.isLoading) {
        parent.clearChildren(true);
        gridConfig.value.store.loadChildren(parent);
    }
}

const handleRefresh = (gridConfig, data) => {
    if (data) {
        reloadNode(gridConfig, data);
    } else {
        loadStore(gridConfig, null, true);
    }
}

const loadStore = (gridConfig, isLoaded, enforce) => {

    loadTimeout = setTimeout(() => {
        if (gridConfig.value && ((!gridConfig.value.store.isLoading && isLoaded && !isLoaded.value) || enforce)) {
            Log.logDebug('Loading store ' + gridConfig.value.store.id);
            if (isLoaded) {
                isLoaded.value = true;
            }

            gridConfig.value.store.load();
        }
    }, 200); // Delay in ms
}

const registerDblClick = (gridReference, callback, isArchive) => {
    if (!callback) {
        Log.logWarn("registerDblClick: - no callback provided: ", callback);
        return;
    }
    if (gridReference && gridReference.value && gridReference.value.instance && gridReference.value.instance.value) {
        const grid = gridReference.value.instance.value;
        grid.on('cellDblClick', ({ grid, record, column, cellElement, target, event }) => {
            if (callback) {
                callback(record, gridReference, isArchive);
            }
        });
        // Register keydown event
        grid.element.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
                const record = grid.getSelection()[0];
                if (record) {
                    callback(record, gridReference);
                }
            }
        });
    } else {
        Log.logWarn("registerDblClick: gridReference was not available: ", gridReference)
    }
}

export {setFontSize, loadStore, registerDblClick, reloadNode, reloadNodeByParent, handleRefresh};