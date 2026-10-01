import { Fragment, useEffect, useMemo, useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/Dialog";
import { DropdownMenu, DropdownMenuButton, DropdownMenuContent, DropdownMenuItem } from "../../components/ui/DropdownMenu";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { SegmentedTabs } from "../../components/ui/Tabs";
import { SimpleSelect } from "../../components/ui/Select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";

type NavItem = {
  id: string;
  menu: "primary" | "footer" | "mobile" | "utility";
  parent_id: string | null;
  label: string;
  to_path: string;
  mega: "chapters" | "councils" | "" | null;
  position: number;
  active: boolean;
};

const menuOptions = [
  { value: "primary", label: "Header menu" },
  { value: "footer", label: "Footer" },
  { value: "mobile", label: "Mobile tab bar" },
  { value: "utility", label: "Header utility links" },
];

const blankForm = { menu: "primary" as NavItem["menu"], parentId: "", label: "", toPath: "", mega: "", position: 0, active: true };

export default function NavigationTab() {
  const toast = useToast();
  const [menu, setMenu] = useState<NavItem["menu"]>("primary");
  const [items, setItems] = useState<NavItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(blankForm);

  async function load() {
    const result = await api<{ navItems: NavItem[] }>("/api/admin/nav-items");
    setItems(result.navItems);
  }

  useEffect(() => {
    void load().catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load navigation"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const menuItems = useMemo(() => items.filter((item) => item.menu === menu), [items, menu]);
  const topLevel = useMemo(() => menuItems.filter((item) => !item.parent_id).sort((a, b) => a.position - b.position), [menuItems]);
  const childrenOf = (parentId: string) => menuItems.filter((item) => item.parent_id === parentId).sort((a, b) => a.position - b.position);
  const labelOf = (id: string | null) => (id ? items.find((item) => item.id === id)?.label ?? "" : "");

  function openCreate(parentId?: string) {
    setEditingId(null);
    setForm({ ...blankForm, menu, parentId: parentId ?? "", position: parentId ? childrenOf(parentId).length : topLevel.length });
    setDialogOpen(true);
  }

  function openEdit(item: NavItem) {
    setEditingId(item.id);
    setForm({ menu: item.menu, parentId: item.parent_id ?? "", label: item.label, toPath: item.to_path, mega: item.mega ?? "", position: item.position, active: item.active });
    setDialogOpen(true);
  }

  async function save() {
    if (!form.label.trim()) {
      toast.error("A label is required");
      return;
    }
    try {
      await api(editingId ? `/api/admin/nav-items/${encodeURIComponent(editingId)}` : "/api/admin/nav-items", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify({ menu: form.menu, parentId: form.parentId || null, label: form.label.trim(), toPath: form.toPath, mega: form.mega || null, position: form.position, active: form.active }),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save navigation item");
      return;
    }
    toast.success(editingId ? "Navigation item updated." : "Navigation item added.");
    setDialogOpen(false);
    await load().catch(() => undefined);
  }

  async function remove(id: string) {
    try {
      await api(`/api/admin/nav-items/${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove navigation item");
      return;
    }
    toast.success("Navigation item removed.");
    await load().catch(() => undefined);
  }

  async function move(item: NavItem, direction: -1 | 1) {
    const siblings = (item.parent_id ? childrenOf(item.parent_id) : topLevel);
    const index = siblings.findIndex((row) => row.id === item.id);
    const swapWith = siblings[index + direction];
    if (!swapWith) return;
    try {
      await Promise.all([
        api(`/api/admin/nav-items/${encodeURIComponent(item.id)}`, { method: "PUT", body: JSON.stringify({ menu: item.menu, parentId: item.parent_id, label: item.label, toPath: item.to_path, mega: item.mega, position: swapWith.position, active: item.active }) }),
        api(`/api/admin/nav-items/${encodeURIComponent(swapWith.id)}`, { method: "PUT", body: JSON.stringify({ menu: swapWith.menu, parentId: swapWith.parent_id, label: swapWith.label, toPath: swapWith.to_path, mega: swapWith.mega, position: item.position, active: swapWith.active }) }),
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reorder");
      return;
    }
    await load().catch(() => undefined);
  }

  const parentOptions = [{ value: "", label: "— Top level —" }, ...topLevel.filter((item) => item.id !== editingId).map((item) => ({ value: item.id, label: item.label }))];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ipf-green)]">Navigation</p>
        <h2 className="mt-2 text-3xl font-bold text-[var(--ipf-navy)]">Site navigation</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
          Add, reorder, rename or remove menu items across the header, footer, mobile tab bar and header utility links — no code deploy needed.
        </p>
      </div>
      <SegmentedTabs value={menu} onValueChange={(value) => setMenu(value as NavItem["menu"])} items={menuOptions} />
      <div className="flex justify-end">
        <Button type="button" onClick={() => openCreate()}>
          Add top-level item
        </Button>
      </div>
      <Table>
        <TableCaption>{menuOptions.find((option) => option.value === menu)?.label}</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeader>Order</TableHeader>
            <TableHeader>Label</TableHeader>
            <TableHeader>Link</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader className="text-right">Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {topLevel.map((item) => (
            <Fragment key={item.id}>
              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => void move(item, -1)}>
                      ↑
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => void move(item, 1)}>
                      ↓
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-[var(--ipf-navy)]">
                  {item.label} {item.mega ? <Badge tone="paper">{item.mega}</Badge> : null}
                </TableCell>
                <TableCell className="font-mono text-xs">{item.to_path}</TableCell>
                <TableCell>
                  <Badge tone={item.active ? "green" : "paper"}>{item.active ? "Active" : "Hidden"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuButton />
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => openEdit(item)}>Edit</DropdownMenuItem>
                      {menu === "primary" || menu === "footer" ? <DropdownMenuItem onSelect={() => openCreate(item.id)}>Add sub-item</DropdownMenuItem> : null}
                      <DropdownMenuItem onSelect={() => void remove(item.id)}>Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              {childrenOf(item.id).map((child) => (
                <TableRow key={child.id} className="bg-[var(--ipf-ivory)]/40">
                  <TableCell>
                    <div className="flex items-center gap-1 pl-4">
                      <Button type="button" variant="ghost" size="sm" onClick={() => void move(child, -1)}>
                        ↑
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => void move(child, 1)}>
                        ↓
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="pl-6 text-[var(--ipf-navy)]">↳ {child.label}</TableCell>
                  <TableCell className="font-mono text-xs">{child.to_path}</TableCell>
                  <TableCell>
                    <Badge tone={child.active ? "green" : "paper"}>{child.active ? "Active" : "Hidden"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuButton />
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => openEdit(child)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => void remove(child.id)}>Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogTitle>{editingId ? "Edit navigation item" : "Add navigation item"}</DialogTitle>
          <DialogDescription>{labelOf(form.parentId) ? `Sub-item of "${labelOf(form.parentId)}"` : "Top-level item"}</DialogDescription>
          <div className="mt-4 grid gap-4">
            <Field label="Label" htmlFor="nav-label">
              <Input id="nav-label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </Field>
            <Field label="Link (e.g. /about)" htmlFor="nav-path">
              <Input id="nav-path" value={form.toPath} onChange={(e) => setForm({ ...form, toPath: e.target.value })} />
            </Field>
            {(menu === "primary" || menu === "footer") && !editingId ? (
              <Field label="Parent (optional — makes this a sub-item)" htmlFor="nav-parent">
                <SimpleSelect id="nav-parent" value={form.parentId} onValueChange={(parentId) => setForm({ ...form, parentId })} placeholder="Top level" options={parentOptions} />
              </Field>
            ) : null}
            {menu === "primary" && !form.parentId ? (
              <Field label="Mega menu (optional)" htmlFor="nav-mega">
                <SimpleSelect
                  id="nav-mega"
                  value={form.mega}
                  onValueChange={(mega) => setForm({ ...form, mega })}
                  placeholder="None"
                  options={[{ value: "", label: "None" }, { value: "chapters", label: "Chapters mega menu" }, { value: "councils", label: "Councils mega menu" }]}
                />
              </Field>
            ) : null}
            <label className="flex items-center gap-2 text-sm text-[var(--ipf-navy)]">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              Visible on the site
            </label>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void save()}>
                {editingId ? "Save changes" : "Add item"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
