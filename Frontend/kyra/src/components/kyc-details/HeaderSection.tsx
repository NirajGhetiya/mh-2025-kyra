import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { KYCRecord } from "@/types/kyc";
import { getStatusColor } from "../dashboard/KYCList";

interface HeaderSectionProps {
  record: KYCRecord;
}

export const HeaderSection = ({ record }: HeaderSectionProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-gray-200 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="
                font-medium 
                hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600
                hover:text-white
                hover:border-transparent
                transition-all duration-200
              "
          >
            <ArrowLeft className="h-10 w-10" />
          </Button>

          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              KYC Details
              <Badge
                variant="secondary"
                className="bg-blue-50 from-blue-600 to-purple-600 text-blue-700 border-blue-200 font-medium text-sm"
              >
                ID: {record.kyc_id}
              </Badge>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Review and manage KYC verification details
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500 font-medium">Status</p>
            <Badge
              className={`${getStatusColor(
                record.status
              )} px-3 py-1 text-sm font-semibold capitalize`}
            >
              {record.status.replace("_", " ").toLowerCase()}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
