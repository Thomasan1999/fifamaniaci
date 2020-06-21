import {MutationTree, Store} from 'vuex';
import Vue                   from 'vue';
import {StoreState}   from '@/vue-extend.d';
import Tomwork        from '@/plugins/Tomwork';
import VueObject      from '@/plugins/VueObject';

const mutationsExportable = {
    dataLoadedSet(this: {_vm: Vue}, state: StoreState, {nestedValues = [], value = true}: { nestedValues: number[], value?: boolean }): void
    {
        const targetContainer = nestedValues.slice(0, -1).reduce((a, nestedValue) =>
        {
            if (!a[nestedValue] || typeof a[nestedValue] !== `object`)
            {
                Vue.set(a, nestedValue, {});
            }

            return a[nestedValue];
        }, state.dataLoaded.value as any);

        const nestedValueLast: number = nestedValues[nestedValues.length - 1];

        Vue.set(targetContainer, nestedValueLast, value);
    },
    leagueSeasonsDivisionPost(this: {_vm: Vue}, state: StoreState, {categoryId, divisionId, seasonId}: { categoryId: number, divisionId: number, seasonId: number }): void
    {
        const {divisions} = state.leagueSeasons.value[seasonId];

        if (!divisions[categoryId])
        {
            Vue.set(divisions, categoryId, []);
        }

        divisions[categoryId].push(divisionId);
    },
    loadingSet(this: {_vm: Vue}, state: StoreState, {categoryId, tableName, nestedValues = [], value}: {
        categoryId: number,
        tableName: string,
        nestedValues: number[],
        value: any
    }): void
    {
        const tabs = state[tableName];

        if (tabs.categoryHas && !tabs.loading[categoryId])
        {
            Vue.set(tabs.loading, categoryId, {});
        }

        const targetContainer: any = nestedValues.slice(0, -1).reduce((a, nestedValue) =>
        {
            if (!a[nestedValue])
            {
                Vue.set(a, nestedValue, {});
            }

            return a[nestedValue];
        }, tabs.categoryHas ? tabs.loading[categoryId] : tabs.loading);

        const nestedValueLast: number = nestedValues[nestedValues.length - 1];

        if (typeof nestedValueLast === `undefined` || value === false)
        {
            Vue.set(targetContainer, nestedValueLast, value);
        }
    },
    messagesPersonalDelete(this: {_vm: Vue}, state: StoreState): void
    {
        [`messages`, `messagesTabs`].forEach((prop) =>
        {
            Object.keys(state[prop].value[state.categories.active]).filter((tabId) =>
            {
                return parseInt(tabId) !== 0;
            }).forEach((tabId) =>
            {
                Vue.delete(state[prop].value[state.categories.active], tabId);
            });
        });

        state.messagesTabs.active = 0;
    },
    set(state, {props}: { props: {[s: string]: any} }): void
    {
        Object.entries(props).forEach(([prop, value]) =>
        {
            const propParts = prop.split(`.`);
            const target = propParts.slice(0, -1).reduce((a, propPart) =>
            {
                return a[propPart];
            }, state);

            target[propParts[propParts.length - 1]] = value;

            if (prop === `navVisible`)
            {
                window.dispatchEvent(new CustomEvent(`navVisibilityChange`));
            }
        });
    },
    socket_connectivityUpdate(this: {_vm: Vue}, state: StoreState, {id, categoryId, connectivity}: { id: number, categoryId: number, connectivity: Connectivity }): void
    {
        if (!state.users.value[id] || (connectivity === `online` && state.users.value[id].online?.includes(categoryId)))
        {
            return;
        }

        if (connectivity === `online`)
        {
            // eslint-disable-next-line
            state.users.value[id].online?.push(categoryId);
            return;
        }

        Vue.set(state.users.value[id], `online`, state.users.value[id].online?.filter((userAppTypeId) =>
        {
            return categoryId !== userAppTypeId;
        }));
    },
    socket_fieldDelete(this: {_vm: Vue}, state: StoreState, ...tables): void
    {
        Object.entries((tables[0] || {}) as { [s: string]: { [s: string]: { categoryId?: number } } }).forEach(([tableName, fields]) =>
        {
            const table: StoreTable<any> = state[tableName];

            Object.entries(fields).forEach(([fieldId, props]) =>
            {
                const target = new VueObject(table.categoryHas ? table.value[props.categoryId as number] : table.value).findNested((table.nestedProps || []).map((nestedProp) =>
                {
                    return props[nestedProp];
                }));

                Vue.delete(target, fieldId);
            });
        });
    },
    tabCreate(this: {_vm: Vue}, state: StoreState, {categoryId, tableName, value}: { categoryId: number, tableName: string, value: any }): void
    {
        if (!state[tableName].value[categoryId])
        {
            Vue.set(state[tableName].value, categoryId, {});
        }

        state[tableName].value[categoryId] = {...state[tableName].value[categoryId], ...value};
    },
    tabDelete(this: {_vm: Vue}, state: StoreState, {categoryId, tabId, tabsTableName}: { categoryId: number, tabId: string | number, tabsTableName: string }): void
    {
        Vue.delete(state[tabsTableName].value[categoryId], tabId);
    },
    tableUpdate(this: {_vm: Vue}, state: StoreState, {categoryId, tableName, finishedNew, lastUpdate = false, unseenUpdate = true, value}: {
        categoryId: number,
        finishedNew?: number[]
        lastUpdate?: boolean,
        tableName: string,
        unseenUpdate: boolean,
        value: { [s: string]: any }
    })
    {
        if (typeof value !== `object` || value === null)
        {
            return;
        }

        const {categoryHas, finished, loading, nestedProps, unseen} = state[tableName];

        const props = {
            finished: false,
            loading: Boolean(finishedNew),
            unseen: {general: 0, personal: 0},
            value: {}
        };

        const propsEntries = Object.entries(props);

        if (categoryHas)
        {
            propsEntries.filter(([propName]) =>
            {
                return state[tableName][propName] && !state[tableName][propName][categoryId];
            }).forEach(([propName, propDefault]) =>
            {
                const defaultValue = typeof propDefault === `object` && propDefault !== null ? Tomwork.clone(propDefault) : propDefault;

                Vue.set(state[tableName][propName], categoryId, nestedProps ? {} : defaultValue);
            });
        }

        const nestedLength = (nestedProps || []).length;

        type Finished = boolean | { [s: string]: Finished };
        type Loading = boolean | { [s: string]: Loading };
        type Value = any | { [s: string]: Value };

        const valueSplit = ({index = 0, splitting}: {
            index?: number,
            splitting: {
                finished?: Finished,
                loading?: Loading,
                unseen?: Unseen,
                value?: Value
            }
        }) =>
        {
            if (!nestedProps[index])
            {
                return splitting.value;
            }

            const valueSplitted = Object.entries(splitting.value || {}).reduce((a, [fieldId, field]: [string, any]) =>
            {
                const splitterProp = nestedProps[index];

                const splitterValue = field[splitterProp] || 0;

                delete field[splitterProp];

                a[splitterValue] = {...a[splitterValue], [fieldId]: field};
                return a;
            }, {});

            return Object.fromEntries(Object.entries(valueSplitted).map(([splitterValue, partSplitted]) =>
            {
                propsEntries.filter(([propName]) =>
                {
                    return ![`finished`, `value`].includes(propName) && splitting[propName] && !splitting[propName][splitterValue];
                }).forEach(([propName, propDefault]) =>
                {
                    const defaultValue = typeof propDefault === `object` && propDefault !== null ? Tomwork.clone(propDefault) : propDefault;

                    Vue.set(splitting[propName], splitterValue, nestedLength - 1 === index ? defaultValue : {});
                });

                if (splitting.finished && !splitting.finished[splitterValue])
                {
                    Vue.set(
                        splitting.finished as object,
                        splitterValue,
                        lastUpdate ? !finishedNew?.includes(Number(splitterValue)) : true
                    );
                }

                return [
                    splitterValue,
                    valueSplit({
                        index: index + 1,
                        splitting: {
                            ...(splitting.finished && {finished: splitting.finished[splitterValue]}),
                            ...(splitting.loading && {loading: splitting.loading[splitterValue]}),
                            ...(splitting.unseen && {unseen: splitting.unseen[splitterValue]}),
                            value: partSplitted
                        }
                    })
                ];
            }));
        };

        const fieldsSet = ({index = 0, target, valueOld, valueNew}: { index?: number, target: any, valueOld: any, valueNew: { [s: string]: object } }) =>
        {
            if (!target || !valueNew || nestedLength + 2 === index)
            {
                return;
            }

            Object.entries(valueNew).forEach(([partId, part]) =>
            {
                if (nestedLength === index && state.dataLoaded.value[state.categories.active] && unseenUpdate && unseen && !Tomwork.equalIs(part, valueOld?.[partId]))
                {
                    Vue.set(part, `unseen`, true);
                }

                Vue.set(target, partId, index < nestedLength ? {...valueOld?.[partId], ...part} : part);
                fieldsSet({index: index + 1, target: target[partId], ...(valueOld && {valueOld: valueOld[partId]}), valueNew: valueNew[partId] as { [s: string]: object }});
            });
        };

        const valueNew: any = nestedProps ? valueSplit({
            splitting: {
                finished: categoryHas ? finished?.[categoryId] : finished,
                loading: categoryHas ? loading?.[categoryId] : loading,
                unseen: categoryHas ? unseen?.[categoryId] : unseen,
                value
            }
        }) : value;

        const target: any = categoryHas ? state[tableName].value[categoryId] : state[tableName].value;
        const valueOld: any = Tomwork.clone(target);

        fieldsSet({target, valueOld, valueNew});

        if (!nestedProps && finished)
        {
            const value2: any = lastUpdate ? !Tomwork.emptyIs(finishedNew) : true;

            if (categoryHas)
            {
                Vue.set(finished, categoryId, value2);
            }
            else
            {
                Vue.set(state[tableName], `finished`, value2);
            }
        }
    },
    unseenCountUpdate(this: {_vm: Vue}, state: StoreState, {categoryId, tableName, nestedValues = []}: { categoryId: number, tableName: string, nestedValues?: number[] }): void
    {
        const {categoryHas, unseen, value} = state[tableName];

        if (!unseen)
        {
            return;
        }

        const rowsContainer: any = categoryHas ? value[categoryId] : value;

        if (!rowsContainer || !nestedValues)
        {
            return;
        }

        const nestedValuesChecked: number[] = nestedValues.map((nestedValue) =>
        {
            return typeof nestedValue === `undefined` ? 0 : nestedValue;
        });

        const rows: { [s: string]: { unseen?: boolean } } = new VueObject(rowsContainer).findNested(nestedValuesChecked);

        if (!rows)
        {
            return;
        }

        const count: Unseen = Object.values(rows).filter((row) =>
        {
            return row.unseen;
        }).reduce((a, row) =>
        {
            // eslint-disable-next-line no-unused-expressions
            state[tableName].unseenPersonalCondition(row, state) ? a.personal += 1 : a.general += 1;
            return a;
        }, {general: 0, personal: 0});

        const target: any = new VueObject(categoryHas ? state[tableName].unseen[categoryId] : state[tableName].unseen).findNested(nestedValuesChecked.slice(0, -1));

        target[nestedValuesChecked.slice(-1)[0]] = count;
    },
    unseenCountSectionUpdate(this: {_vm: Vue}, state: StoreState, {tableName, unseen}: { tableName: string, unseen: Unseen | {[s: string]: Unseen} })
    {
        Vue.set(state.sections.unseen, tableName, unseen);
    }
};

export default mutationsExportable;
