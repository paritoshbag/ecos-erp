import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import PasswordInput from '@/components/password-input';
import { AuthSplit } from '@/components/template/auth-split';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const strengthLevels = [
    { label: 'Too weak', className: 'bg-destructive' },
    { label: 'Weak', className: 'bg-warning' },
    { label: 'Good', className: 'bg-info' },
    { label: 'Strong', className: 'bg-success' },
];

const scorePassword = (password: string): number => {
    if (!password) {
        return -1;
    }

    let score = 0;

    if (password.length >= 8) {
        score++;
    }

    if (password.length >= 12) {
        score++;
    }

    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) {
        score++;
    }

    if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) {
        score++;
    }

    return Math.min(score, 3);
};

export default function TemplateAuthRegister() {
    const [password, setPassword] = useState('');
    const score = scorePassword(password);

    return (
        <>
            <Head title="Register Preview" />
            <AuthSplit
                title="Create your account"
                description="Start a 14-day trial — no credit card required."
                backHref="/template"
                backLabel="Command Centre"
                preview
                footer={
                    <>
                        Already have an account?{' '}
                        <Link
                            href="/template/auth/login"
                            className="font-medium text-primary hover:underline"
                        >
                            Sign in
                        </Link>
                    </>
                }
            >
                <form
                    className="grid gap-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        toast.info(
                            'Design preview — registration is wired to the real backend later.',
                        );
                    }}
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="reg-first">First name</Label>
                            <Input
                                id="reg-first"
                                placeholder="Jane"
                                autoComplete="given-name"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="reg-last">Last name</Label>
                            <Input
                                id="reg-last"
                                placeholder="Cooper"
                                autoComplete="family-name"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="reg-email">Work email</Label>
                        <Input
                            id="reg-email"
                            type="email"
                            placeholder="you@company.com"
                            autoComplete="email"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="reg-company">Company</Label>
                        <Input
                            id="reg-company"
                            placeholder="Acme Industries Ltd."
                            autoComplete="organization"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="reg-password">Password</Label>
                        <PasswordInput
                            id="reg-password"
                            placeholder="At least 8 characters"
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                        />
                        {score >= 0 && (
                            <div className="space-y-1.5">
                                <div className="flex gap-1">
                                    {strengthLevels.map((level, index) => (
                                        <span
                                            key={level.label}
                                            className={cn(
                                                'h-1 flex-1 rounded-full bg-muted transition-colors',
                                                index <= score &&
                                                    strengthLevels[score]
                                                        .className,
                                            )}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Password strength:{' '}
                                    <span className="font-medium text-foreground">
                                        {strengthLevels[score].label}
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                    <Label className="flex items-start gap-2 font-normal">
                        <Checkbox className="mt-0.5" required />
                        <span>
                            I agree to the{' '}
                            <span className="font-medium text-primary">
                                Terms of Service
                            </span>{' '}
                            and{' '}
                            <span className="font-medium text-primary">
                                Privacy Policy
                            </span>
                            .
                        </span>
                    </Label>
                    <Button type="submit" className="w-full">
                        Create account
                    </Button>
                </form>
            </AuthSplit>
        </>
    );
}
