"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageContainer } from "@/components/layouts/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Download, Mail, Phone, MapPin, Briefcase, GraduationCap, FileText, UserX } from "lucide-react";
import { employeeService } from "@/services/employee.service";
import { Employee } from "@/types/employee.types";

export default function EmployeeProfilePage() {
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("id");
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employeeId) {
      employeeService.getEmployeeById(employeeId).then((res) => {
        setEmployee(res);
        setLoading(false);
      });
    } else {
      // Fetch latest employee from database
      employeeService.getEmployees({ limit: 1 }).then((res) => {
        if (res && res.data && res.data.length > 0) {
          setEmployee(res.data[0]);
        } else {
          setEmployee(null);
        }
        setLoading(false);
      });
    }
  }, [employeeId]);

  if (loading) {
    return (
      <PageContainer title="Employee Profile" subtitle="Detailed employee profile view">
        <div className="py-20 text-center text-xs text-neutral-400 font-mono">এমপ্লয়ী প্রোফাইল ডাটা লোড হচ্ছে... (Loading profile...)</div>
      </PageContainer>
    );
  }

  if (!employee) {
    return (
      <PageContainer title="Employee Profile" subtitle="Detailed employee profile view">
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 border border-dashed border-[#e6dfd8] dark:border-[#2e2c28] rounded-2xl">
          <UserX className="h-10 w-10 text-neutral-400" />
          <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">কোন এমপ্লয়ী প্রোফাইল ডাটা পাওয়া যায়নি</h3>
          <p className="text-xs text-neutral-500 max-w-md">
            No employee record exists in the database for the requested ID. Please add an employee or select a valid profile from the directory.
          </p>
        </div>
      </PageContainer>
    );
  }

  const cvData = employee.cvData || {};
  const education = cvData.education || [];
  const experience = cvData.experience || [];
  const skills = cvData.skills || [];

  return (
    <PageContainer
      title="Employee Profile"
      subtitle="Comprehensive personal and professional CV details"
      breadcrumbs={[{ label: "Employee Directory", href: "/employees" }, { label: employee.name }]}
      actions={
        employee.cvFileName ? (
          <Button className="bg-[#cc785c] hover:bg-[#a9583e] text-white" leftIcon={<Download className="h-4 w-4" />}>
            Download Original CV ({employee.cvFileName})
          </Button>
        ) : undefined
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-[#e6dfd8] dark:border-[#2e2c28] text-center p-6">
            <div className="flex flex-col items-center">
              <Avatar name={employee.name} size="xl" className="h-24 w-24 text-2xl shadow-lg mb-4" />
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{employee.name}</h2>
              <p className="text-sm font-medium text-neutral-500">{employee.designation || "Staff"}</p>
              <Badge variant={employee.status === "active" ? "success" : "secondary"} className="mt-2">
                {employee.status} Staff
              </Badge>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-3 text-left text-xs">
              <div className="flex items-center space-x-3 text-neutral-600 dark:text-neutral-400">
                <Mail className="h-4 w-4 text-[#cc785c] shrink-0" />
                <span className="truncate">{employee.email || "N/A"}</span>
              </div>
              <div className="flex items-center space-x-3 text-neutral-600 dark:text-neutral-400">
                <Phone className="h-4 w-4 text-[#cc785c] shrink-0" />
                <span>{employee.phone || "N/A"}</span>
              </div>
              <div className="flex items-center space-x-3 text-neutral-600 dark:text-neutral-400">
                <Briefcase className="h-4 w-4 text-[#cc785c] shrink-0" />
                <span>Department: {employee.department || "General"}</span>
              </div>
              <div className="flex items-center space-x-3 text-neutral-600 dark:text-neutral-400">
                <MapPin className="h-4 w-4 text-[#cc785c] shrink-0" />
                <span>Joining Date: {employee.joiningDate || "N/A"}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Detailed Specs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Academic Background */}
          <Card className="border-[#e6dfd8] dark:border-[#2e2c28]">
            <CardHeader className="flex flex-row items-center space-x-2 pb-3">
              <GraduationCap className="h-5 w-5 text-[#cc785c]" />
              <CardTitle className="text-base font-bold">Academic Background</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {education.length === 0 ? (
                <p className="text-xs text-neutral-400 font-mono">কোন শিক্ষাগত তথ্য নেই (No education history)</p>
              ) : (
                education.map((edu: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 space-y-1">
                    <h4 className="font-bold text-neutral-900 dark:text-white">{edu.degree || "Degree"}</h4>
                    <p className="text-neutral-600 dark:text-neutral-400">{edu.institution} ({edu.year})</p>
                    {edu.cgpa && <p className="text-neutral-500 font-mono text-[11px]">CGPA: {edu.cgpa}</p>}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card className="border-[#e6dfd8] dark:border-[#2e2c28]">
            <CardHeader className="flex flex-row items-center space-x-2 pb-3">
              <Briefcase className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-base font-bold">Work Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {experience.length === 0 ? (
                <p className="text-xs text-neutral-400 font-mono">কোন কাজের অভিজ্ঞতা নেই (No work experience history)</p>
              ) : (
                experience.map((exp: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 space-y-1">
                    <div className="flex justify-between">
                      <h4 className="font-bold text-neutral-900 dark:text-white">{exp.role || "Role"}</h4>
                      <span className="text-[11px] font-mono text-neutral-500">{exp.duration}</span>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400">{exp.company}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Skills & Expertise */}
          <Card className="border-[#e6dfd8] dark:border-[#2e2c28]">
            <CardHeader className="flex flex-row items-center space-x-2 pb-3">
              <FileText className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-base font-bold">Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {skills.length === 0 ? (
                <p className="text-xs text-neutral-400 font-mono">কোন দক্ষতা তালিকাভুক্ত নেই (No skills listed)</p>
              ) : (
                skills.map((skill: string, i: number) => (
                  <Badge key={i} variant="default" className="text-xs px-3 py-1">
                    {skill}
                  </Badge>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
