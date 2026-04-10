import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReceiptUploadProps {
  campaignId: string;
  onUpload: (url: string) => void;
  onOcrResult?: (amount: number | null) => void;
  imageUrl?: string;
}

export function ReceiptUpload({ campaignId, onUpload, onOcrResult, imageUrl }: ReceiptUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isRunningOcr, setIsRunningOcr] = useState(false);
  const [preview, setPreview] = useState<string | null>(imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Endast bildfiler är tillåtna');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Bilden får max vara 10MB');
      return;
    }

    setIsUploading(true);
    try {
      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `receipts/${campaignId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('receipt-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('receipt-images')
        .getPublicUrl(filePath);

      onUpload(publicUrl);
      toast.success('Kvittot har laddats upp');

      // Run OCR in background
      if (onOcrResult) {
        runOcr(publicUrl);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Kunde inte ladda upp kvittot');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const runOcr = async (url: string) => {
    setIsRunningOcr(true);
    try {
      const { data, error } = await supabase.functions.invoke('ocr-receipt', {
        body: { imageUrl: url },
      });

      if (error) throw error;
      if (data?.amount != null) {
        onOcrResult?.(data.amount);
        toast.success(`Belopp avläst: ${data.amount} kr`);
      } else {
        onOcrResult?.(null);
      }
    } catch (error) {
      console.error('OCR error:', error);
      onOcrResult?.(null);
    } finally {
      setIsRunningOcr(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input
    e.target.value = '';
  };

  const clearImage = () => {
    setPreview(null);
    onUpload('');
    onOcrResult?.(null);
  };

  return (
    <div className="space-y-3">
      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Kvitto"
            className="w-full max-h-64 object-contain rounded-lg border bg-muted"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={clearImage}
          >
            <X className="w-4 h-4" />
          </Button>
          {isRunningOcr && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Läser av belopp...
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Ladda upp en bild på ditt kvitto
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              type="button"
              variant="default"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1 sm:flex-none"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              Ta foto
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1 sm:flex-none"
            >
              <Upload className="w-4 h-4" />
              Välj bild
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
