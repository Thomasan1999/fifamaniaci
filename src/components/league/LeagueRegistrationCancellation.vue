<template>
    <form class="league-registration-cancellation" :action="urlFullGet()" @submit.prevent="formSubmit({alertSuccessful: false, auth: true})">
        <button class="cancel" v-html="text.cancel"/>
    </form>
</template>

<script lang="ts">
    import {Component, Prop} from 'vue-property-decorator';
    import {mixins}          from 'vue-class-component';
    import FormMixin         from '@/mixins/Form';
    import MainMixin         from '@/mixins/Main';

    @Component({
        name: `LeagueRegistrationCancellation`
    })
    export default class LeagueRegistrationCancellation extends mixins(MainMixin, FormMixin)
    {
        @Prop({required: true, type: Object}) public readonly text!: any;

        responseOn(res: any): void
        {
            if (!res.ok)
            {
                this.alertShow({alertType: `leagueRegistrationCancellationFailed`, state: `failed`, targetType: `leagueRegistration`});
                return;
            }

            this.alertShow({alertType: `leagueRegistrationCanceled`, state: `successful`, targetType: `leagueRegistration`});
        }
        public tableName = `leagueRegistrations`;
        public elements = {};
        public method: 'delete' = `delete`
    }
</script>

<style lang="stylus" scoped>
    .league-registration-cancellation
        margin-top 10px

    .cancel
        background-color transparent
        text-decoration underline

        &:hover
            background-color transparent
            color lighten($tableLight, 50%)
</style>
