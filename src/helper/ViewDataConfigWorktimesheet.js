
import { AjaxStore, GridRowModel } from '@bryntum/grid';
import { API_BASE_URL } from '@/helper/apiConfig';
import { encodeFilterParams, handleAggregate, handleBg, collectColumns, cellMenuFeatureConfig, handleSelectionChange, } from '@/helper/GridHelper';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Standard Felder für die Modelle
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const WoktimesheetFields = [
    { name: 'parentId', type: 'number' },
    { name: 'isParent', type: 'boolean' },
    { name: 'level', type: 'number' },
    { name: 'nr', type: 'number' },
    { name: 'expanded', type: 'boolean' },
    { name: 'employeeId', type: 'string' },
    { name: 'employeeName', type: 'string' },
    { name: 'calcPeriod', type: 'string' },

    { name: 'tag', type: 'string' },
    { name: 'permissionlevel', type: 'string' },
    { name: 'permissionDeniedLogo', type: 'string' },
    { name: 'permissionLogo', type: 'number' },
    { name: 'notiz', type: 'string' },
    { name: 'nachweisnummer', sortable: true, type: 'string' },
    { name: 'unternummer', type: 'number' },
    { name: 'storno', type: 'boolean' },
    { name: 'svmxgenerationerror', type: 'boolean' },
    { name: 'svmxFreigabe', type: 'number' },
    { name: 'businessarea', type: 'string' },
    { name: 'mitarbeiter', type: 'string' },
    { name: 'team', type: 'string' },
    { name: 'auftragsnummer', type: 'string' },
    { name: 'fehltag', type: 'string', dataSource: 'auftragsnummer' },
    { name: 'orderadd', type: 'string' },
    { name: 'ordername', type: 'string' },
    { name: 'costtype', type: 'string' },
    { name: 'controlmark', type: 'string' },
    { name: 'travelDistance', type: 'number' },
    { name: 'travelStartTime', type: 'string' },
    { name: 'travelEndTime', type: 'string' },
    { name: 'workingStartTime', type: 'string' },
    { name: 'workingEndTime', type: 'string' },
    { name: 'worktimeFloat', type: 'string' },
    { name: 'drivingTimeFloat', type: 'number' },
    { name: 'arbeitszeitFloat', type: 'number' },
    { name: 'breakTimeFloat', type: 'number' },
    { name: 'worktimenormalFloat', type: 'number' },
    { name: 'tagesSollStundenFloat', type: 'number' },
    { name: 'weektimesplitting', type: 'string' },
    { name: 'worktimeadditionalFloat', type: 'number' },
    { name: 'orderedovertimeLogo', type: 'number' },
    { name: 'worktimeFlexFloat', type: 'number' },
    { name: 'dailyBenefitSumFloat', type: 'number' },
    { name: 'specialExpensesFloat', type: 'number' },
    { name: 'accomodationCostFloat', type: 'number' },
    { name: 'accomodationSumFloat', type: 'number' },
    { name: 'accomodationtaxedFloat', type: 'number' },
    { name: 'accomodationtaxfreeFloat', type: 'number' },
    { name: 'attendanceFlatrateFloat', type: 'number' },
    { name: 'exportdatep1', type: 'date' },
    { name: 'exportdatep3', type: 'date' },
    { name: 'exportdateoracletravel', type: 'date' },
    { name: 'exportdatewo', type: 'date' },
    { name: 'exportdateoraclejobs', type: 'date' },
    { name: 'svmxtimestamp', type: 'date' },
    { name: 'auftragsnummerold', type: 'string' },
    { name: 'orderaddold', type: 'string' },
    { name: 'stornodateorder', type: 'date' },
    { name: 'modified', type: 'date' },
    { name: 'businessTrip', type: 'boolean' },
    { name: 'absencetimeFloat', type: 'number' },
    { name: 'dailybenefitmanualset', type: 'boolean' },
    { name: 'hostingverinsumcalcFloat', type: 'number' },
    { name: 'laenderkennzeichen', type: 'string' },
    { name: 'hostingveraussumcalcFloat', type: 'number' },
    { name: 'hostinghotinbelegvatcalcFloat', type: 'number' },
    { name: 'hostingbusinesssumcalcFloat', type: 'number' },
    { name: 'kfzamountkmcalcFloat', type: 'number' },
    { name: 'kfzcarcosttotalcalcFloat', type: 'number' },
    { name: 'servicesumcalcFloat', type: 'number' },
    { name: 'transportsumcalcFloat', type: 'number' },
    { name: 'othersumcalcFloat', type: 'number' },
];

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Modelle
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// the class name mimics the object name as used in taesy backend
class WorktimesheetViewBaseModel extends GridRowModel {
    static fields = WoktimesheetFields;
}

