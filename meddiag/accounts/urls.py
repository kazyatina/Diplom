from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from . import views

app_name = "accounts"

urlpatterns = [
    path("register/", views.register, name="register"),
    path("login/", views.login_view, name="login"),
    path("profile/", views.profile, name="profile"),
    path("logout/", views.user_logout, name="logout"),
    path("update-avatar/", views.update_avatar, name="update_avatar"),
    path('api/medical-history/', views.get_medical_history, name='medical_history_api'),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
