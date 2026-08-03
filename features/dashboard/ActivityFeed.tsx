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
    // In production, activity feed is populated from live system log events.
    // Starts 100% empty until real user/system actions occur.
    setActivities([]);
  }, []);

  return (
    <Card className="h-full flex flex-col justify-between border-[#e6dfd8] dark:border-[#2e2c28]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-bold text-neutral-900 dark:text-white">
          Recent Activities
        </CardTitle>
        <Link href="/employees" className="text-xs font-semibold text-[#cc785c] hover:underline dark:text-[#cc785c]">
          View All -&gt;
        </Link>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
            <Activity className="h-8 w-8 text-neutral-400" />
            <p className="text-xs text-neutral-500 font-medium">সাম্প্রতিক কোন কার্যকলাপ পাওয়া যায়নি</p>
            <p className="text-[11px] text-neutral-400">Recent activities will be recorded here when system actions occur.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((act) => (
              <div key={act.id} className="flex items-start space-x-3 text-xs">
                <div className="p-2 rounded-xl shrink-0 bg-neutral-100 dark:bg-neutral-800 text-[#cc785c]">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">{act.text}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{act.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
