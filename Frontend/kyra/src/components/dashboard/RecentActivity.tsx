import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Clock, Activity, MoreHorizontal } from "lucide-react";

interface RecentActivityItem {
  kyc_id: number;
  name: string;
  changed_at: string;
  status: "approved" | "rejected" | "pending" | "under_review";
}

interface RecentActivityProps {
  data: RecentActivityItem[];
}

export const RecentActivity = ({ data }: RecentActivityProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return {
          icon: CheckCircle,
          color: "text-emerald-600",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
          badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200"
        };
      case "rejected":
        return {
          icon: XCircle,
          color: "text-rose-600",
          bgColor: "bg-rose-50",
          borderColor: "border-rose-200",
          badgeColor: "bg-rose-100 text-rose-800 border-rose-200"
        };
      case "under_review":
        return {
          icon: AlertCircle,
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          badgeColor: "bg-amber-100 text-amber-800 border-amber-200"
        };
      case "pending":
        return {
          icon: Clock,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          badgeColor: "bg-blue-100 text-blue-800 border-blue-200"
        };
      default:
        return {
          icon: Clock,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          badgeColor: "bg-gray-100 text-gray-800 border-gray-200"
        };
    }
  };

  const ActivityItem = ({ activity }: { activity: RecentActivityItem }) => {
    const config = getStatusConfig(activity.status);
    const Icon = config.icon;

    return (
      <div className="group flex items-center gap-4 p-4 rounded-xl border border-gray-200/60 hover:border-gray-300 hover:shadow-md transition-all duration-200 bg-white">
        <div className={`p-3 rounded-xl ${config.bgColor} ${config.borderColor} border group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`h-5 w-5 ${config.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-gray-900 truncate">{activity.name}</p>
            <Badge 
              variant="outline" 
              className={`${config.badgeColor} text-xs font-medium capitalize`}
            >
              {activity.status.replace('_', ' ')}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="font-mono">#KYC{activity.kyc_id}</span>
            <span>•</span>
            <span className="font-medium">{formatDate(activity.changed_at)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-600" />
            Recent Activity
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.slice(0, 5).map((activity) => (
            <ActivityItem key={activity.kyc_id} activity={activity} />
          ))}
        </div>

        {data.length === 0 && (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No recent activity</p>
            <p className="text-sm text-gray-400 mt-1">Activity will appear here as it happens</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};