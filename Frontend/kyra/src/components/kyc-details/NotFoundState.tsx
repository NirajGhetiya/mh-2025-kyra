import { Button } from "@/components/ui/button";

interface NotFoundStateProps {
  onBack: () => void;
}

export const NotFoundState = ({ onBack }: NotFoundStateProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
            KYC Record Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't find the KYC record you're looking for. Please check again or return to the dashboard.
          </p>
          <Button
            onClick={onBack}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};