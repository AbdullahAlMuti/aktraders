import { PageContainer } from "@/components/layouts/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Mail, Phone, BookOpen, MessageSquare } from "lucide-react";

export const metadata = {
  title: "Help Center",
  description: "AK Traders ERP user guides and support",
};

export default function HelpCenterPage() {
  const faqs = [
    {
      q: "How do I upload a new CV and run AI extraction?",
      a: "Navigate to 'CV Upload' from the left sidebar. Drag and drop your PDF/Image CV file into the dropzone or click browse. The AI will automatically extract and structure the employee data.",
    },
    {
      q: "How can I export system reports to Excel or PDF?",
      a: "Go to the 'Reports & Analytics' page and click on either the 'Export Excel' (green) or 'Export PDF' (red) buttons located at the top right of the page.",
    },
    {
      q: "How do I add a new System Administrator or HR user?",
      a: "Go to the 'User Management' section under Admin, click the 'Add User' button, and fill in the required account details and roles.",
    },
  ];

  return (
    <PageContainer
      title="Help Center & Support"
      subtitle="System documentation, FAQs, and IT support contacts"
      breadcrumbs={[{ label: "Help Center" }]}
    >
      <div className="space-y-6 max-w-4xl">
        {/* Support Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center space-y-2">
            <BookOpen className="h-8 w-8 text-blue-600 mb-1" />
            <h4 className="font-bold text-sm">User Guides</h4>
            <p className="text-xs text-slate-500">Read step-by-step tutorials</p>
          </Card>

          <Card className="p-4 border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center space-y-2">
            <Mail className="h-8 w-8 text-emerald-600 mb-1" />
            <h4 className="font-bold text-sm">Email Support</h4>
            <p className="text-xs text-slate-500">support@aktraders.com</p>
          </Card>

          <Card className="p-4 border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center space-y-2">
            <Phone className="h-8 w-8 text-purple-600 mb-1" />
            <h4 className="font-bold text-sm">IT Helpline</h4>
            <p className="text-xs text-slate-500">+880 9612-000000</p>
          </Card>
        </div>

        {/* FAQs */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <span>Frequently Asked Questions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1 text-xs">
                <h5 className="font-bold text-slate-900 dark:text-slate-100">{item.q}</h5>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
