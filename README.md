# [VUE 3] parent.clearChildren followed by store.filter leave tree-store sub-nodes in instable state

https://forum.bryntum.com/viewtopic.php?t=32874

This repo helps to reproduce a bug when combining 
```
parent.clearChildren(true);
gridConfig.value.store.loadChildren(parent);
```
and
```
store.filter({
property: 'nodeLabel',
value: newValue,
disabled: false
});
```

## Video
You can watch a video (if you like) showing this bug:
https://www.ekert.de/bryntum.mov

## 1. clone this repo
git clone https://github.com/ekert-it/bryntumissue.git

## 2. build this repo
npm install
npm run dev

## 3. Setup
* This repo is optimized for Chrome
* To load data the Bryntum Ajax store connects to https://taesy-integration-dev.ekert.de/read/issue20250506/an/allgemein/?startIndex=0&parentId=root&count=10000
* This data is randomized data
* Make sure your firewall allows access to this uri

## 4. Start
Navigate to http://localhost:5173/

## 5. Reproduce the Bug

### 5.1 Filter
* The demo provides a Searchkey input field which allows to filter the content.
* The data is filtered by backend.
* Try some Filter Samples like "Aaron, Hudson" or "Aaron"_
* The Filter automatically fires when you pause typing

### 5.2 Dynamic Changes of content from backend
* The demo uses lazy load and a tree grid
* Reset the filter field and make sure you see the full list of names (about 1700 entries)
* Open the entry for Aaron, Hudson by clicking the >
* Open the entry for 2025-04 by clicking the >
* Double click the red values in column "Dynamic from server" - this triggers the backend to send new data
* You can see the data refresh when the > for a short moment is replaced by the spinner icon
* In the developer tools you can see that new data is loaded through the network

### 5.3 Fire the bug
* Now again enter the Searchkey Aaron, Hudson
* Navigate to Aaron, Hudson -> 2025-04
* You now will experience the broken grid
  * The triangles > no longer work properly
* If you remove the Search key again, you can see the exception in the console
```
@bryntum_grid.js?v=a3a9f3e9:30399 Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'includes')
    at AjaxStore.onNodeRemoveChild (@bryntum_grid.js?v=a3a9f3e9:30399:29)
    at @bryntum_grid.js?v=a3a9f3e9:18660:19
    at Array.forEach (<anonymous>)
    at ModelClass.clearChildren (@bryntum_grid.js?v=a3a9f3e9:18658:16)
    at AjaxStore.clear (@bryntum_grid.js?v=a3a9f3e9:25950:25)
    at DynamicTreeStoreLazyLoadPlugin.clearLoaded (@bryntum_grid.js?v=a3a9f3e9:34594:12)
    at DynamicTreeStoreLazyLoadPlugin.beforePerformFilter (@bryntum_grid.js?v=a3a9f3e9:34569:10)
    at Proxy.performRemoteFilter (@bryntum_grid.js?v=a3a9f3e9:37632:72)
    at Proxy.filter (@bryntum_grid.js?v=a3a9f3e9:27281:43)
    at SearchFilter.applyFilter (SearchFilter.js:89:49)
```
# Background
We update the filter via a keyhandler and trigger the function refreshFilter in helper/SearchFilter.js:
```
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
```
We reload the tree node by calling reloadNode in helper/gridUtils.js:
```
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
```
