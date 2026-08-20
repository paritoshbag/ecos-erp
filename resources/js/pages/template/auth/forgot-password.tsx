import { Head, Link } from '@inertiajs/react';
import { MailCheck } from 'lucide-react';
import { useState } from 'react';
import { AuthSplit } from '@/components/template/auth-split';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TemplateAuthForgotPassword() {
    const [sent, setSent] = useState(false);

    return (
        <>
            <Head title="Forgot Password Preview" />
            <AuthSplit
                title={sent ? 'Check your inbox' : 'Reset your password'}
                description={
                    sent
                        ? 'If an account exists for that address, a reset link is on its way.'
                        : "Enter your work email and we'll send you a reset link."
                }
                backHref="/template"
                backLabel="Command Centre"
                preview
                footer={
                    <>
                        Remembered it after all?{' '}
                        <Link
                            href="/template/auth/login"
                            className="font-medium text-primary hover:underline"
                        >
                            Back to sign in
                        </Link>
                    </>
                }
            >
                {sent ? (
                    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed p-8 text-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
                            <MailCheck className="size-6" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            The link expires in 60 minutes. Didn't get it?
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => setSent(false)}
                        >
                            Send again
                        </Button>
                    </div>
                ) : (
                    <form
                        className="grid gap-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            setSent(true);
                        }}
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="forgot-email">Email</Label>
                            <Input
                                id="forgot-email"
                                type="email"
                                placeholder="you@company.com"
                                autoComplete="email"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Email me a reset link
                        </Button>
                    </form>
                )}
            </AuthSplit>
        </>
    );
}
