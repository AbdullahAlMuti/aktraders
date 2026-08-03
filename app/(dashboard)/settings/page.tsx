import { PageContainer } from "@/components/layouts/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "System Settings",
  description: "Configure system preferences and settings",
};

export default function SettingsPage() {
  return (
    <PageContainer
      title="System Settings"
      subtitle="Configure account parameters, organization metadata, and application preferences"
      breadcrumbs={[{ label: "Settings" }]}
    >
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Company Name" defaultValue="A K Traders Limited" />
            <Input label="System Admin Email" defaultValue="info@aktraders.com" />
            <Button className="bg-[#1657FF] hover:bg-blue-700">Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
