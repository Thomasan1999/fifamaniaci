// eslint-disable-next-line
import {Vue} from 'vue/types/vue';

declare global
{
    type AlertState = 'failed' | 'successful';

    type CategoryValue = {
        id: number,
        name: string
    }

    type ColumnValue = {
        adminShow?: boolean,
        children?: {[s: string]: ColumnValue}
        class?: string | {[s: string]: string}
        connectivityShow?: boolean,
        default?: any,
        dnfShow?: boolean,
        fixed?: number,
        format?: string | {[s: string]: string},
        fut?: boolean,
        head?: ColumnValue,
        html?: string,
        join?: string,
        margin?: number,
        minimalist?: boolean,
        order: number,
        orientation?: 'left' | 'center' | 'right',
        required?: boolean,
        signed?: boolean,
        static?: boolean,
        style?: {[s: string]: string},
        tag?: 'input' | 'time',
        title?: string | ((...args) => string),
        type?: 'id' | 'canceled' | 'date' | 'float' | 'index' | 'integer' | 'message' | 'tooltip',
        visibility?: boolean
    }

    type Connectivity = 'online' | 'offline';

    type DivisionValue = {
        categoryId: number;
        index?: number;
        level?: number;
        matchTypeId: number;
    };

    type FormElement = {
        id?: number,
        alertType: string,
        checking: boolean,
        color?: string,
        default?: boolean,
        disabled?: boolean,
        disabledDates?: {
            from?: Date,
            to?: Date
        },
        dropdown?: {visibility: boolean},
        emptyIs(): boolean,
        errorShow: boolean,
        input: `checkbox` | `text` | `email` | `number` | `password`,
        inputting: boolean,
        labelTop?: string,
        length: {min: number, max: number},
        max?: number,
        min?: number,
        name: string,
        order: number,
        prefix: string,
        reference?: boolean,
        required: boolean,
        sendable: boolean,
        taken: boolean,
        tag: `input` | `span`,
        tooltip?: {
            submitted: boolean
        },
        type: `alphabetical` | `fbLink` | `id` | `idUsername` | `any` | `boolean` | `date` | `email` | `float` | `integer` | `message` | `password` | `username`,
        unique?: boolean,
        userActiveIndex?: number,
        valid: boolean,
        validateRegex: RegExp,
        validLength: boolean,
        valueDefault?: any,
        value: any,
        visibility: boolean
    };

    type ImageFormat = 'jpg' | 'webp';

    type Lang = 'sk';

    type LeagueRegistrationValue = {
        id: number,
        created: Date,
        completed?: Date,
        dnfAfterWeeks?: number,
        finalPosition?: number,
        rating?: number,
        seasonId: number,
        userId: number,
        valid: boolean
    };

    type LeagueSeasonValue = {
        created: string,
        divisionSize: 10 | 20,
        divisions: {[s: string]: number[]},
        id: number,
        seasonEnd: string;
        month: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
        playOffEnd: string;
        playOffStart: string;
        playOffRoundsLimit: 2 | 3;
        playOffWinsLimit: 2 | 3;
        quarter?: 0 | 1 | 2 | 3;
        registrationTo: string;
        seasonStart: string;
    }

    type MatchSide = 'home' | 'away';
    type MatchValue = {
        awayGoals: number
        awayId: number,
        canceledAt?: number,
        canceledBy?: MatchSide,
        divisionId: number,
        homeGoals: number,
        homeId: number
        leg?: number,
        matchOrder?: number,
        playedAt?: Date
        resultWritten?: Date,
        round?: number,
        series?: number
        seasonId?: number,
        typeId?: number,
        unseen?: boolean,
        week?: number
    };

    type LeagueMatchValue = Merge<MatchValue, {
        matchOrder: number
        week: number
    }>;

    type LeaguePlayOffValue = Merge<LeagueMatchValue, {
        leg: number,
        round: number,
        series: number
    }>;

    type LeaguePrizeValue = { money: number };

    type MatchResultShort = 'w' | 'd' | 'l' | 'otw' | 'otl';
    type MatchForm = MatchResultShort[];

    type LeagueTableRecordValue = {
        id: number,
        divisionId: number,
        dnfAfterWeeks?: number,
        draws: number,
        form: MatchForm,
        goalDifference: number,
        losses: number,
        matches: number,
        overtimeLosses: number,
        overtimeWins: number,
        points: number,
        score: [number, number],
        seasonId: number,
        userId: number,
        wins: number
    };

    type MatchesTypeName = 'friendly' | 'qualification' | 'league' | 'playOff';

    type MatchesTypeValue = {
        id: number,
        name: MatchesTypeName
        weight: 10 | 25 | 40 | 60;
    }

    type MessageValue = { id: number, addresseeId?: number, created: Date, createdById: number, message: string };

    type MessagesTabValue = { addresseeId: number, categoryId: number, id: number};

    type PlatformName = 'ps' | 'xbox' | 'pc';

    type PlayerValue = {
        id: number,
        rating: number,
        userId: number
    };

    type SectionValue = {
        category?: boolean,
        href?: string,
        loggedIn?: boolean,
        nav?: boolean,
        navLink?: boolean,
        order?: number,
        params?: string[]
        tab?: boolean | { component?: boolean }
        title?: string
    };

    type StoreTable<Value> = {
        active?: number,
        activeCalc?(...args): number,
        auth?: boolean,
        categoryHas?: boolean,
        dependent?: boolean,
        finished?: {[s: string]: boolean},
        htmlGet?(row: Omit<Value, 'id'>, ...args): string,
        lastGet?(query: any): [string, Omit<Value, 'id'>],
        loading?: {[s: string]: boolean},
        loginRequired?: boolean,
        nestedProps?: string[],
        param?: string,
        rowsGet?(...args): Omit<Value, 'id'>,
        rowsSortCompareFn?(rowA: [string, Omit<Value, 'id'>], rowB: [string, Omit<Value, 'id'>]): number,
        specials?: number[],
        tabs?: boolean,
        unseen?: {[s: string]: Unseen},
        unseenPersonalCondition?(row: Omit<Value, 'id'>, ...args): boolean,
        value: {[s: string]: Omit<Value, 'id'>}
    }

    type TabValue = { disabled?: boolean, href: string, name?: string, order: number, title: string };

    type Unseen = {general: number, personal: number};

    type UserValue = {
        id: number,
        email?: string,
        fbLink?: string,
        online?: number[],
        password?: string,
        username: string,
        usernamesInGame: null | {
            [s in 'pc' | 'xbox' | 'ps']?: string
        }
    };
}

export {};
