import { Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export type StepperStep = {
    id: string;
    title: string;
    description?: string;
};

type StepperProps = {
    steps: StepperStep[];
    currentStep: number;
    onStepClick?: (index: number) => void;
    className?: string;
};

/*
 * Wizard step indicator. Desktop: numbered circles with connectors.
 * Mobile: compact "Step x of y" summary with a progress bar.
 * Completed steps are clickable when onStepClick is provided.
 */
export function Stepper({
    steps,
    currentStep,
    onStepClick,
    className,
}: StepperProps) {
    return (
        <div className={cn('w-full', className)}>
            {/* Mobile */}
            <div className="space-y-2 md:hidden">
                <div className="flex items-baseline justify-between">
                    <p className="text-sm font-medium">
                        {steps[currentStep]?.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Step {currentStep + 1} of {steps.length}
                    </p>
                </div>
                <Progress
                    value={((currentStep + 1) / steps.length) * 100}
                    className="h-1.5"
                />
            </div>

            {/* Desktop */}
            <ol className="hidden items-start md:flex">
                {steps.map((step, index) => {
                    const isComplete = index < currentStep;
                    const isCurrent = index === currentStep;
                    const isClickable = isComplete && onStepClick;

                    return (
                        <li
                            key={step.id}
                            className={cn(
                                'flex flex-1 items-start gap-3',
                                index > 0 && 'ps-3',
                            )}
                        >
                            {index > 0 && (
                                <div
                                    aria-hidden="true"
                                    className={cn(
                                        'mt-4 h-px flex-1 rounded-full',
                                        isComplete || isCurrent
                                            ? 'bg-primary'
                                            : 'bg-border',
                                    )}
                                />
                            )}
                            <button
                                type="button"
                                disabled={!isClickable}
                                onClick={() => onStepClick?.(index)}
                                className={cn(
                                    'group flex items-start gap-3 rounded-md text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                                    isClickable && 'cursor-pointer',
                                )}
                            >
                                <span
                                    className={cn(
                                        'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                                        isComplete &&
                                            'border-primary bg-primary text-primary-foreground',
                                        isCurrent &&
                                            'border-primary text-primary ring-4 ring-primary/15',
                                        !isComplete &&
                                            !isCurrent &&
                                            'border-border text-muted-foreground',
                                    )}
                                >
                                    {isComplete ? (
                                        <Check className="size-4" />
                                    ) : (
                                        index + 1
                                    )}
                                </span>
                                <span className="grid gap-0.5">
                                    <span
                                        className={cn(
                                            'text-sm font-medium',
                                            !isComplete &&
                                                !isCurrent &&
                                                'text-muted-foreground',
                                        )}
                                    >
                                        {step.title}
                                    </span>
                                    {step.description && (
                                        <span className="text-xs text-muted-foreground">
                                            {step.description}
                                        </span>
                                    )}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
