<template>
    <div class="table-container">
        <unseen-message-container v-if="!$Tomwork.emptyIs(unseen)" :table-name="tableName" :count="unseen" :text="text.unseen"/>
        <scrollbar-container ref="scrollbarContainer" @scroll="scrollOn">
            <div v-if="!$Tomwork.emptyIs(rows) || !$Tomwork.emptyIs(rowsExtra)" class="lazy-loading-container">
                <lazy-loading v-if="!finished && loadingHas" :style="{order: startTopAt ? 1 : -1}"/>
                <table ref="table">
                    <thead v-if="head">
                    <tr-component v-bind="{columnsFilteredEntries}" :children="`th`"/>
                    </thead>
                    <tr-component v-for="([rowId, row], index) in rowsEntries" :key="rowId" v-bind="{columnsFilteredEntries, index, row, rowId}"
                                  :class="$Tomwork.emptyIs(types) ? `` : [new $String(types[row.typeId].name).caseTrainTo().toString()]" :children="`td`"/>
                    <component v-for="row in rowsExtra" :key="`form-${row.id}`" :is="formComponent" :id="row.id" :columns="columns" :key-mode="keyMode"
                               :type-id="row.typeId" @delete="formDelete" @input-focus="inputFocusOn" @response="formResponseOn" @submit="formSubmitOn"/>
                </table>
            </div>
            <div v-else class="text-container">
                <p v-html="new $String(placeholder || text.placeholder).htmlParse()" @click.prevent.stop="placeholderClickOn"/>
            </div>
        </scrollbar-container>
        <div v-if="$scopedSlots.bottomRow" class="bottom-row">
            <slot name="bottomRow" :formAdd="formAdd"/>
        </div>
    </div>
</template>

