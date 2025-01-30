from django.shortcuts import render

# Create your views here.
def index(request, case_id):
    pass

def case_list(request):
    return render(request, 'cases/case_list.html', {})