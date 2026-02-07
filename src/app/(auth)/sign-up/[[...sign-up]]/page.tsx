import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">M</span>
                    </div>
                    <h1 className="text-2xl font-bold">Create your account</h1>
                    <p className="text-muted-foreground">Join MentorConnect and start your journey</p>
                </div>
                <SignUp
                    appearance={{
                        elements: {
                            formButtonPrimary: 'bg-primary hover:bg-primary-dark',
                            card: 'shadow-none',
                        }
                    }}
                />
            </div>
        </div>
    );
}
