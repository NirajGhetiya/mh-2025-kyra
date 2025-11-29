import { useRef, useState, useEffect } from "react";
import { Camera, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosInstance from '@/api/axiosInstance';
import { toast } from "sonner";

interface LivenessResult {
  score: number;
  status: string;
  is_live: boolean;
}

export default function SimpleLivenessCheck({ formData, setFormData, isError }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCaptured, setIsCaptured] = useState(!!formData.livenessImage);
  const [isVerified, setIsVerified] = useState(!!formData.livenessStatus);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiResult, setApiResult] = useState<LivenessResult | null>(
    formData.livenessStatus ? {
      score: formData.livenessScore,
      status: formData.livenessStatus,
      is_live: formData.livenessStatus === "live"
    } : null
  );

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (isError && !formData.livenessImage) {
      setError("Please capture a selfie for liveness check.");
    }
  }, [isError, formData.livenessImage]);

  useEffect(() => {
    const startCamera = async () => {
      if (isCaptured && isVerified) return;
      
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Unable to access camera. Please allow camera permissions and ensure your camera is working.");
        console.error("Camera error:", err);
      }
    };

    if (!isCaptured) {
      startCamera();
    }
  }, [isCaptured, isVerified]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError("Camera not ready. Please try again.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Camera not ready. Please wait for camera to initialize.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Canvas context not available.");
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL("image/jpeg", 0.9);
    
    setFormData({ 
      ...formData, 
      livenessImage: base64Image,
      livenessPhoto: null, 
      livenessScore: null,
      livenessStatus: null
    });
    
    setIsCaptured(true);
    setIsVerified(false);
    setApiResult(null);
    setError("");
    stopCamera();
    
    toast.success("Selfie captured! Click 'Verify Liveness' to continue.");
  };

  const retakePhoto = async () => {
    setIsCaptured(false);
    setIsVerified(false);
    setError("");
    setApiResult(null);
    setFormData({ 
      ...formData, 
      livenessImage: null,
      livenessPhoto: null,
      livenessScore: null,
      livenessStatus: null
    });

  };

  const verifyLiveness = async () => {
    if (!formData.livenessImage) {
      setError("Please capture a selfie first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const base64String = formData.livenessImage.split(",")[1];

      const response = await axiosInstance.post(`/ai/liveness-check`, {
        image_base64: base64String
      });

      const result = response.data;
      setLoading(false);

      if (!result.success) {
        const errorMsg = result.message || "Liveness check failed. Please retake the selfie.";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      const livenessData = result.data;
      const isLive = livenessData.is_live !== false;
      
      setApiResult({
        score: livenessData.livenessScore,
        status: livenessData.livenessStatus,
        is_live: isLive
      });

      if (isLive) {
        setFormData({
          ...formData,
          livenessScore: livenessData.livenessScore,
          livenessStatus: livenessData.livenessStatus
        });
        setIsVerified(true);
        toast.success("Liveness verified successfully!");
      } else {
        const errorMsg = livenessData.message || "Liveness check failed. Please ensure you're a real person and retake the selfie.";
        setError(errorMsg);
        toast.error(errorMsg);
      }

    } catch (err: any) {
      setLoading(false);
      const errorMsg = err.response?.data?.message || "Something went wrong while verifying liveness. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const imageUrl = formData.livenessImage;

  return (
    <div className="space-y-5 max-w-md mx-auto text-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Liveness Check
        </h2>
        <p className="text-muted-foreground mt-2">
          {!isCaptured 
            ? "Please take a clear selfie to verify your identity."
            : !isVerified
            ? "Selfie captured! Verify liveness to continue."
            : "Liveness verified successfully!"
          }
        </p>
      </div>

      {isVerified && apiResult && (
        <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Liveness Verified</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-gradient-to-r from-red-50 to-purple-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-red-700">
            <XCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="rounded-lg overflow-hidden bg-black aspect-[4/3] relative border-2 border-purple-300">
        {!isCaptured ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            onLoadedData={() => setError("")}
          />
        ) : (
          <img 
            src={imageUrl} 
            alt="Captured selfie" 
            className="w-full h-full object-cover"
          />
        )}
        
        {!isCaptured && (
          <div className="absolute inset-0 border-2 border-white rounded-lg pointer-events-none opacity-30" />
        )}
      </div>

      <div className="space-y-3">
        {!isCaptured ? (
          <Button 
            onClick={takePhoto} 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
            size="lg"
          >
            <Camera className="w-4 h-4 mr-2" />
            Take Selfie
          </Button>
        ) : !isVerified ? (
          <div className="flex gap-3">
            <Button variant="outline" onClick={retakePhoto} 
            className="
              flex-1
              hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600
              hover:text-white
              hover:border-transparent
              transition-all duration-200"
            size="lg"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={loading}
              onClick={verifyLiveness}
              size="lg"
            >
              {loading ? "Verifying..." : "Verify Liveness"}
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button variant="outline" onClick={retakePhoto} 
              className="
                flex-1 font-medium 
                hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600
                hover:text-white
                hover:border-transparent
                transition-all duration-200">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake
            </Button>
            <Button className="flex-1" variant="secondary" disabled>
              <CheckCircle className="w-4 h-4 mr-2" />
              Verified
            </Button>
          </div>
        )}
      </div>

      {apiResult && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-purple-200 text-left">
          <h3 className="font-semibold mb-2 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Liveness Results
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Score:</span>
              <div className="mt-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      apiResult.score > 0.7 ? 'bg-gradient-to-r from-green-500 to-blue-500' : 
                      apiResult.score > 0.5 ? 'bg-gradient-to-r from-yellow-500 to-purple-500' : 
                      'bg-gradient-to-r from-red-500 to-purple-500'
                    }`}
                    style={{ width: `${apiResult.score * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600">
                  {(apiResult.score * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ml-2 ${
                apiResult.is_live 
                  ? 'bg-gradient-to-r from-green-100 to-blue-100 text-green-800' 
                  : 'bg-gradient-to-r from-red-100 to-purple-100 text-red-800'
              }`}>
                {apiResult.is_live ? 'Live' : 'Not Live'}
              </div>
            </div>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}