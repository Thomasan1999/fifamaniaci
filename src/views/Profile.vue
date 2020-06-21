<template>
    <loading-container :condition="userPropsInitialized">
        <scrollbar-container>
            <div class="text-container-container">
                <div class="text-container">
                    <h1 v-html="user ? user.username : $route.params.username"/>
                    <template v-if="userLoggedIs">
                        <form-container/>
                        <!--                        <div class="fb-login-button" data-width="" data-size="large" data-button-type="continue_with" data-auto-logout-link="false"-->
                        <!--                             data-use-continue-as="false" data-scope="user_link"></div>-->
                    </template>
                    <div v-else class="user-other-container">
                        <ul v-if="user">
                            <li v-for="(userProp, userPropName) in userOtherVisibleGet()" :key="userPropName">
                                <span v-html="`${new $String(texts.dictionary[userPropName]).capitalize().htmlParse()}:`"/>
                                <span v-html="new $String(userProp).htmlParse().toString()"/>
                            </li>
                        </ul>
                        <p v-else v-html="texts.profile.userNotFound"/>
                    </div>
                </div>
            </div>
        </scrollbar-container>
    </loading-container>
</template>

<script lang="ts">
    import {Component, Watch} from 'vue-property-decorator';
    import {mixins}           from 'vue-class-component';
    import FormSectionMixin   from '@/mixins/FormSection';
    import FormContainer      from '@/components/FormContainer.vue';
    import ScrollbarContainer from '@/components/scrollbar/ScrollbarContainer.vue';
    import FormMixin          from '@/mixins/Form';
    import MainMixin          from '@/mixins/Main';
    @Component({
        components: {
            ScrollbarContainer,
            FormContainer
        },
        name: `Profile`
    })
    export default class Profile extends mixins(MainMixin, FormMixin, FormSectionMixin)
    {
        public profilePropsCalc(): void
        {
            const {state} = this.$store;

            if (this.profilePropsCalculated || !state.userLogged.username)
            {
                return;
            }

            this.profilePropsCalculated = true;

            const profileProps = Object.keys(this.elements);
            const {userLogged} = state;

            Object.keys(state.userProps).filter((propName) =>
            {
                return userLogged[propName] && (profileProps.includes(propName) || state.userProps[propName]?.nested);
            }).forEach((propName) =>
            {
                const elementUpdate = ({element, value}) =>
                {
                    const valueFull = element.prefix ? `${element.prefix}${value}` : value;

                    this.propertiesUpdate({element, props: {color: ``, valueDefault: valueFull, value: valueFull}});
                };

                if (state.userProps[propName].nested)
                {
                    Object.entries(userLogged[propName]).forEach(([platformName, username]) =>
                    {
                        elementUpdate({element: this.elements[`${propName}${new this.$String(platformName).capitalize()}`], value: username});
                    });
                }
                else
                {
                    elementUpdate({element: this.elements[propName], value: userLogged[propName]});
                }
            });
        }

        public profileUsernameUpdate(): void
        {
            this.$store.commit(`set`, {props: {profileUsername: this.$route.params.username}});
        }

        public responseOn(res: any): void
        {
            if (!res.ok)
            {
                if (res.body.message === `Incorrect password`)
                {
                    this.alertShow({alertType: `passwordIncorrect`, targetType: `passwordCurrent`});
                    return;
                }

                this.alertShow({alertType: `invalid`});
            }
        }

        public submitOn(): void
        {
            const formDataKeys: string[] = Object.keys(this.formData);

            if (formDataKeys.length === 1 && formDataKeys[0] === `passwordCurrent`)
            {
                this.validate();
                return;
            }

            this.formSubmit({auth: this.auth});
        }

        public userOtherVisibleGet(): {
            [s in 'fbLink' | 'usernamesInGamePs' | 'usernamesInGameXbox' | 'usernamesInGamePc']?: string
        }
        {
            if (!this.userPropsInitialized)
            {
                return {};
            }

            const {user} = this;
            const fbLink: string = user?.fbLink ? `\${href|external|${this.elements.fbLink.prefix}${user.fbLink}}` : ``;

            return {
                fbLink,
                usernamesInGamePs: user?.usernamesInGame?.ps,
                usernamesInGameXbox: user?.usernamesInGame?.xbox,
                usernamesInGamePc: user?.usernamesInGame?.pc
            };
        }

        public alertTypesActive: string[] = [`empty`, `short`, `long`, `invalid`, `notFound`, `taken`];
        public auth: boolean = true;
        public method: 'patch' = `patch`;
        public tableName: string = `users`;
        public profilePropsCalculated: boolean = false;
        public url: string = `propsUpdate`;

        public get text()
        {
            return this.texts.profile;
        }

        public get user(): UserValue | null
        {
            const {state} = this.$store;
            const {userLogged} = state;
            const {params} = this.$route;

            const userOtherGet = () =>
            {
                if (!params.username)
                {
                    return null;
                }

                const userEntries = Object.entries(state.users.value as { [s: string]: UserValue }).find(([, user]) =>
                {
                    return user.username.toLowerCase() === params.username.toLowerCase();
                });

                if (!userEntries)
                {
                    return null;
                }

                return {id: userEntries[0], ...userEntries[1]};
            };

            return state.profileUsername === userLogged.username ? userLogged : userOtherGet();
        }

        public get userLoggedIs(): boolean
        {
            return this.user?.username === this.$store.state.userLogged.username;
        }

        public get userPropsInitialized(): boolean
        {
            const {state} = this.$store;
            const {userLogged} = state;

            if (!this.$Tomwork.emptyIs(state.users.value) && this.user === null)
            {
                return true;
            }

            return Boolean(state.profileUsername === userLogged.username ? userLogged.loggedIn && userLogged.email : this.user?.username);
        }

        @Watch('$store.state.profileUsername')
        public async '$store.state.profileUsernameChangeOn'()
        {
            this.$store.dispatch(`titleUpdate`).catch((err) =>
            {
                console.error(err);
            });
        }

        @Watch('$store.state.userLogged.username')
        public async '$store.state.userLogged.usernameChangeOn'()
        {
            if (!this.$route.params.username)
            {
                this.$router.push({name: `profile`, params: {username: this.user?.username || ``}}).catch((err) =>
                {
                    console.error(err);
                });
            }
        }

        public created(): void
        {
            const {getters, state} = this.$store;

            const {userLogged} = state;

            const usernamesInGameColumnsGet = ({platformNames, orderFirst}: { platformNames: string[], orderFirst: number }) =>
            {
                return platformNames.reduce((a, platformName, index) =>
                {
                    const columnName: string = `usernamesInGame${new this.$String(platformName).capitalize()}`;

                    a[columnName] = {
                        reference: true,
                        required: false,
                        order: orderFirst + index,
                        type: columnName,
                        unique: false
                    };

                    return a;
                }, {});
            };

            this.elements = this.elementsCreate({
                email: {
                    order: 0,
                    reference: true,
                    type: `email`,
                    value: userLogged.email,
                    valueDefault: userLogged.email
                },
                fbLink: {
                    reference: true,
                    required: false,
                    order: 2,
                    type: `fbLink`
                },
                passwordCurrent: {
                    labelTop: getters.texts.profile.passwordConfirmation,
                    order: 7,
                    type: `password`
                },
                passwordNew: {
                    order: 1,
                    required: false,
                    type: `password`
                },
                ...usernamesInGameColumnsGet({platformNames: [`ps`, `xbox`, `pc`], orderFirst: 3})
            });

            this.profileUsernameUpdate();
            this.profilePropsCalc();

            const _vm = this;

            this.$store.subscribeAction({
                after({type})
                {
                    if (type === `userPropsUpdate`)
                    {
                        _vm.profilePropsCalc();
                    }
                }
            });
        }
    }
</script>

<style lang="stylus" scoped>
    .loading-container
        height 100%

    .text-container-container
        display flex
        margin auto

        @media (max-width 1023px)
            margin unset

    >>> .text-container
        max-width 700px

        @media (max-width 1023px)
            align-self flex-start

    h1
        margin-bottom (30 / 16 / 2.5) em

    .user-other-container
        text-align left

        ul
            display table

        li
            display table-row
            line-height 2
            list-style none

        span
            display table-cell

            &:first-child
                padding-right .25em
                text-align right

            &:last-child
                font-weight 700
                min-width 16em
</style>
