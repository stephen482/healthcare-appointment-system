from rest_framework.permissions import BasePermission


class IsAppointmentOwner(BasePermission):
    """A patient may only access their own appointments."""

    message = "You do not have permission to access this appointment."

    def has_object_permission(self, request, view, obj):
        return obj.patient_id == request.user.id