import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Eye } from "lucide-react";

export function ReportTable() {
  const reports = [
    { sl: 1, department: "Sales", total: 900, active: 860, newJoinees: 95, left: 40, cvUploaded: 890 },
    { sl: 2, department: "Operations", total: 750, active: 720, newJoinees: 70, left: 30, cvUploaded: 740 },
    { sl: 3, department: "HR", total: 450, active: 430, newJoinees: 40, left: 20, cvUploaded: 445 },
    { sl: 4, department: "Finance", total: 300, active: 290, newJoinees: 25, left: 10, cvUploaded: 298 },
    { sl: 5, department: "IT", total: 300, active: 290, newJoinees: 50, left: 10, cvUploaded: 295 },
    { sl: 6, department: "Others", total: 300, active: 260, newJoinees: 40, left: 40, cvUploaded: 302 },
  ];

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="text-base font-bold">Detailed Report Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 font-bold">
                <th className="py-3 px-3 text-center">SL</th>
                <th className="py-3 px-3 text-left">Department</th>
                <th className="py-3 px-3 text-center">Total Employees</th>
                <th className="py-3 px-3 text-center">Active Employees</th>
                <th className="py-3 px-3 text-center">New Joinees</th>
                <th className="py-3 px-3 text-center">Resigned / Retired</th>
                <th className="py-3 px-3 text-center">CV Uploaded</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {reports.map((row) => (
                <tr key={row.sl} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 text-center font-bold text-slate-500">{row.sl}</td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">{row.department}</td>
                  <td className="py-3 px-3 text-center font-semibold">{row.total}</td>
                  <td className="py-3 px-3 text-center text-emerald-600 font-semibold">{row.active}</td>
                  <td className="py-3 px-3 text-center text-blue-600 font-semibold">{row.newJoinees}</td>
                  <td className="py-3 px-3 text-center text-amber-600 font-semibold">{row.left}</td>
                  <td className="py-3 px-3 text-center text-purple-600 font-semibold">{row.cvUploaded}</td>
                  <td className="py-3 px-3 text-center">
                    <button className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-blue-600">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-slate-700">
                <td colSpan={2} className="py-3 px-3">Total</td>
                <td className="py-3 px-3 text-center">3,000</td>
                <td className="py-3 px-3 text-center text-emerald-600">2,850</td>
                <td className="py-3 px-3 text-center text-blue-600">320</td>
                <td className="py-3 px-3 text-center text-amber-600">120</td>
                <td className="py-3 px-3 text-center text-purple-600">2,980</td>
                <td className="py-3 px-3 text-center">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
