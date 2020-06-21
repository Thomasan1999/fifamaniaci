<template>
    <tr class="matches-form-add" :class="new $String(type.name).caseTrainTo().toString()">
        <td v-for="(element, elementName) in elements" :key="elementName" :class="tdClassGet({column: columns[elementName], columnName: elementName})"
            :style="columns[elementName].style">
            <matches-form-add-tooltip v-if="element.tooltip" v-show="element.visibility" :html-name="idGet({elementName})" :username="elements[`${sideGet(element.name)}Id`].value"
                                      :text="text" :visibility="element.visibility" @delete="(props) => tooltipDeleteOn({element, props})"
                                      @submit="(value) => tooltipSubmitOn({element, value})"/>
            <div v-else-if="element.tag === `input`" v-show="element.input !== `checkbox` || element.visibility"
                 :class="{[`user-dropdown-container`]: element.dropdown && element.dropdown.visibility && element.value}">
                <datepicker v-if="elementName === `playedAt`" calendar-class="datepicker-calendar" :class="datepickerClassGet()" :disabled-dates="element.disabledDates"
                            :format="`d. M. ${$store.state.windowWidth > 499 ? `yyyy` : ``}`" :full-month-name="true" :monday-first="true" :language="text.datepicker"
                            ref="elements" :value="element.value" wrapper-class="datepicker"
                            @input="propertiesUpdate({element, props: {value: $dayjs($event).startOf(`d`).format()}})"/>
                <input v-else ref="elements" :autocomplete="element.autocomplete" :checked="element.value"
                       :disabled="element.disabled" :id="idGet({elementName})" :maxlength="element.length.max" :min="element.min"
                       :placeholder="(text[elementName] && text[elementName].localization) || text[elementName]" :style="{textAlign: columns[elementName].orientation}"
                       :type="element.input" :value="element.value" @blur="blurOnCustom({$event, element})" @focus="focusOn({element})" @input="inputOn({$event, element})"/>
                <label v-if="element.input === `checkbox`" :for="idGet({elementName})" ref="elements" @mousedown.prevent>
                    <font-awesome-icon v-if="elementName.includes(`Canceled`)" :icon="[`fas`, `exclamation-triangle`]"/>
                    <span v-else v-html="text.overtime.localization" :title="text.overtime.title"/>
                </label>
                <user-dropdown v-else-if="element.dropdown && element.dropdown.visibility && element.value" :key-mode="keyMode" :users="sideUsers[elementName]"
                               @blur="userBlurOn({element})" @click="(user) => userClickOn({element, user})"/>
            </div>
            <span v-else ref="elements" v-html="element.value"/>
        </td>
        <template v-for="columnName in [`submit`, `delete`]">
            <td :class="tdClassGet({column: columns[columnName], columnName})" :key="columnName" v-html="columns[columnName].html" @click.stop="clickOn" @mousedown.prevent/>
        </template>
    </tr>
</template>

