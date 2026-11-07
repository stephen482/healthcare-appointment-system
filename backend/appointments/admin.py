from django.contrib import admin

from .models import Appointment, Doctor


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ("name", "specialty", "is_available")
    list_filter = ("specialty", "is_available")
    search_fields = ("name", "specialty", "bio")
    list_editable = ("is_available",)


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "patient",
        "doctor",
        "appointment_date",
        "appointment_time",
        "status",
    )
    list_filter = ("status", "appointment_date", "doctor__specialty")
    search_fields = ("patient__username", "doctor__name", "reason")
    list_editable = ("status",)
    date_hierarchy = "appointment_date"