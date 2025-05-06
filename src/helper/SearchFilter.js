import { Log } from '@/helper/Logger';
import { loadStore } from '@/helper/gridUtils';

export class SearchFilter {

    constructor(property='nodeLabel', gridConfig, suchfeld, ) {
        this.property = property; // property: 'nodeLabel' - The property to filter on, should equal to a store's column name
        this.gridConfig = gridConfig; // gridConfig.value - The grid's configuration object
        this.suchfeld = suchfeld; // suchfeld.value - The input field's value where the user inputs the search string
        this.filterTimeout = null; // filterTimeout - Timeout to delay the filter application
        this.updateFilter = this.updateFilter.bind(this);
        this.applyFilter = this.applyFilter.bind(this);
        this.initializeFilter = this.initializeFilter.bind(this);
        this.logFilters = this.logFilters.bind(this);
        this.refreshFilter = this.refreshFilter.bind(this);
        this.getExcelUrl = this.getExcelUrl.bind(this);
        this.isinitialized = false;
        this.logFilters('SearchFilter constructor ');
    };

    updateFilter (newValue) {
        if (this.filterTimeout) {
            clearTimeout(this.filterTimeout);
        }
        if (this.isinitialized) {
            this.filterTimeout = setTimeout(() => {
                    Log.logDebug('Filtering on property / value = ', this.property, '/', newValue);
                    this.applyFilter(newValue);
            }, 500); //grace period
        }
    }
    refreshFilter() {
        if (this.isinitialized) {
            const getValueByName = this.getFilterValue(this.property);
            const disable = getValueByName === '' || !getValueByName;
            Log.logDebug('Refreshing filter for property / value / disable ', this.property, '/', getValueByName, disable);
            this.gridConfig.value.store.filter({
                property: this.property,
                value: getValueByName,
                disabled: disable
            });
            if (disable) {
                this.gridConfig.value.store.filters.remove(this.property);
                this.gridConfig.value.store.reload();
            }
        }
    }

    logFilters(text='') {
        for (const fil of this.gridConfig.value.store.filters) {
            Log.logDebug(text + this.property, fil.initialConfig);
        }
    }

    getFilterValue(searchKey) {
        for (const fil of this.gridConfig.value.store.filters) {
           // Log.logDebug('getFilterValue ' + this.property, fil.initialConfig.property, fil.initialConfig.value, " == ? ", searchKey);
            if (fil.initialConfig.property === searchKey) {
                return fil.initialConfig.value;
            }
        }
        return false;
    }

    getExcelUrl() {
        if (this.gridConfig.value && this.gridConfig.value.store) {
            let filter = '';
            if (this.gridConfig.value.store.filters) {
                for (const fil of this.gridConfig.value.store.filters) {
                    const temp = '[{"field":"nodeLabel","value":"' + fil.initialConfig.value + '"}]';
                    filter = '?' + this.gridConfig.value.store.initialConfig.filterParamName + '=' + encodeURIComponent(temp);
                }
            }
            return (this.gridConfig.value.store.initialConfig.readUrl + filter).replace('/view/', '/excel/');
        }
        return false;
    }

    async applyFilter (newValue) {
       // Log.logDebug('Applying filter for property / value = ', this.property, '/', newValue);
        let disable = false;
        if (newValue === '' || !newValue) {
            disable = true;
        }
        const getValueByName = this.getFilterValue(this.property);
        if (this.gridConfig?.value?.store) {
            if (!getValueByName || getValueByName !== newValue) {
                try {
                    this.gridConfig.value.store.filter({
                        property: this.property,
                        value: newValue,
                        disabled: disable
                    });
                } catch (e) {
                    Log.logError (e);
                    loadStore(this.gridConfig, null, true);
                }
            }
        }

        this.setInitialized();
    };

    setInitialized() {
        setTimeout(() => {
            this.isinitialized = true;
        }, 500);
    }

    initializeFilter () {
        //this.logFilters('initializeFilter ');
        if (this.gridConfig.value && this.gridConfig.value.store && this.gridConfig.value.store.filters) {
            try {
                const searchFilter = this.gridConfig.value.store.filters.get(this.property);
                if (searchFilter) {
                    this.suchfeld.value = searchFilter.value;
                    //Log.logDebug('Filter initialized with value', searchFilter.value);
                } else {
                    //this.logFilters('initializeFilter get By Name ');
                    const getByName = this.getFilterValue(this.property);
                    if (getByName) {
                        if (this.suchfeld.value !== getByName) {
                            this.suchfeld.value = getByName;
                        }
                       // Log.logDebug('Filter initialized with value', getByName);
                    }
                    else {
                        //Log.logDebug('No filter found for property', this.property);
                    }
                }
            } catch (e) {
                Log.logWarn('Exception on filter: ', this.property, e);
            }
        }
        this.setInitialized();
    };
}