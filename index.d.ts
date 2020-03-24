
export = Logger;

declare function Logger(mod: Logger.ParamModule, config: Logger.Config): Logger.NLogger;


declare namespace Logger {
    declare type ParamModule = NodeModule | {filename: string} | ImportMeta | string

    /**
     * @description style methods for colors module
     * @see {@link colors github}
     * @see {@http https://github.com/Marak/colors.js} 
     */
    declare type Style = [       
        "black" |
        "red" |
        "green" |
        "yellow" |
        "blue" |
        "magenta" |
        "cyan" |
        "white" |
        "gray" |
        "grey" |
        "brightRed" |
        "brightGreen" |
        "brightYellow" |
        "brightBlue" |
        "brightMagenta" |
        "brightCyan" |
        "brightWhite" |
        "bgBlack" |
        "bgRed" |
        "bgGreen" |
        "bgYellow" |
        "bgBlue" |
        "bgMagenta" |
        "bgCyan" |
        "bgWhite" |
        "bgGray" |
        "bgGrey" |
        "bgBrightRed" |
        "bgBrightGreen" |
        "bgBrightYellow" |
        "bgBrightBlue" |
        "bgBrightMagenta" |
        "bgBrightCyan" |
        "bgBrightWhite" |
        "reset" |
        "bold" |
        "dim" |
        "italic" |
        "underline" |
        "inverse" |
        "hidden" |
        "strikethroug" |
        "rainbow" |
        "zebra" |
        "america" |
        "trap" |
        "random" 
    ]

    declare type Segments = {

        /**
         * @description first segment (moduleName)
         * @default ['yellow', 'italic', 'dim']
         */
        first: Style,

        /**
         * @description filename style
         * @default ['cyan', 'italic']
         */
        last: Style,

        /**
         * @description path sections (from module dir to filename). Without separator
         * @default ['grey', 'italic']
         */
        all: Style,

        /**
         * @description separator path sections
         * @default ['gray']
         */
        delimiter: Style,
    }

    declare type MethodConfig = {

        /** @description Sets whether this method works*/
        show: boolean

        /** @description style for method build time label. If not specified, use default */
        time?: Style,

        /** @description style for method build segments (path & moduleName) label. If not specified, use default */
        segments?: Segments,

        /** @description style for method build methodName label. If not specified, use default */
        label?: Style,

        /**
         * @description Show message when invoking logger.time()? Only time method
         * @default false
         */
        showStartTimer: boolean,

        /**
         * @description warning if the label exists when invoking logger.time(). Only time method
         * @default true
         */
        warningPresentLabel: boolean,


        /**
         * @description warning if the label does not exist when invoking logger.timeEnd(). Only time method
         * @default true
         */
        warningMissingLabel: boolean,

        /**
         * @description overwrite the label if one already exists. Only time method
         * @default false
         */
        changePresentLabel: boolean,

        /**
         * @description diff time style. Only time method
         * @default ['yellow']
         */
        diffTimeColor: Style,

        /**
         * @description depth param to dir method
         * @default 3
         */
        depth: number
    }


    declare interface Config {

        /**
         * @description style for default build time label
         * @default ['gray', 'bgBlack']
         */
        time: Style

        /**
         * @description style for default build methodName label
         * @default ['white', 'bold']
         */
        label: Style

        /** @description style for default build segments (path & moduleName) label */
        segments: Segments;

        /** 
         * @description custom formatters
         */
        formatters: {

            /** @description format string labels with styles */
            string: (str: string, styles: Style) => string,

            /** @description format time labels */
            time: (timestamp: number, short: boolean) => string,
        },


        /**
         * @default true
         */
        enableFileLink: boolean;

        /**
         * @description if not NULL, each time the indicated timestamp of the log does not match the previous one, an additional message is displayed indicating the full date and time
         * @default hour
         */
        groupedEveryTime: 'minute' | 'hour' | 'day' | null,

        /**
         * @description config for each method
         */
        methods: {
            log: MethodConfig,
            info: MethodConfig,
            debug: MethodConfig,
            warn: MethodConfig,
            error: MethodConfig,
            time: MethodConfig,
            dir: MethodConfig,
            table: MethodConfig
        },
    }

    export declare function getConfig(): Config;
    export declare function setConfig(newConfig: Config): undefined;

    export declare class NLogger {
        log(): undefined;
        info(): undefined;
        debug(): undefined;
        warn(): undefined;
        error(): undefined;
        time(label: string): undefined;
        timeLog(label: string): undefined;
        timeEnd(label: string): undefined;
        dir(obj: object, params: {depth: number}): undefined;
        table(arr: [object]): undefined;
    }
}

