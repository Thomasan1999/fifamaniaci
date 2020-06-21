import dayjs   from 'dayjs';
import {Route} from 'vue-router';
import Vue     from 'vue';
import router  from '@/router';

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
        await dispatch(`tableActiveSet`, {tableName: `categories`, active: categoryIdNew});

        if (!categoryIdOld)
        {
            router.push({params: getters.params, path: router.currentRoute.path}).catch((err) =>
            {
                console.error(err);
            });
        }

        Promise.all([
            dispatch(`divisionsActiveCalc`),
            dispatch(`userOnlineSet`, {categoryIdOld, categoryIdNew})
        ]).catch((err) =>
        {
            console.error(err);
            return Promise.reject(err);
        });

        return categoryIdNew;
    },
    async tableUpdate(this: { _vm: Vue }, {commit, dispatch, state}: Vue['$store'],
                      {
                          categoryId,
                          tableName,
                          lastUpdate = true,
                          res
                      }: {
                          categoryId: number,
                          lastUpdate?: boolean,
                          res: any,
                          tableName: string
                      })
    {
        const value: any = (() =>
        {
            return tableName === `messagesTabs` ? Object.entries(res.body as { [s: string]: MessagesTabValue }).reduce((a, [tabId, tab]) =>
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

        commit(`tableUpdate`, {categoryId, tableName, ...(headerFinished && {finishedNew: JSON.parse(headerFinished)}), lastUpdate, value});
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
                    setTimeout(() =>
                    {
                        commit(`dataLoadedSet`, {nestedValues});
                    }, 50);

                    window.removeEventListener(`dataLoad`, dataLoadOn);
                };

                window.addEventListener(`dataLoad`, dataLoadOn);
            }

            return;
        }

        this._vm.$cookies.set(`divisionsActive`, divisionId);

        return divisionId;
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

        if (!leagueSeasonsActiveOld)
        {
            return;
        }

        await dispatch(`divisionsActiveCalc`).catch((err) =>
        {
            console.error(err);
            return Promise.reject(err);
        });

        return leagueSeasonId;
    },
    async leagueSeasonsActiveCalc(this: { _vm: Vue }, {dispatch, state}: Vue['$store']): Promise<number | void>
    {
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
    // async login(this: { _vm: Vue }, {commit, dispatch, state}: Vue['$store'], res: any): Promise<void>
    // {
    //     if (!res.ok)
    //     {
    //         return;
    //     }
    //
    //     commit(`set`, {props: {'userLogged.loggedIn': true}});
    //
    //     @ts-ignore
    // await Promise.all([
    //     dispatch(`userPropsUpdate`, {props: res.body}),
    //     ...(state.userLogged.verified ? [dispatch(`get`, {tableName: `messages`})] : []),
    //     dispatch(`get`, {tableName: `messagesTabs`})
    // ]).catch((err) =>
    // {
    //     console.error(err);
    //     return Promise.reject(err);
    // });
    // },
    // async logout(this: { _vm: Vue }, {commit, state}: Vue['$store']): Promise<void>
    // {
    //     const {id, token} = state.userLogged;
    //
    //     commit(`set`, {props: {keyMode: `section`, 'userLogged.loggedIn': false}});
    //
    //     Object.keys(state.userProps).forEach((prop) =>
    //     {
    //         if (this._vm.$cookies.get(prop))
    //         {
    //             this._vm.$cookies.remove(prop);
    //         }
    //
    //         commit(`set`, {props: {[`userLogged.${prop}`]: null}});
    //     });
    //
    //     [`categoriesActive`, `sectionsActive`].forEach((prop) =>
    //     {
    //         this._vm.$cookies.remove(prop);
    //     });
    //
    //     commit(`messagesPersonalDelete`);
    // },
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
        commit(`set`, {props: {[`sections.active`]: sectionNewChecked}});
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
    },
    async tabCreate(this: { _vm: Vue }, {commit, dispatch}: Vue['$store'], {categoryId, tableName, nestedValues, res}: {
        categoryId: number,
        nestedValues: number[],
        res: any,
        tableName: string
    }): Promise<void | void[]>
    {
        const tabsTableName: string = `${tableName}Tabs`;

        commit(`tabCreate`, {categoryId, tableName: tabsTableName, value: res.body});

        return Promise.all([
            dispatch(`tableUpdate`, {categoryId, tableName: tabsTableName, res})
        ]).catch((err) =>
        {
            console.error(err);
        });
    },
    async tabDelete(this: { _vm: Vue }, {commit, getters, state}: Vue['$store'], {categoryId, tabId, tabsTableName}: {
        categoryId: number,
        tabId: string | number,
        tabsTableName: string
    }): Promise<void>
    {
        commit(`tabDelete`, {categoryId, tabId, tabsTableName});
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

        const categoriesTitle: string = sectionsActive.category === false ? `` : getters.texts.categories[state.categories.value[state.categories.active]?.name];

        const sectionsTitle: string = (() =>
        {
            if (sectionsActive.title)
            {
                return new this._vm.$String(sectionsActive.title).htmlParse().toString() ?? `FIFA maniaci`;
            }

            return router.currentRoute.meta.title;
        })();

        document.title = `${categoriesTitle ? `${categoriesTitle} - ` : ``}${sectionsTitle}`;
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
    async userOnlineSet(this: { _vm: Vue }, store, {categoryIdOld, categoryIdNew}: {
        categoryIdOld: number,
        categoryIdNew: number
    }): Promise<any | void>
    // eslint-disable-next-line no-empty-function
    {
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
