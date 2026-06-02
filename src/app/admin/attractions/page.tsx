
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  getAttractions, addAttraction, updateAttraction,
  deleteAttraction, uploadAttractionImage, Attraction,
} from "@/lib/attractionActions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  MapPin, Plus, Pencil, Trash2, Upload, Loader2, Eye, EyeOff, Image as ImageIcon,
} from "lucide-react";
import { Label } from "@/components/ui/label";

const CATEGORIES = ["Beach", "Cultural", "Wildlife", "Nature", "Historical", "Adventure", "City"];

const CATEGORY_COLORS: Record<string, string> = {
  Beach: "bg-blue-100 text-blue-700 border-blue-200",
  Cultural: "bg-purple-100 text-purple-700 border-purple-200",
  Wildlife: "bg-green-100 text-green-700 border-green-200",
  Nature: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Historical: "bg-amber-100 text-amber-700 border-amber-200",
  Adventure: "bg-orange-100 text-orange-700 border-orange-200",
  City: "bg-slate-100 text-slate-700 border-slate-200",
};

const emptyForm = {
  name: "", description: "", location: "", category: "Cultural",
  imageUrl: "", order: 0, published: true,
};

export default function AdminAttractionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Attraction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Attraction | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") { router.push("/"); return; }
    getAttractions().then((data) => { setAttractions(data); setLoading(false); });
  }, [user, authLoading, router]);

  const openAdd = () => {
    setEditTarget(null);
    setForm({ ...emptyForm, order: attractions.length });
    setImageFile(null);
    setImagePreview("");
    setDialogOpen(true);
  };

  const openEdit = (a: Attraction) => {
    setEditTarget(a);
    setForm({ name: a.name, description: a.description, location: a.location, category: a.category, imageUrl: a.imageUrl, order: a.order, published: a.published });
    setImageFile(null);
    setImagePreview(a.imageUrl);
    setDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.location.trim()) {
      toast({ variant: "destructive", title: "Required fields missing", description: "Name and location are required." });
      return;
    }
    setSaving(true);
    try {
      let imageUrl = form.imageUrl;
      if (imageFile) {
        const fd = new FormData();
        fd.append("image", imageFile);
        imageUrl = await uploadAttractionImage(fd);
      }
      const payload = { ...form, imageUrl, order: Number(form.order) };
      if (editTarget) {
        await updateAttraction(editTarget.id, payload);
        setAttractions((prev) => prev.map((a) => a.id === editTarget.id ? { ...a, ...payload } : a));
        toast({ title: "Updated", description: `${form.name} has been updated.` });
      } else {
        await addAttraction(payload);
        const fresh = await getAttractions();
        setAttractions(fresh);
        toast({ title: "Added", description: `${form.name} has been added.` });
      }
      setDialogOpen(false);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to save attraction." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAttraction(deleteTarget.id, deleteTarget.imageUrl);
      setAttractions((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      toast({ title: "Deleted", description: `${deleteTarget.name} has been removed.` });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete attraction." });
    } finally {
      setDeleteTarget(null);
    }
  };

  const togglePublish = async (a: Attraction) => {
    await updateAttraction(a.id, { published: !a.published });
    setAttractions((prev) => prev.map((x) => x.id === a.id ? { ...x, published: !x.published } : x));
  };

  if (authLoading || loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Tourist Attractions</h1>
          <p className="text-muted-foreground mt-1">Manage Sri Lanka travel guide spots shown on the home page.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Attraction
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total</p><p className="text-3xl font-bold">{attractions.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Published</p><p className="text-3xl font-bold text-green-600">{attractions.filter(a => a.published).length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Hidden</p><p className="text-3xl font-bold text-muted-foreground">{attractions.filter(a => !a.published).length}</p></CardContent></Card>
      </div>

      {/* Grid */}
      {attractions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg">No attractions yet</p>
              <p className="text-muted-foreground text-sm">Add Sri Lanka's best travel spots to guide your tourist customers.</p>
            </div>
            <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Add First Attraction</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {attractions.map((a) => (
            <Card key={a.id} className={`overflow-hidden transition-all ${!a.published ? "opacity-60" : ""}`}>
              <div className="relative h-48 bg-secondary">
                {a.imageUrl ? (
                  <img src={a.imageUrl} alt={a.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border ${CATEGORY_COLORS[a.category] ?? "bg-secondary text-foreground border-border"}`}>
                    {a.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant={a.published ? "default" : "secondary"} className="text-xs">
                    {a.published ? "Live" : "Hidden"}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg leading-tight">{a.name}</h3>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />{a.location}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {a.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    <Switch checked={a.published} onCheckedChange={() => togglePublish(a)} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(a)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(a)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Attraction" : "Add New Attraction"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Image upload */}
            <div className="space-y-2">
              <Label>Photo</Label>
              <div
                className="relative w-full h-48 bg-secondary rounded-xl overflow-hidden border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                    <Upload className="h-8 w-8" />
                    <span className="text-sm">Click to upload photo</span>
                  </div>
                )}
                {imagePreview && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-sm font-medium flex items-center gap-2"><Upload className="h-4 w-4"/>Change Photo</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <Label>Name <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. Sigiriya Rock Fortress" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Location <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. Matale District, Central Province" value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Display Order</Label>
                <Input type="number" min={0} value={form.order} onChange={(e) => setForm(f => ({ ...f, order: Number(e.target.value) }))} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe this attraction — history, what to see, best time to visit..."
                  className="resize-none h-28"
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <Switch checked={form.published} onCheckedChange={(v) => setForm(f => ({ ...f, published: v }))} />
                <Label className="cursor-pointer">{form.published ? "Published (visible on home page)" : "Hidden (not visible to visitors)"}</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {saving ? "Saving..." : editTarget ? "Save Changes" : "Add Attraction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this attraction from the home page. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
