
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
  TableCaption,
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
import { MoreHorizontal, Pencil, Trash2, Loader2, ShieldCheck, ShieldOff } from "lucide-react";
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
import { deleteCar } from "@/lib/carActions";
import { Skeleton } from "@/components/ui/skeleton";

export function CarList() {
  const [cars, setCars] = useState<AdminCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [carToDelete, setCarToDelete] = useState<AdminCar | null>(null);
  const { toast } = useToast();

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

  const handleDeleteClick = (car: AdminCar) => {
    setCarToDelete(car);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (!carToDelete) return;

    startDeleteTransition(async () => {
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
                <CardDescription>View, edit, or delete your vehicles.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]"><Skeleton className="h-5 w-24" /></TableHead>
                                <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                                <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                                <TableHead className="text-right"><Skeleton className="h-5 w-16" /></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
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
    <Card>
      <CardHeader>
        <CardTitle>Manage Your Fleet</CardTitle>
        <CardDescription>
          A list of all the vehicles in your inventory. You can edit or delete them from here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[300px]">Name & Type</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {cars.length > 0 ? (
                cars.map((car) => (
                    <TableRow key={car.id}>
                    <TableCell className="font-medium">
                        <div className="font-bold">{car.name}</div>
                        <div className="text-sm text-muted-foreground">{car.type}</div>
                    </TableCell>
                    <TableCell>
                        {car.isAvailable ? (
                        <Badge>
                            <ShieldCheck className="mr-2 h-4 w-4"/>
                            Available
                        </Badge>
                        ) : (
                        <Badge variant="secondary">
                            <ShieldOff className="mr-2 h-4 w-4"/>
                            Unavailable
                        </Badge>
                        )}
                    </TableCell>
                    <TableCell>
                        {car.createdAt ? new Date(car.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/edit/${car.id}`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                            className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                            onClick={() => handleDeleteClick(car)}
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              car "{carToDelete?.name}" and all of its associated images from the servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? "Deleting..." : "Yes, delete it"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
