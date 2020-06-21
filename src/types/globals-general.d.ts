// eslint-disable-next-line
import {Vue} from 'vue/types/vue';

declare global
{
    namespace NodeJS
    {
        interface ProcessEnv
        {
            BASE_URL: string;
            NODE_ENV: 'development' | 'production';
            VUE_APP_FM_GREEN: string;
            VUE_APP_FM_HOSTNAME: string
            VUE_APP_FM_LEAGUE_REGISTRATION_MONEY: string;
            VUE_APP_FM_QUALIFICATION: string;
        }
    }

    interface Window
    {
        fbq: any;
        _smartsupp: {
            key: string,
            offsetX: number,
            offsetY: number,
            smallDeviceMinWidth: number,
        },
        smartsupp(on: string | Document, eventType?: string, listener?: Function)
    }

    type DeepReadonly<T> =
        T extends (infer R)[] ? DeepReadonlyArray<R> :
            T extends Function ? T :
                T extends Date ? Date :
                T extends object ? DeepReadonlyObject<T> :
                    T;

    interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

    type DeepReadonlyObject<T> = {
        readonly [P in keyof T]: DeepReadonly<T[P]>;
    };

    type Merge<M, N> = Omit<M, Extract<keyof M, keyof N>> & N;
}

export {};
