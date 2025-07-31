import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Copy, Download, Share2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface QRCodeDisplayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  url: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  open,
  onOpenChange,
  code,
  url,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (open && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) {
          console.error('Error generating QR code:', error);
          toast.error('Failed to generate QR code');
        }
      });
    }
  }, [open, url]);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copied to clipboard!`);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error(`Failed to copy ${type.toLowerCase()}`);
    }
  };

  const downloadQRCode = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `feedback-space-${code}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
    toast.success('QR code downloaded!');
  };

  const shareUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join Feedback Space ${code}`,
          text: 'Join my feedback space to leave retros about our event!',
          url: url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        copyToClipboard(url, 'URL');
      }
    } else {
      copyToClipboard(url, 'URL');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Feedback Space</DialogTitle>
          <DialogDescription>
            Share this QR code or link with your attendees so they can leave feedback.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg shadow-sm border">
              <canvas ref={canvasRef} className="block" />
            </div>
          </div>

          {/* Unique Code */}
          <div className="space-y-2">
            <Label htmlFor="code">Unique Code</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                value={code}
                readOnly
                className="font-mono text-center text-lg"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(code, 'Code')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="url">Direct Link</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                value={url}
                readOnly
                className="text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(url, 'URL')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={downloadQRCode}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download QR
            </Button>
            <Button
              onClick={shareUrl}
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};