// a node label column plus the standard columns - we use a unique name for the nodeLabel field to avoid conflicts since Bryntum Grid uses field names to identify columns
//see https://bryntum.com/products/grid/docs/api/Core/data/Model # Field inheritance
class WorktimesheetViewAllgemeinModel extends WorktimesheetViewBaseModel {
    static fields = [
        { name: 'id', dataSource: 'nodeKey', type: 'string' },
        { name: 'nodeLabelAllgemein', type: 'string', dataSource: 'nodeLabel'  }
    ];
}

class WorktimesheetViewNachNummerModel extends WorktimesheetViewBaseModel {
    static fields = [
        { name: 'id', type: 'string', dataSource: 'nodeKey' },
        { name: 'nodeLabelNachNummer', type: 'string', dataSource: 'nodeLabel' },
        { name: 'datum', type : 'date', format : 'DD-MM-YYYY' },
    ];
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Stores
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const storeAllgemein = new AjaxStore({
    id: 'storeAllgemein',
    modelClass: WorktimesheetViewAllgemeinModel,
    readUrl: `${API_BASE_URL}/read/issue20250506/an/allgemein/`,
    autoLoad: true,
    tree: true,
    lazyLoad: { chunkSize: 10000 }, // must be higher than the total amount of user names returned from backend. We want to load all names in one run but still keep lazy loading for deeper nodes.
    filterParamName: 'anfilter',
    encodeFilterParams: encodeFilterParams,
    headers : {
        'X-Taesy-Archive-Mode': 'live'
    }
});

const storeNachNummer = new AjaxStore({
    id: 'storeNachNummer',
    modelClass: WorktimesheetViewNachNummerModel,
    readUrl: `${API_BASE_URL}/read/issue20250506/an/nachnummer/`,
    autoLoad: false,
    tree: false,
    lazyLoad: { chunkSize: 1000 },
    filterParamName: 'anfilter',
    encodeFilterParams: encodeFilterParams,
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Besondere Spalten
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const columnNodeLabelAllgemein =     {
    id: 200,
    text: 'Mitarbeiter | Monat | Datum',
    field: 'nodeLabelAllgemein',
    width: 200,
    type: 'tree',
    locked: true,
    touchConfig: { editor: false },
    readOnly: true, filterable: true,
    tooltip: 'Mitarbeiter | Monat | Tag',
    resizable: true
}

const columnArbeitszeit = {
    id: 303, field: 'worktimeFloat', text: 'ArbZt.', format: '9,999.99', type: 'aggregate', filterable: false, width: 80, minWidth: 80, tooltip: 'Arbeitszeit (Reisezeit + Arbeitszeit - außer bei Storno oder SVMX Fehler)',
    afterRenderCell: ({ record, row, cellElement }) => {
        handleAggregate(row, record, cellElement, 2);
    }
};

const columnTag =
    {
    id: 304, field: 'tag', text: 'Tag', filterable: false, width: 40, minWidth: 40, tooltip: 'Wochentag',
        afterRenderCell: ({ record, row }) => {
            handleBg(row, record);
        }
    };

const columnFehltag =  {
    id: 306, field: 'fehltag', text: 'Dynamic from server', filterable: false, width: 250, minWidth: 250, tooltip: 'Dynamic data from Server - changes on each load (for this example)?',
    vue: true,
    renderer({ record }) {
       // if (record.auftragsnummer === '9997') {
            return {
                is: 'ColorRenderer',
                text: record.auftragsnummer,
                color: 'red',
                divClass: 'colorColumnBold',
                value: record.ordername
            };
        //}
    }
};

const columnDatum = { id: 305, field: 'datum', text: 'Datum', type: 'date', format: 'DD.MM.YYYY', filterable: false, width: 85, minWidth: 85, tooltip: 'Buchungsdatum des Arbeitsnachweises.' };


const columnsNachweis = [
    {
        id: 7, field: 'nachweisnummer', sortable: true, text: 'Nachweisnummer', filterable: false, width: 120, minWidth: 120, tooltip: 'Nachweisnummer des Arbeitsnachweises'
        /* renderer({ row, record, value }) {
             // Color only odd rows
             row.eachElement(el => el.style.background = row.index % 2 === 0 ? '#b2ffe9' : '#ffffff');

             return value;
         }*/
    },
    {
        id: 8, field: 'unternummer', text: 'UNr.', filterable: false, width: 45, minWidth: 45, tooltip: 'Unternummer des Arbeitsnachweises',
        vue: true,
        renderer({ record: { unternummer: value } }) {
            if (value > 0) {
                return {
                    is: 'ColorRenderer',
                    text: value,
                    color: 'green',
                    divClass: 'colorColumnBold',
                    value
                };
            } else {
                return {
                    is: 'ColorRenderer',
                    text: value,
                    color: 'gray',
                    divClass: 'colorColumn',
                    value
                };
            }
        }
    },
]
const columnEmployeeName = {id: 205, field: 'employeeName', text: 'Name', filterable: false, width: 120, minWidth: 120, tooltip: 'Name des Mitarbeiters'};


const columnNodeLabelNachNummer = JSON.parse(JSON.stringify(columnsNachweis));
columnNodeLabelNachNummer[0].locked = true;
columnNodeLabelNachNummer[1].locked = true;

const columnsFlags = [

    { id: 3, field: 'permissionlevel', text: 'Stufe', filterable: false, width: 25, minWidth: 20, tooltip: 'Genehmigungsstufe' },
    { id: 4, field: 'permissionDeniedLogo', text: 'Gen. Abg.', filterable: false, width: 25, minWidth: 20, tooltip: 'Genehmigung abgelehnt?',
        vue: true,
        renderer({ record }) {
            if (record.permissionDeniedLogo > 0) {
                return {
                    is: 'ColorRenderer',
                    text: '',
                    icon: 228,
                    color: 'red',
                    divClass: 'colorColumnBold',
                    value: ''
                };
            }
        }
    },
    {
        id: 5, field: 'permissionLogo', text: 'Bes. Gen.', filterable: false, width: 25, minWidth: 20, cellCls: 'cellCenter', tooltip: 'Besondere Genehmigung notwendig?',
        vue: true,
        renderer({ row, record, value }) {
            if (record.permissionLogo > 0) {
                return {
                    // text: value,
                    is: 'ColorRenderer',
                    useValueAsIcon: true,
                    color: record.permissionLogo === 82 ? 'green' : 'red',
                    divClass: 'colorColumnBold',
                    value: record.permissionLogo
                };
            }
        }
    },
    { id: 6, field: 'notiz', text: 'Notiz', filterable: false, width: 25, minWidth: 20, tooltip: 'Notiz vorhanden?' },
    {
        id: 9, field: 'storno', text: 'Storno', filterable: false, width: 25, minWidth: 20,
        vue: true,
        tooltip: 'Storno - Wurde dieser Arbeitsnachweis storniert?',
        renderer({ row, record, value }) {
            if (record.storno) {
                return {
                    is: 'ColorRenderer',
                    text: 'Storno',
                    icon: 97,
                    color: 'red',
                    divClass: 'colorColumnBold',
                    value: ''
                };
            } else {
                //row.cls.remove ('bg-red-100')
            }
        }
    },
    {
        id: 10, field: 'svmxgenerationerror', text: 'SVMX Fehler', filterable: false, width: 25, minWidth: 20, tooltip: 'Lag ein Fehler beim Import aus Service Max vor? Falls ja, müssen Sie den Arbeitsnachweis korrigieren.',
        vue: true,
        renderer({ row, record, value }) {
            if (record.svmxgenerationerror) {
                //row.cls.add('bg-red-100')
                return {
                    is: 'ColorRenderer',
                    text: 'FEHLER',
                    icon: 38,
                    color: 'red',
                    divClass: 'colorColumnBold',
                    value: ''
                };
            } else {
                //row.cls.remove ('bg-red-100')
            }
        }
    },
    {
        id: 11, field: 'svmxFreigabe', text: 'SVMX Freigabe', filterable: false, width: 25, minWidth: 20, tooltip: 'Ist eine Service Max Freigabe erforderlich oder bereits erfolgt?',
        vue: true,
        renderer({ row, record, value }) {
            if (record.svmxFreigabe > 0) {
                return {
                    // text: value,
                    is: 'ColorRenderer',
                    useValueAsIcon: true,
                    color: record.svmxFreigabe === 202 ? 'green' : 'red',
                    divClass: 'colorColumnBold',
                    value: record.svmxFreigabe
                };
            }
        }
    },
]

const orderColumns =
    {   id: 1002,
        text: 'Auftrag',
        collapsible: true,
        collapsed: true,
        children: [
            { id: 517, field: 'auftragsnummer', text: 'Auftragsnummer', filterable: false, width: 100, minWidth: 100, tooltip: 'Auftragsnummer' },
            { id: 518, field: 'orderadd', text: 'Zusatz', filterable: false, width: 80, minWidth: 80, tooltip: 'Typ des Auftrags' },
            {
                id: 519, field: 'ordername', text: 'Auftrag', filterable: false, width: 220, minWidth: 220, tooltip: 'Beschreibung des Auftrags',
                vue: true,
                renderer({ record }) {
                    if (record.auftragsnummer === '9997') {
                        return {
                            is: 'ColorRenderer',
                            text: record.ordername,
                            color: 'red',
                            divClass: 'colorColumnBold',
                            value: record.ordername
                        };
                    } else {
                        return {
                            is: 'ColorRenderer',
                            text: record.ordername,
                            color: 'gray',
                            divClass: 'colorColumn',
                            value: record.ordername
                        };
                    }
                }
            },
        ]
    };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Allgemeine Worktimesheet Spalten
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const overtimeColumns = [
    {
        id: 31, field: 'worktimeadditionalFloat', text: 'Mehr- arb.', format: '9,999.99', type: 'aggregate', filterable: false, width: 50, minWidth: 50, tooltip: 'Mehrarbeit',
        afterRenderCell: ({ record, row, cellElement }) => {
            handleAggregate(row, record, cellElement);
        }
    },
    {
        id: 32, field: 'orderedovertimeLogo', text: 'ang. Mehr.', filterable: false, width: 25, minWidth: 20, tooltip: 'angeordnete Mehrarbeit',
        vue: true,
        renderer({ record }) {
            if (record.orderedovertimeLogo > 0) {
                return {
                    // text: value,
                    is: 'ColorRenderer',
                    useValueAsIcon: true,
                    color: 'red',
                    divClass: 'colorColumnBold',
                    value: record.orderedovertimeLogo
                };
            }
        }
    },
    {
        id: 33, field: 'worktimeFlexFloat', text: 'Flex gb.', format: '9,999.99', type: 'aggregate', filterable: false, width: 50, minWidth: 50, tooltip: 'Flexzeit gebucht',
        afterRenderCell: ({ record, row, cellElement }) => {
            handleAggregate(row, record, cellElement);
        }
    },
    { id: 19, field: 'controlmark', text: 'Str. KZ', filterable: false, width: 25, minWidth: 20, tooltip: 'Steuerungskennzeichen' },
    {
        id: 38, field: 'attendanceFlatrateFloat', text: 'Bereit. Pausch.', format: '9,999.99', type: 'aggregate', filterable: false, width: 50, minWidth: 50, tooltip: 'Bereitschaftspauschale',
        afterRenderCell: ({ record, row, cellElement }) => {
            handleAggregate(row, record, cellElement);
        }
    },
]

const worktimesheetColumns = [

    { id: 21, field: 'travelStartTime', text: 'Reise-Beginn', filterable: false, width: 50, minWidth: 50, tooltip: 'Reisebeginn' },
    { id: 23, field: 'workingStartTime', text: 'Arbeits- Beginn', filterable: false, width: 50, minWidth: 50, tooltip: 'Arbeitsbeginn' },
    {
        id: 27, field: 'breakTimeFloat', text: 'Pause', format: '9,999.99', type: 'aggregate', filterable: false, width: 50, minWidth: 50, tooltip: 'Pause',
        afterRenderCell: ({ record, row, cellElement }) => {
            handleAggregate(row, record, cellElement);
        }
    },
    { id: 24, field: 'workingEndTime', text: 'Arbeits- Ende', filterable: false, width: 50, minWidth: 50, tooltip: 'Arbeitsende' },
    { id: 22, field: 'travelEndTime', text: 'Reise-Ende', filterable: false, width: 50, minWidth: 50, tooltip: 'Reiseende' },
    { id: 14, field: 'team', text: 'Team', filterable: false, width: 150, minWidth: 150, tooltip: 'Team' },
    {
        id: 25, field: 'worktimeFloat', text: 'Gesamt Arbzt.', format: '9,999.99', type: 'aggregate', filterable: false, width: 50, minWidth: 50, tooltip: 'Gesamt Arbeitszeit',
        afterRenderCell: ({ record, row, cellElement }) => {
            handleAggregate(row, record, cellElement);
        }
    },
    { id: 20, field: 'travelDistance', text: 'Gesamt Km', format: '9,999', filterable: false, width: 50, minWidth: 50, tooltip: 'Gesamt Km' },
    {
        id: 26, field: 'drivingTimeFloat', text: 'Gesamt ReiseZt.', format: '9,999.99', type: 'aggregate', filterable: false, width: 50, minWidth: 50, tooltip: 'Gesamt Reisezeit',
        afterRenderCell: ({ record, row, cellElement }) => {
            handleAggregate(row, record, cellElement);
        }
    },
    {
        id: 28, field: 'worktimenormalFloat', text: 'Normal Std.', format: '9,999.99', type: 'aggregate', filterable: false, width: 50, minWidth: 50, tooltip: 'Normal-Arbeitszeit',
        afterRenderCell: ({ record, row, cellElement }) => {
            handleAggregate(row, record, cellElement);
        }
    },
    {
        id: 29, field: 'tagesSollStundenFloat', text: 'Tag Soll h', format: '9,999.99', type: 'aggregate', filterable: false, width: 50, minWidth: 50, tooltip: 'Sollstunden des Tages',
        afterRenderCell: ({ record, row, cellElement }) => {
            handleAggregate(row, record, cellElement);
        }
    },
    { id: 12, field: 'businessarea', text: 'Business Area', filterable: false, width: 150, minWidth: 150, tooltip: 'Business Area' },
    { id: 13, field: 'mitarbeiter', text: 'Mitarbeiter-Nr.', filterable: false, width: 100, minWidth: 100, tooltip: 'Personalnummer des Mitarbeiters, für den der Arbeitsnachweis gilt.' },
    { id: 30, field: 'weektimesplitting', text: 'Wo. Std.', filterable: false, width: 50, minWidth: 50, tooltip: 'Wochenstunden-Gruppe' },

 ];

const travelColumns = [
    { id: 18, field: 'costtype', text: 'Kostenart', filterable: false, width: 80, minWidth: 80, tooltip: 'Kostenart' },
    {
        id: 34, field: 'dailyBenefitSumFloat', text: 'Tage- geld', format: '9,999.99', type: 'aggregate', filterable: false, width: 50, minWidth: 50, tooltip: 'Tagegeld',
        afterRenderCell: ({ record, row, cellElement }) => {
            handleAggregate(row, record, cellElement);
        }
    },
    { id: 502, field: 'dailybenefitmanualset', text: 'Tagegeld manuell', filterable: false, width: 35, minWidth: 35, tooltip: 'Tagegeld manuell gesetzt',
        vue: true,
        renderer({ record }) {
            if (record.dailybenefitmanualset) {
                return {
                    is: 'ColorRenderer',
                    text: '',
                    icon: 38,
                    color: 'red',
                    divClass: 'colorColumnBold',
                    value: ''
                };
            }
        } },
    {
        id: 35, field: 'specialExpensesFloat', text: 'Erst. MA', format: '9,999.99', type: 'aggregate', filterable: false, width: 50, minWidth: 50, tooltip: 'Erstattung an Mitarbeiter',
        afterRenderCell: ({ record, row, cellElement }) => {
            handleAggregate(row, record, cellElement);
        }
    },
    {
        id: 36, field: 'accomodationCostFloat', text: 'Hotel', format: '9,999.99', type: 'aggregate', filterable: false, width: 50, minWidth: 50, tooltip: 'Hotel',
        afterRenderCell: ({ record, row, cellElement }) => {
            handleAggregate(row, record, cellElement);
        }
    },
    {
        id: 37, field: 'accomodationSumFloat', text: 'Übern. pauschale', format: '9,999.99', type: 'aggregate', filterable: false, width: 50, minWidth: 50, tooltip: 'Übernachtungspauschale',
        afterRenderCell: ({ record, row, cellElement }) => {
            handleAggregate(row, record, cellElement);
        }
    },
];

const exportDateColumns = {
    id: 1001,
    text: 'Schnitstellen',
    collapsible: true,
    collapsed: true,
    children: [
        { id: 39, field: 'exportdatep1', text: 'P1', type: 'date', format: 'DD.MM.YYYY', filterable: false, width: 110, minWidth: 85, tooltip: 'Paisy Export P1 erfolgt am...' },
        { id: 40, field: 'exportdatep3', text: 'P3', type: 'date', format: 'DD.MM.YYYY', filterable: false, width: 85, minWidth: 85, tooltip: 'Paisy Export P3 erfolgt am...' },
        { id: 41, field: 'exportdateoracletravel', text: 'OEX', type: 'date', format: 'DD.MM.YYYY', filterable: false, width: 85, minWidth: 85, tooltip: 'Oracle Auslagen Export am...' },
        { id: 42, field: 'exportdatewo', text: 'WO', type: 'date', format: 'DD.MM.YYYY', filterable: false, width: 85, minWidth: 85, tooltip: 'WO Auftrag exporttiert am...' },
        { id: 43, field: 'exportdateoraclejobs', text: 'Oracle h', type: 'date', format: 'DD.MM.YYYY', filterable: false, width: 85, minWidth: 85, tooltip: 'Oracle Aufträge Stunden exportiert am...' },
    ]
};

const additionalWtsColumns = [
    { id: 44, field: 'svmxtimestamp', text: 'SVMX Impt.', type: 'date', format: 'DD.MM.YYYY HH:mm:ss.SSSZ', filterable: false, width: 85, minWidth: 85, tooltip: 'Tag, Uhrzeit des Service Max Imports.' },
    { id: 45, field: 'auftragsnummerold', text: 'Ursp.', filterable: false, width: 45, minWidth: 45, tooltip: 'Vorige Auftragsnummer' },
    { id: 46, field: 'orderaddold', text: 'Typ Ursp.', filterable: false, width: 45, minWidth: 45, tooltip: 'Voriger Auftragstyp' },
    { id: 47, field: 'stornodateorder', text: 'Auftrag Storno', filterable: false, width: 45, minWidth: 45, tooltip: 'Auftragsstorno am...' },
    { id: 48, field: 'modified', text: 'Geändert (Datum, Uhrzeit)', type: 'date', format: 'DD.MM.YYYY HH:mm:ss.SSSZ', filterable: false, width: 220, minWidth: 220, tooltip: 'Zuletzt geändert...' }

];

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Zusammenbauen der Spalten für die useConfigs
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const WorktimesheetColumnsAllgemein = collectColumns(columnsNachweis, additionalWtsColumns, exportDateColumns, travelColumns, worktimesheetColumns, overtimeColumns, columnFehltag, columnTag, columnNodeLabelAllgemein);
const WorktimesheetColumnsNachNummer = collectColumns(additionalWtsColumns, exportDateColumns, travelColumns, worktimesheetColumns, overtimeColumns, columnEmployeeName, columnDatum, columnFehltag, columnTag, columnNodeLabelNachNummer);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Eigentliche useConfigs für die verschiedenen Grids
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const useGridConfigAllgemein = (scrollHeight) => {
    return {
        id: 'gridAllgemein',
        store: storeAllgemein,
        selectionMode: {
            row: true,
            checkboxOnly: false
        },
        stateId: 'taesy-tree-grid-allgemein',
        animateTreeNodeToggle: false,
        cellEditFeature: false,
        filterBarFeature: false,
        sortFeature: false,
        rowReorderFeature: false,
        stripeFeature: true,
        treeFeature: true,
        autoHeight: false,
        height: scrollHeight,
        rowHeight: 25,
        rowResizeFeature: false,
        cellMenuFeature: cellMenuFeatureConfig,
        loadMask: 'Einen Moment bitte...',
        onSelectionChange: handleSelectionChange,
        columns: WorktimesheetColumnsAllgemein,
    };
};

const useGridConfigNachNummer = (scrollHeight) => {
    return {
        id: 'gridNachNummer',
        store: storeNachNummer,
        selectionMode: {
            row: true,
            checkboxOnly: false
        },
        stateId: 'taesy-nach-nummer',
        //animateTreeNodeToggle: false,
        cellEditFeature: false,
        filterBarFeature: false,
        sortFeature: false,
        rowReorderFeature: false,
        stripeFeature: true,
        treeFeature: false,
        autoHeight: false,
        height: scrollHeight,
        rowHeight: 25,
        rowResizeFeature: false,
        cellMenuFeature: cellMenuFeatureConfig,
        loadMask: 'Einen Moment bitte...',
//        onSelectionChange: handleSelectionChange,
        columns: WorktimesheetColumnsNachNummer
    };
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Exports
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export {
    useGridConfigAllgemein,
    useGridConfigNachNummer,
};