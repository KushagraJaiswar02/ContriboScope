'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, Clock, GraduationCap, Laptop, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UserPreferences {
  stack: string[];
  experience: string;
  available_time: string;
  work_type: string;
}

interface OnboardingWizardProps {
  onComplete: (prefs: UserPreferences) => void;
}

const STEPS = [
  {
    id: 'stack',
    title: 'What do you code in?',
    description: 'Select your primary technologies.',
    icon: Code,
    options: ['React', 'TypeScript', 'Node.js', 'Python', 'Go', 'Rust', 'Java', 'Vue', 'Next.js', 'CSS'],
    multiSelect: true,
  },
  {
    id: 'experience',
    title: 'Experience Level',
    description: 'How comfortable are you with open source?',
    icon: GraduationCap,
    options: ['First-timer', 'Some experience', 'Experienced dev'],
    multiSelect: false,
  },
  {
    id: 'time',
    title: 'Available Time',
    description: 'How much time can you commit right now?',
    icon: Clock,
    options: ['~1 hour', 'Half a day', 'Full weekend', 'Just browsing'],
    multiSelect: false,
  },
  {
    id: 'work_type',
    title: 'Work Style',
    description: 'What kind of tasks do you prefer?',
    icon: Laptop,
    options: ['Fixing bugs', 'Writing docs', 'Refactoring', 'Adding features'],
    multiSelect: false,
  },
];

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, any>>({
    stack: [],
    experience: '',
    available_time: '',
    work_type: '',
  });

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  const handleSelect = (option: string) => {
    if (step.multiSelect) {
      const current = selections[step.id] as string[];
      if (current.includes(option)) {
        setSelections({ ...selections, [step.id]: current.filter((o) => o !== option) });
      } else {
        setSelections({ ...selections, [step.id]: [...current, option] });
      }
    } else {
      setSelections({ ...selections, [step.id]: option });
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete(selections as UserPreferences);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const isNextDisabled = step.multiSelect 
    ? (selections[step.id] as string[]).length === 0 
    : !selections[step.id];

  return (
    <div className="max-w-2xl mx-auto py-12">
      {/* Progress */}
      <div className="mb-8 space-y-2">
        <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>Step {currentStep + 1} of {STEPS.length}</span>
          <span>{Math.round(((currentStep + 1) / STEPS.length) * 100)}% Complete</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader className="space-y-4 pb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <step.icon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold">{step.title}</CardTitle>
            <CardDescription className="text-base">{step.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-2 gap-3">
            {step.options.map((option) => {
              const isSelected = step.multiSelect 
                ? (selections[step.id] as string[]).includes(option)
                : selections[step.id] === option;
              
              return (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "relative flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all hover:border-primary/50 group",
                    isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-muted bg-background"
                  )}
                >
                  <span className={cn(
                    "font-medium transition-colors",
                    isSelected ? "text-primary" : "text-foreground group-hover:text-primary/70"
                  )}>
                    {option}
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="px-6"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={isNextDisabled}
              className="px-6 min-w-[140px]"
            >
              {isLastStep ? 'Find Issues' : 'Next'}
              {!isLastStep && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <p className="text-center mt-6 text-sm text-muted-foreground italic">
        "The best time to plant a tree was 20 years ago. The second best time is now."
      </p>
    </div>
  );
}
