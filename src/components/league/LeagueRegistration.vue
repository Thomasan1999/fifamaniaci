<template>
    <loading-container :condition="dataLoaded && !leagueRegistrationAwaiting">
        <scrollbar-container ref="scrollbarContainer">
            <div class="text-container-container">
                <div class="text-container">
                    <template v-if="/* $store.getters.leagueSeason.quarter !== 1 || $store.getters.leagueSeason.seasonStart.year() !== 2019*/ leagueSeasonLastIs">
                        <h1 v-html="text.title"/>
                        <div class="rules-content">
                            <rule key-clone="leagueRegistrationRules" :text="text.rules.text"/>
                        </div>
                    </template>
                    <p v-if="expired || registration" v-html="placeholder"/>
                    <league-registration-cancellation v-if="registration && !expired" :text="text"/>
                    <div v-else-if="!$store.state.userLogged.loggedIn || !expired" class="main">
                        <registration v-if="!$store.state.userLogged.loggedIn" :league-registration="true"/>
                        <form v-else :action="urlFullGet()" @submit.prevent="formSubmit({alertSuccessful: false, auth: true})">
                            <button class="bordered-button" v-html="new $String(text.button).htmlParse({category})" type="submit"/>
                        </form>
                    </div>
                </div>
            </div>
        </scrollbar-container>
    </loading-container>
</template>

<script lang="ts">
    import {Component, Watch}             from 'vue-property-decorator';
    import {mixins}                       from 'vue-class-component';
    import Registration                   from '@/views/Registration.vue';
    import Rule                           from '@/components/rules/Rule.vue';
    import ScrollbarContainer             from '@/components/scrollbar/ScrollbarContainer.vue';
    import LeagueRegistrationCancellation from '@/components/league/LeagueRegistrationCancellation.vue';
    import MainMixin                      from '@/mixins/Main';
    import LeagueSectionMixin             from '@/mixins/LeagueSection';
    import FormMixin                      from '@/mixins/Form';
    import LeagueRegistrationFormMixin    from '@/mixins/LeagueRegistrationForm';
    // eslint-disable-next-line
    import {VueHttpResponse}              from '@/plugins/VueHttp';

    @Component({
        components: {
            LeagueRegistrationCancellation,
            Rule,
            Registration,
            ScrollbarContainer
        },
        name: `LeagueRegistration`
    })
    export default class LeagueRegistration extends mixins(MainMixin, LeagueSectionMixin, FormMixin, LeagueRegistrationFormMixin)
    {
        public async cancel(): Promise<VueHttpResponse | void>
        {
            return this.$http.delete(this.urlFullGet({tableName: this.tableName, url: this.url}), {
                categoryId: this.categoriesActive,
                auth: this.$store.getters.authData
            }).then(() =>
            {
                this.alertShow({alertType: `leagueRegistrationCanceled`, state: `successful`, targetType: `leagueRegistration`});
            }).catch((res) =>
            {
                if (!res.ok)
                {
                    this.alertShow({alertType: `leagueRegistrationCancellationFailed`, state: `failed`, targetType: `leagueRegistration`});
                }
            });
        }

        public responseOn(res: VueHttpResponse): void
        {
            if (!res.ok)
            {
                this.alertShow({alertType: `leagueRegistrationFailed`, state: `failed`, targetType: `leagueRegistration`});
                return;
            }

            if (this.$store.state.userLogged.verified === false)
            {
                this.alertShow({alertType: `notVerified`, state: `successful`, targetType: `leagueRegistration`});
            }
            else
            {
                this.alertShowSuccessful();
            }

            // window.fbq(`track`, `Purchase`, {value: this.moneyAmount.toString(), currency: `EUR`});

            if (!this.registration)
            {
                this.leagueRegistrationAwaiting = true;
            }
        }

        public tableName: string = `leagueRegistrations`;
        public elements: { [s: string]: FormElement } = {};
        public leagueRegistrationAwaiting: boolean = false;

        public get category(): string
        {
            if (!this.dataLoaded)
            {
                return ``;
            }

            const {categories} = this.$store.state;

            return categories.active ? this.texts.categories[categories.value[categories.active].name] : ``;
        }

        public get expired(): boolean
        {
            return !this.leagueSeasonLastIs || this.$dayjs(this.leagueSeasonLast[1].registrationTo).diff(this.$dayjs()) < 0;
        }

        public get leagueSeasonLast(): [string, DeepReadonlyObject<Omit<LeagueSeasonValue, 'id'>>]
        {
            return this.$store.state.leagueSeasons.lastGet();
        }

        public get leagueSeasonLastIs(): boolean
        {
            return parseInt(this.leagueSeasonLast[0]) === this.seasonId;
        }

        public get placeholder(): string
        {
            if (this.expired)
            {
                return this.text.expired;
            }

            return this.text[this.registration.valid ? `completed` : `notVerified`];
        }

        public get registration(): LeagueRegistrationValue
        {
            return Object.values(this.rowsGet()).find((registration) =>
            {
                return registration.userId === this.$store.state.userLogged.id;
            });
        }

        @Watch('registration')
        public registrationChangeOn(): void
        {
            this.leagueRegistrationAwaiting = false;
        }
    }
</script>

<style lang="stylus" scoped>
    $h1MarginTop = 20px;

    .league-registration
        align-items center
        justify-content center
        text-align center

    >>> .scrollbar-container
        justify-content center

    .text-container-container
        align-items center
        box-sizing border-box
        display flex
        justify-content center
        min-height 100%

        @media (min-width 1024px)
            padding-vertical 80px

    .text-container
        @media (max-width 1023px)
            margin-bottom (18px + $h1MarginTop)

    h1
        font-size 2.5em
        text-align left

        @media (max-width 1023px)
            margin-top 20px

    .rules-content
        margin-bottom 20px

    p
        box-sizing border-box
        margin-horizontal auto

    .main
        margin-top 50px

    button
        background-color $blue
        border-color $blue
        text-transform none
        transition 0.25s

        &:hover
            background-color $blueHover
            border-color $blueHover

    a
        text-decoration underline
</style>
