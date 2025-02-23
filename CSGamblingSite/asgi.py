<<<<<<< HEAD
"""
ASGI config for CSGamblingSite project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
import my_account.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'CSGamblingSite.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            my_account.routing.websocket_urlpatterns
        )
    ),
})

=======
"""
ASGI config for CSGamblingSite project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'CSGamblingSite.settings')

application = get_asgi_application()
>>>>>>> 587eeefc3f2ad2c4ea3190741cdaa5f9b6d795f9
