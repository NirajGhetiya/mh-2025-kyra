import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KYCRecord } from "@/types/kyc";
import { CheckCircle, Gauge, Shield, Video, XCircle } from "lucide-react";

interface PersonalInfoSectionProps {
  record: KYCRecord;
}

export const LivenessSection = ({ record }: PersonalInfoSectionProps) => {

  const getImageSrc = (base64String: string) => {
    if (!base64String) return "";
    return base64String.startsWith('data:') ? base64String : `data:image/jpeg;base64,${base64String}`;
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'pass' || statusLower === 'approved') {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-green-700 bg-green-100 font-semibold">
        <CheckCircle className="w-4 h-4 mr-1" /> Pass
      </span>;
    } else if (statusLower === 'fail' || statusLower === 'rejected') {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-red-700 bg-red-100 font-semibold">
        <XCircle className="w-4 h-4 mr-1" /> Fail
      </span>;
    } else {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-yellow-700 bg-yellow-100 font-semibold">
        Pending
      </span>;
    }
  };

  const InfoItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | JSX.Element }) => (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-b-0">
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
        <p className="text-base font-semibold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );

  return (
    <Card className="border-purple-600/20 hover:shadow-lg transition-shadow">
      <CardHeader className="bg-purple-600/10 transition-shadow">
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5 text-purple-600" /> 
          Liveness Verification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
          <div className="lg:col-span-1 flex justify-center">
            <div className="relative">
              <div className="w-60 h-60 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-purple-50 to-gray-50">
                {record.details.livenessImage ? (
                  <img
                    src={getImageSrc(record.details.livenessImage)}
                    alt="Liveness verification"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-100">
                    <Shield className="w-20 h-20 text-purple-600" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <InfoItem
                  icon={Gauge}
                  label="Liveness Score"
                  value={`${Math.round(record.details.livenessScore * 100)}%`}
                />
                <InfoItem
                  icon={CheckCircle}
                  label="Liveness Status"
                  value={getStatusBadge(record.details.livenessStatus)}
                />
              </div>
            </div>  
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
