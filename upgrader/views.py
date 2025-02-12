from django.shortcuts import render

# Create your views here.
def upgrade(request):
    return render(request, 'upgrade/upgrade.html')