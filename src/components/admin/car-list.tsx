
"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { getCarsForAdmin, AdminCar } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Loader2, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { toggleCarAvailability, deleteCar } from "@/lib/carActions";
import { Skeleton } from "@/components/ui/skeleton";

export function CarList() {
  const [cars, setCars] = useState<AdminCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, startUpdateTransition] = useTransition();
  const { toast } = useToast();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [carToDelete, setCarToDelete] = useState<AdminCar | null>(null);

  useEffect(() => {
    async function fetchCars() {
      setLoading(true);
      try {
        const fetchedCars = await getCarsForAdmin();
        setCars(fetchedCars);
      } catch (error) {
        console.error("Failed to fetch cars:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch the car list.",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchCars();
  }, [toast]);

  const handleToggleAvailability = (carId: string, isAvailable: boolean) => {
    startUpdateTransition(async () => {
      try {
        await toggleCarAvailability(carId, isAvailable);
        setCars((prevCars) =>
          prevCars.map((c) =>
            c.id === carId ? { ...c, isAvailable: !isAvailable } : c
          )
        );
        toast({
          title: "Success",
          description: `Car has been ${isAvailable ? "disabled" : "enabled"}.`,
        });
      } catch (error) {
        console.error("Failed to toggle availability:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update the car. Please try again.",
        });
      }
    });
  };

  const handleDeleteClick = (car: AdminCar) => {
    setCarToDelete(car);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (!carToDelete) return;

    startUpdateTransition(async () => {
      try {
        await deleteCar(carToDelete.id);
        setCars((prevCars) => prevCars.filter((c) => c.id !== carToDelete.id));
        toast({
          title: "Success",
          description: `Car "${carToDelete.name}" has been deleted.`,
        });
      } catch (error) {
        console.error("Failed to delete car:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete the car. Please try again.",
        });
      } finally {
        setShowDeleteDialog(false);
        setCarToDelete(null);
      }
    });
  };


  if (loading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Your Fleet</CardTitle>
                <CardDescription>View, edit, or manage your vehicles.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-full md:w-[300px]"><Skeleton className="h-5 w-24" /></TableHead>
                                <TableHead className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableHead>
                                <TableHead className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableHead>
                                <TableHead className="text-right"><Skeleton className="h-5 w-16" /></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Manage Your Fleet</CardTitle>
        <CardDescription>
          A list of all the vehicles in your inventory. You can edit or disable them from here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-full md:w-[300px]">Name & Type</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Date Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {cars.length > 0 ? (
                cars.map((car) => (
                    <TableRow key={car.id}>
                    <TableCell className="font-medium">
                        <div className="font-bold">{car.name}</div>
                        <div className="text-sm text-muted-foreground md:hidden">
                            {car.isAvailable ? 'Enabled' : 'Disabled'} | Added: {car.createdAt ? new Date(car.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground hidden md:block">{car.type}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        {car.isAvailable ? (
                        <Badge>
                            <ShieldCheck className="mr-2 h-4 w-4"/>
                            Enabled
                        </Badge>
                        ) : (
                        <Badge variant="secondary">
                            <ShieldOff className="mr-2 h-4 w-4"/>
                            Disabled
                        </Badge>
                        )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        {car.createdAt ? new Date(car.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isUpdating}>
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                                <Link href={`/admin/edit/${car.id}`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.preventDefault();
                                    handleToggleAvailability(car.id, car.isAvailable);
                                }}
                                disabled={isUpdating}
                            >
                                {car.isAvailable ? (
                                    <><ShieldOff className="mr-2 h-4 w-4" /> Disable</>
                                ) : (
                                    <><ShieldCheck className="mr-2 h-4 w-4" /> Enable</>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                                onSelect={(e) => {
                                    e.preventDefault();
                                    handleDeleteClick(car);
                                }}
                                disabled={isUpdating}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                    No cars found. Add one above to get started.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>

    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              car "{carToDelete?.name}" and all of its associated images. Bookings linked to this car will not be deleted but may become orphaned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isUpdating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUpdating ? "Deleting..." : "Yes, delete it"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
