/* eslint-disable no-console */

import {register} from 'register-service-worker';

const text: {
    cached: string,
    error: string,
    offline: string,
    ready: string,
    updated: string
} = {
    'cached': 'Obsah stránky bol uložený (zacacheovaný) pre budúce použitie.',
    'error': 'Nastala chyba počas registrácie service workerov:',
    'offline': 'Internetové pripojenie nebolo nájdené. Aplikácia beží v offline móde.',
    'ready': 'Aplikácia je načítaná z pamäte (cache) pomocou service workera. \nPre podrobnejšie informácie, navštív https://goo.gl/AFskqB',
    'updated': 'Nový obsah je dostupný; prosím obnov (refreshni) stránku.'
};

if (process.env.NODE_ENV === `production`)
{
    register(`${process.env.BASE_URL}service-worker.js`, {
        ready()
        {
            console.log(text.ready);
        },
        cached()
        {
            console.log(text.cached);
        },
        updated()
        {
            console.log(text.updated);
        },
        offline()
        {
            console.log(text.offline);
        },
        error(error)
        {
            console.error(text.error, error);
        }
    });
}
