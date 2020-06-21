<template>
    <section>
        <loading-container :condition="dataLoaded">
            <tab-container ref="tabContainer" :table-name="tableName" :tabs="tabs" :tabs-active="tabsActive" :tabs-names="tabsNames" :text="text"
                           :updatable="true" @delete="tabDeleteOn" @tab-add-click="tabAddClickOn">
                <template #special>
                    <span class="connectivity" :class="{online: onlineCount, offline: !onlineCount}"/>
                    <span v-html="onlineCount"/>
                    <font-awesome-icon class="users" :icon="[`fas`, `users`]" :title="new $String(text.onlineCount).htmlParse().toString()"/>
                </template>
                <template #add>
                    <form @submit.prevent="submitOn">
                        <input :maxlength="element.length.max" ref="tabAddInput" :type="element.input" :value="element.value"
                               @blur="blurOnCustom" @focus="focusOn" @input="inputOn">
                        <user-dropdown v-if="element.dropdown.visibility && element.value" :key-mode="keyMode" :users="usersByStringGet()"
                                       @blur="userBlurOn({element})" @click="userClickOnCustom"/>
                    </form>
                </template>
            </tab-container>
            <loading-container :condition="!loading">
                <table-container :table-name="tableName" :columns="columns" :nested-values="[tabId]" :placeholder="placeholder" ref="tables"
                                 :rows="rows" :rows-sort-compare-fn="rowsSortCompareFn" :text="text" :start-top-at="false">
                    <template v-if="$store.state.userLogged.loggedIn" #bottomRow>
                        <messages-form-add :addressee-id="addresseeId" :tab-id="tabId" :text="text"/>
                    </template>
                </table-container>
            </loading-container>
        </loading-container>
    </section>
</template>

