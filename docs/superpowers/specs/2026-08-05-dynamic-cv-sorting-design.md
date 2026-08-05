# Dynamic CV Information Sorting & Zero-Hardcode Profile Tab Mapping Design

**Date:** 2026-08-05  
**Goal:** Guarantee 100% dynamic, AI-sorted CV information extraction into database `cv_records` (`structured_data` & `extracted_text`) and map them directly into Employee Profile tabs (`Personal Information`, `Employment Details`, `Educational Qualifications`, `Work Experience`, `Attached Documents`, `Other Details`) with **zero hardcoding** or fake default values.

---

## 1. System Architecture & Data Flow

```
[Uploaded CV (PDF/DOCX/Zip)] 
          │
          ▼
 [Gemini 1.5/2.0 Flash Vision AI] 
          │ (Prompt: Strict extraction into exact JSON tab schema; null for unstated fields)
          ▼
   [Structured JSON]
          │
          ├────────────────────────────────────────┐
          ▼                                        ▼
 [Supabase cv_records]                  [Employee Profile UI]
 (structured_data JSON)              (/profile & EmployeeDetailDrawer)
                                     Renders matching fields or "Not Provided"
                                     (Zero fake placeholders)
```

---

## 2. Dynamic JSON Schema

```json
{
  "candidateName": "Extracted Full Name or null",
  "extractedText": "Complete plain text of the CV",
  "personal": {
    "fullName": "Full Name or null",
    "fatherName": "Father's Name or null",
    "motherName": "Mother's Name or null",
    "dob": "Date of Birth or null",
    "gender": "Gender or null",
    "maritalStatus": "Marital Status or null",
    "nationality": "Nationality or null",
    "religion": "Religion or null",
    "nid": "NID or null",
    "bloodGroup": "Blood Group or null",
    "mobile": "Mobile Phone or null",
    "email": "Email or null",
    "presentAddress": "Present Address or null",
    "permanentAddress": "Permanent Address or null",
    "emergencyContact": "Emergency Contact or null"
  },
  "employment": {
    "department": "Inferred or stated Department or null",
    "designation": "Job Designation or null",
    "workplace": "Workplace location or null",
    "joiningDate": "Joining Date or null",
    "employmentType": "Employment Type or null",
    "salaryScale": "Salary Scale or null",
    "status": "Active"
  },
  "education": [
    {
      "degree": "Degree Name",
      "institution": "Institution / University",
      "passingYear": "Passing Year",
      "board": "Board / University",
      "major": "Major / Field",
      "result": "Result / Grade"
    }
  ],
  "experience": [
    {
      "role": "Role / Position",
      "company": "Company Name",
      "duration": "Duration",
      "isCurrent": boolean,
      "description": "Responsibilities"
    }
  ],
  "documents": [
    {
      "name": "Original PDF File Name",
      "size": "File Size",
      "type": "pdf",
      "url": "PDF Data/File URL"
    }
  ],
  "other": {
    "skills": ["Extracted skills array"],
    "rawText": "Raw text"
  }
}
```

---

## 3. Strict Rules & Constraints

1. **Zero Hardcoded Data**:
   - Delete all hardcoded fallback strings (`"Dhaka Office"`, `"Bachelor's Degree"`, `"2021"`, `"Previous Organization"`, `"Communication"`, `"Single"`, `"Bangladeshi"`, etc.).
   - If a field is missing from the CV, Gemini returns `""` or `null` or `[]`.
2. **Profile UI Display**:
   - Render extracted values if present. If missing, render `"Not Provided in CV"` or leave array sections empty without rendering fake items.
3. **Clean Local Fallback**:
   - If AI is unavailable, extract ONLY real regex matches for email, phone, and name from text. Do not invent any non-existent fields.

---

## 4. Verification Plan

1. Run `npm run type-check` to verify zero TypeScript errors.
2. Upload test CVs and verify via API endpoints (`/api/employees` and `/profile`) that ONLY fields explicitly in the CV are populated in the database JSON and rendered in the profile tabs.
