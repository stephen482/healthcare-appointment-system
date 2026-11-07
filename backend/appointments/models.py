from django.conf import settings
from django.db import models
from django.db.models import Q


class Doctor(models.Model):
    name = models.CharField(max_length=120)
    specialty = models.CharField(max_length=80)
    bio = models.TextField(blank=True)
    is_available = models.BooleanField(default=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.name} ({self.specialty})"


class Appointment(models.Model):
    class Status(models.TextChoices):
        BOOKED = "booked", "Booked"
        CANCELLED = "cancelled", "Cancelled"
        COMPLETED = "completed", "Completed"

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="appointments",
    )
    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name="appointments",
    )
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    reason = models.CharField(max_length=300, blank=True)
    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.BOOKED,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["appointment_date", "appointment_time"]
        constraints = [
            # Only one BOOKED appointment per doctor, date and time.
            # Cancelled appointments do not block the slot.
            models.UniqueConstraint(
                fields=["doctor", "appointment_date", "appointment_time"],
                condition=Q(status="booked"),
                name="unique_active_doctor_slot",
            ),
        ]

    def __str__(self):
        return f"{self.patient} with {self.doctor} on {self.appointment_date} {self.appointment_time}"