from django.shortcuts import render

def case_list(request):
    cases = [  # Temporary static data for development
        {"name": "Case 1", "image": "static/images/case1.jpg", "weapon": "AWP | Dragon Lore"},
        {"name": "Case 2", "image": "static/images/case2.jpg", "weapon": "AK-47 | Redline"},
    ]
    return render(request, 'cases/case_list.html', {'cases': cases})

def case_detail(request, case_id):
    return render(request, 'cases/case_detail.html', {})