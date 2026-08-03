"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Activity } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export interface ActivityItem {
  id: string;
  icon?: any;
  color?: string;
  text: string;
  timestamp: string;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    setActivities([]);
  }, []);

  return (
    <Card className="h-full flex flex-col justify-between border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#111c38]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
          Recent Activities
        </CardTitle>
        <Link href="/employees" className="text-xs font-bold text-[#0066ff] hover:underline dark:text-[#0066ff]">
          View All -&gt;
        </Link>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
            <Activity className="h-8 w-8 text-slate-400" />
            <p className="text-xs text-slate-500 font-medium">No Recent Activities Found</p>
            <p className="text-[11px] text-slate-400">Recent activities will be recorded here when system actions occur.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((act) => (
              <div key={act.id} className="flex items-start space-x-3 text-xs">
                <div className="p-2 rounded-xl shrink-0 bg-[#e8f1ff] text-[#0066ff]">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{act.text}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{act.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
