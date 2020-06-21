<template>
    <div class="lazy-loading">
        <loading/>
    </div>
</template>

<script lang="ts">
    import {Component} from 'vue-property-decorator';
    import {mixins}    from 'vue-class-component';
    import Loading     from './Loading.vue';
    import MainMixin   from '@/mixins/Main';

    @Component({
        components: {
            Loading
        },
        name: `LazyLoading`
    })
    export default class LazyLoading extends mixins(MainMixin)
    {
    }
</script>

<style lang="stylus" scoped>
    .lazy-loading
        flex 0 0 80px
        height 80px
        position relative
        width 100%
</style>
