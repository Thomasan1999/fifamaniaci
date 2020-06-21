<template>
    <div>
        <loading-container :condition="dataLoaded">
            <div class="bracket" :style="bracketStyleGet()">
                <div v-for="(round, roundIndex) in rounds" :key="roundIndex" class="round" ref="rounds">
                    <p class="title" v-html="text.rounds[rounds.length - roundIndex - 1]"/>
                    <div class="series-container">
                        <div v-for="(series, seriesIndex) in round" :key="seriesIndex" class="series" ref="series" :style="{maxWidth: `${270 + (30 * ((2 * roundsLimit) - 1))}px`}">
                            <table-container :table-name="`matches`" :columns="columns" :rows="series" :rows-sort-compare-fn="rowsSortCompareFn" :text="text.table"/>
                            <!--                        <div v-if="roundIndex !== rounds.length - 1" class="lines-container" :style="linesContainerStyleGet({roundIndex, seriesIndex})">-->
                            <!--                            <svg class="lines" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"-->
                            <!--                                 xml:space="preserve">-->
                            <!--                                <line x1="0" :y1="seriesIndex % 2 === 0 ? `0` : `100`" x2="100" :y2="seriesIndex % 2 === 0 ? `0` : `100`"></line>-->
                            <!--                                <line x1="100" :y1="seriesIndex % 2 === 0 ? `0` : `100`" x2="100" :y2="seriesIndex % 2 === 0 ? `100` : `0`"></line>-->
                            <!--                                <line x1="100" :y1="seriesIndex % 2 === 0 ? `100` : `0`" x2="200" :y2="seriesIndex % 2 === 0 ? `100` : `0`"></line>-->
                            <!--                            </svg>-->
                            <!--                        </div>-->
                        </div>
                    </div>
                </div>
            </div>
        </loading-container>
    </div>
</template>

