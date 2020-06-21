<template>
    <div class="scrollbar-container">
        <slot/>
    </div>
</template>

<script lang="ts">
    import {Component}    from 'vue-property-decorator';
    import {mixins}       from 'vue-class-component';
    import * as zenscroll from 'zenscroll';
    import MainMixin      from '@/mixins/Main';

    @Component({
        name: `ScrollbarContainer`
    })
    export default class ScrollbarContainer extends mixins(MainMixin)
    {
        public scrollMaxGet(): number
        {
            const {clientHeight, scrollHeight} = this.$el;

            return scrollHeight - clientHeight;
        }

        public scrollOn(): void
        {
            this.$emit(`scroll`, this.$el.scrollTop);
        }

        public scroller!: typeof zenscroll;

        public mounted(): void
        {
            this.scroller = this.$scroll.createScroller(this.$el as HTMLElement, 1000, 30);

            this.$el.addEventListener(`scroll`, this.scrollOn);
        }

        public destroyed(): void
        {
            this.$el.removeEventListener(`scroll`, this.scrollOn);
        }
    }
</script>

<style lang="stylus" scoped>
    $scrollbarThumbColor = $blue;
    $scrollbarThumbHoverColor = #0288c6;
    $scrollbarThumbActiveColor = #014e74;
    $scrollbarColor = #eeeeee;

    .scrollbar-container
        align-items flex-start
        box-sizing border-box
        display flex
        height 100%
        justify-content center
        overflow-y auto
        position relative
        scrollbar-color $scrollbarThumbColor $scrollbarColor
        width 100%

    ::-webkit-scrollbar
        background $scrollbarColor

    ::-webkit-scrollbar-thumb
        background $scrollbarThumbColor

        &:hover
            background $scrollbarThumbHoverColor

        &:active
            background $scrollbarThumbActiveColor
</style>
