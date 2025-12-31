import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, MapPin, Calendar, Download } from 'lucide-react';
import { format } from 'date-fns';

interface PDFCustomizationData {
  hospitalName: string;
  location: string;
  reportDate: string;
}

interface PDFCustomizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: PDFCustomizationData) => void;
}

export const PDFCustomizationDialog: React.FC<PDFCustomizationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
}) => {
  const [hospitalName, setHospitalName] = useState('');
  const [location, setLocation] = useState('');
  const [reportDate, setReportDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleConfirm = () => {
    onConfirm({
      hospitalName: hospitalName.trim(),
      location: location.trim(),
      reportDate,
    });
    onOpenChange(false);
  };

  const handleSkip = () => {
    onConfirm({
      hospitalName: '',
      location: '',
      reportDate: format(new Date(), 'yyyy-MM-dd'),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Customize PDF Report
          </DialogTitle>
          <DialogDescription>
            Add your hospital or organization details to personalize the report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="hospitalName" className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Hospital / Organization Name
            </Label>
            <Input
              id="hospitalName"
              placeholder="e.g., City General Hospital"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Location / Address
            </Label>
            <Input
              id="location"
              placeholder="e.g., 123 Medical Ave, City, Country"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={150}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Report Date
            </Label>
            <Input
              id="reportDate"
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleSkip} className="w-full sm:w-auto">
            Skip & Download
          </Button>
          <Button onClick={handleConfirm} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
