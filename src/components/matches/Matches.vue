<template>
    <section class="matches">
        <loading-container :condition="dataLoaded">
            <table-container :table-name="tableName" :columns="columns" :form-component="`MatchesFormAdd`" :rows="rows" :rows-sort-compare-fn="rowsSortCompareFn"
                             :start-top-at="startTopAt" :text="text" :types="types">
                <template #bottomRow="{formAdd}">
                    <div class="legend">
                        <p v-if="$store.state.windowWidth > 424" v-html="text.types.localization"/>
                        <div class="type-container-container">
                            <div v-for="([, type], typeIndex) in typesSorted" :key="typeIndex">
                                <div class="legend-circle" :class="new $String(type.name).caseTrainTo().toString()"></div>
                                <p v-html="typeHtmlGet(type)"/>
                            </div>
                        </div>
                    </div>
                    <div v-if="$store.state.userLogged.loggedIn" class="add-match-button-container">
                        <div v-for="([typeId, type], typeIndex) in typesSorted" :key="typeIndex"
                             :class="{[new $String(type.name).caseTrainTo().toString()]: true, disabled: type.disabled}"
                             :title="new $String(text.add).htmlParse({type: text.types[type.name].long || text.types[type.name]})" @click="formAdd(typeId)"
                             @mousedown.prevent><p>+</p>
                        </div>
                    </div>
                </template>
            </table-container>
        </loading-container>
    </section>
</template>

<script lang="ts">
    import {mixins}            from 'vue-class-component';
    import {Component}         from 'vue-property-decorator';
    import MatchesMixin        from '@/mixins/Matches';
    import SectionMixin        from '@/mixins/Section';
    import MatchesSectionMixin from '@/mixins/MatchesSection';
    import TableContainer      from '@/components/table/TableContainer.vue';
    import MainMixin           from '@/mixins/Main';

    @Component({
        components: {
            TableContainer
        },
        name: `Matches`
    })
    export default class Matches extends mixins(MainMixin, SectionMixin, MatchesSectionMixin, MatchesMixin)
    {
        public rowsSortCompareFn([, matchA]: [string, MatchValue], [, matchB]: [string, MatchValue]): number
        {
            const diff: number = this.$dayjs(matchA.playedAt).diff(this.$dayjs(matchB.playedAt));

            if (diff === 0)
            {
                return this.$dayjs(matchA.resultWritten).diff(this.$dayjs(matchB.resultWritten));
            }

            return diff;
        }

        public typeHtmlGet(type: MatchesTypeValue): string
        {
            const typeText: {
                short: string,
                long: string
            } | string = this.text.types[type.name];

            const touchscreenGet: () => string = () =>
            {
                // @ts-ignore
                return this.$store.getters.touchscreen ? typeText.short : typeText.long;
            };

            return typeof typeText === `object` ? touchscreenGet() : typeText;
        }

        public get rows(): {[s: string]: MatchValue}
        {
            return Object.fromEntries(Object.entries((this.$store.state.matches.value[this.categoriesActive] || {}) as {[s: string]: MatchValue}).filter(([, match]) =>
            {
                return match.playedAt;
            }));
        }

        public get typesSorted(): [string, MatchesTypeValue][]
        {
            return Object.entries(this.types as {[s: string]: MatchesTypeValue}).sort(([, typeA], [, typeB]) =>
            {
                return typeA.weight - typeB.weight;
            });
        }
    }
</script>

<style lang="stylus" scoped>
    >>> .played-at
        width 10%

        @media (max-width 1719px)
            width 133px

        @media (max-width 949px)
            width 118px

        @media (max-width 499px)
            width 70px

        @media (max-width 359px)
            width 58px

    >>> .home-id
        flex 3.7 0 0

    .add-match-button-container
        bottom .625em
        display grid
        grid-template-columns repeat(4, 1fr)
        height 2.75em
        position absolute
        right .625em

        @media (max-width 1179px)
            bottom 0
            grid-template-columns repeat(2, 1fr)
            height 100%

        & > *
            border-radius 50%
            cursor pointer
            display inline-block
            font-weight 400
            height 2.75em
            line-height 2.75em
            margin-horizontal 5px
            transition background-color .25s
            width 2.75em

            @media (max-width 1179px)
                margin-vertical .375em

            &.disabled
                filter grayscale(80%)
                pointer-events none

            &:last-child
                margin-right 0

            for type in $matchesTypes
                $color = lookup('$' + type)
                $colorHover = lookup('$' + type + 'Hover')

                &.{type}
                    background-color $color

                    &:hover
                        background-color $colorHover

            & > *
                font-size 1.875em
                height 100%

    >>> .bottom-row
        position relative

        @media (max-width 1179px)
            flex 0 0 7em

    .legend
        align-items flex-start
        display flex
        height 4em
        left .625em
        line-height 4em

        @media (max-width 1179px)
            height 7em
            line-height 3.5em

        p
            padding-horizontal 5px

        & > p
            padding-left 15px

    .type-container-container
        display grid
        grid-template-columns repeat(4, auto)
        word-break keep-all

        @media (max-width 1179px)
            grid-template-columns repeat(2, 1fr)

        & > *
            align-items center
            display flex
            padding-left 10px

    .legend-circle
        border-radius 50%
        height 1.125em
        width 1.125em

        for type in $matchesTypes
            $color = lookup('$' + type)

            &.{type}
                background-color $color
</style>
