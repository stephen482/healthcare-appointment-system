from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Appointment, Doctor
from .permissions import IsAppointmentOwner
from .serializers import (
    AppointmentSerializer,
    DoctorSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ - create a patient account."""

    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []


class LoginView(TokenObtainPairView):
    """POST /api/auth/login/ - returns access and refresh tokens."""

    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []


class MeView(generics.RetrieveAPIView):
    """GET /api/auth/me/ - the signed-in user's profile."""

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class DoctorListView(generics.ListAPIView):
    """GET /api/doctors/ - public doctor directory.

    Optional filters: ?specialty=Cardiology  ?available=true  ?search=heart
    """

    serializer_class = DoctorSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Doctor.objects.all()
        params = self.request.query_params

        specialty = params.get("specialty")
        if specialty:
            qs = qs.filter(specialty__iexact=specialty)

        if params.get("available", "").lower() in ("1", "true", "yes"):
            qs = qs.filter(is_available=True)

        search = params.get("search")
        if search:
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(specialty__icontains=search)
                | Q(bio__icontains=search)
            )

        return qs


class DoctorDetailView(generics.RetrieveAPIView):
    """GET /api/doctors/<id>/"""

    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.AllowAny]


class AppointmentListCreateView(generics.ListCreateAPIView):
    """GET  /api/appointments/ - only the signed-in patient's bookings.
    POST /api/appointments/ - create a booking for the signed-in patient.
    """

    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(patient=self.request.user).select_related("doctor")

    def perform_create(self, serializer):
        # The patient always comes from the token, never from the request body.
        serializer.save(patient=self.request.user)


class AppointmentDetailView(generics.RetrieveUpdateAPIView):
    """GET   /api/appointments/<id>/
    PATCH /api/appointments/<id>/ - a patient may cancel their own booking.
    """

    queryset = Appointment.objects.select_related("doctor")
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAppointmentOwner]
    http_method_names = ["get", "patch", "head", "options"]