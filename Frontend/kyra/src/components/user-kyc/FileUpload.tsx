import { Upload, X } from "lucide-react";
import { useRef, useState, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface FileUploadProps {
  label: ReactNode;
  accept?: string;
  capture?: boolean;
  value?: File | string;
  onChange: (base64: string | undefined) => void;
  className?: string;
}

export const FileUpload = ({
  label,
  accept = "image/*,application/pdf",
  capture = false,
  value,
  onChange,
  className,
}: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const MAX_SIZE = 100 * 1024 * 1024;

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const base64ToFile = (base64: string, fileName: string): File => {
    const arr = base64.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";

    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], fileName, { type: mime });
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/tiff",
      "image/tif",
      "application/pdf",
      "image/jfif",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Only JPG, JPEG, PNG, TIF, TIFF, PDF, JFIF files are allowed."
      );
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error("File must be less than 100MB.");
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      onChange(base64);
      setFileName(file.name);

      if (file.type.startsWith("image/")) {
        setPreview(base64);
      } else {
        setPreview(null);
      }
    } catch (err) {
      toast.error("Failed to load file.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    await handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleRemove = () => {
    onChange(undefined);
    setPreview(null);
    setFileName(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const detectFileType = (base64: string): string => {
    const typeMap: { [prefix: string]: string } = {
      "/9j/": "image/jpeg",
      iVBOR: "image/png",
      R0lGOD: "image/gif",
      JVBER: "application/pdf",
      SUkq: "image/tiff",
    };

    for (const prefix in typeMap) {
      if (base64.startsWith(prefix)) return typeMap[prefix];
    }
    return "application/octet-stream";
  };

  useEffect(() => {
    if (!value || typeof value !== "string") return;

    let base64String = value;
    let mime = "application/octet-stream";

    if (!value.startsWith("data:")) {
      mime = detectFileType(value);
      base64String = `data:${mime};base64,${value}`;
    } else {
      const mimeMatch = value.match(/data:(.*?);base64,/);
      if (mimeMatch) mime = mimeMatch[1];
    }

    const defaultName = mime.includes("pdf") ? "document.pdf" : "image.jpg";
    const file = base64ToFile(base64String, defaultName);
    setFileName(file.name);

    if (mime.startsWith("image/")) {
      setPreview(base64String);
    } else {
      setPreview(null);
    }
  }, [value]);

  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-sm font-medium text-gray-700">{label}</label>

      <div
        className={cn(
          "border-2 border-dashed border-gray-300 rounded-lg p-4 text-center transition-colors cursor-pointer bg-white",
          isDragOver ? "border-blue-500 bg-blue-50" : "hover:border-gray-400"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="w-6 h-6 text-gray-500" />
          <div className="text-center">
            <p className="text-sm text-gray-600">
              <span className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline-block">
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {capture
                ? "Take a photo or upload"
                : "JPG, JPEG, PNG, TIF, TIFF, PDF, JFIF (max 100MB)"}
            </p>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          capture={capture ? "user" : undefined}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {(preview || fileName) && (
        <div className="border border-gray-200 rounded-lg p-3 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {preview ? (
                <div className="w-10 h-10 rounded border overflow-hidden flex-shrink-0">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded border flex items-center justify-center bg-gray-100 flex-shrink-0">
                  <span className="text-xs font-medium text-gray-600">PDF</span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {fileName}
                </p>
                <p className="text-xs text-gray-500">
                  {preview ? "Image file" : "PDF document"}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="shrink-0 h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
