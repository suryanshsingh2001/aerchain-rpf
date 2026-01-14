'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Loader2,
  Package,
  DollarSign,
  Calendar,
  FileText,
  Shield,
  Clock,
  ChevronRight,
  Send,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRfps } from '@/hooks/use-rfps';
import type { Rfp, RfpItem } from '@/lib/types';
import { toast } from 'sonner';

const examplePrompts = [
  "I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days. We need 20 laptops with 16GB RAM and 15 monitors 27-inch. Payment terms should be net 30, and we need at least 1 year warranty.",
  "Looking for office furniture: 50 ergonomic chairs, 25 standing desks, and 10 conference tables. Budget around $75,000. Need them delivered in 2 weeks. 2 year warranty required.",
  "Need to purchase 100 tablets for our field sales team. Must be iPads with 256GB storage. Budget $60,000. Payment net 45, delivery within 3 weeks."
];

export default function CreateRfpPage() {
  const router = useRouter();
  const { createRfp, loading } = useRfps();
  const [input, setInput] = useState('');
  const [generatedRfp, setGeneratedRfp] = useState<Rfp | null>(null);

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error('Please describe what you want to procure');
      return;
    }

    if (input.length < 20) {
      toast.error('Please provide more details about your requirements');
      return;
    }

    const rfp = await createRfp(input);
    if (rfp) {
      setGeneratedRfp(rfp);
      toast.success('RFP generated successfully!');
    } else {
      toast.error('Failed to generate RFP. Please try again.');
    }
  };

  const handleUseExample = (example: string) => {
    setInput(example);
  };

  const formatCurrency = (value: string | null | undefined, currency = 'USD') => {
    if (!value) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Create RFP"
        breadcrumbs={[
          { label: 'RFPs', href: '/rfps' },
          { label: 'Create' },
        ]}
      />

      <div className="flex-1 p-6 space-y-6 max-w-4xl mx-auto w-full">
        {!generatedRfp ? (
          <>
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-500" />
                  Describe Your Needs
                </CardTitle>
                <CardDescription>
                  Write in plain English what you want to procure. Our AI will extract the
                  important details and create a structured RFP.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Example: I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {input.length} characters
                  </span>
                  <Button onClick={handleGenerate} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate RFP
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Example Prompts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Example Prompts</CardTitle>
                <CardDescription>
                  Click on any example below to use it as a starting point
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleUseExample(prompt)}
                    className="w-full text-left p-4 rounded-lg border bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <p className="text-sm line-clamp-2">{prompt}</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Generated RFP Preview */}
            <Card className="border-green-500/50 bg-green-500/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline" className="mb-2 bg-green-500/10 text-green-700 border-green-500/30">
                      ✓ Generated Successfully
                    </Badge>
                    <CardTitle>{generatedRfp.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {generatedRfp.description || 'No description provided'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Items */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Items Required
                  </h4>
                  <div className="space-y-2">
                    {(generatedRfp.items as RfpItem[]).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between p-3 rounded-lg border bg-background"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.specifications && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.specifications}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary">
                          Qty: {item.quantity} {item.unit || ''}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Terms Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">Budget</span>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(generatedRfp.budget, generatedRfp.currency)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Delivery</span>
                    </div>
                    <p className="font-medium">
                      {generatedRfp.deliveryDays
                        ? `${generatedRfp.deliveryDays} days`
                        : 'Not specified'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">Payment Terms</span>
                    </div>
                    <p className="font-medium">
                      {generatedRfp.paymentTerms || 'Not specified'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm">Warranty</span>
                    </div>
                    <p className="font-medium">
                      {generatedRfp.warrantyMonths
                        ? `${generatedRfp.warrantyMonths} months`
                        : 'Not specified'}
                    </p>
                  </div>
                </div>

                {generatedRfp.additionalTerms && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Additional Terms</h4>
                      <p className="text-sm text-muted-foreground">
                        {generatedRfp.additionalTerms}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedRfp(null);
                  setInput('');
                }}
              >
                Start Over
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <Link href={`/rfps/${generatedRfp.id}`}>
                    View Details
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/rfps/${generatedRfp.id}/send`}>
                    <Send className="mr-2 h-4 w-4" />
                    Send to Vendors
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
