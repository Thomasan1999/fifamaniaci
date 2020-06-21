import {mixins}    from 'vue-class-component';
import {Component} from 'vue-property-decorator';
import MainMixin from '@/mixins/Main';
import FormMixin from '@/mixins/Form';

@Component({
    name: `UserDropdownContainerMixin`
})
export default class UserDropdownContainerMixin extends mixins(MainMixin, FormMixin)
{
    public computedPropertiesUpdateCustom({element}: {element: FormElement}): void
    {
    }

    public userBlurOn({element})
    {
        element.dropdown.visibility = false;
    }

    public userClickOn({element, user})
    {
        const id: number = Number(Object.keys(user));
        this.propertiesUpdate({element, props: {id, value: user[id].username}});

        this[this.computedPropertiesUpdateCustom ? `computedPropertiesUpdateCustom` : `computedPropertiesUpdate`]({element});
        element.dropdown.visibility = false;
    }

    public userDropdownContainerClickOn($event)
    {
        if ($event.target.closest(`.user-dropdown-container`) || document.activeElement === $event.target)
        {
            return;
        }

        Object.values(this.elements).filter((element) =>
        {
            return element.dropdown;
        }).forEach((element) =>
        {
            (element.dropdown as {visibility: boolean}).visibility = false;
        });
    }

    public created()
    {
        window.addEventListener(`click`, this.userDropdownContainerClickOn);
    }

    public destroyed()
    {
        window.removeEventListener(`click`, this.userDropdownContainerClickOn);
    }
}
