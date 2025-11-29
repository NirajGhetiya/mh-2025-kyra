import { CheckCircle, Clock, BarChart3, XCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface StatusCardsProps {
  stats: {
    total_approved: number;
    total_pending: number;
    total_under_review: number;
    total_rejected: number;
    total_kyc_count?: number;
  };
}

export const StatusCards = ({ stats }: StatusCardsProps) => {
  const totalKYC = stats.total_kyc_count || 
    (stats.total_approved + stats.total_pending + stats.total_under_review + stats.total_rejected);

  const getPercentage = (value: number) => {
    return totalKYC > 0 ? Math.round((value / totalKYC) * 100) : 0;
  };

  const getTrendData = (status: string, value: number) => {
    const percentage = getPercentage(value);
    const trends = {
      approved: { trend: '+12%', direction: 'up' as const, color: 'text-emerald-600' },
      pending: { trend: '+5%', direction: 'up' as const, color: 'text-blue-600' },
      under_review: { trend: '-3%', direction: 'down' as const, color: 'text-amber-600' },
      rejected: { trend: '-8%', direction: 'down' as const, color: 'text-rose-600' }
    };

    return trends[status as keyof typeof trends] || { trend: '0%', direction: 'flat', color: 'text-gray-600' };
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'flat') => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-3 w-3" />;
      case 'down': return <TrendingDown className="h-3 w-3" />;
      default: return <Minus className="h-3 w-3" />;
    }
  };

  const StatusCard = ({ 
    title, 
    value, 
    icon: Icon, 
    percentage,
    trend,
    gradient,
    status
  }: {
    title: string;
    value: number;
    icon: any;
    percentage: number;
    trend: { trend: string; direction: 'up' | 'down' | 'flat'; color: string };
    gradient: string;
    status: string;
  }) => (
    <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${gradient}`} />
      
      <div className={`absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient.replace('bg-', 'from-').replace(' to-', ' via-')}`} />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {value}
              </span>
              <Badge 
                variant="outline" 
                className={`${trend.color} border-current/20 bg-current/5 text-xs font-semibold flex items-center gap-1`}
              >
                {getTrendIcon(trend.direction)}
                {trend.trend}
              </Badge>
            </div>
          </div>
          
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium">Progress</span>
            <span className="font-semibold text-gray-900">{percentage}%</span>
          </div>
          <Progress 
            value={percentage} 
            className={`h-2 bg-gray-200 [&>div]:${gradient.replace('bg-', 'bg-')}`}
          />
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500 font-medium">
            {value} of {totalKYC} total
          </span>
          <div className={`w-2 h-2 rounded-full ${gradient.replace('bg-', 'bg-')}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          title="Approved"
          value={stats.total_approved}
          icon={CheckCircle}
          percentage={getPercentage(stats.total_approved)}
          trend={getTrendData('approved', stats.total_approved)}
          gradient="bg-gradient-to-br from-emerald-500 to-green-600"
          status="approved"
        />

        <StatusCard
          title="Pending"
          value={stats.total_pending}
          icon={Clock}
          percentage={getPercentage(stats.total_pending)}
          trend={getTrendData('pending', stats.total_pending)}
          gradient="bg-gradient-to-br from-blue-100 to-cyan-900"
          status="pending"
        />

        <StatusCard
          title="Under Review"
          value={stats.total_under_review}
          icon={BarChart3}
          percentage={getPercentage(stats.total_under_review)}
          trend={getTrendData('under_review', stats.total_under_review)}
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          status="under_review"
        />

        <StatusCard
          title="Rejected"
          value={stats.total_rejected}
          icon={XCircle}
          percentage={getPercentage(stats.total_rejected)}
          trend={getTrendData('rejected', stats.total_rejected)}
          gradient="bg-gradient-to-br from-rose-500 to-red-600"
          status="rejected"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl border border-gray-200/60 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-gray-700">Live Status Summary</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-gray-600">Approved: </span>
              <span className="font-bold text-gray-900">{getPercentage(stats.total_approved)}%</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Pending: </span>
              <span className="font-bold text-gray-900">{getPercentage(stats.total_pending)}%</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-gray-600">Review: </span>
              <span className="font-bold text-gray-900">{getPercentage(stats.total_under_review)}%</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
              <span className="text-gray-600">Rejected: </span>
              <span className="font-bold text-gray-900">{getPercentage(stats.total_rejected)}%</span>
            </div>
          </div>
        </div>

        <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm border border-gray-300/50">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
          Updated just now
        </Badge>
      </div>
    </div>
  );
};