import store from '@/store';

export default class VueSocket extends WebSocket
{
    public listeners: {
        actions: string[],
        mutations: string[],
    };
    public queue: [string, any][];

    constructor()
    {
        super(`wss://${process.env.VUE_APP_FM_HOSTNAME}`);
        this.listeners = {
            actions: Object.keys((store as unknown as {_actions: {[s: string]: Function}})._actions).filter((actionName) =>
            {
                return actionName.includes(`socket_`);
            }),
            mutations: Object.keys((store as unknown as {_mutations: {[s: string]: Function}})._mutations).filter((mutationName) =>
            {
                return mutationName.includes(`socket_`);
            })
        };

        this.queue = [];

        this.addEventListener(`message`, this.onmessage);
        this.addEventListener(`open`, this.onopen);
    }

    public emit(eventName: string, data: any): void
    {
        if (this.readyState === 0)
        {
            this.queue.push([eventName, data]);
            return;
        }

        this.send(JSON.stringify([eventName, data]));
    }

    // @ts-ignore
    public onmessage(dataRaw: {data: string}): void
    {
        const [eventName, data] = JSON.parse(dataRaw.data);

        const storeEventName = `socket_${eventName}`;

        if (this.listeners.actions.includes(storeEventName))
        {
            store.dispatch(storeEventName, data).catch((err) =>
            {
                console.error(err);
            });
        }

        if (this.listeners.mutations.includes(storeEventName))
        {
            store.commit(storeEventName, data);
        }
    }

    // @ts-ignore
    public onopen(): void
    {
        this.queue.forEach(([eventName, data]) =>
        {
            this.emit(eventName, data);
        });
        this.queue = [];
    }
}
