import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { 
  Database, 
  Search, 
  Microscope, 
  ExternalLink,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Filter
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Dataset {
  id: string;
  name: string;
  description: string | null;
  test_type: 'malaria';
  classification: string | null;
  image_url: string | null;
  created_at: string;
  metadata?: Record<string, unknown>;
}

const Datasets: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'malaria'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  const { data: datasets, isLoading, error } = useQuery({
    queryKey: ['datasets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .order('test_type', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Dataset[];
    },
  });

  const filteredDatasets = datasets?.filter(dataset => {
    const matchesTab = activeTab === 'all' || dataset.test_type === activeTab;
    const matchesSearch = !searchQuery || 
      dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.classification?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getClassificationConfig = (classification: string | null) => {
    if (!classification) return { color: 'bg-muted', textColor: 'text-muted-foreground', icon: Info, label: 'Unknown' };
    
    const lowerClass = classification.toLowerCase();
    
    if (lowerClass.includes('negative')) {
      return { color: 'bg-success', textColor: 'text-success', icon: CheckCircle, label: 'Negative' };
    }
    if (lowerClass.includes('severe')) {
      return { color: 'bg-destructive', textColor: 'text-destructive', icon: XCircle, label: 'Severe' };
    }
    if (lowerClass.includes('moderate')) {
      return { color: 'bg-warning', textColor: 'text-warning', icon: AlertCircle, label: 'Moderate' };
    }
    if (lowerClass.includes('mild') || lowerClass.includes('early') || lowerClass.includes('positive')) {
      return { color: 'bg-accent', textColor: 'text-accent', icon: AlertCircle, label: classification };
    }
    if (lowerClass.includes('invalid') || lowerClass.includes('artifact')) {
      return { color: 'bg-muted', textColor: 'text-muted-foreground', icon: Info, label: classification };
    }
    
    return { color: 'bg-primary', textColor: 'text-primary', icon: Info, label: classification };
  };

  const malariaCount = datasets?.filter(d => d.test_type === 'malaria').length || 0;
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" />
              Reference Datasets
            </h1>
            <p className="text-muted-foreground mt-1">
              Browse reference samples for comparison with your test results
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="px-3 py-1.5 rounded-full bg-destructive/10 text-destructive">
              {malariaCount} Malaria
            </span>
            <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary">
              {pregnancyCount} Pregnancy
            </span>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search datasets by name, description, or classification..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    All
                  </TabsTrigger>
                  <TabsTrigger value="malaria" className="flex items-center gap-2">
                    <Microscope className="h-4 w-4" />
                    Malaria
                  </TabsTrigger>
                  <TabsTrigger value="pregnancy" className="flex items-center gap-2">
                    <Baby className="h-4 w-4" />
                    Pregnancy
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Dataset Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="glass-card overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to Load Datasets</h3>
              <p className="text-muted-foreground">
                Unable to fetch reference datasets. Please try again later.
              </p>
            </CardContent>
          </Card>
        ) : filteredDatasets?.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Datasets Found</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `No datasets match "${searchQuery}"`
                  : 'No datasets available in this category'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDatasets?.map((dataset) => {
              const classConfig = getClassificationConfig(dataset.classification);
              const ClassIcon = classConfig.icon;
              
              return (
                <Card 
                  key={dataset.id} 
                  className="glass-card overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  onClick={() => setSelectedDataset(dataset)}
                >
                  {/* Image */}
                  <div className="relative h-48 bg-muted overflow-hidden">
                    {dataset.image_url ? (
                      <img
                        src={dataset.image_url}
                        alt={dataset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
                        {dataset.test_type === 'malaria' ? (
                          <Microscope className="h-16 w-16 text-muted-foreground/40" />
                        ) : (
                          <Baby className="h-16 w-16 text-muted-foreground/40" />
                        )}
                      </div>
                    )}
                    
                    {/* Test Type Badge */}
                    <Badge 
                      className={`absolute top-3 left-3 ${
                        dataset.test_type === 'malaria' 
                          ? 'bg-destructive/90' 
                          : 'bg-primary/90'
                      } text-white`}
                    >
                      {dataset.test_type === 'malaria' ? (
                        <><Microscope className="h-3 w-3 mr-1" /> Malaria</>
                      ) : (
                        <><Baby className="h-3 w-3 mr-1" /> Pregnancy</>
                      )}
                    </Badge>
                    
                    {/* Classification Badge */}
                    <Badge 
                      className={`absolute top-3 right-3 ${classConfig.color} text-white`}
                    >
                      <ClassIcon className="h-3 w-3 mr-1" />
                      {classConfig.label}
                    </Badge>
                  </div>

                  {/* Content */}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground line-clamp-1 mb-2 group-hover:text-primary transition-colors">
                      {dataset.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {dataset.description || 'No description available'}
                    </p>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-3 w-full group-hover:bg-primary/10"
                    >
                      View Details
                      <ExternalLink className="h-3.5 w-3.5 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5 text-primary" />
              About Reference Datasets
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              These reference datasets are curated samples used by our AI to compare and analyze 
              your test results. Each dataset includes:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>High-quality reference images for each test type</li>
              <li>Classification labels (negative, mild, moderate, severe)</li>
              <li>Detailed descriptions of what to look for</li>
              <li>Metadata about parasite stages, HCG levels, etc.</li>
            </ul>
            <p className="text-xs italic pt-2">
              Note: These are educational references only. Always consult a healthcare professional for diagnosis.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dataset Detail Modal */}
      <Dialog open={!!selectedDataset} onOpenChange={() => setSelectedDataset(null)}>
        <DialogContent className="max-w-2xl">
          {selectedDataset && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedDataset.test_type === 'malaria' ? (
                    <Microscope className="h-5 w-5 text-destructive" />
                  ) : (
                    <Baby className="h-5 w-5 text-primary" />
                  )}
                  {selectedDataset.name}
                </DialogTitle>
                <DialogDescription>
                  Reference sample for {selectedDataset.test_type} test analysis
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Image */}
                {selectedDataset.image_url && (
                  <div className="rounded-lg overflow-hidden bg-muted">
                    <img
                      src={selectedDataset.image_url}
                      alt={selectedDataset.name}
                      className="w-full h-64 object-contain"
                    />
                  </div>
                )}
                
                {/* Classification */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Classification:</span>
                  <Badge className={getClassificationConfig(selectedDataset.classification).color}>
                    {selectedDataset.classification || 'Unknown'}
                  </Badge>
                </div>
                
                {/* Description */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedDataset.description || 'No description available'}
                  </p>
                </div>
                
                {/* Metadata */}
                {selectedDataset.metadata && Object.keys(selectedDataset.metadata).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Technical Details</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(selectedDataset.metadata as Record<string, unknown>).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground capitalize">
                            {key.replace(/_/g, ' ')}:
                          </span>
                          <span className="font-medium">
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Datasets;