<script lang="ts">
    import {mixins}                 from 'vue-class-component';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import LazyLoading              from '@/components/loading/LazyLoading.vue';
    import MatchesFormAdd           from '@/components/matches/MatchesFormAdd.vue';
    import ScrollbarContainer       from '@/components/scrollbar/ScrollbarContainer.vue';
    import TrComponent              from '@/components/table/TrComponent.vue';
    import UnseenMessageContainer   from '@/components/unseen/UnseenMessageContainer.vue';
    import UsernameContainer        from '@/components/UsernameContainer.vue';
    import MainMixin                from '@/mixins/Main';
    // eslint-disable-next-line
    import {VueHttpResponse}        from '@/plugins/VueHttp';

    @Component({
        components: {
            LazyLoading,
            MatchesFormAdd,
            ScrollbarContainer,
            TrComponent,
            UnseenMessageContainer,
            UsernameContainer
        },
        name: `TableContainer`
    })
    export default class TableContainer extends mixins(MainMixin)
    {
        @Prop({required: true, type: Object}) public readonly columns!: { [s: string]: ColumnValue };
        @Prop({type: String}) public readonly formComponent?: string;
        @Prop({type: Boolean}) public readonly head?: boolean;
        @Prop({
            default()
            {
                return [];
            },
            type: Array
        }) public readonly nestedValues!: number[];
        @Prop({type: String}) public readonly placeholder?: string;
        @Prop({required: true, type: Object}) public readonly rows!: { [s: string]: any };
        @Prop({type: Function}) public readonly rowsSortCompareFn?: (...args) => number;
        @Prop({default: true, type: Boolean}) public readonly startTopAt!: boolean;
        @Prop({required: true, type: String}) public readonly tableName!: string;
        @Prop({required: true, type: Object}) public readonly text!: any;
        @Prop({
            default()
            {
                return {};
            },
            type: Object
        }) public readonly types!: { [s: string]: any };

        public clickOn($event: Merge<MouseEvent, { target: HTMLElement }>): void
        {
            if (!$event.target.closest(`tr`)?.className.includes(`form`))
            {
                this.keyMode = `rows`;
            }
        }

        public eventListenersSwitch(type: 'add' | 'remove'): void
        {
            [`click`, `keydown`].forEach((event) =>
            {
                window[`${type}EventListener`](event, this[`${event}On`]);
            });
        }

        public formAdd(typeId: number | string): void
        {
            const {commit, state} = this.$store;

            if (!state.userLogged.loggedIn)
            {
                return;
            }

            this.keyMode = `input`;
            commit(`set`, {props: {keyMode: `section`}});
            this.rowsExtra.push({component: this.formComponent, id: this.rowsExtra.length, typeId});
        }

        public async formDelete(formId: number): Promise<void>
        {
            this.rowsExtra = this.rowsExtra.filter((row) =>
            {
                return row.id !== formId;
            });
        }

        public formResponseOn({formId, res}: { formId: number, res: VueHttpResponse }): void
        {
            if (res.ok)
            {
                this.formDelete(formId);
            }
        }

        public formSubmitOn(): void
        {
            this.keyMode = `rows`;
            this.scrolledEndTo = false;
        }

        public inputFocusOn(): void
        {
            this.keyMode = `input`;
        }

        public keydownOn($event: KeyboardEvent): void
        {
            const {state} = this.$store;

            if (state.keyMode !== `section` || this.keyMode !== `rows` || document.activeElement?.tagName === `INPUT` || !state.userLogged.loggedIn || !this.formComponent)
            {
                return;
            }

            const keyNumber: number = parseInt($event.code.replace(`Digit`, ``));

            if (keyNumber <= Object.keys(this.types).length)
            {
                const [typeId] = Object.entries(this.types).sort(state[`${this.tableName}Types`].rowsSortCompareFn)[keyNumber - 1];
                $event.preventDefault();
                this.formAdd(typeId);
            }
            else if ($event.key === `Delete`)
            {
                this.rowsExtra.pop();
            }
        }

        public placeholderClickOn($event: Merge<MouseEvent, { target: HTMLElement }>): void
        {
            const href = $event.target.getAttribute(`href`);

            if (!href)
            {
                return;
            }

            this.$router.push(href).catch((err) =>
            {
                console.error(err);
            });
        }

        public scrollEndTo(): void
        {
            this.$nextTick(() =>
            {
                // @ts-ignore
                const scrollMax: number = this.$refs.scrollbarContainer.scrollMaxGet();

                if (scrollMax <= 0)
                {
                    return;
                }

                // @ts-ignore
                this.$refs.scrollbarContainer.scroller.toY(this.startTopAt ? 0 : scrollMax, 0);
                this.scrolledEndTo = true;
            });
        }

        public scrollOn(): void
        {
            const {scrollTop} = this.$refs.scrollbarContainer.$el;
            // @ts-ignore
            const scrollMax: number = this.$refs.scrollbarContainer.scrollMaxGet();

            if (this.loadingHas && !this.finished && !this.lazyLoading && (this.startTopAt ? scrollTop >= scrollMax - 80 : scrollTop <= 80))
            {
                this.lazyLoading = true;
                this.scrollToReversedLast = scrollMax - scrollTop;
                this.scrollToLast = scrollTop;

                const {tableName, nestedValues} = this;

                this.$store.dispatch(`get`, {tableName, nestedValues}).catch((err) =>
                {
                    console.error(err);
                });
            }

            this.scrolled = (scrollMax >= 0) && ((this.startTopAt && scrollTop !== 0) || (!this.startTopAt && scrollMax !== scrollTop));
            this.scrolledEndTo = this.scrolled;

            if (!this.scrolled)
            {
                this.unseenCountCheck();
            }
        }

        public unseenCountCheck(): void
        {
            if (!this.$store.state[this.tableName]?.unseen || document.hidden || !this.unseen)
            {
                return;
            }

            const {tableName, nestedValues} = this;

            const rowIds: number[] = this.rowsEntries.filter(([, row]) =>
            {
                return row.unseen;
            }).map(([rowId]) =>
            {
                return Number(rowId);
            });

            if (this.$Tomwork.emptyIs(rowIds))
            {
                return;
            }

            this.$store.dispatch(`unseenCountZero`, {categoryId: this.categoriesActive, tableName, nestedValues, rowIds}).catch((err) =>
            {
                console.error(err);
            });
        }

        public update(): void
        {
            this.unseenCountCheck();

            if (this.lazyLoading)
            {
                this.lazyLoading = false;

                this.$nextTick(() =>
                {
                    // @ts-ignore
                    const scrollMax: number = this.$refs.scrollbarContainer.scrollMaxGet();

                    if (scrollMax <= 0)
                    {
                        return;
                    }

                    // @ts-ignore
                    this.$refs.scrollbarContainer.scroller.toY(this.startTopAt ? this.scrollToLast : scrollMax - this.scrollToReversedLast, 0);
                });
            }

            if (!this.scrolledEndTo && !this.$Tomwork.emptyIs(this.rows))
            {
                this.scrollEndTo();
            }
        }

        public keyMode: string = `rows`;
        public lazyLoading: boolean = false;

        public $refs!: {
            scrollbarContainer: InstanceType<typeof ScrollbarContainer>
        };

        public rowsExtra: any[] = [];
        public scrolled: boolean = false;
        public scrollToLast: number = 0;
        public scrollToReversedLast: number = 0;
        public scrolledEndTo: boolean = false;

        public get columnsFilteredEntries()
        {
            return Object.entries(this.columns).filter(([, column]) =>
            {
                return typeof column.fut === `undefined` ? true : column.fut === this.fut;
            }).sort(([, columnA], [, columnB]) =>
            {
                return columnA.order - columnB.order;
            });
        }

        public get finished()
        {
            const table = this.$store.state[this.tableName] || {};

            if (!table.finished)
            {
                return true;
            }

            return new this.$Object(table.categoryHas ? table.finished[this.categoriesActive] : table.finished).findNested(this.nestedValues);
        }

        public get loadingHas(): boolean
        {
            return Boolean(this.$store.state[this.tableName]?.loading);
        }

        public get rowsEntries()
        {
            const rowsEntries = Object.entries(this.rows);

            if (this.rowsSortCompareFn)
            {
                rowsEntries.sort(this.rowsSortCompareFn);
            }

            return rowsEntries;
        }

        public get unseen()
        {
            const table = this.$store.state[this.tableName];

            if (table)
            {
                return new this.$Object(table.categoryHas ? table.unseen[this.categoriesActive] : table.unseen).findNested(this.nestedValues);
            }

            const routeCaseCamelSplit = new this.$String(this.$route.name as string).caseCamelSplit();

            return this.$store.getters[`${routeCaseCamelSplit[0]}Unseen`]?.[routeCaseCamelSplit[1].capitalize().toString()] || null;
        }

        @Watch('categoriesActive')
        categoriesActiveChangeOn()
        {
            this.scrolledEndTo = false;
        }

        @Watch('$store.state.userLogged.loggedIn')
        '$store.state.userLogged.loggedInChangeOn'()
        {
            if (!this.$store.state.userLogged.loggedIn)
            {
                this.rowsExtra = [];
            }
        }

        @Watch('rows')
        rowsChangeOn()
        {
            this.update();
        }

        public created(): void
        {
            this.eventListenersSwitch(`add`);

            this.$root.$on(`submit`, () =>
            {
                this.scrolledEndTo = false;
            });

            window.addEventListener(`visibilitychange`, this.unseenCountCheck);
        }

        public mounted(): void
        {
            this.update();

            // @ts-ignore
            this.$refs.scrollbarContainer.scroller.toY(this.$refs.scrollbarContainer.$el.scrollTop, 0);
        }

        public destroyed(): void
        {
            this.eventListenersSwitch(`remove`);
            this.$root.$off(`submit`);
            window.removeEventListener(`visibilitychange`, this.unseenCountCheck);
        }
    }
