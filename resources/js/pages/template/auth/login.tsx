import { Head, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import PasswordInput from '@/components/password-input';
import { AuthSplit } from '@/components/template/auth-split';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function TemplateAuthLogin() {
    return (
        <>
            <Head title="Login Preview" />
            <AuthSplit
                title="Welcome back"
                description="Sign in to your workspace to continue."
                footer="Member access only. Contact an administrator if you need an account."
                backHref="/template"
                backLabel="Command Centre"
                preview
            >
                <form
                    className="grid gap-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        toast.info(
                            'Design preview — authentication is wired to the real backend later.',
                        );
                    }}
                >
                    <div className="grid gap-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                            id="login-email"
                            type="email"
                            placeholder="you@company.com"
                            autoComplete="email"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="login-password">Password</Label>
                            <Link
                                href="/template/auth/forgot-password"
                                className="text-sm text-primary hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <PasswordInput
                            id="login-password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                        />
                    </div>
                    <Label className="flex items-center gap-2 font-normal">
                        <Checkbox defaultChecked />
                        Remember me for 30 days
                    </Label>
                    <Button type="submit" className="w-full">
                        Sign in
                    </Button>
                </form>

                <div className="relative">
                    <Separator />
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground uppercase">
                        or continue with
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => toast.info('Design preview only')}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className="size-4"
                            aria-hidden="true"
                        >
                            <path
                                fill="currentColor"
                                d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81"
                            />
                        </svg>
                        Google
                    </Button>
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => toast.info('Design preview only')}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className="size-4"
                            aria-hidden="true"
                        >
                            <path
                                fill="currentColor"
                                d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"
                            />
                        </svg>
                        Microsoft
                    </Button>
                </div>
            </AuthSplit>
        </>
    );
}
