<template>
    <div class="loading">
        <div class="loading-icon">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component} from 'vue-property-decorator';
    import {mixins}    from 'vue-class-component';
    import MainMixin   from '@/mixins/Main';

    @Component({
        name: `Loading`
    })
    export default class Loading extends mixins(MainMixin)
    {
    }
</script>

<style lang="stylus" scoped>
    .loading
        height 100%
        left 0
        position absolute
        top 0
        width 100%
        z 2

    .loading-icon
        bottom 0
        height 64px
        left 0
        margin auto
        position absolute
        right 0
        top 0
        width 64px

        div
            animation loading-icon 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite
            border-color #ffffff transparent transparent transparent
            border-radius 50%
            border-width 6px
            box-sizing border-box
            display block
            height 51px
            margin 6px
            position absolute
            width 51px

            &:nth-child(1)
                animation-delay -0.45s

            &:nth-child(2)
                animation-delay -0.3s

            &:nth-child(3)
                animation-delay -0.15s

    @keyframes loading-icon
        0%
            transform rotate(0deg)

        100%
            transform rotate(360deg)
</style>
