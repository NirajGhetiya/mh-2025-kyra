import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, MailIcon, PhoneIcon, User, UserCircle, UserIcon } from "lucide-react";
import { KYCRecord } from "@/types/kyc";

interface PersonalInfoSectionProps {
  record: KYCRecord;
}

export const PersonalInfoSection = ({ record }: PersonalInfoSectionProps) => {
  const getImageSrc = (base64String: string) => {
    if (!base64String) return "";
    if (base64String.startsWith('data:')) {
      return base64String;
    }
    return `data:image/jpeg;base64,${base64String}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
  
    let date = new Date(dateString);
    if (isNaN(date.getTime())) {
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split("/");
        date = new Date(`${year}-${month}-${day}`);
      }

      else if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split("-");
        date = new Date(`${year}-${month}-${day}`);
      }

      else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
        const [month, day, year] = dateString.split("/");
        date = new Date(`${year}-${month}-${day}`);
      }
      if (isNaN(date.getTime())) return dateString;
    }
  
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const capitalize = (value: string) =>
    value
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());

  const InfoItem = ({ icon: Icon, label, value }: {
    icon: any;
    label: string;
    value: string;
  }) => (
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
    <Card className="border-blue-600/20 hover:shadow-lg transition-shadow">
      <CardHeader className="bg-blue-600/10 transition-shadow">
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 flex justify-center">
                  <div className="relative">
                    <div className="w-60 h-60 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-blue-50 to-gray-50">
                      {record.details.photoImage ? (
                        <img
                          src={getImageSrc(record.details.photoImage)}
                          alt="User photo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-100">
                          <User className="w-20 h-20 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1.5 shadow-lg border-2 border-white">
                      <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      {record.details?.name && (
                        <InfoItem
                          icon={UserCircle}
                          label="Name"
                          value={record.details.name}
                        />
                      )}

                      {record.details?.emailId && (
                        <InfoItem
                          icon={MailIcon}
                          label="Email"
                          value={record.details.emailId}
                        />
                      )}

                      {record.details?.emailId && (
                        <InfoItem
                          icon={PhoneIcon}
                          label="Phone"
                          value={record.details.mobileNo}
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      {record.details?.dob && (
                        <InfoItem
                          icon={CalendarIcon}
                          label="Date of Birth"
                          value={formatDate(record.details.dob)}
                        />
                      )}

                      {record.details?.fatherName && (
                        <InfoItem
                          icon={UserIcon}
                          label="Father Name"
                          value={`${record.details.fatherName}`}
                        />
                      )}

                      {record.details?.gender && (
                        <InfoItem
                          icon={UserCircle}
                          label="Gender"
                          value={capitalize(record.details.gender)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
      </CardContent>
    </Card>
  );
};