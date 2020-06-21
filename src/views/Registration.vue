<template>
    <form-section :section-is="!leagueRegistration"/>
</template>

<script lang="ts">
    import {Component, Prop} from 'vue-property-decorator';
    import {mixins}          from 'vue-class-component';
    import FormSectionMixin  from '@/mixins/FormSection';
    import FormMixin         from '@/mixins/Form';
    import FormSection       from '@/components/FormSection.vue';
    import MainMixin         from '@/mixins/Main';

    @Component({
        components: {
            FormSection
        },
        name: `Registration`
    })
    export default class Registration extends mixins(MainMixin, FormMixin, FormSectionMixin)
    {
        @Prop({default: false, type: Boolean}) public readonly leagueRegistration!: boolean;

        public responseOn(res: any): void
        {
            if (!res.ok)
            {
                return;
            }

            window.fbq(`track`, `CompleteRegistration`);

            // this.$store.dispatch(`login`, res).catch((err) =>
            // {
            //     console.error(err);
            // });
        }

        public alertSuccessful: boolean = false;
        public tableName: string = `users`;

        public alertTypesActive: string[] = [`empty`, `taken`, `short`, `long`, `invalid`];

        public get categoryInclude(): boolean
        {
            return this.leagueRegistration;
        }

        public created(): void
        {
            this.elements = this.elementsCreate({
                email: {
                    order: 1,
                    type: `email`
                },
                password: {
                    order: 2,
                    type: `password`
                },
                username: {
                    order: 0,
                    type: `username`
                }
            });

            if (this.leagueRegistration)
            {
                this.elementsExtra = this.elementsCreate({
                    leagueRegistration: {
                        value: true
                    }
                });
            }
        }
    }
</script>

<style lang="stylus" scoped>
</style>
