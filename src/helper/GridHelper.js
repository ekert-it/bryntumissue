
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Hilfs-Funktionen
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


import { Log } from '@/helper/Logger';

const encodeFilterParams = (filters) => {
    const
        result = [];

    for (const { property, operator, value, caseSensitive } of filters) {
        result.push({
            field : property,
            value,
        });
    }
    return JSON.stringify(result);
}

const onRemove = async (record, ident) => {
    const mappedType = {
        id: record.id,
        Grpname: record.grpname
    }
    const storeOps = { create: [], update: [], delete: mappedType }
    return await new ProtoService().storeData(storeOps, ident);
}

const handleAggregate = (row, record, cellElement, minLevel = 1) => {
    /*
    Ziel: Ich will die Summen in Level 0 nicht anzeigen, da sie
        a) nicht relevant sind
        b) nur diejenigen Daten (für die Level0-Summe) berücksichtigen können, für die die Level 1 ausgeklappt sind. Das ist verwirrend
    Erkenntnisse:
        - Ich könnte das im Backend erledigen, dafür brauche ich einen CASE When Konstrukt, damit keine Werte in Storno-Zeilen addiert werden, z.B. 'CASE WHEN replacedby != 0 OR svmxgenerationerror OR worktime is null OR worktime < 0.00001 THEN 0 ELSE wts.worktime END as worktime'
        - Daher im Frontend.  cellElement.style.visibility = 'hidden'; ist suboptimal, da die rechte Border verschwindet. cellElement.style.display = 'none'; ist suboptimal, da die Spalte schmaler wird. cellElement.innerHTML = ''; ist suboptimal,
         da die Spalte (für diese Row) ganz verschwindet.
     */
    if (record.level < minLevel && cellElement && cellElement.innerHTML) {
        cellElement.style.visibility = 'hidden';
    } else {
        cellElement.style.visibility = 'inherit';
    }
};

const handleBg = (row, record, isStorno=false) => {
    row.removeCls('bg-mark-red-100');
    row.removeCls('bg-mark-orange-100');
    if (record.storno || isStorno) {
        row.addCls('bg-mark-orange-100');
    } else if (record.auftragsnummer === '9997' && !record.storno) {
        row.addCls('bg-mark-red-100');
    } else if (record.svmxgenerationerror > 0) {
        row.addCls('bg-mark-red-100');
    }
};

const collectColumns = (baseColumns, ...columnObject) => {
    let result = null;
    if (baseColumns instanceof Array) {
        result = baseColumns.toSpliced(0,0);
    } else {
        result =  JSON.parse(JSON.stringify([baseColumns]));
    }
    columnObject.forEach(column => {
        if (column instanceof Array) {
            for (let i = column.length - 1; i >= 0; i--) {
                //Log.logDebug('adding Column ... ', column[i]);
                result.unshift(column[i]);
            }
        } else if (typeof column !== 'undefined') {
            //Log.logDebug('adding Column', column);
            result.unshift(column);
        }
    });
    return result;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Callback Functions für die useConfigs
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const cellMenuFeatureConfig = {

    items: {
        // Remove "Delete record" default item
        removeRow: false,
        cut: false,
        paste: false,
        copy: false,
        filterDateBefore: false,
        filterDateAfter: false
    }
};

const handleSelectionChange = ({ source, selected, deselected }) => {
    if (selected.length === 1 && !selected[0].isLeaf && selected[0].children && selected[0].children.length > 0) {
        selected[0].children.forEach(record =>
            source.selectRow({
                record,
                addToSelection: true,
                scrollIntoView: false
            })
        );
    }
    if (deselected.length === 1 && !deselected[0].isLeaf && deselected[0].children) {
        source.deselectRows(deselected[0].children);
    }
};

export {encodeFilterParams, handleAggregate, handleBg, collectColumns, cellMenuFeatureConfig, handleSelectionChange, onRemove};