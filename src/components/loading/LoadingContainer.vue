<template>
    <div class="loading-container">
        <slot v-if="condition"/>
        <loading v-else/>
    </div>
</template>

<script lang="ts">
    import {Component, Prop} from 'vue-property-decorator';
    import {mixins}          from 'vue-class-component';
    import Loading           from '@/components/loading/Loading.vue';
    import MainMixin         from '@/mixins/Main';

    @Component({
        components: {
            Loading
        },
        name: `LoadingContainer`
    })
    export default class LoadingContainer extends mixins(MainMixin)
    {
        @Prop({default: false, type: Boolean}) public readonly condition!: boolean;
    }
</script>

<style lang="stylus" scoped>
    .loading-container
        display flex
        flex-direction column
        flex-grow 1
        max-height 100%
        position relative
        width 100%
</style>
