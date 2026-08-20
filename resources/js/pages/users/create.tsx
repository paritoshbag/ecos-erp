import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import UserController from '@/actions/App/Http/Controllers/Users/UserController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { PageHeader } from '@/components/template/page-header';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { create, index as usersIndex } from '@/routes/users';
import type { UsersCreateProps } from '@/types/user';

export default function UsersCreate({ passwordRules }: UsersCreateProps) {
    return (
        <>
            <Head title="Create user" />
            <div className="flex flex-col gap-4">
                <PageHeader
                    title="Create user"
                    description="The account can sign in immediately. They start as a member."
                    actions={
                        <Button variant="outline" asChild>
                            <Link href={usersIndex()}>
                                <ArrowLeft className="size-4" /> Back to users
                            </Link>
                        </Button>
                    }
                />

                <Card className="max-w-xl">
                    <CardHeader>
                        <CardTitle>Account</CardTitle>
                        <CardDescription>
                            Set a password now. You can send a reset email later
                            if they need to choose their own.
                            {passwordRules ? (
                                <span className="mt-1 block">
                                    {passwordRules}
                                </span>
                            ) : null}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...UserController.store.form()}
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            required
                                            autoComplete="name"
                                            autoFocus
                                            placeholder="Full name"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoComplete="email"
                                            placeholder="name@company.com"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password">
                                            Password
                                        </Label>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            required
                                            autoComplete="new-password"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation">
                                            Confirm password
                                        </Label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            required
                                            autoComplete="new-password"
                                        />
                                        <InputError
                                            message={
                                                errors.password_confirmation
                                            }
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <Button disabled={processing}>
                                            Create user
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

UsersCreate.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: usersIndex(),
        },
        {
            title: 'Create user',
            href: create(),
        },
    ],
};
