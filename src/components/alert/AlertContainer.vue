<template>
    <div class="alert-container">
        <alert v-for="alert in alerts" :key="alert.id" :id="alert.id" :html="alert.html" :state="stateTypes[alert.state] || stateTypes.failed" @destroy="alertDestroyOn"/>
    </div>
</template>

<script lang="ts">
    import {mixins}    from 'vue-class-component';
    import {Component} from 'vue-property-decorator';
    import Alert       from './Alert.vue';
    import MainMixin   from '@/mixins/Main';

    @Component({
        components: {
            Alert
        },
        name: `AlertContainer`
    })
    export default class AlertContainer extends mixins(MainMixin)
    {
        public alertDestroyOn(alertId: number): void
        {
            this.alerts = this.alerts.filter(({id}) =>
            {
                return id !== alertId;
            });
        }

        public alerts: {id: number, html: string, state: AlertState}[] = [];
        public id: number = 0;
        public readonly stateTypes: {
            [s in AlertState]: {backgroundColor: string, color: string}
        } = {
            failed: {backgroundColor: process.env.VUE_APP_FM_QUALIFICATION, color: `#ffffff`},
            successful: {backgroundColor: process.env.VUE_APP_FM_GREEN, color: `#ffffff`}
        };

        public created(): void
        {
            this.$root.$on(`alert-show`, ({html, state}) =>
            {
                this.alerts.push({id: this.id, html, state});
                this.id += 1;
            });
        }
    }
</script>

<style lang="stylus" scoped>
    .alert-container
        display flex
        flex-direction column
        opacity .95
        position fixed
        right $scrollbarWidth
        top $scrollbarWidth
        width (350px + $scrollbarWidth)
        z 6

        @media (max-width 1023px)
            bottom 15px
            flex-direction column-reverse
            left 0
            margin auto
            right 0
            top auto
            width calc(100% - 30px)
</style>
