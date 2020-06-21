<template>
    <section>
        <loading-container :condition="dataLoaded">
            <table-container :table-name="tableName" :columns="columns" :head="true" :rows="rows" :rows-sort-compare-fn="rowsSortCompareFn" :text="text"/>
        </loading-container>
    </section>
</template>

<script lang="ts">
    import {Component}                  from 'vue-property-decorator';
    import {mixins}                     from 'vue-class-component';
    import TableContainer               from '@/components/table/TableContainer.vue';
    import MainMixin                    from '@/mixins/Main';
    import SectionMixin                 from '@/mixins/Section';
    import TableContainerContainerMixin from '@/mixins/TableContainerContainer';

    @Component({
        components: {
            TableContainer
        },
        name: `Players`
    })
    export default class Players extends mixins(MainMixin, SectionMixin, TableContainerContainerMixin)
    {
        public rowsSortCompareFn([, playerA]: [string, PlayerValue], [, playerB]: [string, PlayerValue]): number
        {
            if (playerB.rating === playerA.rating)
            {
                const {users} = this.$store.state;

                return users.value[playerA.userId].username.toLowerCase().localeCompare(users.value[playerB.userId].username.toLowerCase());
            }

            return playerB.rating - playerA.rating;
        }

        public tableName: string = `players`;
        public columns: { [s: string]: ColumnValue } = {
            rank: {
                order: 0,
                orientation: `center`,
                type: `index`
            },
            rating: {
                default: 0,
                fixed: 0,
                order: 2,
                orientation: `center`,
                type: `float`
            },
            userId: {
                order: 1,
                type: `id`
            }
        };

        public get rows()
        {
            return this.$store.state.players.value[this.categoriesActive] || {};
        }
    }
</script>

<style lang="stylus" scoped>
    >>> table
        text-align left

    >>> td
        overflow-wrap break-word

    >>> .rank
        width 15%

    >>> .user-id
        width 70%

        @media (max-width 949px)
            width 85%

    >>> .rating
        width 15%

        @media (max-width 949px)
            width 65px
</style>
