import { Users, CheckCircle, Clock, Calendar, TrendingUp, Zap, Target, BarChart3, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface StatsOverviewProps {
  stats: {
    total_kyc_count: number;
    approval_rate: number;
    avg_processing: string;
    todays_kyc_count: number;
    week_growth: number;
    total_approved: number;
  };
}

export const StatsOverview = ({ stats }: StatsOverviewProps) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 20) return "text-green-600";
    if (growth > 10) return "text-blue-600";
    if (growth > 0) return "text-yellow-600";
    return "text-red-600";
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return "↗";
    if (growth < 0) return "↘";
    return "→";
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    subtitle, 
    trend, 
    gradient,
    delay 
  }: {
    title: string;
    value: string | number;
    icon: any;
    subtitle: string;
    trend?: { value: number; label: string };
    gradient: string;
    delay?: number;
  }) => (
    <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${gradient}`} />
      
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      <CardHeader className="flex flex-row items-center justify-between pb-3 relative z-10">
        <CardTitle className="text-sm font-semibold text-gray-600 tracking-wide">
          {title}
        </CardTitle>
        <div className="p-2 rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-sm group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
              {value}
            </div>
            <p className="text-xs text-gray-500 mt-2 font-medium">{subtitle}</p>
          </div>
          
          {trend && (
            <Badge 
              variant="outline" 
              className={`${getGrowthColor(trend.value)} border-current/20 bg-current/5 font-semibold`}
            >
              <span className="text-xs mr-1">{getGrowthIcon(trend.value)}</span>
              {trend.label}
            </Badge>
          )}
        </div>

        {title === "Approval Rate" && (
          <div className="mt-4 space-y-2">
            <Progress 
              value={stats.approval_rate} 
              className="h-2 bg-gray-200 [&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-emerald-500"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
            <Activity className="h-5 w-5 text-white" />
          </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Performance Overview</h2>
          <p className="text-sm text-gray-500">Key metrics and insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total KYC"
          value={formatNumber(stats.total_kyc_count)}
          icon={Users}
          subtitle="All time verifications"
          trend={{ value: stats.week_growth, label: `+${stats.week_growth}%` }}
          gradient="bg-gradient-to-br from-blue-500 to-purple-600"
          delay={100}
        />

        <StatCard
          title="Approval Rate"
          value={`${stats.approval_rate}%`}
          icon={CheckCircle}
          subtitle={`${formatNumber(stats.total_approved)} approved`}
          gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          delay={200}
        />

        <StatCard
          title="Avg. Processing"
          value={`${stats.avg_processing} mins`}
          icon={Zap}
          subtitle="Per application"
          gradient="bg-gradient-to-br from-orange-500 to-red-600"
          delay={300}
        />

        <StatCard
          title="Today's Submissions"
          value={formatNumber(stats.todays_kyc_count)}
          icon={Target}
          subtitle="New applications"
          gradient="bg-gradient-to-br from-purple-500 to-pink-600"
          delay={400}
        />
      </div>
    </div>
  );
};