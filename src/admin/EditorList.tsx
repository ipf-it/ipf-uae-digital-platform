import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

type EditorListProps = {
  title: string;
  hint?: string;
  items: { src: string; alt: string; title?: string; caption?: string }[];
  mediaOptions: string[];
  onChange: (items: { src: string; alt: string; title?: string; caption?: string }[]) => void;
  onUpload: (file: File, index: number) => void;
  onAdd: () => void;
};

export function EditorList({ title, hint, items, onChange, onUpload, onAdd }: EditorListProps) {
  return (
    <section>
      <h2 className="text-lg font-bold text-[var(--ipf-navy)]">{title}</h2>
      {hint ? <p className="mt-1 text-sm leading-6 text-[var(--ipf-muted)]">{hint}</p> : null}
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div key={`${item.src}-${index}`} className="grid gap-3 overflow-hidden rounded-xl border border-[var(--ipf-line)] bg-[var(--ipf-paper)] p-3 shadow-[0_8px_24px_rgba(11,31,58,0.06)] sm:grid-cols-[96px,1fr]">
            {item.src ? <img src={item.src} alt="" className="h-20 w-full rounded-lg object-cover" /> : <div className="h-20 rounded-lg bg-[var(--ipf-line)]" />}
            <div className="grid gap-2">
              <Input
                placeholder="Image path"
                value={item.src}
                onChange={(event) => {
                  const next = [...items];
                  next[index] = { ...item, src: event.target.value };
                  onChange(next);
                }}
              />
              <Input
                placeholder="Title"
                value={item.title ?? ""}
                onChange={(event) => {
                  const next = [...items];
                  next[index] = { ...item, title: event.target.value };
                  onChange(next);
                }}
              />
              <Input
                placeholder="Caption"
                value={item.caption ?? item.alt}
                onChange={(event) => {
                  const next = [...items];
                  next[index] = { ...item, caption: event.target.value, alt: event.target.value };
                  onChange(next);
                }}
              />
              <Input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onUpload(file, index);
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <Button type="button" variant="outline" onClick={onAdd}>
          Add photograph
        </Button>
      </div>
    </section>
  );
}
