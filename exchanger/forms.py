from django import forms
from my_account.models import InventoryItem
from .models import Exchange


class ExchangeForm(forms.ModelForm):
    class Meta:
        model = Exchange
        fields = ['item']

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user')
        super(ExchangeForm, self).__init__(*args, **kwargs)
        self.fields['item'].queryset = InventoryItem.objects.filter(profile=user.profile)