from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    path("auth/register/", views.RegisterView.as_view(), name="register"),
    path("auth/login/", views.LoginView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", views.MeView.as_view(), name="me"),
    path("doctors/", views.DoctorListView.as_view(), name="doctor-list"),
    path("doctors/<int:pk>/", views.DoctorDetailView.as_view(), name="doctor-detail"),
    path("appointments/", views.AppointmentListCreateView.as_view(), name="appointment-list"),
    path("appointments/<int:pk>/", views.AppointmentDetailView.as_view(), name="appointment-detail"),
]