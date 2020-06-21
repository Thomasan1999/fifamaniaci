<template>
    <div class="league-registrations">
        <loading-container :condition="dataLoaded">
            <table-container :table-name="tableName" :columns="columns" :head="thead" :nested-values="nestedValues" :rows="rows" :rows-sort-compare-fn="rowsSortCompareFn"
                             :text="text"/>
        </loading-container>
    </div>
</template>

<script lang="ts">
    import {Component, Watch}           from 'vue-property-decorator';
    import {mixins}                     from 'vue-class-component';
    import TableContainer               from '../table/TableContainer.vue';
    import LeagueSectionMixin           from '@/mixins/LeagueSection';
    import MainMixin                    from '@/mixins/Main';
    import TableContainerContainerMixin from '@/mixins/TableContainerContainer';

    @Component({
        components: {
            TableContainer
        },
        name: `LeagueRegistrations`
    })
    export default class LeagueRegistrations extends mixins(MainMixin, LeagueSectionMixin, TableContainerContainerMixin)
    {
        public ratingHeadHtmlLongGet(): string
        {
            return `Rating${this.$dayjs().diff(this.$store.getters.leagueSeason.seasonStart) >= 0 ? ` (\${date|d.m.|getters.leagueSeason.seasonStart})` : ``}`;
        }

        public rowsSortCompareFn(...args): number
        {
            // @ts-ignore
            return this.$store.state.leagueRegistrations.rowsSortCompareFn(...args);
        }

        public tableName = `leagueRegistrations`;
        public columns = {
            completed: {
                format: {
                    default: `d.m.yyyy h:mm:ss`,
                    [`767`]: `d.m h:mm`
                },
                order: 3,
                tag: `time`,
                type: `date`
            },
            divisionExpected: {
                order: 4,
                type: `string`
            },
            penaltyPoints: {
                default: 0,
                dnfShow: true,
                order: 5,
                required: false,
                type: `integer`
            },
            rank: {
                order: 0,
                type: `index`
            },
            rating: {
                default: 0,
                fixed: 0,
                head: {
                    html: {
                        long: this.ratingHeadHtmlLongGet(),
                        short: `Rating`
                    }
                },
                order: 2,
                required: false,
                type: `float`
            },
            userId: {
                order: 1,
                type: `id`
            }
        };
        public thead = true;

        public get rows(): { [s: string]: Omit<LeagueRegistrationValue, 'id'> }
        {
            return this.$store.state.leagueRegistrations.rowsGet();
        }

        @Watch('seasonId')
        public seasonIdChangeOn()
        {
            this.columns.rating.head.html.long = this.ratingHeadHtmlLongGet();
        }
    }
</script>

<style lang="stylus" scoped>
    .league-registrations
        flex-direction column

    >>> .rank
        text-align center
        width 13%

        @media (max-width 499px)
            width 35px

        @media (max-width 399px)
            width 33px

        @media (max-width 359px)
            width 31px

    >>> .rating
        @media (max-width 499px)
            width 53px

    >>> .division-expected
        text-align center

        @media (max-width 499px)
            width 35px

        @media (max-width 399px)
            width 33px

        @media (max-width 359px)
            width 31px

    >>> .penalty-points
        text-align center

        @media (max-width 499px)
            width 35px

        @media (max-width 399px)
            width 33px

        @media (max-width 359px)
            width 31px
</style>
