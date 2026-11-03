const specialtyInfo = [
  { name: 'Cardiology', title: 'Cardiologist', bio: 'Specializing in advanced cardiac care, preventive cardiology, and heart health management.' },
  { name: 'Pediatrics', title: 'Pediatrician', bio: 'Dedicated to child healthcare, developmental milestones, and preventive care for all ages.' },
  { name: 'Dermatology', title: 'Dermatologist', bio: 'Expert in medical and cosmetic dermatology, skin cancer screenings, and skin treatments.' },
  { name: 'Neurology', title: 'Neurologist', bio: 'Treating neurological disorders, migraines, epilepsy, and providing complete neurological evaluations.' },
  { name: 'Dentistry', title: 'Dentist', bio: 'Family and cosmetic dentistry offering checkups, whitening, braces, and pain-free dental care.' },
  { name: 'Orthopedics', title: 'Orthopedic Specialist', bio: 'Expert in joint replacement, sports injuries, fractures, and minimally invasive surgery.' },
  { name: 'General Practice', title: 'General Practitioner', bio: 'Comprehensive family healthcare, chronic disease management, and routine wellness checkups.' },
  { name: 'Gynecology', title: 'Gynecologist', bio: "Women's health care including prenatal care, fertility support, and reproductive wellness." },
  { name: 'Ophthalmology', title: 'Ophthalmologist', bio: 'Eye care specialist for vision correction, cataracts, glaucoma, and eye disease management.' },
  { name: 'ENT', title: 'ENT Specialist', bio: 'Treating ear, nose, and throat conditions including sinus problems, hearing loss, and sleep apnea.' },
  { name: 'Psychiatry', title: 'Psychiatrist', bio: 'Supporting mental health through therapy, medication management, anxiety, and depression care.' },
  { name: 'Urology', title: 'Urologist', bio: "Specialist in kidney, bladder, and urinary tract health, as well as men's reproductive health." },
  { name: 'Oncology', title: 'Oncologist', bio: 'Compassionate cancer care including diagnosis, treatment planning, and long-term follow-up.' },
  { name: 'Endocrinology', title: 'Endocrinologist', bio: 'Managing diabetes, thyroid disorders, hormone imbalances, and metabolic health.' },
]

const femaleNames = [
  'Amara', 'Sofia', 'Lina', 'Aisha', 'Mei', 'Grace', 'Priya', 'Elena', 'Fatima', 'Hannah',
  'Chloe', 'Ngozi', 'Yuki', 'Isabella', 'Zainab', 'Olivia', 'Amina', 'Sara', 'Nadia', 'Katarina',
  'Leila', 'Maya', 'Adaeze', 'Rosa', 'Ingrid', 'Camila', 'Tara', 'Eunice', 'Julia', 'Naomi',
]

const maleNames = [
  'Daniel', 'Kwame', 'Peter', 'James', 'Michael', 'Samuel', 'Ahmed', 'Carlos', 'Chinedu', 'David',
  'Liam', 'Omar', 'Raj', 'Thomas', 'Yusuf', 'Marcus', 'Andre', 'Victor', 'Kenji', 'Ibrahim',
  'Lucas', 'Emeka', 'Henry', 'Mateo', 'Tunde', 'Ethan', 'Joseph', 'Hassan', 'Felix', 'Adrian',
]

const lastNames = [
  'Okafor', 'Mensah', 'Alvarez', 'Boateng', 'Haddad', 'Novak', 'Bello', 'Carter', 'Lin', 'Adeyemi',
  'Patel', 'Johnson', 'Kim', 'Rossi', 'Nwosu', 'Silva', 'Khan', 'Muller', 'Chen', 'Okoro',
  'Garcia', 'Tanaka', 'Hughes', 'Bennett', 'Abubakar', 'Ferreira', 'Nguyen', 'Kowalski', 'Mitchell', 'Osei',
  'Reyes', 'Singh', 'Foster', 'Lopez', 'Anderson', 'Yamamoto', 'Balogun', 'Cohen', 'Petrov', 'Dlamini',
]

export const specialties = specialtyInfo.map((s) => s.name)

export const doctors = Array.from({ length: 112 }, (_, i) => {
  const info = specialtyInfo[i % specialtyInfo.length]
  const female = i % 2 === 0
  const k = Math.floor(i / 2)
  const first = female ? femaleNames[k % 30] : maleNames[k % 30]
  const last = lastNames[(i * 7 + 3) % lastNames.length]
  const years = 5 + ((i * 3) % 21)

  return {
    id: i + 1,
    name: `Dr. ${first} ${last}`,
    specialty: info.name,
    title: info.title,
    available: i % 5 !== 3,
    years,
    bio: `${info.bio} ${years}+ years of experience.`,
    img: `https://randomuser.me/api/portraits/${female ? 'women' : 'men'}/${k % 100}.jpg`,
  }
})