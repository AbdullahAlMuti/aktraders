import { PageContainer } from "@/components/layouts/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { HelpCircle, Mail, Phone, BookOpen, MessageSquare } from "lucide-react";

export const metadata = {
  title: "সাহায্য কেন্দ্র (Help Center)",
  description: "AK Traders ERP user guides and support",
};

export default function HelpCenterPage() {
  const faqs = [
    {
      q: "কীভাবে নতুন CV আপলোড ও AI প্রসেসিং করব?",
      a: "বাম পাশের সাইডবার থেকে 'সিডি আপলোড' ট্যাবে যান। আপনার PDF/Image ফাইলটি ড্র্যাগ করে ড্রপ করুন বা ব্রাউজ করুন। AI স্বয়ংক্রিয়ভাবে তথ্য এক্সট্র্যাক্ট করবে।",
    },
    {
      q: "সিস্টেম থেকে রিপোর্ট কীভাবে Excel বা PDF এ এক্সপোর্ট করব?",
      a: "'রিপোর্ট' পৃষ্ঠায় গিয়ে ডানপাশের 'Excel এক্সপোর্ট' বা 'PDF এক্সপোর্ট' বোতামে ক্লিক করুন।",
    },
    {
      q: "নতুন এডমিন বা এইচ আর ইউজার কীভাবে যুক্ত করব?",
      a: "'ব্যবহারকারী' (User Management) সেকশনে গিয়ে 'Add User' বোতামে ক্লিক করুন এবং প্রয়োজনীয় তথ্য প্রদান করুন।",
    },
  ];

  return (
    <PageContainer
      title="সাহায্য কেন্দ্র (Help Center & Support)"
      subtitle="সিস্টেম ব্যবহার নির্দেশিকা ও সাপোর্ট টিম যোগাযোগ"
      breadcrumbs={[{ label: "সাহায্য কেন্দ্র" }]}
    >
      <div className="space-y-6 max-w-4xl">
        {/* Support Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center space-y-2">
            <BookOpen className="h-8 w-8 text-blue-600 mb-1" />
            <h4 className="font-bold text-sm">ইউজার গাইড</h4>
            <p className="text-xs text-slate-500">ধাপ ভিত্তিক নির্দেশিকা পড়ুন</p>
          </Card>

          <Card className="p-4 border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center space-y-2">
            <Mail className="h-8 w-8 text-emerald-600 mb-1" />
            <h4 className="font-bold text-sm">ইমেইল সাপোর্ট</h4>
            <p className="text-xs text-slate-500">support@aktraders.com</p>
          </Card>

          <Card className="p-4 border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center space-y-2">
            <Phone className="h-8 w-8 text-purple-600 mb-1" />
            <h4 className="font-bold text-sm">হটলাইন হেল্পলাইন</h4>
            <p className="text-xs text-slate-500">+880 9612-000000</p>
          </Card>
        </div>

        {/* FAQs */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <span>সাধারণ জিজ্ঞাসিত প্রশ্নাবলী (Frequently Asked Questions)</span>
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
