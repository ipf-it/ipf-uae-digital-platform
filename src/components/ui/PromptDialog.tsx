import { useState, type FormEvent } from "react";
import { Button } from "./Button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./Dialog";
import { Field } from "./Field";
import { Textarea } from "./Textarea";

type PromptDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  label: string;
  submitLabel?: string;
  required?: boolean;
  onSubmit: (value: string) => void;
};

/** A reusable replacement for window.prompt() — a single-field text dialog. */
export function PromptDialog({ open, onOpenChange, title, description, label, submitLabel = "Submit", required, onSubmit }: PromptDialogProps) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(value);
    setValue("");
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setValue("");
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        {description ? <DialogDescription>{description}</DialogDescription> : null}
        <form className="mt-4" onSubmit={handleSubmit}>
          <Field label={label} htmlFor="prompt-dialog-value">
            <Textarea id="prompt-dialog-value" className="min-h-24" required={required} value={value} onChange={(e) => setValue(e.target.value)} />
          </Field>
          <div className="mt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setValue("");
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">{submitLabel}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
