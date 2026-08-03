import { PageContainer } from "@/components/layouts/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Download, Mail, Phone, MapPin, Briefcase, GraduationCap, FileText } from "lucide-react";

export const metadata = {
  title: "Employee Profile",
  description: "Detailed employee CV profile view",
};

export default function EmployeeProfilePage() {
  const employee = {
    id: "EMP-1001",
    name: "Md. Rahim Hasan",
    designation: "Senior Executive",
    department: "Sales",
    email: "rahim.hasan@aktraders.com",
    phone: "01712345678",
    address: "Dhaka, Bangladesh",
    joiningDate: "02 May 2024",
    status: "active" as const,
    education: [
      { degree: "BSc in Computer Science & Engineering", institution: "University of Dhaka", year: "2018", cgpa: "3.25 / 4.00" }
    ],
    experience: [
      { role: "Senior Executive", company: "A K Traders Limited", duration: "2024 - Present" },
      { role: "Executive - Sales", company: "ABC Limited", duration: "2021 - 2024" }
    ],
    skills: ["ERP Systems", "Sales Strategy", "Data Analysis", "Project Management"],
  };

  return (
    <PageContainer
      title="Employee Profile"
      subtitle="Comprehensive personal and professional CV details"
      breadcrumbs={[{ label: "Employee Directory", href: "/employees" }, { label: employee.name }]}
      actions={
        <Button className="bg-[#1657FF] hover:bg-blue-700" leftIcon={<Download className="h-4 w-4" />}>
          Download Original CV
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-slate-200/80 dark:border-slate-800 text-center p-6">
            <div className="flex flex-col items-center">
              <Avatar name={employee.name} size="xl" className="h-24 w-24 text-2xl shadow-lg mb-4" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{employee.name}</h2>
              <p className="text-sm font-medium text-slate-500">{employee.designation}</p>
              <Badge variant="success" className="mt-2">
                Active Staff
              </Badge>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3 text-left text-xs">
              <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                <Mail className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="truncate">{employee.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                <Phone className="h-4 w-4 text-blue-600 shrink-0" />
                <span>{employee.phone}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                <span>{employee.address}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                <Briefcase className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Department: {employee.department}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Detailed Specs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Education */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center space-x-2 pb-3">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base font-bold">Academic Background</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {employee.education.map((edu, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{edu.degree}</h4>
                  <p className="text-slate-600 dark:text-slate-400">{edu.institution} ({edu.year})</p>
                  <p className="text-slate-500 font-mono text-[11px]">CGPA: {edu.cgpa}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center space-x-2 pb-3">
              <Briefcase className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-base font-bold">Work Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {employee.experience.map((exp, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-1">
                  <div className="flex justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{exp.role}</h4>
                    <span className="text-[11px] font-mono text-slate-500">{exp.duration}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{exp.company}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Skills Badges */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center space-x-2 pb-3">
              <FileText className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-base font-bold">Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {employee.skills.map((skill, i) => (
                <Badge key={i} variant="default" className="text-xs px-3 py-1">
                  {skill}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
