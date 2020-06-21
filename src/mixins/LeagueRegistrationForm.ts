import {mixins}    from 'vue-class-component';
import {Component} from 'vue-property-decorator';
import MainMixin   from '@/mixins/Main';

@Component({
    name: `LeagueRegistrationFormMixin`
})
export default class LeagueRegistrationFormMixin extends mixins(MainMixin)
{
    public moneyAmount: number = parseFloat(process.env.VUE_APP_FM_LEAGUE_REGISTRATION_MONEY);
}
