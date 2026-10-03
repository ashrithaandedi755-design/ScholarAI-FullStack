import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is not configured")

client = genai.Client(api_key=api_key)


def explain_eligibility(profile, scholarship, eligible, reasons):

    status = "Eligible" if eligible else "Not Eligible"

    prompt = f"""
You are the AI explanation assistant for ScholarAI.

Explain a student's scholarship eligibility result in simple and clear language.

Student Profile:
Education: {profile.education}
State: {profile.state}
Category: {profile.category}
Income: {profile.income}

Scholarship:
Name: {scholarship.name}
Provider: {scholarship.provider}
Minimum Income: {scholarship.min_income}
Maximum Income: {scholarship.max_income}
Required State: {scholarship.required_state}
Required Category: {scholarship.required_category}
Required Education: {scholarship.required_education}

Eligibility Status: {status}

Eligibility Reasons:
{chr(10).join(reasons)}

Instructions:
- Explain why the student is eligible or not eligible.
- Use simple language.
- Mention the requirements that were satisfied or not satisfied.
- Do not invent any requirements.
- Keep the explanation short.
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt
    )

    return response.text 

def ask_gemini(message, profile, scholarship_data):

    if profile:
        student_info = f"""
Education: {profile.education}
State: {profile.state}
Category: {profile.category}
Income: {profile.income}
"""
    else:
        student_info = "Student profile is not available."

    prompt = f"""
You are ScholarAI, an AI assistant that helps students
understand scholarships.

Student Profile:
{student_info}

Available Scholarships:
{scholarship_data}

Student Question:
{message}

Instructions:
- Answer using only the provided ScholarAI data.
- Keep the answer simple and clear.
- If the student asks about eligibility, compare their
  profile with the eligibility requirements provided.
- Only say that the student is eligible when the provided
  requirements are satisfied.
- If no specific eligibility requirements are stored, say:
  "No specific eligibility requirements are configured in
  ScholarAI, so eligibility cannot be fully determined from
  the available data."
- Do not assume that missing requirements mean the scholarship
  is open to everyone.
- Do not invent scholarship requirements.
- Do not invent scholarship names, amounts, deadlines, or providers.
- If the available data is insufficient, clearly say so.
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt
    )

    return response.text