<template>
    <div class="bar-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 20">
            <rect v-for="e in new $Range(0, 2).enumerate()" :key="e" fill="#ffffff" height="3" width="25" rx="3" ry="3" :y="8.5 * e"/>
        </svg>
    </div>
</template>

<script lang="ts">
    import {mixins}    from 'vue-class-component';
    import {Component} from 'vue-property-decorator';
    import MainMixin   from '@/mixins/Main';

    @Component({
        name: `BarIcon`
    })
    export default class BarIcon extends mixins(MainMixin)
    {
    }
</script>

<style lang="stylus" scoped>
    .bar-icon
        bottom 0
        height $barIconHeight
        left 0
        margin auto
        position absolute
        right 0
        top 0
        transition .5s
        width $barIconWidth
</style>
