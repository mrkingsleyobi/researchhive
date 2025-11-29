/**
 * User Onboarding Flow
 * Interactive tutorial for new users
 */

'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
  action?: string; // Call-to-action text
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to ResearchHive! 🎉',
    description:
      'ResearchHive uses AI-powered multi-agent research to help you gather, analyze, and synthesize information faster than ever.',
    action: 'Get Started',
  },
  {
    id: 'create-research',
    title: 'Create Your First Research',
    description:
      'Click the "New Research" button to start. Our AI agents will automatically search multiple sources and compile findings for you.',
    target: '[data-onboarding="new-research"]',
    action: 'Next',
  },
  {
    id: 'depth-levels',
    title: 'Choose Research Depth',
    description:
      'Quick (4 agents, ~2 min), Standard (8 agents, ~5 min), or Deep (16 agents, ~10 min). More agents = more comprehensive results.',
    action: 'Next',
  },
  {
    id: 'real-time',
    title: 'Watch in Real-Time',
    description:
      'See live progress as agents gather sources, analyze content, and build your knowledge graph. No waiting in the dark!',
    action: 'Next',
  },
  {
    id: 'knowledge-graph',
    title: 'Explore the Knowledge Graph',
    description:
      'Visualize connections between topics, sources, and findings. Click nodes to dive deeper and discover relationships.',
    target: '[data-onboarding="knowledge-graph"]',
    action: 'Next',
  },
  {
    id: 'export',
    title: 'Export & Share',
    description:
      'Export citations in APA, MLA, Chicago, or BibTeX. Download your findings as JSON or markdown. Share with your team.',
    target: '[data-onboarding="export"]',
    action: 'Finish',
  },
];

interface OnboardingFlowProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem('onboarding_completed');
    if (completed) {
      setHasCompletedOnboarding(true);
      return;
    }

    // Show onboarding after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
      trackEvent('onboarding_started', { timestamp: Date.now() });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    const nextStep = currentStep + 1;

    trackEvent('onboarding_step_completed', {
      step: ONBOARDING_STEPS[currentStep].id,
      stepNumber: currentStep + 1,
    });

    if (nextStep >= ONBOARDING_STEPS.length) {
      handleComplete();
    } else {
      setCurrentStep(nextStep);
    }
  };

  const handleSkip = () => {
    trackEvent('onboarding_skipped', {
      step: ONBOARDING_STEPS[currentStep].id,
      stepNumber: currentStep + 1,
    });

    setIsVisible(false);
    onSkip?.();
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setHasCompletedOnboarding(true);
    setIsVisible(false);

    trackEvent('onboarding_completed', {
      completedSteps: ONBOARDING_STEPS.length,
    });

    onComplete?.();
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (hasCompletedOnboarding || !isVisible) {
    return null;
  }

  const step = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[9998] backdrop-blur-sm" />

      {/* Onboarding Card */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999]">
        <div className="bg-white rounded-lg shadow-2xl p-6 w-[500px] max-w-[90vw]">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Skip onboarding"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Description */}
          <p className="text-gray-700 text-base mb-6 leading-relaxed">
            {step.description}
          </p>

          {/* Checklist of benefits (for first step) */}
          {currentStep === 0 && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <ul className="space-y-2">
                {[
                  'Multi-agent AI research',
                  'Real-time progress tracking',
                  'Knowledge graph visualization',
                  'Citation management',
                  'Export in multiple formats',
                ].map((benefit, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-700">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Skip tour
            </button>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Previous
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                {step.action || 'Next'}
                {currentStep < ONBOARDING_STEPS.length - 1 && (
                  <ArrowRight className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Highlight target element (if specified) */}
      {step.target && (
        <style jsx global>{`
          ${step.target} {
            position: relative;
            z-index: 9999;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5),
              0 0 0 9999px rgba(0, 0, 0, 0.5);
            border-radius: 8px;
          }
        `}</style>
      )}
    </>
  );
}

/**
 * Hook to check onboarding status
 */
export function useOnboardingStatus() {
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed');
    setHasCompleted(!!completed);
  }, []);

  const resetOnboarding = () => {
    localStorage.removeItem('onboarding_completed');
    setHasCompleted(false);
  };

  return { hasCompleted, resetOnboarding };
}
