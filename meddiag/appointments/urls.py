from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from . import views

app_name = "appointments"

urlpatterns = [
    path("create/", views.create_appointment, name="create"),
    path(
        "<int:appointment_id>/cancel/",
        views.cancel_appointment,
        name="cancel_appointment",
    ),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
