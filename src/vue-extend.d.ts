import Vue, {WatchOptions}                                                                                                               from 'vue';
import {ActionPayload, ActionTree, GetterTree, Module, ModuleOptions, ModuleTree, MutationPayload, MutationTree, SubscribeActionOptions} from 'vuex';
import zenscroll                                                                                                                         from 'zenscroll';
import dayjs, {ConfigType}                                                                                                               from 'dayjs';
import NumericRange                                                                                                                      from 'numeric-range';
import Tomwork                                                                                                                           from '@/plugins/Tomwork';
import VueDate                                                                                                                           from '@/plugins/VueDate';
import VueObject                                                                                                                         from '@/plugins/VueObject';
import VueString                                                                                                                         from '@/plugins/VueString';
import VueNumber                                                                                                                         from '@/plugins/VueNumber';
import VueCookies                                                                                                                        from '@/plugins/VueCookies';
import state                                                                                                                             from '@/store/state';
import getters                                                                                                                           from '@/store/getters';
import mutations                                                                                                                         from '@/store/mutations';
import actions                                                                                                                           from '@/store/actions';

export type StoreState = {
    readonly [P in keyof typeof state]: typeof state[P];
};

export type StoreGetters = {
    readonly [P in keyof typeof getters]: ReturnType<typeof getters[P]>;
}

