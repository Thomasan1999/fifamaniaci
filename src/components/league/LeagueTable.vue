<template>
    <div>
        <loading-container :condition="dataLoaded">
            <table-container :table-name="tableName" :columns="columns" :head="thead" :nested-values="nestedValues" :rows="rows"
                             :rows-sort-compare-fn="rowsSortCompareFn" :text="text"/>
        </loading-container>
    </div>
</template>

<script lang="ts">
    import {Component}                  from 'vue-property-decorator';
    import {mixins}                     from 'vue-class-component';
    import TableContainer               from '../table/TableContainer.vue';
    import MainMixin                    from '@/mixins/Main';
    import LeagueSectionMixin           from '@/mixins/LeagueSection';
    import TableContainerContainerMixin from '@/mixins/TableContainerContainer';

    @Component({
        components: {
            TableContainer
        },
        name: `LeagueTable`
    })
    export default class LeagueTable extends mixins(MainMixin, LeagueSectionMixin, TableContainerContainerMixin)
    {
        public rowsSortCompareFn(...args): number
        {
            // @ts-ignore
            return this.$store.state.leagueTableRecords.rowsSortCompareFn(...args);
        }

        public tableName = `leagueTableRecords`;
        public columns = {
            draws: {
                fut: false,
                order: 5,
                type: `integer`
            },
            form: {
                children: {
                    class: {
                        d: `draw`,
                        l: `loss`,
                        otl: `overtime-loss`,
                        otw: `overtime-win`,
                        w: `win`
                    },
                    html: new this.$Object(this.text.form).map(([, column]) =>
                    {
                        return column.short;
                    }).value,
                    title: new this.$Object(this.text.form).map(([, column]) =>
                    {
                        return column.long;
                    }).value,
                    type: `alphabetical`
                },
                display: 450,
                order: 11
            },
            goalDifference: {
                display: 768,
                order: 9,
                signed: true,
                type: `integer`
            },
            losses: {
                order: 7,
                type: `integer`
            },
            matches: {
                order: 2,
                type: `integer`
            },
            overtimeLosses: {
                fut: true,
                order: 6,
                type: `integer`
            },
            overtimeWins: {
                fut: true,
                order: 4,
                type: `integer`
            },
            points: {
                order: 10,
                type: `integer`
            },
            rank: {
                order: 0,
                type: `index`
            },
            score: {
                join: `:`,
                order: 8,
                type: `integer[]`
            },
            userId: {
                dnfShow: true,
                order: 1,
                type: `id`
            },
            wins: {
                order: 3,
                type: `integer`
            }
        };
        thead = true;

        public get rows()
        {
            return this.rowsGet();
        }
    }
</script>

<style lang="stylus" scoped>
    >>> table
        text-align left

    >>> th, >>> td
        overflow-wrap break-word
        text-align center

        &:first-child
            padding-left 0

        &:last-child
            padding-right 0

    >>> .user-id
        text-align left
        width 240px

        @media (max-width 1499px)
            width 200px

        @media (max-width 1249px)
            width 160px

        @media (max-width 679px)
            width 115px

    >>> .score
        @media (max-width 729px)
            width 70px

        @media (max-width 499px)
            width 50px

        @media (max-width 399px)
            width 45px

        @media (max-width 359px)
            width 42px

    >>> .rank, >>> .form
        width 132px

        @media (max-width 1149px)
            width 116px

        @media (max-width 679px)
            width 104px

    >>> .form
        @media (max-width 499px)
            width 93px

    >>> .rank
        @media (max-width 599px)
            width 30px

    >>> td.form
        & > *
            display inline-flex

        span
            font-size .9em
            height 1.4em
            line-height 1.4em
            margin-horizontal 2px
            text-align center
            width 1.4em

            @media (max-width 1149px)
                font-size .8em

            @media (max-width 499px)
                margin-horizontal 1px

    >>> .win
        background-color $green

    >>> .overtime-win
        background linear-gradient(to right, $green 50%, $yellow 50%)

    >>> .draw
        background-color $yellow

    >>> .loss
        background-color $red

    >>> .overtime-loss
        background linear-gradient(to right, $red 50%, $yellow 50%)
</style>
