<template>
    <router-view v-if="categoriesActive"/>
</template>

<script lang="ts">
    import {mixins}    from 'vue-class-component';
    import {Component} from 'vue-property-decorator';
    import MainMixin   from '@/mixins/Main';

    @Component({
        name: `Category`
    })
    export default class Category extends mixins(MainMixin)
    {
    }
</script>

<style lang="stylus" scoped>
</style>
