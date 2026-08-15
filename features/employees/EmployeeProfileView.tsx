"use client";

import { useState } from "react";
import { FullEmployeeProfile } from "@/types/employee.types";
import { User, Briefcase, GraduationCap, FileText, Award, Layers, Download, Save, CheckCircle2, ShieldCheck, Mail, Phone, MapPin, Calendar, Globe, Linkedin, Github } from "lucide-react";
import Image from "next/image";

interface Props {
  profile: FullEmployeeProfile;
  onUpdateProfile?: (updated: FullEmployeeProfile) => void;
}

export function EmployeeProfileView({ profile: initialProfile, onUpdateProfile }: Props) {
  const [profile, setProfile] = useState<FullEmployeeProfile>(initialProfile);
  const [activeTab, setActiveTab] = useState<"personal" | "employment" | "education" | "experience" | "documents" | "other">("personal");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/employees/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        onUpdateProfile?.(data.profile);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "personal", label: "1. Personal Information", icon: User },
    { id: "employment", label: "2. Employment Details", icon: Briefcase },
    { id: "education", label: "3. Educational Qualification", icon: GraduationCap },
    { id: "experience", label: "4. Work Experience", icon: Award },
    { id: "documents", label: "5. Attached Documents", icon: FileText },
    { id: "other", label: "6. Other Details", icon: Layers },
  ];

  return (
    <div className="space-y-6">
      {/* Header Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-800 border-2 border-indigo-500/30 flex items-center justify-center text-slate-400 shrink-0">
            {(profile.avatarUrl || profile.personalInformation?.photoUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={(profile.avatarUrl || profile.personalInformation?.photoUrl)!}
                alt={profile.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <User className="w-12 h-12 text-slate-400" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-white">{profile.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Active Employee
              </span>
            </div>

            <p className="text-sm text-slate-400 mt-1 font-medium">{profile.designation} &bull; {profile.organization}</p>

            <div className="flex items-center gap-2 mt-3 flex-wrap text-xs text-slate-300">
              <span className="bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 font-mono px-2.5 py-1 rounded-md">
                ID: {profile.employeeId}
              </span>
              <span className="bg-purple-950/80 border border-purple-700/50 text-purple-300 font-mono px-2.5 py-1 rounded-md">
                APP: {profile.applicantId}
              </span>
              <span className="bg-blue-950/80 border border-blue-700/50 text-blue-300 font-mono px-2.5 py-1 rounded-md">
                CV: {profile.cvNumber}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" /> Profile Saved!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Profile Changes"}
          </button>
        </div>
      </div>

      {/* 6 Tabs Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200">
        {/* Tab 1: Personal Information */}
        {activeTab === "personal" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" /> Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-medium">Full Name</label>
                <input
                  type="text"
                  value={profile.personalInformation?.fullName || profile.name}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      name: e.target.value,
                      personalInformation: { ...profile.personalInformation, fullName: e.target.value },
                    })
                  }
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Email Address</label>
                <input
                  type="email"
                  value={profile.personalInformation?.email || profile.email}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      email: e.target.value,
                      personalInformation: { ...profile.personalInformation, email: e.target.value },
                    })
                  }
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Phone Number</label>
                <input
                  type="text"
                  value={profile.personalInformation?.phone || profile.phone}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      phone: e.target.value,
                      personalInformation: { ...profile.personalInformation, phone: e.target.value },
                    })
                  }
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Gender</label>
                <input
                  type="text"
                  value={profile.personalInformation?.gender || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      personalInformation: { ...profile.personalInformation, gender: e.target.value },
                    })
                  }
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Present Address</label>
                <input
                  type="text"
                  value={profile.personalInformation?.presentAddress || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      personalInformation: { ...profile.personalInformation, presentAddress: e.target.value },
                    })
                  }
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">LinkedIn URL</label>
                <input
                  type="text"
                  value={profile.personalInformation?.linkedinUrl || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      personalInformation: { ...profile.personalInformation, linkedinUrl: e.target.value },
                    })
                  }
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Employment Details */}
        {activeTab === "employment" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" /> Employment Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-medium">Employee ID</label>
                <input type="text" disabled value={profile.employeeId} className="w-full mt-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-indigo-300 font-mono" />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Applicant ID</label>
                <input type="text" disabled value={profile.applicantId} className="w-full mt-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-purple-300 font-mono" />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Current Designation</label>
                <input
                  type="text"
                  value={profile.employmentDetails?.currentDesignation || profile.designation}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      designation: e.target.value,
                      employmentDetails: { ...profile.employmentDetails, currentDesignation: e.target.value },
                    })
                  }
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Department</label>
                <input
                  type="text"
                  value={profile.employmentDetails?.department || profile.department}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      department: e.target.value,
                      employmentDetails: { ...profile.employmentDetails, department: e.target.value },
                    })
                  }
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Educational Qualification */}
        {activeTab === "education" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-400" /> Educational Qualification
            </h2>
            <div className="space-y-4">
              {profile.educationalQualifications?.map((edu, index) => (
                <div key={edu.id || index} className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-white text-base">{edu.degree}</h3>
                    <span className="text-xs px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                      Passing Year: {edu.passingYear || "N/A"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{edu.institution}{edu.board ? ` (${edu.board})` : ""}</p>
                  <p className="text-xs text-slate-400">
                    {edu.major ? `Major: ${edu.major}` : ""}
                    {edu.major && (edu.result || edu.gpaCgpa) ? " • " : ""}
                    {(edu.result || edu.gpaCgpa) ? `Result: ${edu.result || edu.gpaCgpa}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Work Experience */}
        {activeTab === "experience" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" /> Work Experience
            </h2>
            <div className="space-y-4">
              {profile.workExperience?.map((exp, index) => (
                <div key={exp.id || index} className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-white text-base">{exp.jobTitle || exp.designation}</h3>
                    <span className="text-xs px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                      {exp.duration || "Experience Record"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 font-medium">{exp.organizationName}</p>
                  {exp.responsibilities && <p className="text-xs text-slate-400 leading-relaxed">{exp.responsibilities}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Attached Documents */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" /> Attached Documents & Version History
            </h2>
            <div className="space-y-3">
              {profile.attachedDocuments?.map((doc, idx) => (
                <div key={doc.id || idx} className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{doc.originalFileName}</p>
                      <p className="text-xs text-slate-400">CV Version {doc.version || 1} &bull; Uploaded {new Date(doc.uploadDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Download CV
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Other Details */}
        {activeTab === "other" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" /> Other Details & Extracted Skills
            </h2>

            <div>
              <label className="text-xs text-slate-400 font-medium">Technical & Professional Skills</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.otherDetails?.skills?.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-800 text-indigo-300 border border-slate-700 rounded-lg text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Languages</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.otherDetails?.languages?.map((lang, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {(profile.otherDetails?.certifications?.length || 0) > 0 && (
              <div>
                <label className="text-xs text-slate-400 font-medium">Certifications & Trainings</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.otherDetails?.certifications?.map((cert, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-800 text-emerald-300 border border-slate-700 rounded-lg text-xs font-medium">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(profile.otherDetails?.projects?.length || 0) > 0 && (
              <div>
                <label className="text-xs text-slate-400 font-medium">Projects</label>
                <ul className="mt-2 space-y-1.5">
                  {profile.otherDetails?.projects?.map((proj, i) => (
                    <li key={i} className="text-xs text-slate-300 bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2">
                      {proj}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(profile.otherDetails?.awards?.length || 0) > 0 && (
              <div>
                <label className="text-xs text-slate-400 font-medium">Achievements & Awards</label>
                <ul className="mt-2 space-y-1.5">
                  {profile.otherDetails?.awards?.map((award, i) => (
                    <li key={i} className="text-xs text-slate-300 bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2">
                      {award}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(profile.otherDetails?.references?.length || 0) > 0 && (
              <div>
                <label className="text-xs text-slate-400 font-medium">References</label>
                <ul className="mt-2 space-y-1.5">
                  {profile.otherDetails?.references?.map((ref, i) => (
                    <li key={i} className="text-xs text-slate-300 bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2">
                      {ref}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(profile.otherDetails?.careerObjective || profile.otherDetails?.professionalSummary) && (
              <div>
                <label className="text-xs text-slate-400 font-medium">
                  {profile.otherDetails?.careerObjective ? "Career Objective" : "Professional Summary"}
                </label>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2">
                  {profile.otherDetails?.careerObjective || profile.otherDetails?.professionalSummary}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
