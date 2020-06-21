<template>
    <form class="logout-form" :action="urlFullGet()">
        <a href="" v-html="texts.user.logout" @click.prevent="formSubmit({auth: true})"/>
    </form>
</template>

<script lang="ts">
    import {mixins}                   from 'vue-class-component';
    import {Component}                from 'vue-property-decorator';
    import MainMixin                  from '@/mixins/Main';
    import RegistrationLoginFormMixin from '@/mixins/RegistrationLoginForm';

    @Component({
        name: `LogoutForm`
    })
    export default class LogoutForm extends mixins(MainMixin, RegistrationLoginFormMixin)
    {
        public async responseOn(res): Promise<void>
        {
            if (!res.ok)
            {
                return;
            }

            return this.$store.dispatch(`logout`).catch((err) =>
            {
                console.error(err);
                return Promise.reject(err);
            });
        }

        public tableName: string = `users`;
        public method: 'patch' = `patch`;
        public url: string = `logout`;
    }
</script>

<style lang="stylus" scoped>
</style>
