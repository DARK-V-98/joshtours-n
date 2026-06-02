
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAllUsers, setUserRole, UserRecord } from "@/lib/userActions";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, ShieldCheck, ShieldOff, Users, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: UserRecord | null;
    newRole: "admin" | "staff" | "user";
  }>({ open: false, user: null, newRole: "user" });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }
    getAllUsers().then((u) => {
      setUsers(u);
      setLoading(false);
    });
  }, [user, authLoading, router]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.displayName?.toLowerCase().includes(q) ||
      u.uid.toLowerCase().includes(q)
    );
  });

  const adminCount = users.filter((u) => u.role === "admin").length;
  const staffCount = users.filter((u) => u.role === "staff").length;
  const userCount = users.filter((u) => u.role === "user").length;

  const openConfirm = (target: UserRecord, newRole: "admin" | "staff" | "user") => {
    setConfirmDialog({ open: true, user: target, newRole });
  };

  const handleRoleChange = () => {
    const { user: target, newRole } = confirmDialog;
    if (!target) return;
    setConfirmDialog({ open: false, user: null, newRole: "user" });

    setUpdatingIds((prev) => new Set(prev).add(target.uid));
    startTransition(async () => {
      try {
        await setUserRole(target.uid, newRole);
        setUsers((prev) =>
          prev.map((u) => (u.uid === target.uid ? { ...u, role: newRole } : u))
        );
        toast({
          title: "Role updated",
          description: `${target.displayName || target.email} is now ${newRole === "admin" ? "an Admin" : "a regular User"}.`,
        });
      } catch {
        toast({ variant: "destructive", title: "Error", description: "Failed to update role." });
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(target.uid);
          return next;
        });
      }
    });
  };

  if (authLoading || loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-1">Search users and manage their roles.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold">{users.length}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Admins</p>
              <p className="text-3xl font-bold">{adminCount}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Staff</p>
              <p className="text-3xl font-bold">{staffCount}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Regular Users</p>
              <p className="text-3xl font-bold">{userCount}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center">
              <ShieldOff className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or UID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {filtered.length} user{filtered.length !== 1 ? "s" : ""} found
            {search && ` for "${search}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden md:table-cell">UID</TableHead>
                  <TableHead className="hidden sm:table-cell">Joined</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((u) => {
                    const isUpdating = updatingIds.has(u.uid);
                    const isSelf = u.uid === user?.uid;
                    return (
                      <TableRow key={u.uid}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                              {(u.displayName || u.email || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {u.displayName || <span className="text-muted-foreground italic">No name</span>}
                                {isSelf && (
                                  <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <code className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                            {u.uid.slice(0, 16)}…
                          </code>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {u.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={u.role === "admin" ? "default" : u.role === "staff" ? "outline" : "secondary"}
                            className={`capitalize ${u.role === "staff" ? "border-orange-400 text-orange-600" : ""}`}
                          >
                            {isUpdating && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {isSelf ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            <div className="flex gap-2 justify-end flex-wrap">
                              {u.role !== "admin" && (
                                <Button
                                  size="sm"
                                  disabled={isUpdating}
                                  onClick={() => openConfirm(u, "admin")}
                                  className="bg-primary hover:bg-primary/90"
                                >
                                  <ShieldCheck className="mr-1.5 h-4 w-4" />
                                  Make Admin
                                </Button>
                              )}
                              {u.role !== "staff" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isUpdating}
                                  onClick={() => openConfirm(u, "staff")}
                                  className="border-orange-400 text-orange-600 hover:bg-orange-50"
                                >
                                  <ShieldCheck className="mr-1.5 h-4 w-4" />
                                  Make Staff
                                </Button>
                              )}
                              {u.role !== "user" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isUpdating}
                                  onClick={() => openConfirm(u, "user")}
                                >
                                  <ShieldOff className="mr-1.5 h-4 w-4" />
                                  Make User
                                </Button>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No users found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => !open && setConfirmDialog((p) => ({ ...p, open: false }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.newRole === "admin" ? "Grant Admin Access?" : confirmDialog.newRole === "staff" ? "Grant Staff Access?" : "Remove Elevated Access?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.newRole === "admin"
                ? `This will give ${confirmDialog.user?.displayName || confirmDialog.user?.email} full admin access to the dashboard, fleet, and all bookings.`
                : confirmDialog.newRole === "staff"
                ? `This will give ${confirmDialog.user?.displayName || confirmDialog.user?.email} staff access — they can view and edit bookings/agreements but cannot confirm or cancel bookings.`
                : `This will remove elevated access from ${confirmDialog.user?.displayName || confirmDialog.user?.email}. They will only have regular user access.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRoleChange}
              className={confirmDialog.newRole === "user" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {confirmDialog.newRole === "admin" ? "Yes, make Admin" : confirmDialog.newRole === "staff" ? "Yes, make Staff" : "Yes, make User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
