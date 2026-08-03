"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { UploadCloud, UserPlus, Activity } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function ActivityFeed() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from("employees")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (!error && data && data.length > 0) {
          const formatted = data.map((emp: any) => ({
            icon: emp.status === "active" ? UserPlus : UploadCloud,
            color: emp.status === "active"
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-amber-500/10 text-amber-400",
            text: `Candidate profile record saved: ${emp.name}`,
            timestamp: emp.created_at ? new Date(emp.created_at).toLocaleString() : "Recently",
          }));
          setActivities(formatted);
        }
      } catch (e) {
        console.warn("Could not fetch activities:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <Card className="h-full flex flex-col justify-between border-[#e6dfd8] dark:border-[#2e2c28] bg-card text-card-foreground">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-bold text-foreground">
          Recent Audit Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
            Loading activity log...
          </div>
        ) : activities.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <div className="mx-auto h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">No Audit Logs Yet</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">System activity and CV extractions will be logged here.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((act, index) => {
              const Icon = act.icon;
              return (
                <div key={index} className="flex items-start space-x-3 text-xs">
                  <div className={`p-2 rounded-xl shrink-0 ${act.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{act.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{act.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
