from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .models import WithdrawRequest, InventoryItem

class UserRegisterForm(UserCreationForm):
    email = forms.EmailField()

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

class WithdrawRequestForm(forms.ModelForm):
    class Meta:
        model = WithdrawRequest
        fields = ['item']
    
    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user')
        super(WithdrawRequestForm, self).__init__(*args, **kwargs)
        self.fields['item'].queryset = InventoryItem.objects.filter(profile=user.profile)
