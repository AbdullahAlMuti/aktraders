import { PageContainer } from "@/components/layouts/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "সেটিংস (System Settings)",
  description: "Configure system preferences and settings",
};

export default function SettingsPage() {
  return (
    <PageContainer
      title="সেটিংস (System Settings)"
      subtitle="আপনার অ্যাকাউন্ট ও অ্যাপ্লিকেশনের কনফিগারেশন পরিবর্তন করুন"
      breadcrumbs={[{ label: "সেটিংস" }]}
    >
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>সাধারণ সেটিংস (General Settings)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="কোম্পানির নাম (Company Name)" defaultValue="A K Traders Limited" />
            <Input label="সিস্টেম ইমেইল (System Email)" defaultValue="info@aktraders.com" />
            <Button className="bg-[#1657FF] hover:bg-blue-700">সংরক্ষণ করুন</Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
