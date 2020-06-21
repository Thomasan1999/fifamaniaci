import {mixins}           from 'vue-class-component';
import {Component, Watch} from 'vue-property-decorator';
import MainMixin          from '@/mixins/Main';

@Component({
    name: `TabContainerContainerMixin`
})
export default class TabContainerContainerMixin extends mixins(MainMixin)
{
    public keydownOn($event: KeyboardEvent): void
    {
        if (($event.key !== `ArrowLeft` && $event.key !== `ArrowRight`) || document.activeElement?.tagName === `INPUT`)
        {
            return;
        }

        const tabIds: string[] = Object.values(this.tabs).filter(([, tab]) =>
        {
            return !tab.disabled;
        }).map(([tabId]) =>
        {
            return tabId;
        });

        const tabIndex: number = tabIds.findIndex((tabOtherId) =>
        {
            return tabOtherId === this.$store.state[this.tabsTableName].active;
        });

        const tabId: string = tabIds[new this.$Range(0, tabIds.length - 1).incorporate(tabIndex + ($event.key === `ArrowLeft` ? -1 : 1))];

        this.$router.push({name: this.tabsNames[tabId], params: this.$store.getters.params}).catch((err) =>
        {
            console.error(err);
        });
    }

    public tabAddClickOn(): void
    {
        this.$nextTick(() =>
        {
            return (this.$refs.tabAddInput as HTMLInputElement).focus();
        });
    }

    public async tabDeleteOn({tabId}: { tabId: string }): Promise<any>
    {
        const index = this.tabs.findIndex(([tabOtherId]) =>
        {
            return tabOtherId === tabId;
        });

        const tabsNew = this.tabs.filter(([tabOtherId]) =>
        {
            return tabOtherId !== tabId;
        });

        await this.$store.dispatch(`tabsActiveSet`, {
            tabId: tabsNew[Math.min(index, tabsNew.length - 1)][0],
            tabsTableName: this.tabsTableName
        }).catch((err) =>
        {
            console.error(err);
        });

        return this.$store.dispatch(`tabDelete`, {categoryId: this.categoriesActive, tabsTableName: this.tabsTableName, tabId}).catch((err) =>
        {
            console.error(err);
        });
    }

    public async tabsActiveCheck(): Promise<string | void>
    {
        if (this.$Tomwork.emptyIs(this.tabs))
        {
            return;
        }

        if (this.$route.meta.tabId && this.$route.meta.tabId !== this.tabsActive)
        {
            this.$store.dispatch(`tabsActiveSet`, {tabId: this.$route.meta.tabId, tabsTableName: this.tabsTableName}).catch((err) =>
            {
                console.error(err);
            });

            return;
        }

        if (this.tabsActive)
        {
            return;
        }

        if (!this.tabs.some(([tabId]) =>
        {
            return this.tabsActive === tabId;
        }))
        {
            const [tabId] = this.tabs.find(([, tab]) =>
            {
                return tab.order === 0;
            }) || [];

            if (typeof tabId === `undefined`)
            {
                return;
            }

            return this.$store.dispatch(`tabsActiveSet`, {tabId, tabsTableName: this.tabsTableName}).catch((err) =>
            {
                console.error(err);
            });
        }
    }

    public tabs!: [string, TabValue][];

    public get tabsActive(): string
    {
        return this.$store.state[this.tabsTableName].active;
    }

    public readonly sectionName!: string;
    public readonly tabsTableName!: string;

    public get tabsNames(): {[s: string]: string}
    {
        return this.tabs.reduce((a, [tabId, tab]) =>
        {
            const categoryName: string = this.$store.state[this.sectionName].categoryHas && parseInt(tabId) !== 0
                ? new this.$String(this.$store.state.categories.value[this.categoriesActive].name).capitalize().toString() : ``;
            const hrefName: string = new this.$String(tab.href).capitalize().toString();
            const tabIdName: string = parseInt(tabId) === 0 ? `` : new this.$String(tabId).capitalize().toString();

            return {
                ...a,
                [tabId]: `${this.sectionName}${hrefName}${tabIdName}${categoryName}`
            };
        }, {});
    }

    @Watch('categoriesActive')
    public categoriesActiveChangeOn(): void
    {
        this.tabsActiveCheck().catch(console.error);
    }

    @Watch('$route', {deep: true})
    public $routeChangeOn(): void
    {
        this.tabsActiveCheck().catch(console.error);
    }

    @Watch('tabsActive')
    public tabsActiveChangeOn(): void
    {
        if (!this.categoriesActive)
        {
            return;
        }

        this.$router.push({name: this.tabsNames[this.tabsActive], params: this.$store.getters.params}).catch((err) =>
        {
            console.error(err);
        });
    }

    public created(): void
    {
        this.tabsActiveCheck().catch(console.error);
        window.addEventListener(`dataLoad`, this.tabsActiveCheck);
    }

    public destroyed(): void
    {
        window.removeEventListener(`dataLoad`, this.tabsActiveCheck);
    }
}
