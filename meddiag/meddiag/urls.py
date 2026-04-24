from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("core.urls")),
    path('api/', include('appointments.urls')),
    path("accounts/", include("accounts.urls")),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    # Keep legacy template paths like /images/... working in local dev.
    images_root = (settings.BASE_DIR.parent / "images").resolve()
    urlpatterns += static("/images/", document_root=images_root)
