import './style.css'
import { createApp } from 'vue';
import App from './App.vue';
import '@/assets/styles.scss';
import '@/assets/tailwind.css';
import Aura from '@primevue/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import DialogService from 'primevue/dialogservice';
import ToastService from 'primevue/toastservice';
import { definePreset } from '@primevue/themes';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Bryntum Grid configurations
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import { BryntumGrid } from '@bryntum/grid-vue-3';
// import Bryntum Vue renderer components
import ItalicName from '@/components/ItalicName.vue';
import BoldName from '@/components/BoldName.vue';
import ArrayRenderer from '@/components/ArrayRenderer.vue';
import IconRenderer from '@/components/IconRenderer.vue';
import ColorRenderer from '@/components/ColorRenderer.vue';

// Setup Bryntom State provider to store view states (like position of columns) in local storage
import { StateProvider } from '@bryntum/grid';
StateProvider.setup('local');

// Setup Bryntom Locale provider to use German locale
import { LocaleManager, LocaleHelper } from '@bryntum/grid';
import deConfig from '@/helper/countryConfigs';
LocaleHelper.publishLocale(deConfig);
LocaleManager.locale = 'de';

// miscelaneus settings
import { Model } from '@bryntum/grid';

Model.convertEmptyParentToLeaf = false;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// set global fetch config
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const originalFetch = window.fetch;
window.fetch = function(input, init = {}) {
    init.credentials = 'include';
    return originalFetch(input, init);
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// vue init
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const app = createApp(App);
const DiamondPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{teal.50}',
            100: '{teal.100}',
            200: '{teal.200}',
            300: '{teal.300}',
            400: '{teal.400}',
            500: '{teal.500}',
            600: '{teal.600}',
            700: '{teal.700}',
            800: '{teal.800}',
            900: '{teal.900}',
            950: '{teal.950}'
        }
    }
});

app.use(PrimeVue, {
    theme: {
        preset: DiamondPreset,
        options: {
            darkModeSelector: '.app-dark'
        }
    },
    locale: {
        firstDayOfWeek: 1, // Monday as first day of the week
        dayNames: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
        dayNamesShort: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
        dayNamesMin: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
        monthNames: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
        monthNamesShort: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
        today: "Heute",
        clear: "Löschen",
        dateFormat: "dd.mm.yy",
        weekHeader: "KW"
    }
});
app.use(DialogService);
app.use(ConfirmationService);
app.use(ToastService);
app.component('BryntumGrid', BryntumGrid);
app.component('BoldName', BoldName);
app.component('ItalicName', ItalicName);
app.component('ArrayRenderer', ArrayRenderer);
app.component('IconRenderer', IconRenderer);
app.component('ColorRenderer', ColorRenderer);

app.mount('#app');