<script lang="ts">
    import {Component}        from 'vue-property-decorator';
    import {mixins}           from 'vue-class-component';
    import TableContainer     from '../table/TableContainer.vue';
    import MainMixin          from '@/mixins/Main';
    import LeagueSectionMixin from '@/mixins/LeagueSection';

    @Component({
        components: {
            TableContainer
        },
        name: `LeaguePlayOff`
    })
    export default class LeaguePlayOff extends mixins(MainMixin, LeagueSectionMixin)
    {
        public bracketStyleGet(): { width: string }
        {
            const {navVisible, windowWidth} = this.$store.state;
            const navWidth: number = Number(navVisible) * 257.5;

            const width: string = (() =>
            {
                if (windowWidth <= (460 * 2) + navWidth)
                {
                    return `${this.roundsLimit * 100}%`;
                }

                if (windowWidth <= (460 * 3) + navWidth)
                {
                    return `${Math.max(100, this.roundsLimit * 50)}%`;
                }

                return `100%`;
            })();

            return {
                width
            };
        }

        // public linesContainerStyleGet({roundIndex, seriesIndex}: {roundIndex: number, seriesIndex: number}): {left: string, top: string}
        // {
        //     const spaceVertical: string = `100% - 10em / ${2 ** (roundIndex - 1)}`;
        //
        //     return {
        //         left: `0%`,
        //         top: `calc(${spaceVertical})`
        //     };
        // },
        public rowsSortCompareFn([userIndexA], [userIndexB]): number
        {
            return userIndexA - userIndexB;
        }

        public tableName = `matches`;

        public get columns()
        {
            type Leg = { required: boolean, order: number, type: string };

            const legColumnGet: (legIndex: number) => Leg = (index) =>
            {
                return {
                    required: false,
                    order: index + 3,
                    type: `integer`
                };
            };

            const legs: Leg[] = Array((this.$store.getters.leagueSeason.playOffWinsLimit * 2) - 1).fill(null).reduce((a, _, legIndex) =>
            {
                a[`leg${legIndex}`] = legColumnGet(legIndex);

                return a;
            }, {});

            return {
                leagueTablePosition: {
                    order: 0,
                    required: false,
                    type: `integer`
                },
                ...legs,
                userId: {
                    order: 1,
                    required: false,
                    type: `id`
                },
                winsCount: {
                    order: 2,
                    required: false,
                    type: `integer`
                }
            };
        }

        public get nestedValues(): string[]
        {
            return this.$store.state.leagueTableRecords.nestedProps.map((nestedProp) =>
            {
                return this[nestedProp];
            });
        }

        public get rounds()
        {
            const {state} = this.$store;

            const playOffMatches = Object.entries((state.matches.value[this.categoriesActive] || {}) as { [s: string]: LeaguePlayOffValue }).filter(([, match]) =>
            {
                return match.typeId === this.typeId && match.seasonId === this.seasonId && typeof match.leg === `number`;
            });

            const leagueTableRecords: [string, Omit<LeagueTableRecordValue, 'id'>][] = Object.entries(state.leagueTableRecords.rowsGet())
                .sort(state.leagueTableRecords.rowsSortCompareFn);

            const positionGet: (userId: number) => number = (userId: number) =>
            {
                return leagueTableRecords.findIndex(([, leagueTableRecord]) =>
                {
                    return leagueTableRecord.userId === userId;
                }) + 1;
            };

            const playOffMatchesGet: ({roundIndex, seriesIndex}: { roundIndex: number, seriesIndex: number }) => [string, LeaguePlayOffValue][] = ({roundIndex, seriesIndex}) =>
            {
                return playOffMatches.filter(([, match]) =>
                {
                    return match.series === seriesIndex && match.round === roundIndex;
                }).sort(([, matchA], [, matchB]) =>
                {
                    return matchA.leg - matchB.leg;
                });
            };

            return new this.$Range(0, this.roundsLimit - 1).enumerate().reverse().map((roundIndex) =>
            {
                return new this.$Range(0, (2 ** roundIndex) - 1 + .1).enumerate().map((seriesIndex) =>
                {
                    const series: {
                        [s in 'user0' | 'user1']: {
                            leagueTablePosition?: number,
                            userId?: number,
                            winsCount?: number
                        }
                    } = {user0: {}, user1: {}};

                    if (!leagueTableRecords.length)
                    {
                        return series;
                    }

                    const playOffMatchesOwn = playOffMatchesGet({roundIndex, seriesIndex});

                    if (!playOffMatchesOwn.length)
                    {
                        const seriesPrevious: [[string, LeaguePlayOffValue][], [string, LeaguePlayOffValue][]] = [
                            playOffMatchesGet({roundIndex: roundIndex + 1, seriesIndex: seriesIndex * 2}),
                            playOffMatchesGet({roundIndex: roundIndex + 1, seriesIndex: (seriesIndex * 2) + 1})
                        ];

                        const seriesWinners: (number | undefined)[] = seriesPrevious.map((seriesOther) =>
                        {
                            return state.leaguePlayOff.seriesWinnerGet(seriesOther.map(([, match]) =>
                            {
                                return match;
                            }));
                        });

                        seriesWinners.forEach((seriesWinner, seriesWinnersIndex) =>
                        {
                            const seriesPreviousIndex: number = (() =>
                            {
                                const seriesWinnersIndexOther: number = (seriesWinnersIndex + 1) % 2;

                                if (seriesWinner || (!seriesPrevious[seriesWinnersIndexOther].length && seriesPrevious[seriesWinnersIndex].length))
                                {
                                    return seriesWinnersIndex;
                                }

                                return -1;
                            })();

                            if (seriesPreviousIndex === -1)
                            {
                                return;
                            }

                            const seriesPreviousPlayed: [string, MatchValue][] = seriesPrevious[seriesPreviousIndex];
                            const leagueTablePosition: number = (() =>
                            {
                                if (seriesWinner)
                                {
                                    return positionGet(seriesWinner);
                                }

                                const leagueTablePositionOther: number = positionGet(seriesPreviousPlayed[0][1].homeId);
                                return ((2 ** roundIndex) * 2) - (leagueTablePositionOther - 1);
                            })();

                            const userIndex: number = seriesWinner ? seriesPreviousIndex : (seriesPreviousIndex + 1) % 2;

                            series[`user${userIndex}`].userId = leagueTableRecords[leagueTablePosition - 1][1].userId;
                            series[`user${userIndex}`].leagueTablePosition = leagueTablePosition;
                        });

                        return series;
                    }

                    return playOffMatchesOwn.reduce((a, [, match], legIndex) =>
                    {
                        if (legIndex === 0)
                        {
                            a.user0.winsCount = 0;
                            a.user1.winsCount = 0;
                            a.user0.leagueTablePosition = positionGet(match.homeId);
                            a.user1.leagueTablePosition = positionGet(match.awayId);
                            a.user0.userId = match.homeId;
                            a.user1.userId = match.awayId;
                        }

                        if (!match.resultWritten)
                        {
                            return a;
                        }

                        const user1Goals: number = match[`${legIndex % 2 === 0 ? `home` : `away`}Goals`];
                        const user2Goals: number = match[`${legIndex % 2 === 0 ? `away` : `home`}Goals`];

                        a[`user${user1Goals > user2Goals ? `0` : `1`}`].winsCount += 1;

                        a.user0[`leg${legIndex}`] = user1Goals;
                        a.user1[`leg${legIndex}`] = user2Goals;
                        return a;
                    }, series);
                });
            });
        }

        public get roundsLimit(): number
        {
            return this.$store.getters.leagueSeason.playOffRoundsLimit;
        }

        public get typeId(): number
        {
            const {state} = this.$store;

            return parseInt(Object.entries(state.matchesTypes.value as { [s: string]: MatchesTypeValue }).find(([, matchType]) =>
            {
                return matchType.name === `playOff`;
            })?.[0] || `0`);
        }
    }
</script>

<style lang="stylus" scoped>
    .bracket
        display flex
        flex-grow 1

    .round
        display flex
        flex 1 0 0
        flex-direction column
        font-weight 300
        padding-vertical 10px
        position relative

        .title
            flex 0 1 2.5em
            height 2.5em
            line-height 2.5em
            text-align center

    .series-container
        align-items center
        display flex
        flex-direction column
        flex-grow 1
        justify-content space-around

    .series
        display flex
        height 5em
        width calc(100% - 40px)

        @media (max-width 459px)
            width 100%

        >>> .scrollbar-container
            padding-vertical 0

        >>> .table-container
            width 100%

        >>> .lazy-loading-container
            overflow-y hidden

        >>> table
            border-spacing 0

        >>> tr
            height 2.5em

        >>> td
            &:first-child
                padding-left 0

        >>> .text-container
            height calc(100% - 2px)
            padding 0
            width 100%

    >>> .league-table-position
        width (20 * 100 / 400) %

    >>> .wins-count, >>> .leg0, >>> .leg1, >>> .leg2, >>> .leg3, >>> .leg4
        width (30 * 100 / 400) %

    >>> .user-id
        font-weight 400
        width (200 * 100 / 400) %

        /*@media (max-width 1499px)*/
        /*width 200px*/

        @media (max-width 1249px)
            width (160 * 100 / 400) %

        @media (max-width 679px)
            width (115 * 100 / 400) %

    >>> .wins-count
        font-weight 800

    /*.lines-container*/
    /*left 100%*/
    /*position absolute*/
    /*width 100px*/
    /**/
    /*.lines*/
    /*line*/
    /*stroke #ffffff*/
    /*stroke-width 1px*/
</style>
