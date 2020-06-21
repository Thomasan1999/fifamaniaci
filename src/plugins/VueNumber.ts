export default class VueNumber extends Number
{
    public get currencyFormat(): string
    {
        return new Intl.NumberFormat(
            `sk-SK`,
            {
                style: `currency`,
                currency: `EUR`
            }
        ).format(this.valueOf()).replace(/\s+(?=[^\d]+$)/, ``).replace(/[^\d]00(?=[^\d])/, ``);
    }
}
