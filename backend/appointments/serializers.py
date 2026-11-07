from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Appointment, Doctor

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "date_joined")
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate(self, attrs):
        candidate = User(username=attrs.get("username", ""), email=attrs.get("email", ""))
        validate_password(attrs["password"], user=candidate)
        return attrs

    def create(self, validated_data):
        # create_user hashes the password. Plain text is never stored.
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )


class LoginSerializer(TokenObtainPairSerializer):
    """Log in with a username or an email and return tokens plus the user."""

    def validate(self, attrs):
        identifier = attrs.get(self.username_field, "")
        if identifier and "@" in identifier:
            match = User.objects.filter(email__iexact=identifier.strip()).first()
            if match:
                attrs[self.username_field] = match.get_username()
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ("id", "name", "specialty", "bio", "is_available")
        read_only_fields = fields


class AppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source="doctor.name", read_only=True)
    doctor_specialty = serializers.CharField(source="doctor.specialty", read_only=True)

    class Meta:
        model = Appointment
        fields = (
            "id",
            "doctor",
            "doctor_name",
            "doctor_specialty",
            "appointment_date",
            "appointment_time",
            "reason",
            "status",
            "created_at",
        )
        read_only_fields = ("id", "doctor_name", "doctor_specialty", "created_at")

    def validate_appointment_date(self, value):
        if value < timezone.localdate():
            raise serializers.ValidationError("Appointment date cannot be in the past.")
        return value

    def validate_doctor(self, value):
        if self.instance is None and not value.is_available:
            raise serializers.ValidationError("This doctor is not accepting appointments right now.")
        return value

    def validate(self, attrs):
        if self.instance is not None:
            return self._validate_update(attrs)

        date = attrs["appointment_date"]
        time = attrs["appointment_time"]

        if date == timezone.localdate() and time <= timezone.localtime().time():
            raise serializers.ValidationError(
                {"appointment_time": "That time has already passed today."}
            )

        if Appointment.objects.filter(
            doctor=attrs["doctor"],
            appointment_date=date,
            appointment_time=time,
            status=Appointment.Status.BOOKED,
        ).exists():
            raise serializers.ValidationError(
                {"appointment_time": "This time slot is already booked for the selected doctor."}
            )

        # New appointments always start as booked, whatever the client sends.
        attrs["status"] = Appointment.Status.BOOKED
        return attrs

    def _validate_update(self, attrs):
        """Patients may only cancel a booked appointment."""
        extra = set(self.initial_data.keys()) - {"status"}
        if extra:
            raise serializers.ValidationError("You can only change the status of an appointment.")

        if attrs.get("status") != Appointment.Status.CANCELLED:
            raise serializers.ValidationError({"status": "You can only cancel an appointment."})

        if self.instance.status != Appointment.Status.BOOKED:
            raise serializers.ValidationError(
                {"status": f"This appointment is already {self.instance.status}."}
            )
        return attrs

    def create(self, validated_data):
        try:
            # The database constraint is the final protection when two people
            # try to book the same slot at the same moment.
            with transaction.atomic():
                return super().create(validated_data)
        except IntegrityError:
            raise serializers.ValidationError(
                {"appointment_time": "This time slot is already booked for the selected doctor."}
            )