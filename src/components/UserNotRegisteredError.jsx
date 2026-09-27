import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const UserNotRegisteredError = () => {
  return (
      <div className="flex min-h-screen items-center justify-center bg-dots p-6">
      <div className="surface-card w-full max-w-md p-8 text-center">
        <span
          aria-hidden="true"
          className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-warning/15"
        >
          <AlertTriangle className="h-8 w-8 text-warning" />
        </span>
        <h1 className="mb-4 font-display text-3xl font-semibold tracking-tight">
          Access Restricted
        </h1>
        <p className="text-muted-foreground">
          You are not registered to use this application. Please contact the app administrator to
          request access.
        </p>
        <div className="mt-8 rounded-xl bg-muted/60 p-4 text-left text-sm text-muted-foreground">
          <p className="font-medium text-foreground">If you believe this is an error, you can:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Verify you are logged in with the correct account</li>
            <li>Contact the app administrator for access</li>
            <li>Try logging out and back in again</li>
          </ul>
        </div>
        <Button asChild variant="outline" className="mt-6">
          <a href="/login">Back to sign in</a>
        </Button>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;
