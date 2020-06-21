<template>
    <section>
        <loading-container :condition="dataLoaded">
            <scrollbar-container ref="scrollbarContainer">
                <div class="rules-content">
                    <rule key-clone="rules" :text="text.text"/>
                </div>
            </scrollbar-container>
        </loading-container>
    </section>
</template>

<script lang="ts">
    import {Component}        from 'vue-property-decorator';
    import {mixins}           from 'vue-class-component';
    import Rule               from './Rule.vue';
    import ScrollbarContainer from '../scrollbar/ScrollbarContainer.vue';
    import SectionMixin       from '@/mixins/Section';

    @Component({
        components: {
            Rule,
            ScrollbarContainer
        },
        name: `Rules`
    })
    export default class Rules extends mixins(SectionMixin)
    {
    }
</script>

<style lang="stylus" scoped>
    .rules-content
        padding 40px

        @media (max-width 949px)
            padding 15px
</style>
