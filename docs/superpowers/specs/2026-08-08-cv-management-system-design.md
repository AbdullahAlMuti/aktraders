# System Design Specification: AI-Powered CV Management & Employee Profile System

> **Date:** August 8, 2026  
> **Project:** A K Traders Limited — Employee Database Management & Enterprise CV Processing System  
> **Author:** Full-Stack Software Architecture & AI Engineering Team  

---

## 1. Executive Overview

The goal of this enhancement is to transform the existing Next.js 14 & Supabase application into a production-grade **AI-Powered CV Parsing, Employee Profile & Intelligent Search System**. 

The system enables HR administrators and users to upload single or bulk CVs (PDF/DOCX/Images/Zip), automatically extracts structured data and candidate photographs using a multi-provider AI pipeline, deduplicates candidate records, populates 6 distinct profile tabs, and provides multi-identifier instant search across Employee IDs, Applicant IDs, CV Numbers, Emails, Names, and Skills.

---

## 2. Core Architecture & Data Pipeline

```mermaid
flowchart TD
    Upload[Single / Bulk CV Upload Interface] -->|PDF / DOCX / Image / Zip| Validator[File & MIME Validation]
    Validator -->|Store Original File| Storage[Local Public Uploads / Supabase Storage]
    
    Validator -->|1. Extract PDF Stream & Text| Parser[pdf2json & JSZip Extractor]
    Validator -->|2. Detect & Extract Candidate Photo| PhotoExtract[CV Profile Photo Detection Heuristic]
    
    Parser -->|Raw Text & Base64| AIEngine[AI Provider Pipeline: AgentRouter / Gemini / TokenRouter]
    AIEngine -->|Strict JSON Schema| SchemaValidator[Zod / Schema Validation & Normalization]
    
    SchemaValidator -->|Normalized Candidate Data| Deduplicator[Deduplication Engine]
    Deduplicator -->|Check Email / Phone / IDs| DBCheck{Match Existing Employee?}
    
    DBCheck -->|Yes: Update Existing Profile| UpdateDB[Append CV Version & Merge Latest Data]
    DBCheck -->|No: Create New Profile| CreateDB[Assign EMP-XXXXXX, APP-XXXXXX, CV-XXXXXX & Persist]
    
    PhotoExtract -->|Save Avatar Image| SaveAvatar[Store Avatar & Link to Profile]
    
    UpdateDB --> PersistedDB[(Supabase PostgreSQL Database)]
    CreateDB --> PersistedDB
    SaveAvatar --> PersistedDB
    
    PersistedDB -->|Fetch 6 Profile Tabs| ProfileUI[Employee Profile UI /employees/:id]
    PersistedDB -->|Multi-Identifier Query| SearchUI[Multi-Identifier Search & Filtering Engine]
```

---

## 3. Database Schema Design & Relationships

To support all 6 profile tabs, candidate deduplication, and stable identifiers, the database model includes the following normalized entities in Supabase PostgreSQL:

```mermaid
erDiagram
    EMPLOYEE_PROFILES ||--o{ CV_RECORDS : owns
    EMPLOYEE_PROFILES ||--o{ EDUCATION_RECORDS : possesses
    EMPLOYEE_PROFILES ||--o{ EXPERIENCE_RECORDS : has
    EMPLOYEE_PROFILES ||--o{ ATTACHED_DOCUMENTS : attached
    EMPLOYEE_PROFILES ||--|| PROFILE_DETAILS : contains

    EMPLOYEE_PROFILES {
        uuid id PK
        string employee_id UK "EMP-XXXXXX"
        string applicant_id UK "APP-XXXXXX"
        string full_name
        string email UK
        string phone
        string current_designation
        string department
        string current_organization
        string avatar_url
        string profile_status "active | review_required"
        timestamp joining_date
        timestamp created_at
        timestamp updated_at
    }

    CV_RECORDS {
        string id PK "CV-XXXXXX"
        uuid employee_profile_id FK
        string candidate_name
        string extracted_text
        text structured_data
        string original_file_name
        string original_pdf_url
        integer version_number
        timestamp created_at
    }

    EDUCATION_RECORDS {
        uuid id PK
        uuid employee_profile_id FK
        string degree
        string qualification_name
        string institution
        string board
        string major
        string passing_year
        string result
        string gpa_cgpa
        text description
    }

    EXPERIENCE_RECORDS {
        uuid id PK
        uuid employee_profile_id FK
        string organization_name
        string job_title
        string designation
        string department
        string location
        string start_date
        string end_date
        boolean is_current
        string duration
        text responsibilities
    }

    ATTACHED_DOCUMENTS {
        uuid id PK
        uuid employee_profile_id FK
        string document_id
        string document_type "original_cv | certificate | cover_letter"
        string original_file_name
        string file_url
        string file_size
        string mime_type
        timestamp upload_date
    }

    PROFILE_DETAILS {
        uuid id PK
        uuid employee_profile_id FK
        string father_name
        string mother_name
        string dob
        string gender
        string marital_status
        string nationality
        string religion
        string nid
        string present_address
        string permanent_address
        string emergency_contact
        string linkedin_url
        string github_url
        string portfolio_url
        string_array skills
        string_array languages
        string_array certifications
        text career_objective
        text professional_summary
    }
```

