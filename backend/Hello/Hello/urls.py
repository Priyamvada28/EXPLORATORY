from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse  # Import JsonResponse to return a simple response
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include



# Function to return a JSON response when visiting "/"
def home(request):
    return JsonResponse({"message": "Welcome to the Django API!"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('home.urls')),  # API routes from home app
    path('', home, name="home"),  # Default route for "/"
]
# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

