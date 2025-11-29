import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KYCRecord } from "@/types/kyc";
import { FileText } from "lucide-react";

interface DocumentsSectionProps {
  record: KYCRecord;
  onDocSelect: (doc: "permanent" | "corporate") => void;
}

export const DocumentsSection = ({ record, onDocSelect }: DocumentsSectionProps) => {
  const permanent = record.details.permanentAddress;
  const corporate = record.details.corporateAddress;

  const addressesAreSame =
    JSON.stringify(permanent) === JSON.stringify(corporate);

  const documents = [
    {
      type: "permanent" as const,
      title: "Permanent Address Proof",
      docType: record.details.permanentDocType?.ovdType || "Not Provided",
      previewUrl: record.details.permanentDocType?.ovdImage,
    },
    {
      type: "corporate" as const,
      title: "Current Address Proof",
      docType: record.details.corporateDocType?.ovdType || "Not Provided",
      previewUrl: record.details.corporateDocType?.ovdImage,
    },
  ];

  const DocumentCard = ({ type, title, docType, previewUrl }: typeof documents[0]) => (
    <div className="space-y-2">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">Document Type: {docType}</p>

      <button
        onClick={() => onDocSelect(type)}
        className="w-full h-40 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20 hover:border-primary transition-all cursor-pointer group overflow-hidden"
      >
        {previewUrl ? (
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={previewUrl}
              alt={`${title} preview`}
              className="max-w-full max-h-full object-contain rounded-md"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="text-center">
            <FileText className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors mx-auto mb-2" />
            <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
              No preview available
            </p>
          </div>
        )}
      </button>
    </div>
  );

  return (
    <Card className="border-warning/20 hover:shadow-lg transition-shadow">
      <CardHeader className="bg-warning/10">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-warning" />
          Verification Documents
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div
          className={`grid gap-6 pt-6 ${
            addressesAreSame
              ? "grid-cols-1"
              : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          <DocumentCard {...documents[0]} />

          {!addressesAreSame && <DocumentCard {...documents[1]} />}
        </div>
      </CardContent>
    </Card>
  );
};
