<template>
    <span class="unseen-box-container">
        <span v-for="type in $store.state.unseenTypes" :key="type" v-show="count[type]" :class="type" v-html="count[type]"/>
    </span>
</template>

<script lang="ts">
    import {Component, Prop} from 'vue-property-decorator';
    import {mixins}          from 'vue-class-component';
    import MainMixin         from '@/mixins/Main';

    @Component({
        name: `UnseenBoxContainer`
    })
    export default class UnseenBoxContainer extends mixins(MainMixin)
    {
        @Prop({
            default()
            {
                return {general: 0, personal: 0};
            },
            type: Object
        }) public readonly count!: { general: number, personal: number };
    }
</script>

<style lang="stylus" scoped>
    $unseenPadding = .2em;

    .unseen-box-container
        align-items center
        box-sizing border-box
        display flex
        height 100%
        justify-content flex-end
        left 0
        position absolute
        top 0
        width 100%

        span
            box-sizing border-box
            flex-basis auto
            font-size .8em
            height (1 + ($unseenPadding * 2))
            line-height (1 + ($unseenPadding * 2))
            margin-right 5px
            min-width (1 + ($unseenPadding * 2))
            padding-horizontal $unseenPadding
            text-align center

        .general
            background-color $general

        .personal
            background-color $personal
</style>
