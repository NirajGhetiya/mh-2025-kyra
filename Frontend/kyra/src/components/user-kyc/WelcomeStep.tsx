import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, CheckCircle, Clock, FileCheck, Camera } from "lucide-react";

interface WelcomeStepProps {
  onStart: () => void;
}

const WelcomeStep = ({ onStart }: WelcomeStepProps) => {
  const features = [
    {
      icon: FileCheck,
      title: "Basic Information",
      description: "Provide your personal details and contact information"
    },
    {
      icon: Clock,
      title: "Address Details",
      description: "Enter your permanent and current address information"
    },
    {
      icon: Shield,
      title: "Document Upload",
      description: "Upload required identity and address proof documents"
    },
    {
      icon: Camera,
      title: "Liveness Check",
      description: "Complete facial verification for identity confirmation"
    },
    {
      icon: CheckCircle,
      title: "Review & Submit",
      description: "Verify all information before final submission"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 mb-6">
          <Shield className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Welcome to KYC Verification</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Complete your identity verification in 5 simple steps to access all platform features
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-600/10 to-purple-600/10 mb-4">
                  <feature.icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button 
          onClick={onStart} 
          size="lg" 
          className="min-w-48 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Start KYC Journey
        </Button>
      </div>
    </div>
  );
};

export default WelcomeStep;