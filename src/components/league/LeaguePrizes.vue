<template>
    <div class="league-prizes">
        <loading-container :condition="dataLoaded">
            <div v-if="playersRegistered && !$Tomwork.emptyIs(rows)" class="text-container">
                <p v-if="$dayjs().diff($dayjs($store.getters.leagueSeason.seasonStart), `w`) < 2" v-html="text.initial"/>
                <p v-html="new $String(`${text.playersRegistered}: \${playersRegistered}`).htmlParse({playersRegistered})"/>
            </div>
            <table-container :table-name="tableName" :columns="columns" :head="thead" :nested-values="nestedValues"
                             :rows="rows" :rows-sort-compare-fn="rowsSortCompareFn" :text="text"/>
        </loading-container>
    </div>
</template>

<script lang="ts">
    import {mixins}                     from 'vue-class-component';
    import {Component}                  from 'vue-property-decorator';
    import MainMixin                    from '@/mixins/Main';
    import LeagueSectionMixin           from '@/mixins/LeagueSection';
    import TableContainerContainerMixin from '@/mixins/TableContainerContainer';
    import TableContainer               from '@/components/table/TableContainer.vue';

    @Component({
        components: {
            TableContainer
        },
        name: `LeaguePrizes`
    })
    export default class LeaguePrizes extends mixins(MainMixin, LeagueSectionMixin, TableContainerContainerMixin)
    {
        public rowsSortCompareFn([, prizeA]: [string, LeaguePrizeValue], [, prizeB]: [string, LeaguePrizeValue]): number
        {
            return prizeB.money - prizeA.money;
        }

        public tableName = `leaguePrizes`;
        public columns = {
            money: {
                fixed: 0,
                order: 2,
                type: `currency`
            },
            place: {
                order: 0,
                type: `index`
            }
        };
        public entrance: number = parseFloat(process.env.VUE_APP_FM_LEAGUE_REGISTRATION_MONEY);
        public thead = true;

        public get nestedValues(): string[]
        {
            return this.$store.state.leaguePrizes.nestedProps.map((nestedProp) =>
            {
                return this[nestedProp];
            });
        }

        public get playersRegistered(): number
        {
            const pool: number = Object.values(this.rows).reduce((a, prize) =>
            {
                return a + prize.money;
            }, 0);

            if (this.seasonId === 1)
            {
                switch (this.divisionId)
                {
                    case 13:
                        return 6;
                    case 14:
                        return 4;
                    case 15:
                        return 3;
                }
            }

            return Math.round(pool / 7);
        }

        public get rows()
        {
            return this.rowsGet(`leaguePrizes`);
        }
    }
</script>

<style lang="stylus" scoped>
    .league-prizes
        flex-direction column
        text-align center

    .text-container
        border 0
        margin-horizontal auto
        padding-vertical 0

        @media (min-width 1024px)
            margin-bottom 15px
            margin-top 40px

    >>> .money
        padding-right 25px
        text-align right

        @media (max-width 949px)
            padding-right 10px

        @media (max-width 399px)
            padding-right 5px

    >>> .place
        text-align center
        width 20%

    >>> .table-container
        margin-horizontal auto
        max-width 620px
        width 100%
</style>
