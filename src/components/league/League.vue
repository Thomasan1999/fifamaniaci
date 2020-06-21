<template>
    <section>
        <loading-container :condition="dataLoaded">
            <div class="select-container">
                <div v-for="tableName in [`leagueSeasons`, `divisions`]" :key="tableName">
                    <label :for="`league-select-${new $String(new $String(tableName).urlTo()).urlTo()}`"
                           v-html="`${new $String(texts.dictionary[$store.state[tableName].param]).capitalize()}:`"/>
                    <select :key="`${new $String(tableName).urlTo()}-select`" :id="`league-select-${new $String(tableName).urlTo()}`" @change="changeOn({tableName, $event})">
                        <option v-for="(value, valueId) in selects[tableName]" :key="valueId" :value="valueId"
                                :selected="parseInt(valueId) === $store.state[tableName].active"
                                v-html="new $String($store.state[tableName].htmlGet(value, {...$store, divisionShow: false})).capitalize()"/>
                    </select>
                </div>
            </div>
            <tab-container :tabs="tabs" :tabs-active="tabsActive" :tabs-names="tabsNames" :text="text" :unseen="unseen"/>
            <router-view class="subsection" :unseen="unseen[tabsActive]"/>
        </loading-container>
    </section>
</template>

<script lang="ts">
    import {mixins}                   from 'vue-class-component';
    import {Component}                from 'vue-property-decorator';
    import TabContainer               from '../TabContainer.vue';
    import TabContainerContainerMixin from '@/mixins/TabContainerContainer';
    import SectionMixin               from '@/mixins/Section';
    import MainMixin                  from '@/mixins/Main';

    @Component({
        components: {
            TabContainer
        },
        name: `League`
    })
    export default class League extends mixins(MainMixin, SectionMixin, TabContainerContainerMixin)
    {
        public async changeOn({tableName, $event}: { tableName: string, $event: Merge<KeyboardEvent, { target: HTMLSelectElement }> }): Promise<void>
        {
            const {dispatch, getters, state} = this.$store;

            const value: any = state[tableName].categoryHas ? state[tableName].value[this.categoriesActive] : state[tableName].value;

            const valueNew: string = new this.$String(state[tableName].htmlGet(value[$event.target.value], {divisionShow: true})).urlTo();

            this.$router.push({
                params: {...getters.params, [state[tableName].param]: valueNew}
            }).catch((err) =>
            {
                console.error(err);
            });

            await dispatch(`${tableName}ActiveSet` as 'divisionsActiveSet', Number($event.target.value)).catch((err) =>
            {
                console.error(err);
            });

            await dispatch(`unseenTitleUpdate`).catch((err) =>
            {
                console.error(err);
            });
        }

        public sectionName = `league`;
        public readonly tabsTableName = `leagueTabs`;

        public get divisions(): {[s: string]: DivisionValue}
        {
            const {divisions, leagueSeasons} = this.$store.state;

            if (this.$Tomwork.emptyIs(leagueSeasons.value[leagueSeasons.active]?.divisions[this.categoriesActive]))
            {
                return {
                    null: {
                        categoryId: 0,
                        index: 0,
                        level: 0,
                        matchTypeId: 0
                    }
                };
            }

            return (leagueSeasons.value[leagueSeasons.active]?.divisions[this.categoriesActive] || []).reduce((a, divisionId) =>
            {
                a[divisionId] = divisions.value[this.categoriesActive]?.[divisionId] || {
                    categoryId: 0,
                    index: 0,
                    level: 0,
                    matchTypeId: 0,
                };

                return a;
            }, {});
        }

        public get leagueSeasons()
        {
            const {leagueSeasons} = this.$store.state;

            if (this.$Tomwork.emptyIs(leagueSeasons.value))
            {
                return {};
            }

            return leagueSeasons.value;
        }

        public get selects()
        {
            return {
                divisions: this.divisions,
                leagueSeasons: this.leagueSeasons
            };
        }

        public get tabs()
        {
            return Object.entries(this.$store.state.leagueTabs.value as {[s: string]: TabValue}).sort(([, tabA], [, tabB]) =>
            {
                return tabA.order - tabB.order;
            }).map(([tabId, tab]) =>
            {
                return [tabId, {name: this.text.tabs[tabId], ...tab}] as [string, TabValue];
            });
        }

        public get tabsEnabled()
        {
            return this.tabs.filter(([, tab]) =>
            {
                return !tab.disabled;
            });
        }

        public get unseen()
        {
            return this.$store.getters.leagueUnseen;
        }
    }
</script>

<style lang="stylus" scoped>
    >>> .subsection
        display flex
        flex-grow 1
        overflow auto

    .select-container
        align-items center
        align-self center
        display inline-flex
        justify-content center
        padding-vertical 15px

        & > div
            align-items center
            display flex
            padding-horizontal 13px

            @media (max-width 449px)
                align-items flex-start
                flex-basis 0
                flex-direction column

        label
            padding-right 10px

            @media (max-width 449px)
                margin-bottom 5px

        select
            padding-left $navPaddingLeft
            padding-right ($navPaddingLeft + 15px)
</style>
