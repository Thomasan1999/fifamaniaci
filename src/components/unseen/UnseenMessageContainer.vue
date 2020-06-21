<template>
    <div class="unseen-message-container">
        <unseen-message v-for="type in $store.state.unseenTypes" :key="type" :table-name="tableName" :count="count[type]" :text="text[type] || text" :type="type"/>
    </div>
</template>

<script lang="ts">
    import {Component, Prop} from 'vue-property-decorator';
    import {mixins}          from 'vue-class-component';
    import MainMixin         from '@/mixins/Main';
    import UnseenMessage     from '@/components/unseen/UnseenMessage.vue';

    @Component({
        components: {
            UnseenMessage
        },
        name: `UnseenMessageContainer`
    })
    export default class UnseenMessageContainer extends mixins(MainMixin)
    {
        @Prop({required: true, type: String}) public readonly tableName!: string;
        @Prop({required: true, type: Object}) public readonly count!: { general: number, pesronal: number };
        @Prop({required: true, type: Object}) public readonly text!: any;
    }
</script>

<style lang="stylus" scoped>
    .unseen-message-container
        display flex
        flex-direction column
        left 50%
        position absolute
        top 40px
        transform translateX(-50%)
        z 1
</style>