declare module 'vue/types/vue'
{
    interface Vue
    {
        $cookies: typeof VueCookies;
        $dayjs: (config?: ConfigType) => dayjs.Dayjs;
        $Date: new (date: Date) => VueDate,
        $Number: new (number: number) => VueNumber,
        $Object: new (object: object) => VueObject,
        $Range: new (min: number, max: number) => NumericRange;
        $String: new (string: any) => VueString,
        $store: {
            _vm: typeof Vue,
            commit(mutationName: 'dataLoadedSet', arg1: Parameters<typeof mutations['dataLoadedSet']>[1]): ReturnType<typeof mutations['dataLoadedSet']>;
            commit(mutationName: 'leagueSeasonsDivisionPost',
                   arg1: Parameters<typeof mutations['leagueSeasonsDivisionPost']>[1]): ReturnType<typeof mutations['leagueSeasonsDivisionPost']>;
            commit(mutationName: 'loadingSet', arg1: Parameters<typeof mutations['loadingSet']>[1]): ReturnType<typeof mutations['loadingSet']>;
            commit(mutationName: 'messagesPersonalDelete'/* , arg1: Parameters<typeof mutations['messagesPersonalDelete']>[1] */): ReturnType<typeof mutations['messagesPersonalDelete']>;
            commit(mutationName: 'set', arg1: Parameters<typeof mutations['set']>[1]): ReturnType<typeof mutations['set']>;
            // commit(mutationName: 'socket_connectivityUpdate',
            //        arg1: Parameters<typeof mutations['socket_connectivityUpdate']>[1]): ReturnType<typeof mutations['socket_connectivityUpdate']>;
            // commit(mutationName: 'socket_fieldDelete', arg1: Parameters<typeof mutations['socket_fieldDelete']>[1]): ReturnType<typeof mutations['socket_fieldDelete']>;
            commit(mutationName: 'tabCreate', arg1: Parameters<typeof mutations['tabCreate']>[1]): ReturnType<typeof mutations['tabCreate']>;
            commit(mutationName: 'tabDelete', arg1: Parameters<typeof mutations['tabDelete']>[1]): ReturnType<typeof mutations['tabDelete']>;
            commit(mutationName: 'tableUpdate', arg1: Parameters<typeof mutations['tableUpdate']>[1]): ReturnType<typeof mutations['tableUpdate']>;
            dispatch(actionName: 'categoriesActiveCalc' /* arg1: Parameters<typeof actions['categoriesActiveCalc']>[1] */): ReturnType<typeof actions['categoriesActiveCalc']>;
            dispatch(actionName: 'categoriesActiveSet', arg1: Parameters<typeof actions['categoriesActiveSet']>[1]): ReturnType<typeof actions['categoriesActiveSet']>;
            dispatch(actionName: 'divisionsActiveCalc' /* arg1: Parameters<typeof actions['divisionsActiveCalc']>[1] */): ReturnType<typeof actions['divisionsActiveCalc']>;
            dispatch(actionName: 'divisionsActiveSet', arg1: Parameters<typeof actions['divisionsActiveSet']>[1]): ReturnType<typeof actions['divisionsActiveSet']>;
            dispatch(actionName: 'imageFormatSet', /* arg1: Parameters<typeof actions['imageFormatSet']>[1] */): ReturnType<typeof actions['imageFormatSet']>;
            dispatch(actionName: 'lastIdGet', arg1: Parameters<typeof actions['lastIdGet']>[1]): ReturnType<typeof actions['lastIdGet']>;
            dispatch(actionName: 'leagueSeasonsActiveSet', arg1: Parameters<typeof actions['leagueSeasonsActiveSet']>[1]): ReturnType<typeof actions['leagueSeasonsActiveSet']>;
            dispatch(actionName: 'leagueSeasonsActiveCalc', /* arg1: Parameters<typeof actions['leagueSeasonsGet']>[1] */): ReturnType<typeof actions['leagueSeasonsActiveCalc']>;
            dispatch(actionName: 'sectionsActiveCalc' /* arg1: Parameters<typeof actions['sectionsActiveCalc']>[1] */): ReturnType<typeof actions['sectionsActiveCalc']>;
            dispatch(actionName: 'sectionsActiveSet', arg1: Parameters<typeof actions['sectionsActiveSet']>[1]): ReturnType<typeof actions['sectionsActiveSet']>;
            dispatch(actionName: 'tableActiveSet', arg1: Parameters<typeof actions['tableActiveSet']>[1]): ReturnType<typeof actions['tableActiveSet']>;
            dispatch(actionName: 'tableUpdate', arg1: Parameters<typeof actions['tableUpdate']>[1]): ReturnType<typeof actions['tableUpdate']>;
            dispatch(actionName: 'tabCreate', arg1: Parameters<typeof actions['tabCreate']>[1]): ReturnType<typeof actions['tabCreate']>;
            dispatch(actionName: 'tabDelete', arg1: Parameters<typeof actions['tabDelete']>[1]): ReturnType<typeof actions['tabDelete']>;
            dispatch(actionName: 'tabRouteCreate', arg1: Parameters<typeof actions['tabRouteCreate']>[1]): ReturnType<typeof actions['tabRouteCreate']>;
            dispatch(actionName: 'tabsActiveCalc', arg1: Parameters<typeof actions['tabsActiveCalc']>[1]): ReturnType<typeof actions['tabsActiveCalc']>;
            dispatch(actionName: 'tabsActiveCalcAll', /* arg1: Parameters<typeof actions['tabsActiveCalcAll']>[1] */): ReturnType<typeof actions['tabsActiveCalcAll']>;
            dispatch(actionName: 'tabsActiveSet', arg1: Parameters<typeof actions['tabsActiveSet']>[1]): ReturnType<typeof actions['tabsActiveSet']>;
            dispatch(actionName: 'titleUpdate', /* arg1: Parameters<typeof actions['titleUpdate']>[1] */): ReturnType<typeof actions['titleUpdate']>;
            dispatch(actionName: 'urlGet' /* arg1: Parameters<typeof actions['urlGet']>[1] */): ReturnType<typeof actions['urlGet']>;
            dispatch(actionName: 'urlUpdate' /* arg1: Parameters<typeof actions['urlUpdate']>[1] */): ReturnType<typeof actions['urlUpdate']>;
            dispatch(actionName: 'userOnlineSet', arg1: Parameters<typeof actions['userOnlineSet']>[1]): ReturnType<typeof actions['userOnlineSet']>;
            dispatch(actionName: 'userPropsUpdate', arg1: Parameters<typeof actions['userPropsUpdate']>[1]): ReturnType<typeof actions['userPropsUpdate']>;
            getters: StoreGetters;
            state: StoreState;
            replaceState(state: StoreState): void;

            subscribe<P extends MutationPayload>(fn: (mutation: P, state: StoreState) => any): () => void;
            subscribeAction<P extends ActionPayload>(fn: SubscribeActionOptions<P, StoreState>): () => void;
            watch<T>(getter: (state: StoreState, getters: StoreGetters) => T, cb: (value: T, oldValue: T) => void, options?: WatchOptions): () => void;

            registerModule<T>(path: string, module: Module<T, StoreState>, options?: ModuleOptions): void;
            registerModule<T>(path: string[], module: Module<T, StoreState>, options?: ModuleOptions): void;

            unregisterModule(path: string): void;
            unregisterModule(path: string[]): void;

            hotUpdate(options: {
                actions?: ActionTree<StoreState, StoreState>;
                mutations?: MutationTree<StoreState>;
                getters?: GetterTree<StoreState, StoreState>;
                modules?: ModuleTree<StoreState>;
            }): void;
        },
        $Tomwork: typeof Tomwork
        $scroll: typeof zenscroll
    }
}

// @ts-ignore
declare module 'vuejs-datepicker'
{
    export {};
}
