import type { FormEvent, PropsWithChildren } from "react";
import { Button } from "./Button";
import { Card } from "./Card";

type AuthScreenProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  status?: string;
  onSubmit: (event: FormEvent) => void;
  submitLabel: string;
}>;

export function AuthScreen({ eyebrow, title, description, status, onSubmit, submitLabel, children }: AuthScreenProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--ipf-navy)] px-4 py-16">
      <form className="w-full max-w-md" onSubmit={onSubmit}>
        <Card size="lg" eyebrow={eyebrow} title={title} description={description}>
          <div className="grid gap-4">{children}</div>
          {status ? <p className="mt-4 text-sm text-red-700">{status}</p> : null}
          <Button className="mt-5 w-full" type="submit">
            {submitLabel}
          </Button>
        </Card>
      </form>
    </main>
  );
}