---

## 4. The 6 Required Profile Tabs

Every Employee Profile at `/employees/[id]` organizes information cleanly across 6 dedicated tabs:

1. **Personal Information**:
   - Full Name, Photo, Gender, Date of Birth, Nationality, Marital Status, Religion, NID, Phone, Email, Present & Permanent Address, LinkedIn, GitHub, Portfolio.
2. **Employment Details**:
   - Employee ID (`EMP-XXXXXX`), Applicant ID (`APP-XXXXXX`), Current Organization, Current Designation, Department, Employment Type, Location, Joining Date, Career Level, Total Experience.
3. **Educational Qualification**:
   - Structured list of all degrees (Bachelor's, Master's, HSC, SSC, Diplomas) with Degree, Institution, Major, Board, Passing Year, Result/CGPA.
4. **Work Experience**:
   - Chronological employment history with Organization, Role/Title, Duration, Start/End Dates, Current Status, Responsibilities, Achievements.
5. **Attached Documents**:
   - Document inventory showing Original CV, Version History (`CV-000101`, `CV-000102`), Certificates, and Cover Letters with file sizes, download links, and upload timestamps.
6. **Other Details**:
   - Structured tags for Technical Skills, Soft Skills, Languages, Certifications, Projects, References, Career Objective, Professional Summary.

---

## 5. Candidate Deduplication & Identifier Assignment

To prevent duplicate Employee Profiles when multiple CVs are uploaded for the same person:
1. **Identifier Generation**:
   - System assigns stable identifiers: `EMP-100201`, `APP-100201`, `CV-100201`.
2. **Matching Hierarchy**:
   - **Level 1**: Exact match on `email` (case-insensitive).
   - **Level 2**: Exact match on normalized `phone` (e.g. `+8801700123456`).
   - **Level 3**: Exact match on `full_name` + `dob` or `nid`.
3. **Deduplication Behavior**:
   - If match is found: system attaches the new CV file as a new version in `ATTACHED_DOCUMENTS` and `CV_RECORDS`, updates empty profile fields with new information, and keeps existing verified data intact.
   - If no match is found: system creates a new `EMPLOYEE_PROFILE`.

---

## 6. Profile Photo Detection & Extraction

1. **Extraction Pipeline**:
   - Inspect PDF object stream or uploaded image file.
   - Extract embedded image buffers.
   - Apply heuristics to identify candidate photo:
     - Filter out decorative icons, line separators, and tiny logos (< 8KB or aspect ratio > 3:1).
     - Filter out full-page backgrounds (> 2MB).
     - Prefer portrait aspect ratios (0.7 to 1.3) and files between 15KB and 1MB.
2. **Storage**:
   - Save extracted photo to `public/uploads/photos/${employeeId}_avatar.png`.
   - Update `avatar_url` in the Employee Profile.

---

## 7. Multi-Identifier Instant Search

The search engine supports instant partial and exact matching across:
* **Employee Name** (e.g., "Korina Villanueva")
* **Employee ID** (e.g., "EMP-100201")
* **Applicant ID** (e.g., "APP-100201")
* **CV Number / Record ID** (e.g., "CV-100201")
* **Email Address** (e.g., "korina@example.com")
* **Phone Number** (e.g., "+8801700123456")
* **Designation & Skills** (e.g., "Marketing Manager", "UI/UX")

---

## 8. Verification & Acceptance Criteria

- [x] All 6 tabs populated from database queries.
- [x] Single and Bulk Upload working with real-time status tracking.
- [x] AgentRouter / Gemini AI extraction structured into clean JSON schema.
- [x] Deduplication prevents duplicate employee profiles for same email/phone.
- [x] Multi-identifier search correctly resolves Employee ID, Applicant ID, CV Number, Name, Email, and Phone.
- [x] Manual profile edit capability working on profile tabs.
