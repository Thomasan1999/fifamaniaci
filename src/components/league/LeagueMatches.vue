<template>
    <div class="matches">
        <loading-container :condition="dataLoaded">
            <table-container :table-name="tableName" :columns="columnsFiltered" :nested-values="nestedValues" :rows="rows" :rows-sort-compare-fn="rowsSortCompareFn"
                             :start-top-at="startTopAt" :text="text" :types="types" :unseen="unseen"/>
        </loading-container>
    </div>
</template>

<script lang="ts">
    import {mixins}           from 'vue-class-component';
    import {Component}        from 'vue-property-decorator';
    import TableContainer     from '@/components/table/TableContainer.vue';
    import MatchesMixin       from '@/mixins/Matches';
    import MainMixin          from '@/mixins/Main';
    import LeagueSectionMixin from '@/mixins/LeagueSection';

    @Component({
        components: {
            TableContainer
        },
        name: `LeagueMatches`
    })
    export default class LeagueMatches extends mixins(MainMixin, LeagueSectionMixin, MatchesMixin)
    {
        public rowsSortCompareFn([, matchA]: [string, LeagueMatchValue], [, matchB]: [string, LeagueMatchValue]): number
        {
            return matchA.week - matchB.week || matchA.matchOrder - matchB.matchOrder;
        }

        public get columnsFiltered()
        {
            const {playedAt} = this.columns;

            return {...this.columns, playedAt: {...playedAt, join: ` - `, minimalist: true, type: `date[]`}};
        }

        public get rows(): {[s: string]: Omit<Merge<LeagueMatchValue, {playedAt: [string, string]}>, 'id'>}
        {
            const {getters, state} = this.$store;
            const {leagueSeason: {seasonStart: leagueStart}} = getters;

            if (!leagueStart)
            {
                return {};
            }

            return Object.entries(state.matches.value[this.categoriesActive]).filter(([, match]) =>
            {
                return typeof match.week === `number` && match.seasonId === this.seasonId && match.divisionId === this.divisionId;
            }).reduce((a, [matchId, match]) =>
            {
                const {week} = match as Omit<LeagueMatchValue, 'id'>;

                a[matchId] = {
                    ...match as Omit<LeagueMatchValue, 'id'>,
                    playedAt: [leagueStart.add(week, `w`).format(), leagueStart.add(week + 1, `w`).add(-1, `d`).format()]
                };
                return a;
            }, {} as {[s: string]: Merge<Omit<LeagueMatchValue, 'id'>, {playedAt: [string, string]}>});
        }
    }
</script>

<style lang="stylus" scoped>
    >>> .played-at
        width 15%

        @media (max-width 1219px)
            width 158px

        @media (max-width 949px)
            width 154px

        @media (max-width 499px)
            width 83px

    >>> .home-id
        flex 3.2 0 0
</style>
