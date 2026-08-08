import { NextRequest, NextResponse } from "next/server";
import {
  localEmployeeStore,
  buildFullProfileFromRecord,
  loadProfileFromDb,
  saveProfileToDb,
  deleteEmployeeEverywhere,
  supabase,
} from "@/lib/db-schema";
import { FullEmployeeProfile } from "@/types/employee.types";

export const dynamic = "force-dynamic";

async function findProfile(id: string): Promise<FullEmployeeProfile | null> {
  // 1. Supabase `employees` table (source of truth) by any identifier
  const dbProfile = await loadProfileFromDb(id);
  if (dbProfile) return dbProfile;

  // 2. In-memory cache
  const cached = localEmployeeStore.get(id);
  if (cached) return cached;
  for (const p of localEmployeeStore.values()) {
    if (p.id === id || p.employeeId === id || p.applicantId === id || p.cvNumber === id) {
      return p;
    }
  }

  // 3. Legacy raw CV record by its exact id
  try {
    const { data } = await supabase.from("cv_records").select("*").eq("id", id).limit(1);
    if (data && data.length > 0) {
      return buildFullProfileFromRecord(data[0]);
    }
  } catch (dbErr) {
    console.warn("DB lookup notice:", dbErr);
  }

  return null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const profile = await findProfile(id);

    if (!profile) {
      return NextResponse.json({ success: false, error: `Employee Profile '${id}' not found.` }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile });
  } catch (err: any) {
    console.error("GET Employee Profile error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const profile = await findProfile(id);
    if (!profile) {
      return NextResponse.json({ success: false, error: "Profile not found to update." }, { status: 404 });
    }

    // Merge manual profile updates across all 6 tabs
    const updatedProfile: FullEmployeeProfile = {
      ...profile,
      ...body,
      id: profile.id,
      employeeId: profile.employeeId,
      applicantId: profile.applicantId,
      cvNumber: profile.cvNumber,
      personalInformation: { ...profile.personalInformation, ...(body.personalInformation || {}) },
      employmentDetails: { ...profile.employmentDetails, ...(body.employmentDetails || {}) },
      educationalQualifications: body.educationalQualifications || profile.educationalQualifications,
      workExperience: body.workExperience || profile.workExperience,
      attachedDocuments: body.attachedDocuments || profile.attachedDocuments,
      otherDetails: { ...profile.otherDetails, ...(body.otherDetails || {}) },
      updatedAt: new Date().toISOString(),
    };

    const persisted = await saveProfileToDb(updatedProfile);
    if (!persisted) {
      return NextResponse.json(
        { success: false, error: "Profile changes could not be saved to the database." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (err: any) {
    console.error("PUT Employee Profile error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ok = await deleteEmployeeEverywhere(id);

    if (!ok) {
      return NextResponse.json({ success: false, error: "Failed to delete employee profile." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Employee profile ${id} deleted.` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
