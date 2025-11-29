import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";

interface ActionButtonsProps {
  onApprove: () => void;
  onReject: () => void;
  onReKYC: () => void;
  userName: string;
}

export const ActionButtons = ({
  onApprove,
  onReject,
  onReKYC,
  userName,
}: ActionButtonsProps) => {
  return (
    <div className="flex gap-3 justify-end">
      <Button
        onClick={onApprove}
        className="gap-2 bg-success hover:bg-success/90"
      >
        <CheckCircle2 className="h-4 w-4" />
        Approve
      </Button>
      <Button
        onClick={onReject}
        variant="destructive"
        className="gap-2"
      >
        <XCircle className="h-4 w-4" />
        Reject
      </Button>
      <Button
        onClick={onReKYC}
        variant="outline"
        className="gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        Re-KYC
      </Button>
    </div>
  );
};