</script>


<style lang="stylus" scoped>
    .table-container
        box-sizing border-box
        display flex
        flex-direction column
        flex-grow 1

    $borderSpacingVertical = 4px;

    .scrollbar-container
        flex 1 0 0
        overflow-x hidden
        padding-vertical 6px

    .lazy-loading-container
        display flex
        flex-direction column
        height 100%
        width 100%

    table
        border-collapse separate
        border-spacing 0 $borderSpacingVertical
        box-sizing border-box
        padding-horizontal 10px
        table-layout fixed
        width 100%

    >>> tr
        line-height 2.5em

        &:nth-child(even)
            background-color $tableLight

        &:nth-child(odd)
            background-color $tableDark

        &:first-child
            th, td
                margin-top 0

        &:last-child
            td
                margin-bottom 0

    >>> th, >>> td
        box-sizing border-box
        overflow-wrap break-word
        position relative
        text-align left
        vertical-align middle

        & > *
            display block
            margin-horizontal 5px

            @media (max-width 399px)
                margin-horizontal 3px

    >>> .left-oriented
        text-align left

        &:first-child
            padding-left 25px

            @media (max-width 949px)
                padding-left 10px

            @media (max-width 399px)
                padding-left 5px

    >>> .center-oriented
        text-align center

    >>> .right-oriented
        text-align right

        &:last-child
            padding-right 25px

            @media (max-width 949px)
                padding-right 10px

            @media (max-width 399px)
                padding-right 5px

    >>> .colon
        text-align center
        white-space nowrap
        width 7px

        @media (max-width 359px)
            width 6px

    >>> .margin-none
        & > *
            margin 0

    .bottom-row
        background-color $tabGray
        box-shadow $boxShadowTop
        display flex
        flex 0 0 4em
        z 2

    >>> .username-container
        &, *
            word-break break-all
</style>
