"""
Generate synthetic training data (600+ rows) for career recommendation.
Run from backend folder: python scripts/generate_dataset.py
"""
import csv
import os
import random

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "data", "training_dataset.csv")

BRANCHES = ["CSE", "IT", "ECE", "EEE", "Mechanical", "Civil"]
INTERESTS = ["Data", "Web", "AI", "Security", "Cloud", "Mobile", "Design", "Business"]
SUBJECTS_POOL = {
    "Data": ["DBMS", "Statistics", "Data Mining", "ML"],
    "Web": ["Web Technology", "JavaScript", "Computer Networks"],
    "AI": ["ML", "Deep Learning", "Python"],
    "Security": ["Network Security", "Cryptography", "OS"],
    "Cloud": ["Cloud Computing", "Computer Networks", "OS"],
    "Mobile": ["Mobile Computing", "Java", "Kotlin"],
    "Design": ["HCI", "Graphics", "UI Basics"],
    "Business": ["Management", "Economics", "DBMS"],
}
WORK_STYLES = ["Creative", "Analytical", "Coding", "Management"]

CAREER_SKILL_BAGS = {
    "Frontend Developer": ["HTML", "CSS", "JavaScript", "React", "Git"],
    "Backend Developer": ["Python", "SQL", "REST", "Git", "Linux"],
    "Full Stack Developer": ["HTML", "CSS", "JavaScript", "React", "Node", "SQL", "Git"],
    "Data Analyst": ["Python", "SQL", "Excel", "Pandas", "Tableau"],
    "Data Scientist": ["Python", "Pandas", "ML", "Statistics", "SQL"],
    "Machine Learning Engineer": ["Python", "ML", "Deep Learning", "Docker", "SQL"],
    "UI/UX Designer": ["Figma", "Research", "Prototyping", "Wireframes"],
    "Cybersecurity Analyst": ["Networking", "Linux", "SIEM", "OWASP"],
    "Cloud Engineer": ["AWS", "Networking", "Docker", "Terraform"],
    "DevOps Engineer": ["Linux", "Docker", "Kubernetes", "CI/CD", "Git"],
    "QA/Test Engineer": ["Testing", "Selenium", "API testing", "SQL"],
    "Business Analyst": ["Excel", "SQL", "Documentation", "Agile"],
    "Android Developer": ["Kotlin", "Android", "Git", "REST"],
}

CAREER_INTEREST_MAP = {
    "Frontend Developer": "Web",
    "Backend Developer": "Web",
    "Full Stack Developer": "Web",
    "Data Analyst": "Data",
    "Data Scientist": "Data",
    "Machine Learning Engineer": "AI",
    "UI/UX Designer": "Design",
    "Cybersecurity Analyst": "Security",
    "Cloud Engineer": "Cloud",
    "DevOps Engineer": "Cloud",
    "QA/Test Engineer": "Web",
    "Business Analyst": "Business",
    "Android Developer": "Mobile",
}


def jitter_skills(base: list[str], career: str) -> str:
    s = set(base)
    noise = ["Git", "Excel", "Communication", "Teamwork", "Linux", "Docker", "Statistics"]
    if random.random() < 0.4:
        s.add(random.choice(noise))
    if random.random() < 0.25 and len(s) > 2:
        s.remove(random.choice(list(s)))
    return ",".join(sorted(s))


def row_for_career(career: str) -> dict:
    interest = CAREER_INTEREST_MAP[career]
    branch = random.choice(BRANCHES)
    cgpa = round(random.uniform(6.0, 9.5), 1)
    subj = random.choice(SUBJECTS_POOL.get(interest, ["DBMS", "OS"]))
    skills = jitter_skills(list(CAREER_SKILL_BAGS[career]), career)
    projects = random.randint(0, 5)
    certs = random.randint(0, 3)
    intern = random.choice(["Yes", "No", "No", "No"])
    aptitude = random.randint(55, 95)
    analytical = int(max(40, min(99, aptitude + random.randint(-12, 12))))
    creative = int(max(40, min(99, aptitude + random.randint(-18, 18))))
    comm = int(max(40, min(99, aptitude + random.randint(-15, 15))))
    coding = int(max(40, min(99, aptitude + random.randint(-10, 20))))
    work = random.choice(WORK_STYLES)
    if "Designer" in career or "Frontend" in career:
        creative = min(99, creative + random.randint(5, 15))
    if "Data" in career or "Scientist" in career or "ML" in career:
        analytical = min(99, analytical + random.randint(5, 15))
        coding = min(99, coding + random.randint(0, 12))
    if career == "Business Analyst":
        comm = min(99, comm + random.randint(5, 12))
    return {
        "branch": branch,
        "cgpa": cgpa,
        "interest_domain": interest,
        "favorite_subject": subj,
        "technical_skills": skills,
        "projects_count": projects,
        "certifications_count": certs,
        "internship_experience": intern,
        "aptitude_score": aptitude,
        "logical_score": int(max(40, min(99, aptitude + random.randint(-10, 10)))),
        "analytical_score": analytical,
        "creativity_score": creative,
        "communication_score": comm,
        "coding_score": coding,
        "preferred_work_style": work,
        "recommended_career": career,
    }


def main():
    random.seed(42)
    careers = list(CAREER_SKILL_BAGS.keys())
    rows = []
    per = 50
    for c in careers:
        for _ in range(per):
            rows.append(row_for_career(c))
    random.shuffle(rows)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    fieldnames = list(rows[0].keys())
    with open(OUT, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)
    print(f"Wrote {len(rows)} rows to {OUT}")


if __name__ == "__main__":
    main()