<script lang="ts">
    import {Component, Prop, Watch}   from 'vue-property-decorator';
    import {mixins}                   from 'vue-class-component';
    import Datepicker                 from 'vuejs-datepicker';
    import MatchesFormAddTooltip      from '@/components/matches/MatchesFormAddTooltip.vue';
    import UserDropdown               from '@/components/UserDropdown.vue';
    import UserDropdownContainerMixin from '@/mixins/UserDropdownContainerMixin';
    import MainMixin                  from '@/mixins/Main';
    import MatchesMixin               from '@/mixins/Matches';
    import FormMixin                  from '@/mixins/Form';
    // eslint-disable-next-line no-unused-vars
    import {VueHttpResponse}          from '@/plugins/VueHttp';

    @Component({
        components: {
            UserDropdown,
            MatchesFormAddTooltip,
            Datepicker
        },
        name: `MatchesFormAdd`
    })
    export default class MatchesFormAdd extends mixins(MainMixin, MatchesMixin, FormMixin, UserDropdownContainerMixin)
    {
        @Prop({required: true, type: Number}) public readonly id!: number;
        @Prop({required: true, type: Object}) public readonly columns!: any;
        @Prop({required: true, type: String}) public readonly keyMode!: string;
        @Prop({required: true, type: String}) public readonly typeId!: number;

        public alertTypeGet(): ''
        {
            return ``;
        }

        public blurOnCustom({element, $event}: { element: FormElement, $event: FocusEvent }): void
        {
            if (element.dropdown)
            {
                if (($event.relatedTarget as HTMLElement | null)?.classList.contains(`user`))
                {
                    this.$refs.elements[this.columns[element.name].order].focus();
                    return;
                }

                element.userActiveIndex = -1;
            }

            this.blurOn({element});
        }

        public checkboxClickOn({element: {name}, $event}: { element: FormElement, $event: MouseEvent }): void
        {
            if (!name.includes(`Canceled`))
            {
                return;
            }

            const {side, sideOther} = this.sidesGet(name as MatchSide);
            const visibilityNew: boolean = !this.elements[`${side}Tooltip`].visibility;

            this.tooltipHide({side: sideOther});

            if ((this.elements[`${side}Tooltip`] as Merge<FormElement, {tooltip: {submitted: boolean}}>).tooltip.submitted)
            {
                ($event.target as HTMLInputElement).checked = true;
            }
            else
            {
                this.elements[`${side}Canceled`].value = visibilityNew;
            }

            this.elements[`${side}Tooltip`].visibility = visibilityNew;
        }

        public clickOn($event: Merge<MouseEvent, { target: HTMLElement }>): void
        {
            const elementName: string = new this.$String(document.activeElement?.id.match(/(.*)(?=-\d+)/)?.[0].replace(`matches-form-add-`, ``) || ``).caseCamelTo().toString();
            const element = this.elements[elementName];

            if ($event.target.closest(`.matches-form-add-tooltip`) || element?.tooltip || element?.name.includes(`Canceled`))
            {
                return;
            }

            if ($event.target.closest(`.delete`))
            {
                this.deleteOn();
                return;
            }

            if ($event.target.closest(`.submit`))
            {
                this.submitOn();
                return;
            }

            Object.entries(this.elements).forEach(([elementNameOther, elementOther]) =>
            {
                if (elementOther.tooltip)
                {
                    elementOther.visibility = false;
                    this.elements[`${this.sideGet(elementNameOther)}Canceled`].value = false;
                }
            });
        }

        public computedPropertiesUpdateCustom({element, $event}: { element: FormElement, $event?: MouseEvent | KeyboardEvent | FocusEvent | InputEvent }): void
        {
            const {state} = this.$store;

            if (element.dropdown)
            {
                const userId: number = parseInt(Object.entries(state.users.value as { [s: string]: UserValue }).find(([, user]) =>
                {
                    return user.username.toLowerCase() === element.value.toLowerCase();
                })?.[0] || ``);

                this.propertiesUpdate({element, props: {id: userId}});

                const {side, sideOther} = this.sidesGet(element.name as MatchSide);

                this.elementsAll[`${side}Canceled`].visibility = Boolean(element.id);

                if (element.id && !this.elements[`${sideOther}Id`].id)
                {
                    const elementOther = this.elements[`${sideOther}Id`];

                    const usernameUpdate = (username: string) =>
                    {
                        this.propertiesUpdate({element: elementOther, props: {value: username}});
                        this.computedPropertiesUpdateCustom({element: elementOther});
                    };

                    if (this.type.name === `playOff`)
                    {
                        const [userOther] = Object.values(this.usersByStringGet({name: sideOther}));

                        if (userOther)
                        {
                            usernameUpdate(userOther.username);
                        }
                    }
                    else if (element.id !== state.userLogged.id)
                    {
                        usernameUpdate(state.userLogged.username);
                    }
                }
            }
            else if (element.input === `checkbox` && $event)
            {
                this.checkboxClickOn({element, $event: $event as MouseEvent});
            }
            this.computedPropertiesUpdate({element});
        }

        public datepickerClassGet(): { reversed?: boolean }
        {
            const playedAt$el: HTMLElement = this.$refs.elements?.[this.columns.playedAt.order].$el;

            if (!playedAt$el || playedAt$el.constructor.name === `Comment`)
            {
                return {};
            }

            const bottomRowHeight: number = this.$refs.elements ? ((this.$el.closest(`section`) as HTMLElement).querySelector(`.bottom-row`) as HTMLElement).offsetHeight : 0;
            const calendarHeight: number = this.$refs.elements ? parseFloat(window.getComputedStyle(playedAt$el).getPropertyValue(`font-size`)) * 16.875 : 0;

            return {
                reversed: playedAt$el.getBoundingClientRect().bottom + calendarHeight + bottomRowHeight > this.$store.state.windowHeight
            };
        }

        public deleteOn(): void
        {
            this.$emit(`delete`, this.id);
        }

        public divisionDifferentIs(): boolean
        {
            return this.type.name === `league` && !Object.entries(this.sideUsers).every(([side, sideUsers]) =>
            {
                const userIds: number[] = [...Object.keys(sideUsers).map((userId) =>
                {
                    return parseInt(userId);
                }), this.elements[side].id as number];

                return this.divisionPlayers.find((divisionPlayer) =>
                {
                    return userIds.includes(divisionPlayer.userId);
                });
            });
        }

        public focusOn({element}: { element: FormElement }): void
        {
            this.$emit(`input-focus`);

            if (element.dropdown)
            {
                element.dropdown.visibility = true;
            }
        }

        public foreignIs(): boolean
        {
            const {state} = this.$store;

            return this.elements.homeId.id !== state.userLogged.id && this.elements.awayId.id !== state.userLogged.id;
        }

        public goalsAvailabilitySet({availability}: { availability: boolean }): void
        {
            this.goalProps.forEach((goalProp) =>
            {
                this.elements[goalProp].disabled = availability;
            });
        }

        public inputOn({element, $event}: { element: FormElement, $event: Merge<InputEvent, { target: HTMLInputElement }> }): void
        {
            if ($event.type === `click` && element.input !== `checkbox`)
            {
                return;
            }

            if (element.dropdown)
            {
                element.dropdown.visibility = true;
            }

            if (!element.name.includes(`Canceled`))
            {
                this.propertiesUpdate({element, props: {value: element.input === `checkbox` ? !element.value : $event.target.value}});
            }

            this.computedPropertiesUpdateCustom({element, $event});
        }

        public invalidOn(): void
        {
            if (!this.valid)
            {
                const alertMessage: string = (() =>
                {
                    if (this.sides.some((side) =>
                    {
                        return !this.formData[`${side}Id`];
                    }))
                    {
                        return `playerNotFound`;
                    }

                    if (this.foreignIs())
                    {
                        return `foreignMatch`;
                    }

                    if (!this.opponentHas())
                    {
                        return `opponentNotFound`;
                    }

                    if (this.overtimeDrawIs())
                    {
                        return `overtimeDrawIs`;
                    }

                    if (this.divisionDifferentIs())
                    {
                        return `divisionDifferent`;
                    }

                    return `invalid`;
                })();

                this.alertShow({alertType: alertMessage, state: `failed`});
            }
        }

        public keydownOn($event: KeyboardEvent): void
        {
            if (!this.$store.state.userLogged.loggedIn || this.keyMode !== `input`)
            {
                return;
            }

            if ((document.activeElement as HTMLInputElement | null)?.type === `checkbox` && $event.key === `Enter`)
            {
                (document.activeElement as HTMLInputElement).click();
            }
            else if (!this.sides.some((side) =>
            {
                return this.elements[`${side}Id`].dropdown?.visibility && this.elements[`${side}Id`].value;
            }) && this.$refs.elements.includes(document.activeElement as HTMLElement))
            {
                switch ($event.key)
                {
                    case `Enter`:
                        this.submitOn();
                        break;
                    case `Delete`:
                        this.deleteOn();
                        break;
                }
            }
        }

        public opponentHas(): boolean
        {
            return this.elements.homeId.id !== this.elements.awayId.id;
        }

        public overtimeDrawIs(): boolean
        {
            return this.elements.overtime.value && this.elements.homeGoals.value === this.elements.awayGoals.value;
        }

        public overtimeUpdate(): void
        {
            const overtimeAllowed: boolean = this.fut || this.type.name === `playOff`;

            this.elements.overtime.disabled = !overtimeAllowed;
            this.elements.overtime.visibility = overtimeAllowed;
        }

        public responseOn(res: VueHttpResponse): void
        {
            this.$emit(`response`, {formId: this.id, res});

            if (!res.ok)
            {
                const alertType: string = (() =>
                {
                    switch (res.body.message)
                    {
                        case `Email address not verified`:
                            return `notVerified`;
                        case `Match already played`:
                            return `alreadyPlayed`;
                        case `Away and home user are reversed`:
                            return `usersReversed`;
                        case `Draw is not possible in the match type`:
                            return `playOffDrawIs`;
                        default:
                            return `notAdded`;
                    }
                })();

                this.alertShow({alertType, state: `failed`, targetType: `match`});
            }
        }

        public submitOn(): void
        {
            this.formSubmit({auth: true});

            this.$emit(`submit`, {[this.id]: {...this.formData}});
        }

        public tdClassGet({column, columnName}: { column: ColumnValue, columnName: string }): { [s: string]: boolean }
        {
            return {
                [new this.$String(columnName).caseTrainTo().toString()]: true,
                [`margin-none`]: column.margin === 0,
                [`${column.orientation || `left`}-oriented`]: true
            };
        }

        public tooltipDeleteOn({element, props}: { element: Merge<FormElement, {tooltip: {submitted: boolean}}>, props: any[] }): void
        {
            const {side, sideOther} = this.sidesGet(element.name as MatchSide);

            this.goalsAvailabilitySet({availability: false});

            this.propertiesUpdate({element: this.elements[`${sideOther}Canceled`], props: {visibility: Boolean(this.elements[`${sideOther}Id`].value)}});
            this.propertiesUpdate({element: this.elements[`${side}Canceled`], props: {checked: false, value: false}});
            this.propertiesUpdate({element, props: {visibility: false}});

            [...props, `canceledBy`].filter((prop) =>
            {
                return element.tooltip.submitted || ![`homeGoals`, `awayGoals`].includes(prop);
            }).forEach((prop) =>
            {
                this.propertiesUpdate({element: this.elementsAll[prop], props: {value: ``}});
                this.computedPropertiesUpdateCustom({element: this.elementsAll[prop]});
            });

            element.tooltip.submitted = false;
        }

        public tooltipHide({side}: { side: MatchSide }): void
        {
            this.propertiesUpdate({element: this.elements[`${side}Tooltip`], props: {visibility: false}});
            this.propertiesUpdate({element: this.elements[`${side}Canceled`], props: {checked: false, value: false}});
        }

        public tooltipSubmitOn({element, value}: { element: FormElement, value: any }): void
        {
            const {side, sideOther} = this.sidesGet(element.name as MatchSide);

            if (value[`${side}Goals`] > value[`${sideOther}Goals`])
            {
                this.alertShow({alertType: `matchesFormAddTooltipCanceledByWinner`, state: `failed`});
                return;
            }

            this.tooltipUpdateBy({element: element as Merge<FormElement, {tooltip: {submitted: boolean}}>, value: {...value, canceledBy: side}});
            this.goalsAvailabilitySet({availability: true});
            this.propertiesUpdate({element, props: {visibility: false}});
            this.elementsAll[`${sideOther}Canceled`].visibility = false;
        }

        public tooltipUpdateBy({element, value}: { element: Merge<FormElement, {tooltip: {submitted: boolean}}>, value: any }): void
        {
            const {sideOther} = this.sidesGet(element.name as MatchSide);

            element.tooltip.submitted = true;
            value[`${sideOther}Goals`] += this.restGoalsCalc({canceledAt: value.canceledAt});

            Object.keys(value).forEach((elementName) =>
            {
                this.elementsAll[elementName].value = value[elementName];
                this.computedPropertiesUpdateCustom({element: this.elementsAll[elementName]});
            });
        }

        public usersByStringGet({limit = 5, name}: { limit?: number, name: MatchSide }): {[s: string]: Omit<UserValue, 'id'>}
        {
            const {state} = this.$store;
            const {side, sideOther} = this.sidesGet(name);
            const users = state.matchesTypes.leagueTypes.includes(this.type.name) ? this.divisionUsers
                : Object.entries(state.users.value).map(([userId, user]) =>
                {
                    return [parseInt(userId), user] as [number, Omit<UserValue, 'id'>];
                });

            return Object.fromEntries(users.sort(([, userA], [, userB]) =>
            {
                return userA.username.localeCompare(userB.username);
            }).filter(([userId, user]) =>
            {
                const foreignMatch: boolean = Boolean(this.elements[`${sideOther}Id`].id && this.elements[`${sideOther}Id`].id !== state.userLogged.id
                    && userId !== state.userLogged.id);
                const usernameContains: boolean = user.username.toLowerCase().startsWith(this.elementsAll[`${side}Id`].value.toLowerCase());
                const otherSideDifferentIs: boolean = userId !== this.elementsAll[`${sideOther}Id`].id;

                const conditionsGeneral: boolean = !foreignMatch && usernameContains && otherSideDifferentIs;

                if (this.type.name === `league`)
                {
                    const leagueMatches = Object.values(state.matches.value[this.categoriesActive] || {}).filter((match) =>
                    {
                        return !match.resultWritten && [match.homeId, match.awayId].includes(state.userLogged.id);
                    });

                    return conditionsGeneral && leagueMatches.some((match) =>
                    {
                        return [match.homeId, match.awayId].includes(userId);
                    });
                }

                if (this.type.name === `playOff`)
                {
                    const series: MatchValue[] = Object.values(state.matches.value[this.categoriesActive]).filter((match) =>
                    {
                        const userIds: [number, number] = [match.homeId, match.awayId];
                        const playoffIs: boolean = typeof match.leg === `number`;

                        return userIds.includes(userId) && userIds.includes(state.userLogged.id) && playoffIs && match.seasonId === Number(this.leagueSeasonLast[0]);
                    }) as MatchValue[];

                    const playOffOpponent = series.length > 0 && !state.leaguePlayOff.seriesWinnerGet(series);

                    return conditionsGeneral && playOffOpponent;
                }

                return conditionsGeneral;
            }).slice(0, limit));
        }

        public validityGet({element: {name, required, validateRegex}}: { element: FormElement }): boolean
        {
            return (validateRegex.test(this.formData[name]) || (!this.formData[name] && !required));
        }

        public tableName = `matches`;
        public $refs!: {
            elements: (HTMLElement | Datepicker)[]
        };

        public get divisionPlayers(): LeagueTableRecordValue[]
        {
            const {state} = this.$store;
            const divisionIds = state.divisions.value[this.categoriesActive];
            const leagueTableRecordsSeasonLast = state.leagueTableRecords.value[this.categoriesActive]?.[this.leagueSeasonLast[0]] || {};
            const leagueTableRecords = Object.entries(leagueTableRecordsSeasonLast).find(([divisionId, division]) =>
            {
                return Object.keys(divisionIds).includes(divisionId) && Object.values(division).some((leagueTableRecord) =>
                {
                    return leagueTableRecord.userId === state.userLogged.id;
                });
            })?.[1];

            return Object.values((leagueTableRecords || {}) as { [s: string]: LeagueTableRecordValue }).filter((leagueTableRecord) =>
            {
                return typeof leagueTableRecord.dnfAfterWeeks !== `number`;
            });
        }

        public get divisionUsers(): [number, Omit<UserValue, 'id'>][]
        {
            return this.divisionPlayers.map((leagueTableRecord) =>
            {
                return [leagueTableRecord.userId, this.$store.state.users.value[leagueTableRecord.userId]];
            }, {});
        }

        public get leagueSeasonLast()
        {
            return this.$store.state.leagueSeasons.lastGet({seasonStart: {$lte: new Date()}});
        }

        public get sideUsers(): { [s in 'homeId' | 'awayId']: [string, UserValue][] }
        {
            return this.sides.reduce((a, side) =>
            {
                a[`${side}Id`] = this.usersByStringGet({name: side});
                return a;
            }, {} as { [s in 'homeId' | 'awayId']: [string, UserValue][] });
        }

        public get text()
        {
            return this.texts.matches;
        }

        public get type(): DeepReadonlyObject<Omit<MatchesTypeValue, 'id'>>
        {
            return this.$store.state.matchesTypes.value[this.typeId];
        }

        public get valid(): boolean
        {
            return !Object.entries(this.elementsAll).filter(([, element]) =>
            {
                return element.required;
            }).some(([, element]) =>
            {
                return !element.valid;
            }) && !this.foreignIs() && this.opponentHas() && !this.overtimeDrawIs() && !this.divisionDifferentIs();
        }

        @Watch('fut')
        public futChangeOn(): void
        {
            this.overtimeUpdate();

            if (!this.fut)
            {
                this.propertiesUpdate({element: this.elements.overtime, props: {value: false}});
            }
        }

        public created(): void
        {
            // @ts-ignore
            window.addEventListener(`click`, this.clickOn);
            this.elements = this.elementsCreate({
                playedAt: {
                    disabledDates: {
                        from: this.$dayjs().toDate()
                    },
                    value: this.$dayjs().startOf(`d`).format()
                },
                homeId: {
                    default: true,
                    dropdown: {
                        visibility: false
                    },
                    type: `idUsername`
                },
                homeCanceled: {
                    required: false,
                    sendable: false,
                    type: `boolean`,
                    visibility: false
                },
                homeTooltip: {
                    required: false,
                    sendable: false,
                    tooltip: {
                        submitted: false
                    },
                    visibility: false
                },
                homeGoals: {
                    min: 0,
                    type: `integer`
                },
                colon: {
                    tag: `span`,
                    value: this.columns.colon.html
                },
                awayGoals: {
                    min: 0,
                    type: `integer`
                },
                overtime: {
                    required: false,
                    type: `boolean`
                },
                awayTooltip: {
                    required: false,
                    sendable: false,
                    tooltip: {
                        submitted: false
                    },
                    visibility: false
                },
                awayCanceled: {
                    required: false,
                    sendable: false,
                    type: `boolean`,
                    visibility: false
                },
                awayId: {
                    dropdown: {
                        visibility: false
                    },
                    type: `idUsername`
                }
            });
            this.elementsExtra = this.elementsCreate({
                canceledAt: {
                    min: 1,
                    required: false,
                    type: `integer`
                },
                canceledBy: {
                    required: false,
                    type: `alphabetical`
                },
                typeId: {
                    id: this.typeId,
                    type: `id`,
                    valid: true
                }
            });

            this.overtimeUpdate();
        }

        public mounted(): void
        {
            const elementDefaultIndex: number = this.columns[Object.entries(this.elements).find(([, element]) =>
            {
                return element.default;
            })?.[0] || ``].order;

            this.$refs.elements[elementDefaultIndex].focus();
        }

        public destroyed(): void
        {
            // @ts-ignore
            window.removeEventListener(`click`, this.clickOn);
        }
    }
