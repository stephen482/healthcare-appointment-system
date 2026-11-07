from django.core.management.base import BaseCommand

from appointments.models import Doctor

SPECIALTIES = [
    ("Cardiology", "Specializing in advanced cardiac care, preventive cardiology, and heart health management."),
    ("Pediatrics", "Dedicated to child healthcare, developmental milestones, and preventive care for all ages."),
    ("Dermatology", "Expert in medical and cosmetic dermatology, skin cancer screenings, and skin treatments."),
    ("Neurology", "Treating neurological disorders, migraines, epilepsy, and providing complete neurological evaluations."),
    ("Dentistry", "Family and cosmetic dentistry offering checkups, whitening, braces, and pain-free dental care."),
    ("Orthopedics", "Expert in joint replacement, sports injuries, fractures, and minimally invasive surgery."),
    ("General Practice", "Comprehensive family healthcare, chronic disease management, and routine wellness checkups."),
    ("Gynecology", "Women's health care including prenatal care, fertility support, and reproductive wellness."),
    ("Ophthalmology", "Eye care specialist for vision correction, cataracts, glaucoma, and eye disease management."),
    ("ENT", "Treating ear, nose, and throat conditions including sinus problems, hearing loss, and sleep apnea."),
    ("Psychiatry", "Supporting mental health through therapy, medication management, anxiety, and depression care."),
    ("Urology", "Specialist in kidney, bladder, and urinary tract health, as well as men's reproductive health."),
    ("Oncology", "Compassionate cancer care including diagnosis, treatment planning, and long-term follow-up."),
    ("Endocrinology", "Managing diabetes, thyroid disorders, hormone imbalances, and metabolic health."),
]

FEMALE = [
    "Amara", "Sofia", "Lina", "Aisha", "Mei", "Grace", "Priya", "Elena", "Fatima", "Hannah",
    "Chloe", "Ngozi", "Yuki", "Isabella", "Zainab", "Olivia", "Amina", "Sara", "Nadia", "Katarina",
    "Leila", "Maya", "Adaeze", "Rosa", "Ingrid", "Camila", "Tara", "Eunice", "Julia", "Naomi",
]

MALE = [
    "Daniel", "Kwame", "Peter", "James", "Michael", "Samuel", "Ahmed", "Carlos", "Chinedu", "David",
    "Liam", "Omar", "Raj", "Thomas", "Yusuf", "Marcus", "Andre", "Victor", "Kenji", "Ibrahim",
    "Lucas", "Emeka", "Henry", "Mateo", "Tunde", "Ethan", "Joseph", "Hassan", "Felix", "Adrian",
]

LAST = [
    "Okafor", "Mensah", "Alvarez", "Boateng", "Haddad", "Novak", "Bello", "Carter", "Lin", "Adeyemi",
    "Patel", "Johnson", "Kim", "Rossi", "Nwosu", "Silva", "Khan", "Muller", "Chen", "Okoro",
    "Garcia", "Tanaka", "Hughes", "Bennett", "Abubakar", "Ferreira", "Nguyen", "Kowalski", "Mitchell", "Osei",
    "Reyes", "Singh", "Foster", "Lopez", "Anderson", "Yamamoto", "Balogun", "Cohen", "Petrov", "Dlamini",
]

TOTAL = 112


class Command(BaseCommand):
    help = "Add fictional sample doctors (safe to run more than once)."

    def handle(self, *args, **options):
        created = 0
        for i in range(TOTAL):
            specialty, bio = SPECIALTIES[i % len(SPECIALTIES)]
            female = i % 2 == 0
            k = i // 2
            first = FEMALE[k % 30] if female else MALE[k % 30]
            last = LAST[(i * 7 + 3) % len(LAST)]
            years = 5 + ((i * 3) % 21)

            _, was_created = Doctor.objects.get_or_create(
                name=f"Dr. {first} {last}",
                specialty=specialty,
                defaults={
                    "bio": f"{bio} {years}+ years of experience.",
                    "is_available": i % 5 != 3,
                },
            )
            if was_created:
                created += 1

        self.stdout.write(
            self.style.SUCCESS(f"Done. {created} new doctors added, {Doctor.objects.count()} in total.")
        )