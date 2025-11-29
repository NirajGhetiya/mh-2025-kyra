import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KYCRecord } from "@/types/kyc";

interface TimelineSectionProps {
  record: KYCRecord;
}

export const TimelineSection = ({ record }: TimelineSectionProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const TimelineItem = ({ title, date, color }: {
    title: string;
    date: string;
    color: string;
  }) => (
    <div className="flex items-start gap-4">
      <div className={`w-2 h-2 rounded-full ${color} mt-2`} />
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">
          {formatDate(date)}
        </p>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TimelineItem
          title="Submitted"
          date={record.submitted_at}
          color="bg-primary"
        />
        {record.changed_at && (
          <TimelineItem
            title="Last Changed"
            date={record.changed_at}
            color="bg-success"
          />
        )}
      </CardContent>
    </Card>
  );
};