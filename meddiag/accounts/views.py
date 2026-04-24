from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from appointments.models import Appointment
from .forms import CustomUserCreationForm, ProfileUpdateForm
from .models import UserProfile


def register(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            try:
                user = form.save()
                login(request, user)
                messages.success(request, "Регистрация прошла успешно!")
                return redirect("accounts:profile")
            except Exception as e:
                messages.error(request, f"Ошибка при сохранении пользователя: {e}")
                print(f"Ошибка сохранения пользователя: {e}")  # Логирование ошибки
        else:
            # Показываем ошибки формы пользователю
            messages.error(request, "Пожалуйста, исправьте ошибки в форме.")
    else:
        form = CustomUserCreationForm()
    return render(request, "accounts/register.html", {"form": form})


def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get("username")
            password = form.cleaned_data.get("password")
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect("accounts:profile")
    else:
        form = AuthenticationForm()
    return render(request, "accounts/login.html", {"form": form})


@login_required
def profile(request):
    profile = request.user.profile
    if request.method == "POST":
        form = ProfileUpdateForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            messages.success(request, "Профиль успешно обновлён!")
            return redirect("accounts:profile")
    else:
        form = ProfileUpdateForm(instance=profile)
    appointments = profile.get_upcoming_appointments()
    context = {
        "profile": profile,
        "form": form,
        "appointments": appointments,
    }
    return render(request, "accounts/profile.html", context)


def user_logout(request):
    """Представление для выхода пользователя из системы"""
    logout(request)
    messages.info(request, "Вы успешно вышли из системы.")
    return redirect("core:home")  # перенаправляем на главную страницу


@login_required
def update_avatar(request):
    try:
        profile = request.user.profile  # Если профиля нет, будет ошибка
    except UserProfile.DoesNotExist:
        # Создаём профиль, если его нет
        profile = UserProfile.objects.create(user=request.user)
    if request.method == 'POST' and request.FILES.get('avatar'):
        try:
            profile = request.user.profile
            profile.avatar = request.FILES['avatar']
            profile.save()
            return JsonResponse({
                'success': True,
                'avatar_url': request.build_absolute_uri(profile.avatar.url)
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Ошибка при сохранении: {str(e)}'
            }, status=400)
    return JsonResponse({
        'success': False,
        'error': 'Файл не загружен или неверный метод запроса'
    }, status=400)

@login_required
def get_medical_history(request):
    # Получаем записи пользователя (прошедшие и будущие)
    records = Appointment.objects.filter(
        user=request.user
    ).order_by('-date')  # сортировка по дате (новые сверху)

    data = []
    for record in records:
        data.append({
            'date': record.date.strftime('%d.%m.%Y %H:%M'),
            'service': record.service.title if record.service else 'Не указано',
            'doctor': f"{record.doctor.name}"
        })

    return JsonResponse({'records': data})