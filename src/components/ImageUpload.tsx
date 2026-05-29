import { useRef } from "react";
import { Camera, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  onAnalyze?: (dataUrl: string) => void;
  analyzing?: boolean;
}

export function ImageUpload({ value, onChange, onAnalyze, analyzing }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onChange(result);
      onAnalyze?.(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {value ? (
        <div className="relative rounded-lg overflow-hidden border">
          <img src={value} alt="Evidence" className="w-full h-48 object-cover" />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full shadow"
            onClick={() => onChange(null)}
          >
            <X className="h-4 w-4" />
          </Button>
          {analyzing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-medium">
              AI analyzing…
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground bg-muted/50 hover:bg-muted hover:border-primary/40 transition-colors"
        >
          <Camera className="h-8 w-8 mb-2" />
          <span className="text-sm font-medium">Tap to take photo</span>
          <span className="text-xs flex items-center gap-1 mt-1">
            <Upload className="h-3 w-3" /> or upload from gallery
          </span>
        </button>
      )}
    </div>
  );
}
