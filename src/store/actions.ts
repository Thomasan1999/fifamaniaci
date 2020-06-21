import dayjs             from 'dayjs';
import {Route}           from 'vue-router';
import Vue               from 'vue';
import router            from '@/router';
import {VueHttpResponse} from '@/plugins/VueHttp';

const actionsExportable = {
    async categoriesActiveCalc(this: { _vm: Vue }, {dispatch, state}: Vue['$store']): Promise<number | void>
    {
        const categoryIdNew: number = state.categories.activeCalc();

        if (!categoryIdNew)
        {
            return;
        }

        if (state.categories.active !== categoryIdNew)
        {
            return dispatch(`categoriesActiveSet`, categoryIdNew).catch((err) =>
            {
                console.error(err);
            });
        }
    },
    async categoriesActiveSet(this: { _vm: Vue }, {dispatch, getters, state}: Vue['$store'], categoryIdNew?: number): Promise<number | void>
    {
        if (!categoryIdNew)
        {
            return;
        }

        const categoryIdOld: number = state.categories.active;

        this._vm.$cookies.set(`categoriesActive`, categoryIdNew);
        this._vm.$socket.emit(`userPropsUpdate`, {cookies: document.cookie});
        await dispatch(`tableActiveSet`, {tableName: `categories`, active: categoryIdNew});

        if (!categoryIdOld)
        {
            await dispatch(`divisionsGet`).catch((err) =>
            {
                console.error(err);
            });

            router.push({params: getters.params, path: router.currentRoute.path}).catch((err) =>
            {
                console.error(err);
            });
        }

        Promise.all([
            dispatch(`divisionsActiveCalc`).then(() =>
            {
                dispatch(`dataGet`).catch((err) =>
                {
                    console.error(err);
                    return Promise.reject(err);
                });
            }),
            dispatch(`userOnlineSet`, {categoryIdOld, categoryIdNew})
        ]).catch((err) =>
        {
            console.error(err);
            return Promise.reject(err);
        });

        return categoryIdNew;
    },
    async categoriesGet(this: { _vm: Vue }, {commit, dispatch, state}: Vue['$store']): Promise<[void, string]>
    {
        return dispatch(`get`, {tableName: `categories`}).then(async () =>
        {
            return Promise.all([
                dispatch(`categoriesActiveCalc`).then((categoriesActive) =>
                {
                    if (categoriesActive && !state.dataLoaded.value[categoriesActive])
                    {
                        Object.keys(state.categories.value).forEach((categoryId) =>
                        {
                            commit(`tableUpdate`, {
                                categoryId: Number(categoryId),
                                tableName: `messagesTabs`,
                                unseenUpdate: false,
                                value: {
                                    '0': {
                                        addresseeId: 0,
                                        href: ``,
                                        order: 0,
                                        special: true,
                                        title: ``
                                    }
                                }
                            });
                        });
                    }
                }),
                dispatch(`sectionsActiveCalc`)
            ]).catch((err) =>
            {
                console.error(err);
                return Promise.reject(err);
            });
        }).catch((err) =>
        {
            console.error(err);
            return Promise.reject(err);
        });
    },
    async tableUpdate(this: { _vm: Vue }, {commit, dispatch, state}: Vue['$store'],
                      {
                          categoryId,
                          tableName,
                          lastUpdate = true,
                          res,
                          unseenUpdate = Boolean(state.dataLoaded.value[state.categories.active])
                      }: {
                          categoryId: number,
                          lastUpdate?: boolean,
                          res: VueHttpResponse,
                          tableName: string
                          unseenUpdate?: boolean
                      })
    {
        const value: any = (() =>
        {
            return tableName === `messagesTabs` ? Object.entries(res.body).reduce((a, [tabId, tab]) =>
            {
                const addressee: Omit<UserValue, 'id'> = state.users.value[tab.addresseeId];

                return {
                    ...a,
                    [tabId]: {
                        ...tab,
                        component: {
                            name: `UsernameContainer`,
                            props: {
                                userId: tab.addresseeId
                            }
                        },
                        href: addressee.username || ``,
                        special: (state[tableName].specials as number[]).includes(Number(tabId)),
                        title: addressee.username || ``
                    }
                };
            }, {}) : res.body;
        })();

        if (tableName === `messagesTabs`)
        {
            Promise.all(Object.entries(value as { [s: string]: TabValue }).filter(([, tab]) =>
            {
                const categoryName: string = new this._vm.$String(state.categories.value[categoryId].name).capitalize().toString();
                return tab.href && router.resolve({
                    name: `messages${new this._vm.$String(tab.href).capitalize()}${categoryName}`
                }).resolved.matched.length === 0;
            }).map(([tabId, tab]) =>
            {
                return dispatch(`tabRouteCreate`, {categoryId, tableName, tabId, tab}).catch((err) =>
                {
                    console.error(err);
                    return Promise.reject(err);
                });
            })).catch((err) =>
            {
                console.error(err);
                return Promise.reject(err);
            });
        }

        const headerFinished: string | null = res.headers?.get(`Finished`);

        commit(`tableUpdate`, {categoryId, tableName, ...(headerFinished && {finishedNew: JSON.parse(headerFinished)}), lastUpdate, unseenUpdate, value});
    },
    async dataGet(this: { _vm: Vue }, {commit, dispatch, getters, state}: Vue['$store']): Promise<void | Route>
    {
        const categoryId: number = state.categories.active;

        if (state.dataLoaded.value[categoryId])
        {
            return;
        }

        const nestedValues: number[] = [state.leagueSeasons.active, state.divisions.active];

        const dataLoadedFirstIs: boolean = state.dataLoaded.firstIs();

        const promises: Promise<any>[] = getters.dataProps.filter((tableName) =>
        {
            const table = state[tableName];

            return (dataLoadedFirstIs || !tableName.match(/^league/)) && (!table.dependent || !dataLoadedFirstIs) && (!table.loginRequired || state.userLogged.loggedIn)
                && (dataLoadedFirstIs || table.categoryHas);
        })/* .sort((tableNameA, tableNameB) =>
         {
         const sectionsActive = state.sections.active;

         if (tableNameA === sectionsActive)
         {
         return -1;
         }

         if (tableNameB === sectionsActive)
         {
         return 1;
         }

         return 0;
         }) */.map((tableName) =>
        {
            if (tableName === `divisions`)
            {
                return dispatch(`${tableName}Get` as 'divisionsGet');
            }

            return dispatch(`get`, {tableName});
        });

        await Promise.all(promises).catch((err) =>
        {
            console.error(err);
            return Promise.reject(err);
        });

        if (dataLoadedFirstIs && getters.dataProps.includes(`messagesTabs`))
        {
            await dispatch(`get`, {tableName: `messagesTabs`});
        }

        getters.dataProps.filter((tableName) =>
        {
            return state[tableName].tabs && state[tableName].loading[categoryId];
        }).forEach((tableName) =>
        {
            Object.keys(state[tableName].loading[categoryId]).forEach((tabId) =>
            {
                commit(`loadingSet`, {categoryId, tableName, nestedValues: [Number(tabId)], value: false});
            });
        });

        await dispatch(`tabsActiveCalc`, {section: `messages`}).catch((err) =>
        {
            console.error(err);
            return Promise.reject(err);
        });

        commit(`dataLoadedSet`, {
            nestedValues: dataLoadedFirstIs ? [categoryId] : [categoryId, ...nestedValues.filter((nestedValue) =>
            {
                return nestedValue;
            })]
        });

        window.dispatchEvent(new CustomEvent(`dataLoad`));

        return dispatch(`urlUpdate`).catch((err) =>
        {
            console.error(err);
            return Promise.reject(err);
        });
    },
    async dataLeagueGet(this: { _vm: Vue }, {commit, dispatch, getters, state}: Vue['$store'], {force = false}: { force?: boolean } = {}): Promise<void>
    {
        const categoryId: number = state.categories.active;

        if (!force && !state.dataLoaded.value[categoryId])
        {
            return;
        }

        const nestedValues: number[] = [state.leagueSeasons.active, state.divisions.active];

        const dataProps: string[] = getters.dataProps.filter((tableName) =>
        {
            const table = state[tableName];

            return tableName.match(/^league/) && !new this._vm.$Object(state.dataLoaded.value[categoryId] as unknown as { [s: string]: boolean }).findNested(
                nestedValues.slice(0, table.nestedProps.length)
            );
        });

        const promises: Promise<any>[] = dataProps.map((tableName) =>
        {
            return dispatch(`get`, {tableName, unseenUpdate: false});
        });

        await Promise.all(promises).catch((err) =>
        {
            console.error(err);
            return Promise.reject(err);
        });

        if (!state.dataLoaded.value[categoryId])
        {
            const dataLoadOn = () =>
            {
                commit(`dataLoadedSet`, {nestedValues: [categoryId, ...nestedValues]});
                window.removeEventListener(`dataLoad`, dataLoadOn);
            };

            window.addEventListener(`dataLoad`, dataLoadOn);
            return;
        }

        commit(`dataLoadedSet`, {nestedValues: [categoryId, ...nestedValues]});
    },
    async divisionsActiveCalc(this: { _vm: Vue }, {dispatch, state}: Vue['$store'])
    {
        const route = router.currentRoute;

        const leagueSeasonsDivisions: number[] = state.leagueSeasons.value[state.leagueSeasons.active]?.divisions[state.categories.active] || [];
        const divisions = Object.entries(state.divisions.value[state.categories.active] || {}).filter(([divisionId]) =>
        {
            return leagueSeasonsDivisions.includes(parseInt(divisionId));
        });

        const divisionName: string = route.params.division?.match(/(\d|[a-d])+$/i)?.[0] || `1`;

        const chars: string = `abcd`;

        const paramsDivision = {
            index: [...((divisionName.match(/[a-d]+$/i) || `a`)[0])].reduce((a, char, charIndex) =>
            {
                return a + (chars.indexOf(char.toLowerCase()) * (4 ** charIndex));
            }, 0),
            level: parseInt(divisionName.match(/^\d+/)?.[0] || `1`) - 1
        };

        const divisionsActiveId = parseInt(divisions.find(([, division]) =>
        {
            return paramsDivision.index === division.index && paramsDivision.level === division.level;
        })?.[0] || leagueSeasonsDivisions.find((divisionId) =>
        {
            return divisionId === parseInt(this._vm.$cookies.get(`divisionsActive`) as string);
        })?.toString() || divisions.find(([, division]) =>
        {
            return division.level === 0 && division.index === 0;
        })?.[0] || `0`);

        return dispatch(`divisionsActiveSet`, divisionsActiveId).catch((err) =>
        {
            console.error(err);
        });
    },
    async divisionsActiveSet(this: { _vm: Vue }, {commit, dispatch, getters, state}: Vue['$store'], divisionId: number = 0)
    {
        if (divisionId && divisionId === state.divisions.active)
        {
            return;
        }

        await dispatch(`tableActiveSet`, {tableName: `divisions`, active: divisionId});

        if (!divisionId)
        {
            this._vm.$cookies.remove(`divisionsActive`);

            if (this._vm.$Tomwork.emptyIs(getters.leagueSeason.divisions?.[state.categories.active]))
            {
                const nestedValues: number[] = [state.categories.active, state.leagueSeasons.active, state.divisions.active];

                const dataLoadOn = () =>
                {
                    commit(`dataLoadedSet`, {nestedValues});
                    window.removeEventListener(`dataLoad`, dataLoadOn);
                };

                window.addEventListener(`dataLoad`, dataLoadOn);
            }

            return;
        }

        this._vm.$cookies.set(`divisionsActive`, divisionId);
        this._vm.$socket.emit(`userPropsUpdate`, {cookies: document.cookie});

        await dispatch(`dataLeagueGet`, {force: true}).catch((err) =>
        {
            console.error(err);
            return Promise.reject(err);
        });

        return divisionId;
    },
    async divisionsGet(this: { _vm: Vue }, {dispatch}: Vue['$store'])
    {
        await dispatch(`get`, {tableName: `divisions`}).catch((err) =>
        {
            console.error(err);
            return Promise.reject(err);
        });

        return dispatch(`divisionsActiveCalc`).catch((err) =>
        {
            console.error(err);
            return Promise.reject(err);
        });
    },
    async get(this: { _vm: Vue }, {commit, dispatch, getters, state}: Vue['$store'],
              {tableName, nestedValues, unseenUpdate = Boolean(state.dataLoaded.value[state.categories.active])}: {
                  nestedValues?: number[],
                  tableName: string,
                  unseenUpdate?: boolean
              }): Promise<VueHttpResponse>
    {
        const categoryId: number = state.categories.active;

        const {auth, categoryHas, finished, nestedProps} = state[tableName];

        const nestedPropsDefaults: { [s: string]: string } = {
            divisionId: `divisions`,
            seasonId: `leagueSeasons`
        };

        const paramsNested: { [s: string]: number } = (nestedProps || []).reduce((a, nestedProp, nestedPropIndex) =>
        {
            const nestedValue = nestedValues?.[nestedPropIndex];

            const result = typeof nestedValue === `undefined` ? state[nestedPropsDefaults[nestedProp]]?.active : nestedValue;

            if (result)
            {
                a[nestedProp] = result;
            }

            return a;
        }, {});

        // @ts-ignore
        return this._vm.$http.get(
            `https://api.${process.env.VUE_APP_FM_HOSTNAME}/${tableName}`,
            {
                ...(categoryId && {categoryId}),
                ...(auth && {auth: getters.authData}),
                ...(nestedValues && !new this._vm.$Object(categoryHas ? finished[categoryId] : finished).findNested(nestedValues) && {
                    lastId: await dispatch(`lastIdGet`, {categoryId, tableName, nestedValues})
                }),
                ...paramsNested
            }
        ).then(async (res) =>
        {
            if (!this._vm.$Tomwork.emptyIs(res.body))
            {
                await dispatch(`tableUpdate`, {categoryId, tableName, res, unseenUpdate}).catch((err) =>
                {
                    console.error(err);
                    return Promise.reject(err);
                });
            }

            if (state.dataLoaded.value[categoryId] && state[tableName].tabs)
            {
                Object.keys(state[tableName].loading[categoryId]).forEach((tabId) =>
                {
                    commit(`loadingSet`, {categoryId, tableName, nestedValues: [Number(tabId)], value: false});
                });
            }

            return res;
        }).catch((err) =>
        {
            console.error(err);
            return Promise.reject(err);
        });
    },
    async imageFormatSet(this: { _vm: Vue }, {commit}: Vue['$store'])
    {
        if (!self.createImageBitmap)
        {
            commit(`set`, {props: {imageFormat: `jpg`}});
            return;
        }

        const blob = await fetch(`data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=`).then((r) =>
        {
            return r.blob();
        }).catch((err) =>
        {
            console.error(err);
            return Promise.reject(err);
        });

        return createImageBitmap(blob).catch(() =>
        {
            commit(`set`, {props: {imageFormat: `jpg`}});
        });
    },
    async lastIdGet(this: { _vm: Vue }, {state}: Vue['$store'], {categoryId = state.categories.active, tableName, nestedValues = []}: {
        categoryId?: number,
        nestedValues?: number[]
        tableName: string,
    }): Promise<string>
    {
        const {categoryHas, value} = state[tableName];

        return Object.keys(new this._vm.$Object(categoryHas ? value[categoryId] : value).findNested(nestedValues)).sort((idA, idB) =>
        {
            return parseInt(idA) - parseInt(idB);
        })[0];
    },
    async leagueSeasonsActiveSet(this: { _vm: Vue }, {dispatch, state}: Vue['$store'], leagueSeasonId): Promise<number | void>
    {
        const leagueSeasonsActiveOld: number = state.leagueSeasons.active;

        if (!leagueSeasonId)
        {
            return;
        }

        await dispatch(`tableActiveSet`, {tableName: `leagueSeasons`, active: leagueSeasonId});
        this._vm.$cookies.set(`leagueSeasonsActive`, leagueSeasonId);
        this._vm.$socket.emit(`userPropsUpdate`, {cookies: document.cookie});

        if (!leagueSeasonsActiveOld)
        {
            return;
        }

        await dispatch(`divisionsActiveCalc`).catch((err) =>
        {
            console.error(err);
            return Promise.reject(err);
        });

        await dispatch(`dataLeagueGet`).catch((err) =>
        {
            console.error(err);
            return Promise.reject(err);
        });

        return leagueSeasonId;
    },
    async leagueSeasonsGet(this: { _vm: Vue }, {dispatch, state}: Vue['$store']): Promise<number | void>
    {
        await dispatch(`get`, {tableName: `leagueSeasons`}).catch((err) =>
        {
            console.error(err);
            return Promise.reject(err);
        });

        const leagueSeasonsActiveId: number = parseInt(Object.entries(state.leagueSeasons.value).find(([, leagueSeason]) =>
        {
            return new this._vm.$String(state.leagueSeasons.htmlGet(leagueSeason)).urlTo() === router.currentRoute.params.season;
        })?.[0] || this._vm.$cookies.get(`leagueSeasonsActive`) || Object.entries(state.leagueSeasons.value).sort(([, leagueSeasonA], [, leagueSeasonB]) =>
        {
            return dayjs(leagueSeasonB.seasonStart).diff(dayjs(leagueSeasonA.seasonStart));
        })[0][0]);

        return dispatch(`leagueSeasonsActiveSet`, leagueSeasonsActiveId).catch((err) =>
        {
            console.error(err);
            return Promise.reject(err);
        });
    },
    async localesGet(this: { _vm: Vue }, {commit}, {lang = `sk`}: { lang?: Lang } = {})
    {
        return this._vm.$http.get(`https://api.${process.env.VUE_APP_FM_HOSTNAME}/locales`, {lang}).then(async (res) =>
        {
            commit(`set`, {props: {[`locales.value.${lang}`]: res.body}});
        }).catch((err) =>
        {
            console.error(err);
            return Promise.reject(err);
        });
    },
    async login(this: { _vm: Vue }, {commit, dispatch, state}: Vue['$store'], res: VueHttpResponse): Promise<void>
    {
        if (!res.ok)
        {
            return;
        }

        commit(`set`, {props: {'userLogged.loggedIn': true}});

        // @ts-ignore
        await Promise.all([
            dispatch(`userPropsUpdate`, {props: res.body}),
            ...(state.userLogged.verified ? [dispatch(`get`, {tableName: `messages`})] : []),
            dispatch(`get`, {tableName: `messagesTabs`})
        ]).catch((err) =>
        {
            console.error(err);
            return Promise.reject(err);
        });
    },
    async logout(this: { _vm: Vue }, {commit, state}: Vue['$store']): Promise<void>
    {
        const {id, token} = state.userLogged;

        this._vm.$socket.emit(`logout`, {id, token});

        commit(`set`, {props: {keyMode: `section`, 'userLogged.loggedIn': false}});

        Object.keys(state.userProps).forEach((prop) =>
        {
            if (this._vm.$cookies.get(prop))
            {
                this._vm.$cookies.remove(prop);
            }

            commit(`set`, {props: {[`userLogged.${prop}`]: null}});
        });

        [`categoriesActive`, `sectionsActive`].forEach((prop) =>
        {
            this._vm.$cookies.remove(prop);
        });

        commit(`messagesPersonalDelete`);
    },
    async sectionsActiveCalc(this: { _vm: Vue }, {dispatch, state}: Vue['$store']): Promise<string>
    {
        const sectionNewName: string = state.sections.activeCalc();

        dispatch(`sectionsActiveSet`, sectionNewName).catch((err) =>
        {
            console.error(err);
        });

        return sectionNewName;
    },
    async sectionsActiveSet(this: { _vm: Vue }, {commit, state}: Vue['$store'], sectionNew: string): Promise<string | void>
    {
        if (!sectionNew || sectionNew === state.sections.active)
        {
            return;
        }

        const sectionCookieExists = Object.entries(state.sections.value).some(([sectionName]) =>
        {
            return sectionName === sectionNew;
        });

        const sectionNewChecked = sectionCookieExists ? sectionNew : state.sections.default;

        this._vm.$cookies.set(`sectionsActive`, sectionNewChecked);
        this._vm.$socket.emit(`userPropsUpdate`, {cookies: document.cookie});
        commit(`set`, {props: {[`sections.active`]: sectionNewChecked}});
    },
    async socket_fieldPost(this: { _vm: Vue }, {dispatch, state}: Vue['$store'], {categoryId, createdById, ...fieldsNew}: {
        categoryId: number,
        createdById: number
    })
    {
        return Object.entries(this._vm.$Tomwork.clone(fieldsNew)).reduce((a, [tableName, value]) =>
        {
            return a.then(async () =>
            {
                if (tableName.match(/Tabs$/))
                {
                    const parentTableName: string = tableName.replace(/Tabs$/, ``);

                    const {loading} = state[parentTableName];

                    Object.keys(value).filter((tabId) =>
                    {
                        return typeof (state[parentTableName].categoryHas ? loading[categoryId][tabId] : loading[tabId]) === `undefined`;
                    }).forEach((tabId) =>
                    {
                        dispatch(`get`, {tableName: parentTableName, nestedValues: [Number(tabId)]}).catch((err) =>
                        {
                            console.error(err);
                        });
                    });
                }

                const unseenUpdate: boolean = createdById !== state.userLogged.id;

                dispatch(`tableUpdate`, {
                    categoryId,
                    lastUpdate: false,
                    res: {body: this._vm.$Tomwork.clone(value), ok: true} as VueHttpResponse,
                    tableName,
                    unseenUpdate
                }).catch((err) =>
                {
                    console.error(err);
                });

                if (unseenUpdate && state[tableName].nestedProps)
                {
                    const fieldPosted: any = new this._vm.$Object(value).unwrap();

                    const nestedValues: number[] = state[tableName].nestedProps.map((nestedProp) =>
                    {
                        return fieldPosted[nestedProp];
                    });

                    return dispatch(`unseenCountUpdate`, {categoryId, tableName, nestedValues}).catch((err) =>
                    {
                        console.error(err);
                    });
                }
            });
        }, Promise.resolve());
    },
    async socket_leagueSeasonsDivisionPost(this: { _vm: Vue }, {commit, dispatch, state}: Vue['$store'],
                                           {divisionId, seasonId}: { divisionId: number, seasonId: number }): Promise<any>
    {
        const categoryId: number = Number(Object.entries(state.divisions.value).find(([, divisions]) =>
        {
            return Object.keys(divisions).includes(divisionId.toString());
        })?.[0]) || 0;

        commit(`leagueSeasonsDivisionPost`, {categoryId, divisionId, seasonId});
        commit(`dataLoadedSet`, {nestedValues: [categoryId, seasonId, divisionId]});

        if (!state.divisions.active && Number(categoryId) === state.categories.active && seasonId === state.leagueSeasons.active)
        {
            return dispatch(`divisionsActiveCalc`).catch((err) =>
            {
                console.error(err);
            });
        }
    },
    async socket_logout(this: { _vm: Vue }, {dispatch}: Vue['$store']): Promise<any>
    {
        return dispatch(`logout`).catch((err) =>
        {
            console.error(err);
        });
    },
    async socket_userPropsUpdate(this: { _vm: Vue }, {dispatch}: Vue['$store'], {props}: { props: { [s: string]: any } }): Promise<void>
    {
        await dispatch(`userPropsUpdate`, {props}).catch((err) =>
        {
            console.error(err);
        });
    },
    async tableActiveSet(this: { _vm: Vue }, {commit}: Vue['$store'], {active, tableName}: {
        active: string | number,
        tableName: string
    }): Promise<void>
    {
        commit(`set`, {props: {[`${tableName}.active`]: (typeof active === `string` && tableName !== `leagueTabs` ? parseInt(active) : active) || 0}});
    },
    async tabsActiveCalcAll(this: { _vm: Vue }, {dispatch, state}: Vue['$store']): Promise<any[]>
    {
        return Promise.all(Object.entries(state).filter(([, prop]) =>
        {
            // @ts-ignore
            return typeof prop === `object` && prop.tabs;
        }).map(async ([section]) =>
        {
            await dispatch(`tabsActiveCalc`, {section}).catch((err) =>
            {
                console.error(err);
                return Promise.reject(err);
            });
        })).catch((err) =>
        {
            console.error(err);
            return Promise.reject(err);
        });
    },
    async tabsActiveCalc(this: { _vm: Vue }, {dispatch, getters, state}: Vue['$store'], {section}: { section: string }): Promise<string | number>
    {
        const tabsTableName: string = `${section}Tabs`;

        if (!state[tabsTableName])
        {
            return ``;
        }

        const tabs: { [s: string]: TabValue } = (state[tabsTableName].categoryHas ? state[tabsTableName].value[state.categories.active] : state[tabsTableName].value) || {};
        const cookieProp: string = `${tabsTableName}Active`;

        const tabCookieExists: boolean = !state.dataLoaded.value[state.categories.active] || Object.entries(tabs).some(([tabId]) =>
        {
            return tabId === this._vm.$cookies.get(cookieProp);
        });

        const tabDefault = Object.entries(tabs).find(([, tab]) =>
        {
            return tab.order === 0;
        })?.[0];

        const {matched} = router.resolve({
            name: router.currentRoute.name?.includes(section) ? router.currentRoute.name : `${section}${state[tabsTableName].appendable === false ? `Default` : ``}`,
            params: getters.params
        }).resolved;

        const tabId: string | number = matched[matched.length - 1]?.meta.tabId || (tabCookieExists && this._vm.$cookies.get(cookieProp)) || tabDefault;

        if (tabId !== state[tabsTableName].active)
        {
            dispatch(`tabsActiveSet`, {tabId, tabsTableName}).catch((err) =>
            {
                console.error(err);
            });
        }

        return tabId;
    },
    async tabsActiveSet(this: { _vm: Vue }, {dispatch}: Vue['$store'], {tabId, tabsTableName}: { tabId: string | number, tabsTableName: string }): Promise<void>
    {
        if (!tabId)
        {
            return;
        }

        await dispatch(`tableActiveSet`, {tableName: tabsTableName, active: tabId});
        this._vm.$cookies.set(`${tabsTableName}Active`, tabId);
        this._vm.$socket.emit(`userPropsUpdate`, {cookies: document.cookie});
    },
    async tabCreate(this: { _vm: Vue }, {commit, dispatch}: Vue['$store'], {categoryId, tableName, nestedValues, res}: {
        categoryId: number,
        nestedValues: number[],
        res: VueHttpResponse,
        tableName: string
    }): Promise<void | [any, any]>
    {
        const tabsTableName: string = `${tableName}Tabs`;

        commit(`tabCreate`, {categoryId, tableName: tabsTableName, value: res.body});

        return Promise.all([
            dispatch(`tableUpdate`, {categoryId, tableName: tabsTableName, res}),
            dispatch(`get`, {nestedValues, tableName})
        ]).catch((err) =>
        {
            console.error(err);
        });
    },
    async tabDelete(this: { _vm: Vue }, {commit, getters, state}: Vue['$store'], {categoryId, tabId, tabsTableName}: {
        categoryId: number,
        tabId: string | number,
        tabsTableName: string
    }): Promise<VueHttpResponse>
    {
        commit(`tabDelete`, {categoryId, tabId, tabsTableName});

        return this._vm.$http.delete(`https://api.${process.env.VUE_APP_FM_HOSTNAME}/${tabsTableName}`, {
            id: tabId,
            ...(state[tabsTableName].auth && {auth: getters.authData})
        }).catch((err) =>
        {
            console.error(err);
            return Promise.reject(err);
        });
    },
    async tabRouteCreate(this: { _vm: Vue }, {commit, getters, state}: Vue['$store'], {categoryId, tableName, tabId, tab}: {
        categoryId: number,
        tab: TabValue,
        tabId: string | number
        tableName: string,
    })
    {
        const categoryName: string = new this._vm.$String(state.categories.value[categoryId].name).urlTo();
        const parentTable: string = tableName.replace(/Tabs$/, ``);
        const sectionPath: string = new this._vm.$String(getters.texts[parentTable].title).urlTo();
        const parentPath: string = `/${categoryName}/${sectionPath}`;
        const sectionTitle: string = getters.texts[parentTable].title;
        const tabAppTypeName: string = state[tableName].categoryHas ? new this._vm.$String(state.categories.value[categoryId].name).capitalize().toString() : ``;

        const route = [
            {
                component: router.resolve(parentPath).resolved.matched[router.resolve(parentPath).resolved.matched.length - 1].components.default,
                meta: {
                    sectionName: parentTable,
                    tabId,
                    title: `${sectionTitle} > ${tab.title}`
                },
                name: `${parentTable}${new this._vm.$String(tab.href).capitalize()}${new this._vm.$String(tabId.toString()).capitalize()}${tabAppTypeName}`,
                path: `${parentPath}/${tab.href}`,
                props: {
                    text: getters.texts[parentTable]
                }
            }
        ];

        commit(`loadingSet`, {categoryId, tableName: tableName.replace(/Tabs$/, ``), nestedValues: [Number(tabId)], value: true});

        router.addRoutes(route);

        return route;
    },
    async titleUpdate(this: { _vm: Vue }, {getters, state}: Vue['$store']): Promise<void>
    {
        if (!state.sections.active)
        {
            return;
        }

        const sectionsActive: SectionValue = state.sections.value[state.sections.active];

        if ((sectionsActive.category !== false && !state.categories.active) || !router.currentRoute.name)
        {
            return;
        }

        const unseen: string | undefined = document.title.match(/^\(\d+\) /)?.[0];
        const categoriesTitle: string = sectionsActive.category === false ? `` : getters.texts.categories[state.categories.value[state.categories.active]?.name];

        const sectionsTitle: string = (() =>
        {
            if (sectionsActive.title)
            {
                return new this._vm.$String(sectionsActive.title).htmlParse().toString() || `FIFA maniaci`;
            }

            return router.currentRoute.meta.title;
        })();

        document.title = `${unseen || ``}${categoriesTitle ? `${categoriesTitle} - ` : ``}${sectionsTitle}`;
    },
    async unseenCountUpdate(this: { _vm: Vue }, {commit, dispatch, getters, state}: Vue['$store'], {categoryId, tableName, nestedValues}: {
        categoryId: number,
        nestedValues?: number[]
        tableName: string
    }): Promise<void>
    {
        if (!state[tableName].unseen)
        {
            return;
        }

        commit(`unseenCountUpdate`, {categoryId, nestedValues, tableName});

        const sectionName: string = new this._vm.$String(tableName).caseCamelSplit()[0].toString();

        const unseen = (() =>
        {
            const unseenSource: { [s: string]: Unseen } = (state[sectionName].categoryHas ? state[sectionName].unseen[state.categories.active]
                : state[sectionName].unseen) || getters[`${sectionName}Unseen`];

            if (state[sectionName].tabs)
            {
                return Object.values(unseenSource || {}).filter((unseenTable) =>
                {
                    return unseenTable;
                }).reduce((a, {general, personal}) =>
                {
                    a.general += general;
                    a.personal += personal;
                    return a;
                }, {general: 0, personal: 0});
            }

            return unseenSource;
        })();

        commit(`unseenCountSectionUpdate`, {tableName: sectionName, unseen});
        dispatch(`unseenTitleUpdate`).catch((err) =>
        {
            console.error(err);
        });
    },
    async unseenCountUpdateAll(this: { _vm: Vue }, {dispatch, state}: Vue['$store']): Promise<any[]>
    {
        return Promise.all(Object.entries(state.sections.value).filter(([tableName, table]) =>
        {
            return table.category !== false && state[tableName]?.unseen;
        }).map(async ([tableName]) =>
        {
            return dispatch(`unseenCountUpdate`, {categoryId: state.categories.active, tableName}).catch((err) =>
            {
                console.error(err);
            });
        }));
    },
    async unseenCountZero(this: { _vm: Vue }, {dispatch, state}: Vue['$store'], {categoryId, tableName, nestedValues, rowIds}: {
        categoryId: number,
        nestedValues: number[],
        rowIds: number[],
        tableName: string,
    }): Promise<void>
    {
        if (!state[tableName].unseen)
        {
            return;
        }

        const {categoryHas} = state[tableName];

        const rowsContainer: any = categoryHas ? state[tableName].value[categoryId] : state[tableName].value;

        if (!rowsContainer)
        {
            return;
        }

        const nestedValuesChecked: number[] = nestedValues.map((nestedValue) =>
        {
            return typeof nestedValue === `undefined` ? 0 : nestedValue;
        });

        const rows: any = new this._vm.$Object(rowsContainer).findNested(nestedValuesChecked);

        if (!rows)
        {
            return;
        }

        rowIds.forEach((rowId) =>
        {
            Vue.delete(rows[rowId], `unseen`);
        });

        return dispatch(`unseenCountUpdate`, {categoryId, tableName, nestedValues}).catch((err) =>
        {
            console.error(err);
        });
    },
    async unseenTitleUpdate(this: { _vm: Vue }, {state}: Vue['$store']): Promise<void>
    {
        const unseenCount: number = Object.values(state.sections.unseen).reduce((a, {general = 0, personal = 0}: Partial<Unseen> = {}) =>
        {
            return a + general + personal;
        }, 0);

        const unseenTitle: string = unseenCount ? `(${unseenCount}) ` : ``;

        const routeTitle: string = document.title.replace(/^\(\d+\) /, ``);
        document.title = `${unseenTitle}${routeTitle}`;
    },
    async urlGet(this: { _vm: Vue }, {getters, state}: Vue['$store']): Promise<string>
    {
        const matchedIs: (path: string) => boolean = (path) =>
        {
            return Boolean(router.resolve({path}).resolved.matched.length);
        };

        const {fullPath} = router.currentRoute;

        const fullPathParts: string[] = fullPath.split(`/`).map((part) =>
        {
            return part.toLowerCase();
        });

        const sectionsActive: SectionValue = state.sections.value[state.sections.active];

        if (matchedIs(fullPath))
        {
            return fullPath;
        }

        const paths: string[] = [fullPathParts.slice(0, 3).join(`/`), `/${fullPathParts.slice(2, 3).join(`/`)}`];

        if (sectionsActive.params)
        {
            const params: string = sectionsActive.params.map((param) =>
            {
                return getters.params[param];
            }).join(`/`);

            paths.unshift(`${fullPathParts.join(`/`)}/${params}`, `${fullPathParts.slice(0, -1).join(`/`)}/${params}/${fullPathParts[fullPathParts.length - 1]}`);
        }

        return paths.find(matchedIs) || router.currentRoute.fullPath;
    },
    async urlUpdate(this: { _vm: Vue }, {dispatch}: Vue['$store']): Promise<void | Route>
    {
        return router.push(await dispatch(`urlGet`).catch((err) =>
        {
            console.error(err);
            return Promise.reject(err);
        })).catch((err) =>
        {
            console.error(err);
        });
    },
    async userOnlineSet(this: { _vm: Vue }, {getters, state}: Vue['$store'], {categoryIdOld, categoryIdNew}: {
        categoryIdOld: number,
        categoryIdNew: number
    }): Promise<VueHttpResponse | void>
    {
        const {id, token} = state.userLogged;

        if (!id || !token)
        {
            return;
        }

        return this._vm.$http.patch(`https://api.${process.env.VUE_APP_FM_HOSTNAME}/users/online`, {categoryIdOld, categoryIdNew, auth: getters.authData}).catch((err) =>
        {
            console.error(err);
            return Promise.reject(err);
        });
    },
    async userPropsGet(this: { _vm: Vue }, {dispatch, getters, state}: Vue['$store']): Promise<void>
    {
        if (!state.userLogged.id)
        {
            return;
        }

        return this._vm.$http.get(`https://api.${process.env.VUE_APP_FM_HOSTNAME}/users`, {auth: getters.authData, id: state.userLogged.id}).then(async (res) =>
        {
            return dispatch(`userPropsUpdate`, {props: res.body}).catch((err) =>
            {
                console.error(err);
                return Promise.reject(err);
            });
        }).catch((err) =>
        {
            console.error(err);
            return Promise.reject(err);
        });
    },
    async userPropsUpdate(this: { _vm: Vue }, {commit, state}: Vue['$store'], {props}: { props: { [s: string]: any } }): Promise<void>
    {
        Object.entries(props).filter(([propName]) =>
        {
            return Object.keys(state.userProps).includes(propName);
        }).forEach(([propName, propValue]) =>
        {
            if (state.userProps[propName].cookies)
            {
                this._vm.$cookies.set(propName, props[propName]);
            }
            else if (this._vm.$cookies.get(propName))
            {
                this._vm.$cookies.remove(propName);
            }

            if (propName === `username`)
            {
                const {params} = router.currentRoute;

                commit(`set`, {
                    props: {
                        profileUsername: !params.username || params.username.toLowerCase() === propValue.toLowerCase() ? propValue : params.username
                    }
                });
            }
        });

        this._vm.$socket.emit(`userPropsUpdate`, {cookies: document.cookie});

        commit(`set`, {
            props: Object.entries(props).map(([propName, prop]) =>
            {
                return [`userLogged.${propName}`, prop];
            }).reduce((a, [propName, prop]) =>
            {
                a[propName] = prop;
                return a;
            }, {})
        });
    }
};

export default actionsExportable;
