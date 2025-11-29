import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { PieChart3 } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface StatusDistributionProps {
  stats: {
    total_approved: number;
    total_pending: number;
    total_under_review: number;
    total_rejected: number;
  };
}

export const StatusDistribution = ({ stats }: StatusDistributionProps) => {
  const total = stats.total_approved + stats.total_pending + stats.total_under_review + stats.total_rejected;

  const statusChartData = [
    { 
      name: "Approved", 
      value: stats.total_approved, 
      color: "#10b981",
      gradient: "from-emerald-500 to-green-600",
      percentage: total > 0 ? Math.round((stats.total_approved / total) * 100) : 0
    },
    { 
      name: "Pending", 
      value: stats.total_pending, 
      color: "#3b82f6",
      gradient: "from-blue-500 to-cyan-600",
      percentage: total > 0 ? Math.round((stats.total_pending / total) * 100) : 0
    },
    { 
      name: "Under Review", 
      value: stats.total_under_review, 
      color: "#f59e0b",
      gradient: "from-amber-500 to-orange-600",
      percentage: total > 0 ? Math.round((stats.total_under_review / total) * 100) : 0
    },
    { 
      name: "Rejected", 
      value: stats.total_rejected, 
      color: "#ef4444",
      gradient: "from-rose-500 to-red-600",
      percentage: total > 0 ? Math.round((stats.total_rejected / total) * 100) : 0
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <div>
              <p className="font-semibold text-gray-900">{data.name}</p>
              <p className="text-sm text-gray-600">{data.value} applications</p>
              <p className="text-sm font-semibold text-gray-900">{data.percentage}% of total</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-bold"
      >
        {`${percentage}%`}
      </text>
    );
  };

  return (
    <Card className="border-0 shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            {/* <PieChart3 className="h-5 w-5 text-purple-600" /> */}
            Status Distribution
          </CardTitle>
          <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
            {total} Total
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="w-full lg:w-1/2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="white"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  content={() => null}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full lg:w-1/2 space-y-4">
            {statusChartData.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200/60 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.value} applications</p>
                  </div>
                </div>
                <Badge 
                  className={`bg-gradient-to-r ${item.gradient} text-white font-bold`}
                >
                  {item.percentage}%
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200/60">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">Highest Status:</span>
            <span className="font-semibold text-gray-900">
              {statusChartData.reduce((prev, current) => 
                (prev.value > current.value) ? prev : current
              ).name}
            </span>
            <span className="text-gray-600 font-medium">Completion Rate:</span>
            <span className="font-semibold text-green-600">
              {statusChartData[0].percentage}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};