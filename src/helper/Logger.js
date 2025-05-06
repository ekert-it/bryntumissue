import { LOGGER_LEVEL } from '@/helper/apiConfig';

export const LEVEL = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    DEBUG: 'DEBUG'
};

export class Logger {

    constructor() {
        this.maxLevel = `${LOGGER_LEVEL}`;
    }

    logDebug(...args) {
        if (this.maxLevel === LEVEL.DEBUG) {
            console.log("DEBUG: ", ...args);
        }
    }

    logError(...args) {
        if (this.maxLevel === LEVEL.ERROR || this.maxLevel === LEVEL.WARN || this.maxLevel === LEVEL.INFO || this.maxLevel === LEVEL.DEBUG) {
            console.error("ERROR :", ...args);
        }
    }

    logWarn(...args) {
        if (this.maxLevel === LEVEL.WARN || this.maxLevel === LEVEL.INFO || this.maxLevel === LEVEL.DEBUG) {
            console.warn("WARN: ", ...args);
        }
    }

    logInfo(...args) {
        if (this.maxLevel === LEVEL.INFO || this.maxLevel === LEVEL.DEBUG) {
            console.info("INFO: ", ...args);
        }
    }
}
export const Log= new Logger();
