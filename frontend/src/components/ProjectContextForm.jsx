import { useState } from 'react';
import { Building2, MessageSquare, Target, Loader2, Briefcase } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { runMVPGeneration } from '../utils/api';

export default function ProjectContextForm({ onMVPGenerated, onMVPGenerationStart, disabled }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerCompany: '',
    customerContext: '',
    fdeContext: '',
    projectGoals: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    onMVPGenerationStart?.();

    try {
      const result = await runMVPGeneration(formData);
      onMVPGenerated(result);
    } catch (error) {
      console.error('MVP generation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Project Context
        </CardTitle>
        <CardDescription>
          Provide additional context for MVP generation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Customer Company
            </Label>
            <Input
              id="company"
              placeholder="Acme Corp"
              value={formData.customerCompany}
              onChange={(e) => handleChange('customerCompany', e.target.value)}
              disabled={disabled}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerContext" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Customer Context
            </Label>
            <Textarea
              id="customerContext"
              placeholder="Customer background, industry, current challenges..."
              value={formData.customerContext}
              onChange={(e) => handleChange('customerContext', e.target.value)}
              disabled={disabled}
              className="min-h-[80px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fdeContext" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              FDE Context
            </Label>
            <Textarea
              id="fdeContext"
              placeholder="Technical constraints, resources, timeline..."
              value={formData.fdeContext}
              onChange={(e) => handleChange('fdeContext', e.target.value)}
              disabled={disabled}
              className="min-h-[80px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Project Goals
            </Label>
            <Textarea
              id="goals"
              placeholder="Describe the main objectives and requirements..."
              value={formData.projectGoals}
              onChange={(e) => handleChange('projectGoals', e.target.value)}
              disabled={disabled}
              className="min-h-[100px]"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={disabled || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating MVP...
              </>
            ) : (
              'Generate MVP'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

