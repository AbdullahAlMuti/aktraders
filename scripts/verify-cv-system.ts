import { buildFullProfileFromRecord, localEmployeeStore, supabase, deleteEmployeeEverywhere } from "../lib/db-schema";
import { findOrCreateEmployeeProfile, generateIdentifiers, normalizeEmail, normalizePhone } from "../lib/employee-deduplication";
import { extractAndSaveProfilePhoto } from "../lib/cv-photo-extractor";

async function verifyAllMasterRequirements() {
  console.log("=================================================");
  console.log("MASTER SYSTEM VERIFICATION: AI CV & PROFILE SYSTEM");
  console.log("=================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] Test ${totalTests}: ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test ${totalTests}: ${testName}`);
    }
  }

  // 1. Test Identifier Generation
  const ids = generateIdentifiers(100201);
  assert(ids.employeeId === "EMP-100201", "Generates stable Employee ID (EMP-100201)");
  assert(ids.applicantId === "APP-100201", "Generates stable Applicant ID (APP-100201)");
  assert(ids.cvNumber === "CV-100201", "Generates stable CV Number (CV-100201)");

  // 2. Test Normalization
  assert(normalizeEmail(" Korina.V@Example.com ") === "korina.v@example.com", "Email normalization matches case-insensitive");
  assert(normalizePhone("+880 1700-123456") === "01700123456", "Phone normalization strips country code & spaces");

  // 3. Test 6-Tab Profile Building
  const mockRecord = {
    id: "cv-test-1",
    employee_id: "EMP-99001",
    applicant_id: "APP-99001",
    cv_number: "CV-99001",
    candidate_name: "Korina Villanueva",
    extracted_text: "Korina Villanueva Email: korina@example.com Phone: 01700123456",
    structured_data: JSON.stringify({
      personal: { fullName: "Korina Villanueva", email: "korina@example.com", mobile: "01700123456", gender: "Female" },
      employment: { designation: "Marketing Manager", department: "Marketing", workplace: "Arowwai Corp" },
      education: [{ degree: "B.A. in Business", institution: "Borcelle University", passingYear: "2018" }],
      experience: [{ role: "Marketing Manager", company: "Arowwai Corp", duration: "2020 - Present" }],
      other: { skills: ["Digital Marketing", "UI/UX"], languages: ["English", "Bengali"] },
    }),
    original_file_name: "Korina_CV.pdf",
    original_pdf_url: "/uploads/cvs/Korina_CV.pdf",
    created_at: new Date().toISOString(),
  };

  const profile = buildFullProfileFromRecord(mockRecord);
  assert(profile.personalInformation?.fullName === "Korina Villanueva", "Tab 1 (Personal Information) contains Full Name");
  assert(profile.employmentDetails?.employeeId === "EMP-99001", "Tab 2 (Employment Details) contains Employee ID");
  assert(profile.educationalQualifications?.length === 1, "Tab 3 (Educational Qualification) contains education records");
  assert(profile.workExperience?.length === 1, "Tab 4 (Work Experience) contains experience records");
  assert(profile.attachedDocuments?.length === 1, "Tab 5 (Attached Documents) contains original CV");
  assert(profile.otherDetails?.skills?.includes("UI/UX") === true, "Tab 6 (Other Details) contains skills list");

  // 4. Test Deduplication Engine
  const cv1 = await findOrCreateEmployeeProfile(
    { personal: { email: "rahim@example.com", mobile: "01700999888" }, candidateName: "Rahim Ahmed" },
    {
      id: "cv-dedup-1",
      candidateName: "Rahim Ahmed",
      extractedText: "Rahim Ahmed rahim@example.com",
      structuredData: {},
      originalFileName: "Rahim_CV_v1.pdf",
      originalPdfUrl: "/uploads/cvs/Rahim_CV_v1.pdf",
    }
  );
  assert(cv1.isNew === true, "CV 1 creates new Employee Profile for Rahim Ahmed");

  const cv2 = await findOrCreateEmployeeProfile(
    { personal: { email: "rahim@example.com", mobile: "01700999888" }, candidateName: "Md. Rahim Ahmed" },
    {
      id: "cv-dedup-2",
      candidateName: "Md. Rahim Ahmed",
      extractedText: "Md. Rahim Ahmed rahim@example.com",
      structuredData: {},
      originalFileName: "Rahim_CV_v2.pdf",
      originalPdfUrl: "/uploads/cvs/Rahim_CV_v2.pdf",
    }
  );
  assert(cv2.isNew === false, "CV 2 with same email detects existing profile and attaches CV version 2 without duplicating profile");
  assert(cv2.profile.attachedDocuments.length === 2, "Profile attached documents version history updated to 2 versions");

  // Verify the profile was actually persisted to the Supabase employees table
  const { data: persistedRows } = await supabase.from("employees").select("*").eq("id", cv2.profile.employeeId).limit(1);
  assert(!!persistedRows && persistedRows.length === 1, "Deduplicated profile persisted to Supabase employees table");
  assert(
    persistedRows?.[0]?.cv_data?.attachedDocuments?.length === 2,
    "Full 6-tab profile (cv_data) stored in database with document history"
  );

  // Cleanup test rows created by the deduplication test (soft-deletes when RLS blocks hard delete)
  await deleteEmployeeEverywhere(cv1.profile.employeeId);
  await deleteEmployeeEverywhere(cv2.profile.employeeId);

  // 5. Test Photo Extraction File Creation
  const imageBuffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
  const avatarPath = await extractAndSaveProfilePhoto(imageBuffer, "image/png", "candidate_photo.png", "EMP-99001");
  assert(typeof avatarPath === "string" && avatarPath.includes("emp-99001_avatar.png"), "Profile Photo Extraction saves candidate picture");

  console.log(`\n=================================================`);
  console.log(`VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log(`=================================================\n`);
  process.exit(passedTests === totalTests ? 0 : 1);
}

verifyAllMasterRequirements();
