import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KYCRecord } from "@/types/kyc";
import { MapPin } from "lucide-react";

interface PersonalInfoSectionProps {
  record: KYCRecord;
}

export const AddressSection = ({ record }: PersonalInfoSectionProps) => {
  const permanent = record.details.permanentAddress;
  const corporate = record.details.corporateAddress;

  const addressesAreSame =
    JSON.stringify(permanent) === JSON.stringify(corporate);

  const addresses = {
    permanent: {
      title: "Permanent Address",
      iconColor: "text-success",
      bgColor: "bg-success/20",
      borderColor: "border-success/10",
      address: {
        street: permanent.streetAddress,
        city: permanent.city,
        state: permanent.state,
        zipCode: permanent.zipCode,
        country: permanent.country,
      },
    },
    corporate: {
      title: "Current Address",
      iconColor: "text-accent",
      bgColor: "bg-accent/20",
      borderColor: "border-accent/10",
      address: {
        street: corporate.streetAddress,
        city: corporate.city,
        state: corporate.state,
        zipCode: corporate.zipCode,
        country: corporate.country,
      },
    },
  };

  const AddressCard = ({ type }: { type: keyof typeof addresses }) => {
    const { title, iconColor, bgColor, borderColor, address } = addresses[type];

    return (
      <Card className={`${borderColor} hover:shadow-lg transition-shadow`}>
        <CardHeader className={bgColor}>
          <CardTitle className="flex items-center gap-2">
            <MapPin className={`w-5 h-5 ${iconColor}`} />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-4">
          <p>{address.street}</p>
          <p>
            {address.city}, {address.state}
          </p>
          <p>{address.zipCode}</p>
          <p>{address.country}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div
      className={`grid gap-6 ${
        addressesAreSame
          ? "grid-cols-1" 
          : "grid-cols-1 md:grid-cols-2"
      }`}
    >
      <AddressCard type="permanent" />

      {!addressesAreSame && <AddressCard type="corporate" />}
    </div>
  );
};