<script lang="ts">
    import {mixins}                     from 'vue-class-component';
    import {Component}                  from 'vue-property-decorator';
    import MessagesFormAdd              from '@/components/messages/MessagesFormAdd.vue';
    import TabContainer                 from '@/components/TabContainer.vue';
    import TableContainer               from '@/components/table/TableContainer.vue';
    import UserDropdownContainerMixin   from '@/mixins/UserDropdownContainerMixin';
    import UserDropdown                 from '@/components/UserDropdown.vue';
    import MainMixin                    from '@/mixins/Main';
    import SectionMixin                 from '@/mixins/Section';
    import FormMixin                    from '@/mixins/Form';
    import TabContainerContainerMixin   from '@/mixins/TabContainerContainer';
    import TableContainerContainerMixin from '@/mixins/TableContainerContainer';

    @Component({
        components: {
            MessagesFormAdd,
            TabContainer,
            TableContainer,
            UserDropdown
        },
        name: `Messages`
    })
    export default class Messages extends mixins(MainMixin, SectionMixin, FormMixin, TabContainerContainerMixin, TableContainerContainerMixin, UserDropdownContainerMixin)
    {
        public blurOnCustom(): void
        {
            this.blurOn({element: this.element});
            this.keyMode = `section`;
        }

        public clickOn($event: Merge<MouseEvent, {target: HTMLElement}>): void
        {
            if (!$event.target.closest(`.tab-add, .tab-add-add`))
            {
                this.formEmpty();
            }
        }

        public focusOn(): void
        {
            this.keyMode = `input`;
            this.element.dropdown.visibility = true;
        }

        public formEmpty(): void
        {
            const {element} = this;

            this.propertiesUpdate({element, props: {id: ``, value: ``}});

            if (this.$refs.tabContainer)
            {
                // @ts-ignore
                this.$refs.tabContainer.tabAddClicked = false;
            }
        }

        public inputOn($event: Merge<KeyboardEvent, {target: HTMLInputElement}>): void
        {
            this.focusOn();
            this.propertiesUpdate({element: this.element, props: {value: $event.target.value}});
        }

        public responseOn(res: any): void
        {
            const {dispatch} = this.$store;

            this.submitted = false;

            const [tabId] = Object.keys(res.body);

            const {tableName} = this;

            dispatch(`tabCreate`, {categoryId: this.categoriesActive, tableName, nestedValues: [Number(tabId)], res}).catch((err) =>
            {
                console.error(err);
                return Promise.reject(err);
            });

            this.formEmpty();
            dispatch(`tabsActiveSet`, {tabId, tabsTableName: this.tabsTableName}).catch((err) =>
            {
                console.error(err);
                return Promise.reject(err);
            });
        }

        public rowsSortCompareFn([, messagesA]: [string, MessageValue], [, messagesB]: [string, MessageValue]): number
        {
            return messagesA.created.valueOf() - messagesB.created.valueOf();
        }

        public submitOn(): void
        {
            if (this.submitted)
            {
                return;
            }

            if (!this.element.id)
            {
                this.alertShow({alertType: `notFound`, state: `failed`, targetType: `username`});
                return;
            }

            this.submitted = true;
            this.formSubmit({alertSuccessful: false, auth: true, tableName: `messagesTabs`});
        }

        public userClickOnCustom(user: UserValue): void
        {
            this.userClickOn({element: this.element, user});
            this.submitOn();
        }

        public usersByStringGet(limit: number = 5): {[s: string]: UserValue}
        {
            const {state} = this.$store;

            if (!this.element.value)
            {
                return {};
            }

            return Object.fromEntries(Object.entries(state.users.value as {[s: string]: UserValue}).filter(([userId, user]) =>
            {
                const addresseeStartsWith: boolean = user.username.toLowerCase().startsWith(this.element.value.toLowerCase());

                return addresseeStartsWith && Number(userId) !== state.userLogged.id && !Object.values(this.tabs).map(([, tab]) =>
                {
                    return tab.addresseeId;
                }).includes(userId);
            }).slice(0, limit));
        }

        public validityGet({element: {name, required, validateRegex}}: {element: FormElement}): boolean
        {
            return (validateRegex.test(this.formData[name]) || (!this.formData[name] && !required));
        }

        public columns: {[s: string]: ColumnValue} = {
            created: {
                format: {
                    default: `d.m.yyyy h:mm:ss`,
                    [`680`]: `d.m. h:mm`
                },
                order: 0,
                tag: `time`,
                type: `date`
            },
            createdById: {
                adminShow: true,
                connectivityShow: true,
                order: 1,
                type: `id`
            },
            message: {
                order: 2,
                type: `message`
            }
        };

        public keyMode: string = `section`;

        public sectionName = `messages`;
        public $refs!: {
            tabContainer: TabContainer
        };

        public submitted: boolean = false;
        public tabLoaded: boolean = true;
        public tableName: string = `messages`;

        public readonly tabsTableName = `messagesTabs`;

        public get addresseeId(): number
        {
            return this.$store.state.messagesTabs.value[this.categoriesActive]?.[this.tabId].addresseeId;
        }

        public get element()
        {
            return this.elements.addresseeId as Merge<FormElement, {dropdown: {visibility: boolean}}>;
        }

        public get loading(): boolean
        {
            return this.$Tomwork.emptyIs(this.rows) && this.$store.state.messages.loading[this.categoriesActive]?.[this.tabId];
        }

        public get onlineCount(): number
        {
            return Object.values(this.$store.state.users.value as {[s: string]: UserValue}).filter((user) =>
            {
                return user.online?.includes(this.categoriesActive);
            }).length;
        }

        public get placeholder(): string
        {
            const {state} = this.$store;

            if (this.$Tomwork.emptyIs(state.users.value) || !state.users.value[this.addresseeId])
            {
                return ``;
            }

            const addressee: string = state.users.value[this.addresseeId].username;
            return new this.$String(this.text.placeholder[this.nestedValues[0] === -1 ? `general` : `personal`]).htmlParse({addressee}).toString();
        }

        public get rows(): {[s: string]: Omit<MessageValue, 'id'>} | {}
        {
            return this.$store.state.messages.value[this.categoriesActive]?.[this.tabId] || {};
        }

        public get tabId(): number
        {
            return this.$route.meta.tabId;
        }

        public get tabs(): [string, any][]
        {
            return Object.entries(this.$store.state.messagesTabs.value[this.categoriesActive] || {}).sort(([tabAId], [tabBId]) =>
            {
                if (parseInt(tabAId) === -1)
                {
                    return -1;
                }

                if (parseInt(tabBId) === -1)
                {
                    return 1;
                }

                return 0;
            });
        }

        created()
        {
            // @ts-ignore
            window.addEventListener(`click`, this.clickOn);
            this.elements = this.elementsCreate({
                addresseeId: {
                    dropdown: {
                        visibility: false
                    },
                    type: `id`
                }
            });
        }

        destroyed()
        {
            // @ts-ignore
            window.removeEventListener(`click`, this.clickOn);
        }
    }
</script>

<style lang="stylus" scoped>
    >>> table
        text-align left

    >>> .created
        padding-left 25px
        width 200px

        @media (max-width 1249px)
            width 180px

        @media (max-width 949px)
            padding-left 10px
            width 175px

        @media (max-width 679px)
            width 100px

        @media (max-width 499px)
            width 90px

        @media (max-width 399px)
            padding-left 5px
            width 85px

    >>> .created-by-id
        width 240px

        @media (max-width 1499px)
            width 200px

        @media (max-width 1249px)
            width 160px

        @media (max-width 679px)
            width 115px

        @media (max-width 499px)
            width 100px

        @media (max-width 399px)
            width 90px

        @media (max-width 359px)
            width 80px

    >>> .text
        width 70%

        @media (max-width 1249px)
            width 100%
</style>
