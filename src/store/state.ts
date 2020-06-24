import dayjs                 from 'dayjs';
import {Route}               from 'vue-router/types/router.d';
import store                 from '@/store/index';
import VueString             from '@/plugins/VueString';
import VueObject             from '@/plugins/VueObject';
import VueCookies            from '@/plugins/VueCookies';
import router                from '@/router';
import Tomwork               from '@/plugins/Tomwork';
import {StoreState}          from '@/vue-extend.d';
import dbCategories          from '@/db/categories.json';
import dbDivisions           from '@/db/divisions.json';
import dbLeagueRegistrations from '@/db/leagueRegistrations.json';
import dbLeaguePrizes        from '@/db/leaguePrizes.json';
import dbLeagueSeasons       from '@/db/leagueSeasons.json';
import dbLeagueTableRecords  from '@/db/leagueTableRecords.json';
import dbLocales             from '@/db/locales.json';
import dbMatches             from '@/db/matches.json';
import dbMatchesTypes        from '@/db/matchesTypes.json';
import dbMessages            from '@/db/messages.json';
import dbMessagesTabs        from '@/db/messagesTabs.json';
import dbPlayers             from '@/db/players.json';
import dbUsers               from '@/db/users.json';

const stateExportable: {
    categories: Merge<StoreTable<CategoryValue>, {
        active: number,
        activeCalc(): number
    }>,
    dataLoaded: {
        firstIs(): boolean,
        value: { [s: string]: boolean }
    },
    divisions: Merge<StoreTable<DivisionValue>, {
        active: number,
        htmlGet({index, level}: Merge<Omit<DivisionValue, 'id'>, { index: number, level: number }>, {divisionShow}: { divisionShow?: boolean }): string
        value: {
            [s: string]: { [s: string]: Omit<DivisionValue, 'id'> }
        }
    }>,
    imageFormat: ImageFormat,
    keyMode: string,
    lang: Lang,
    league: {
        tabs: boolean
    },
    leaguePlayOff: {
        seriesWinnerGet(series: Omit<MatchValue, 'id'>[]): number | undefined,
        winsLimitGet(): number
    },
    leaguePrizes: Merge<StoreTable<LeaguePrizeValue>, {
        nestedProps: string[],
    }>,
    leagueRegistrations: Merge<StoreTable<LeagueRegistrationValue>, {
        nestedProps: string[],
        rowsGet(): { [s: string]: Omit<LeagueRegistrationValue, 'id'> },
        rowsSortCompareFn(rowA: [string, Omit<LeagueRegistrationValue, 'id'>], rowB: [string, Omit<LeagueRegistrationValue, 'id'>]): number,
        value: { [s: string]: { [s: string]: { [s: string]: Omit<LeagueRegistrationValue, 'id'> } } }
    }>,
    leagueSeasons: Merge<StoreTable<LeagueSeasonValue>, {
        active: number,
        htmlGet(leagueSeason: Omit<LeagueSeasonValue, 'id'>): string,
        lastGet(query?: { seasonStart?: any }): [string, Omit<LeagueSeasonValue, 'id'>]
    }>,
    leagueTableRecords: Merge<StoreTable<LeagueTableRecordValue>, {
        nestedProps: string[],
        rowsGet(): { [s: string]: Omit<LeagueTableRecordValue, 'id'> },
        rowsSortCompareFn(rowA: [string, Omit<LeagueTableRecordValue, 'id'>], rowB: [string, Omit<LeagueTableRecordValue, 'id'>]): number,
        value: { [s: string]: { [s: string]: { [s: string]: { [s: string]: Omit<LeagueTableRecordValue, 'id'> } } } }
    }>,
    leagueTabs: {
        active: string,
        appendable: boolean,
        default: string,
        value: { [s: string]: Partial<TabValue> }
    },
    locales: {
        value: { [s: string]: typeof dbLocales }
    },
    matches: Merge<StoreTable<MatchValue>, {
        sides: MatchSide[],
        value: { [s: string]: { [s: string]: MatchValue } }
    }>,
    matchesTypes: Merge<StoreTable<MatchesTypeValue>, {
        leagueTypes: MatchesTypeName[]
    }>,
    messages: Merge<StoreTable<MessageValue>, {
        loading: { [s: string]: { [s: string]: boolean } }
        value: { [s: string]: { [s: string]: Omit<MessageValue, 'id'> } }
    }>,
    messagesTabs: Merge<StoreTable<MessagesTabValue>, {}>,
    navVisible: boolean,
    players: Merge<StoreTable<PlayerValue>, {
        value: { [s: string]: { [s: string]: Omit<PlayerValue, 'id'> } }
    }>,
    profileUsername: string,
    sections: Merge<StoreTable<Partial<SectionValue>>, {
        active: string,
        activeCalc(): string,
        default: string,
    }>,
    userLogged: {
        id: number,
        email: string,
        fbLink: string,
        loggedIn: boolean,
        money: number,
        token: string,
        username: string,
        usernamesInGame: { [s in PlatformName]?: string },
        variableSymbol: number,
        verified: null | boolean
    },
    userProps: {
        [s in 'id' | 'email' | 'fbLink' | 'money' | 'token' | 'username' | 'usernamesInGame' | 'variableSymbol' | 'verified']: { cookies?: boolean, nested?: boolean }
    },
    users: Merge<StoreTable<UserValue>, {}>,
    windowHeight: number,
    windowWidth: number
} = {
    categories: {
        active: 0,
        activeCalc(): number
        {
            return parseInt((Object.entries(store.state.categories.value as StoreState['categories']['value']).find(([, category]) =>
            {
                return new VueString(store.getters.texts.categories[category.name]).urlTo()
                    === (router.currentRoute.params.category?.toLowerCase() || router.currentRoute.path.split(`/`)[1]?.toLowerCase());
            }) || [])[0] || VueCookies.get(`categoriesActive`) || `0`) || (router.currentRoute.name === `categoriesSelect` ? 0 : 1);
        },
        htmlGet(category: CategoryValue): string
        {
            return category?.name || ``;
        },
        value: dbCategories
    },
    dataLoaded: {
        firstIs(): boolean
        {
            return !Object.values(store.state.dataLoaded.value).some((dataLoaded) =>
            {
                return dataLoaded;
            });
        },
        value: {}
    },
    divisions: {
        active: 0,
        categoryHas: true,
        dependent: true,
        htmlGet({index, level}, {divisionShow = true})
        {
            const divisionTitle: string = divisionShow ? `${store.getters.texts.dictionary.division} ` : ``;
            const divisionName: string = `${level + 1}${Array(level).fill(null).reduce((a, _, charIndex) =>
            {
                return `${a}${String.fromCharCode(65 + (Math.floor(index / (4 ** charIndex)) % 4))}`;
            }, ``)}`;

            return `${divisionTitle} ${divisionName}`;
        },
        param: `division`,
        // @ts-ignore
        value: dbDivisions
    },
    imageFormat: `webp`,
    keyMode: `section`,
    lang: `sk`,
    league: {
        tabs: true
    },
    leaguePlayOff: {
        seriesWinnerGet(series)
        {
            const winsLimit: number = this.winsLimitGet();

            if (!series[0])
            {
                return;
            }

            const user1Id: number = series[0].homeId;
            const user2Id: number = series[0].awayId;

            if (!user1Id || !user2Id)
            {
                return;
            }

            const [user1Wins, user2Wins]: [number, number] = series.filter((match) =>
            {
                return match.resultWritten;
            }).reduce((a, match) =>
            {
                const winner: MatchSide = match.homeGoals > match.awayGoals ? `home` : `away`;

                if (user1Id === match[`${winner}Id`])
                {
                    a[0] += 1;
                }
                else
                {
                    a[1] += 1;
                }

                return a;
            }, [0, 0]);

            if (user1Wins === winsLimit)
            {
                return user1Id;
            }

            if (user2Wins === winsLimit)
            {
                return user2Id;
            }
        },
        winsLimitGet()
        {
            return store.state.leagueSeasons.lastGet({seasonStart: {$lte: new Date()}})[1].playOffWinsLimit;
        }
    },
    leaguePrizes: {
        categoryHas: true,
        dependent: true,
        nestedProps: [`seasonId`, `divisionId`],
        // @ts-ignore
        value: dbLeaguePrizes
    },
    leagueRegistrations: {
        categoryHas: true,
        dependent: true,
        finished: {},
        nestedProps: [`seasonId`],
        rowsGet()
        {
            const players: Omit<PlayerValue, 'id'>[] = Object.values(store.state.players.value[store.state.categories.active] || {});

            const divisionExpected: {
                c: number,
                label: number[],
                labelInc(): void,
                level: number,
                limit: number
            } = {
                c: 0,
                label: [],
                labelInc()
                {
                    let position: number = 0;

                    while (position < this.label.length)
                    {
                        if (this.label[position] < 3)
                        {
                            this.label[position] += 1;
                            return;
                        }

                        this.label[position] = 0;

                        position += 1;
                    }
                },
                level: 0,
                limit: store.getters.leagueSeason.divisionSize
            };

            return Object.fromEntries(Object.entries(new VueObject(this.value[store.state.categories.active]).findNested(
                [store.state.leagueSeasons.active]
            ) as { [s: string]: Omit<LeagueRegistrationValue, 'id'> }).filter(([, leagueRegistration]) =>
            {
                return leagueRegistration.valid;
            }).map(([leagueRegistrationId, leagueRegistration]) =>
            {
                const preStart: boolean = leagueRegistration.created < store.getters.leagueSeason.seasonStart;

                const {rating} = players.find((player) =>
                {
                    return player.userId === leagueRegistration.userId;
                }) || {};

                if (divisionExpected.c === divisionExpected.limit)
                {
                    divisionExpected.c = 0;
                    divisionExpected.label.push(0);
                    divisionExpected.level += 1;
                    divisionExpected.limit *= 4;
                }

                const divisionExpectedValue: string = `${divisionExpected.level + 1}${divisionExpected.label.reduce((a, number) =>
                {
                    return `${a}${String.fromCharCode(65 + number)}`;
                }, ``)}`;

                divisionExpected.labelInc();
                divisionExpected.c += 1;

                return [leagueRegistrationId,
                    {...leagueRegistration, divisionExpected: divisionExpectedValue, ...(preStart && typeof leagueRegistration.rating === `undefined` && {rating})}];
            }));
        },
        rowsSortCompareFn([, leagueRankingA], [, leagueRankingB])
        {
            const timestampA: dayjs.Dayjs = dayjs(leagueRankingA.completed);
            const timestampB: dayjs.Dayjs = dayjs(leagueRankingB.completed);
            const {leagueSeason: {seasonStart}} = store.getters;

            if (timestampA.diff(seasonStart) >= 0 || timestampB.diff(seasonStart) >= 0 || leagueRankingA.rating === leagueRankingB.rating)
            {
                return timestampA.diff(timestampB);
            }

            const finalPositionA: number = leagueRankingA.finalPosition || Number.MAX_SAFE_INTEGER;
            const finalPositionB: number = leagueRankingB.finalPosition || Number.MAX_SAFE_INTEGER;

            if (finalPositionA === finalPositionB)
            {
                return (leagueRankingB.rating as number) - (leagueRankingA.rating as number);
            }

            return finalPositionA - finalPositionB;
        },
        // @ts-ignore
        value: dbLeagueRegistrations
    },
    leagueSeasons: {
        active: 0,
        htmlGet(leagueSeason)
        {
            const {getters, state} = store;

            const wordFirst = typeof leagueSeason.quarter === `number` ? getters.texts.seasons[leagueSeason.quarter]
                : new Date(leagueSeason.seasonStart).toLocaleString(state.lang, {month: `long`});
            return `${wordFirst} ${dayjs(leagueSeason.seasonStart).year()}`;
        },
        lastGet(query = {})
        {
            const leagueSeasons = Object.entries((store.state.leagueSeasons.value || {}) as StoreState['leagueSeasons']['value']).filter(([, leagueSeason]) =>
            {
                if (typeof query.seasonStart?.$lte !== `undefined`)
                {
                    return new Date(leagueSeason.seasonStart) <= query.seasonStart.$lte;
                }

                return true;
            });

            return leagueSeasons.sort(([, leagueSeasonA], [, leagueSeasonB]) =>
            {
                return dayjs(leagueSeasonA.seasonStart).diff(dayjs(leagueSeasonB.seasonStart));
            })?.[leagueSeasons.length - 1];
        },
        param: `season`,
        // @ts-ignore
        value: dbLeagueSeasons
    },
    leagueTableRecords: {
        categoryHas: true,
        dependent: true,
        nestedProps: [`seasonId`, `divisionId`],
        rowsGet()
        {
            const {state} = store;
            const {value} = state.leagueTableRecords;

            const nestedValues = [state.leagueSeasons.active, state.divisions.active];

            if (state.dataLoaded.value[state.categories.active])
            {
                return new VueObject(value[state.categories.active]).findNested(nestedValues) || {};
            }

            return {};
        },
        rowsSortCompareFn([, leagueTableRecordA], [, leagueTableRecordB])
        {
            const dnfAfterWeeksA = typeof leagueTableRecordA.dnfAfterWeeks !== `number` ? Number.MAX_SAFE_INTEGER : leagueTableRecordA.dnfAfterWeeks;
            const dnfAfterWeeksB = typeof leagueTableRecordB.dnfAfterWeeks !== `number` ? Number.MAX_SAFE_INTEGER : leagueTableRecordB.dnfAfterWeeks;

            const leagueRegistrations: Omit<LeagueRegistrationValue, 'id'>[] = Object.values(store.state.leagueRegistrations.rowsGet());

            if (dnfAfterWeeksA === dnfAfterWeeksB && typeof leagueTableRecordA.dnfAfterWeeks === `number`)
            {
                return store.state.leagueRegistrations.rowsSortCompareFn([``, leagueRegistrations.find((leagueRegistration) =>
                {
                    return leagueRegistration.userId === leagueTableRecordA.userId;
                }) as LeagueRegistrationValue], [``, leagueRegistrations.find((leagueRegistration) =>
                {
                    return leagueRegistration.userId === leagueTableRecordB.userId;
                }) as LeagueRegistrationValue]);
            }

            return dnfAfterWeeksB - dnfAfterWeeksA || leagueTableRecordB.points - leagueTableRecordA.points
                || leagueTableRecordB.goalDifference - leagueTableRecordA.goalDifference || leagueTableRecordB.score[0] - leagueTableRecordA.score[0];
        },
        // @ts-ignore
        value: dbLeagueTableRecords
    },
    leagueTabs: {
        active: ``,
        appendable: false,
        default: `registration`,
        value: {
            matches: {order: 4},
            playOff: {order: 5},
            prizes: {order: 2},
            registration: {order: 0},
            registrations: {order: 1},
            table: {order: 3}
        }
    },
    locales: {
        // @ts-ignore
        value: dbLocales
    },
    matches: {
        categoryHas: true,
        finished: {},
        sides: [`home`, `away`],
        // @ts-ignore
        value: dbMatches
    },
    matchesTypes: {
        leagueTypes: [`league`, `playOff`],
        rowsSortCompareFn([, matchTypeA], [, matchTypeB])
        {
            return matchTypeA.weight - matchTypeB.weight;
        },
        // @ts-ignore
        value: dbMatchesTypes
    },
    messages: {
        auth: true,
        categoryHas: true,
        finished: {},
        loading: {},
        nestedProps: [`tabId`],
        tabs: true,
        // @ts-ignore
        value: dbMessages
    },
    messagesTabs: {
        active: 0,
        categoryHas: true,
        auth: true,
        dependent: true,
        loginRequired: true,
        specials: [0],
        // @ts-ignore
        value: dbMessagesTabs
    },
    navVisible: window.innerWidth > 1023,
    // nestedValuesGet(table)
    // {
    //     return new VueObject(store.getters.nestedValues).filter(([nestedProp]) =>
    //     {
    //         return table.nestedProps?.includes(nestedProp) || (nestedProp === `categoryId` && table.categoryHas);
    //     }).values();
    // },
    players: {
        categoryHas: true,
        finished: {},
        // @ts-ignore
        value: dbPlayers
    },
    profileUsername: ``,
    sections: {
        active: ``,
        activeCalc()
        {
            const route: Route = router.currentRoute;
            const routePathParts: string[] = route.path.split(`/`).map((part) =>
            {
                return part.toLowerCase();
            });

            const categoryIs: boolean = Object.values(store.state.categories.value as { [s: string]: Omit<CategoryValue, 'id'> }).some((category) =>
            {
                return routePathParts[1] === new VueString(category.name).urlTo();
            });

            const sectionNames: string[] = Object.keys(store.state.sections.value);

            const routePathPartsSectionPossibleValues: string[] = (() =>
            {
                if (Tomwork.emptyIs(store.state.categories.value))
                {
                    return [routePathParts[2], routePathParts[1]];
                }

                return [routePathParts[1 + Number(categoryIs)]];
            })();

            const routeSectionName = sectionNames.find((sectionName) =>
            {
                return routePathPartsSectionPossibleValues.includes(new VueString(store.getters.texts[sectionName].title).urlTo());
            });

            return (routeSectionName && Object.entries(store.state.sections.value as StoreState['sections']['value']).find(([sectionName, section]) =>
            {
                return sectionName === routeSectionName && !(typeof section.loggedIn !== `undefined` && section.loggedIn !== store.state.userLogged.loggedIn);
            })?.[0]) || (VueCookies.get(`sectionsActive`) || store.state.sections.default);
        },
        default: `league`,
        value: {
            categoriesSelect: {category: false, nav: false},
            league: {navLink: true, order: 0, params: [`season`, `division`], tab: {component: true}},
            matches: {navLink: true, order: 2},
            messages: {navLink: true, order: 3, tab: true},
            passwordReset: {category: false, loggedIn: false},
            passwordResetEmail: {category: false, loggedIn: false},
            players: {navLink: true, order: 1},
            profile: {category: false, params: [`username`], title: '${state.profileUsername}'},
            registration: {category: false, loggedIn: false},
            rules: {navLink: true, order: 4}
        }
    },
    userLogged: {
        id: 0,
        email: ``,
        fbLink: ``,
        loggedIn: true,
        money: 0,
        token: ``,
        username: `Ukážková verzia`,
        usernamesInGame: {},
        variableSymbol: 0,
        verified: null
    },
    userProps: {
        id: {cookies: true},
        email: {},
        fbLink: {},
        money: {},
        token: {cookies: true},
        username: {},
        usernamesInGame: {nested: true},
        variableSymbol: {},
        verified: {}
    },
    users: {
        // @ts-ignore
        value: dbUsers
    },
    windowHeight: window.innerHeight,
    windowWidth: window.innerWidth
};

export default stateExportable;
