import {mixins}                   from 'vue-class-component';
import {Component}                from 'vue-property-decorator';
import MainMixin                  from '@/mixins/Main';
import RegistrationLoginFormMixin from '@/mixins/RegistrationLoginForm';

@Component({
    name: `FormSectionMixin`
})
export default class FormSectionMixin extends mixins(MainMixin, RegistrationLoginFormMixin)
{
    public focusOn({element}: {element: FormElement}): void
    {
        if (element.color !== `transparent`)
        {
            return;
        }

        this.propertiesUpdate({element, props: {color: ``, value: ``}});
    }

    public validityGet({element: {required, taken, type, validateRegex, validLength, value, valueDefault}}: {element: FormElement}): boolean
    {
        return (validateRegex.test(value) || (!value && !required)) && ((!taken || value === valueDefault) || type === `password`) && validLength;
    }

    public get elementsEntries()
    {
        return Object.entries(this.elements).sort(([, elementA], [, elementB]) =>
        {
            return elementA.order - elementB.order;
        });
    }

    public get text(): any
    {
        return this.texts[new this.$String(this.$options.name as string).decapitalize().toString()];
    }

    public created(): void
    {
        Object.values(this.elements).forEach((element) =>
        {
            if (!element.valueDefault)
            {
                this.propertiesUpdate({element, props: {color: `transparent`, value: `\u2002`}});
            }

            this.$set(element, `asterisk`, element.required ? `*` : ``);
        });
    }
}