</script>

<style lang="stylus" scoped>
    .matches-form-add
        border-horizontal-width 2px
        margin-vertical 0

        *
            background-color inherit

    span
        cursor default

    input
        width 100%

    >>> input
        background-color inherit
        border 0
        font-color inherit
        height 100%
        text-align inherit

        &[type=checkbox]
            appearance none
            border 0
            height 0
            position relative
            width 0

            & + label
                font-color #666666

            &:checked + label
                font-color inherit

    >>> .datepicker
        margin-left -20px

        @media (max-width 949px)
            margin-left (-10) px

        input
            overflow hidden
            padding-left 20px

            @media (max-width 949px)
                padding-left 10px

        &.reversed
            .datepicker-calendar
                bottom 100%

    >>> .datepicker-calendar
        background-color #101010
        width calc(17.5em + 2px)

        .cell
            height 2.5em
            line-height 2.5em

        .prev, .next, .up
            &:after
                transition .25s

            &:not(.disabled):hover
                background-color #101010

        .prev
            &:after
                border-right-color #ffffff

            &.disabled:after
                border-right-color #7f7f7f

        .next
            &:after
                border-left-color #ffffff

            &.disabled:after
                border-left-color #7f7f7f

        .disabled
            font-color #7f7f7f

        .today
            background-color transparent
            border 1px #ffffff

            &:hover
                background-color transparent

    .home-id
        >>> .user-dropdown
            right 0

            button
                text-align right

    .away-id
        >>> .user-dropdown
            left 0

            button
                text-align left

    for type in $matchesTypes
        $color = lookup('$' + type)
        $colorHover = lookup('$' + type + 'Hover')

        .{type}
            border-horizontal-color $color !important
            border-right-color $color

            >>> .matches-form-add-tooltip
                background-color $color

                &:after
                    border-horizontal-color $color

            >>> .datepicker-calendar
                border-color $color

                .prev, .next, .up
                    &:not(.disabled):hover
                        font-color $color

                .prev
                    &:not(.disabled):hover:after
                        border-right-color $color

                .next
                    &:not(.disabled):hover:after
                        border-left-color $color

                .day:not(.blank):not(.disabled):hover
                    border-color $color

                .selected
                    background-color $color

            >>> .user-dropdown
                button
                    background-color $color

                    &.active, &:hover
                        background-color $colorHover

            .submit, .delete
                &:hover
                    font-color $color
</style>
