/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import useAuthStore from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Edit, Loader2, Plus, Trash, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "@/components/ui/image.upload";
import { bannerSchema } from "@/lib/validation";
import type { Banner } from "@/lib/type";

// Define the Banner type based on the Banner model

type FormData = z.infer<typeof bannerSchema>;

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { checkIsAdmin } = useAuthStore();
  const isAdmin = checkIsAdmin();

  const formAdd = useForm<FormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      name: "",
      title: "",
      startFrom: 0,
      image: "",
      bannerType: "",
    },
  });

  const formEdit = useForm<FormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      name: "",
      title: "",
      startFrom: 0,
      image: "",
      bannerType: "",
    },
  });

  const fetchBanners = async () => {
    try {
      const response = await axiosPrivate.get("/banners");
      setBanners(response.data);
    } catch (error) {
      console.log("Failed to load banners", error);
      toast("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await axiosPrivate.get("/banners");
      setBanners(response.data);
      toast("Banners refreshed successfully");
    } catch (error) {
      console.log("Failed to refresh banners", error);
      toast("Failed to refresh banners");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleEdit = (banner: Banner) => {
    setSelectedBanner(banner);
    formEdit.reset({
      name: banner.name,
      title: banner.title,
      startFrom: banner.startFrom,
      image: banner.image,
      bannerType: banner.bannerType,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsDeleteModalOpen(true);
  };

  const handleAddBanner = async (data: FormData) => {
    setFormLoading(true);
    try {
      await axiosPrivate.post("/banners", {
        ...data,
        startFrom: Number(data.startFrom),
      });
      toast("Banner created successfully");
      formAdd.reset();
      setIsAddModalOpen(false);
      fetchBanners();
    } catch (error) {
      console.log("Failed to create banner", error);
      toast("Failed to create banner");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateBanner = async (data: FormData) => {
    if (!selectedBanner) return;

    setFormLoading(true);
    try {
      await axiosPrivate.put(`/banners/${selectedBanner._id}`, {
        ...data,
        startFrom: Number(data.startFrom),
      });
      toast("Banner updated successfully");
      setIsEditModalOpen(false);
      fetchBanners();
    } catch (error) {
      console.log("Failed to update banner", error);
      toast("Failed to update banner");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBanner = async () => {
    if (!selectedBanner) return;

    try {
      await axiosPrivate.delete(`/banners/${selectedBanner._id}`);
      toast("Banner deleted successfully");
      setIsDeleteModalOpen(false);
      fetchBanners();
    } catch (error) {
      console.log("Failed to delete banner", error);
      toast("Failed to delete banner");
    }
  };

  return (
    <div className="p-5 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Banners</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          {isAdmin && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Banner
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Start From</TableHead>
                <TableHead>Type</TableHead>
                {isAdmin && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => (
                <TableRow key={banner._id}>
                  <TableCell>
                    <div className="h-12 w-12 rounded overflow-hidden bg-muted">
                      <img
                        src={banner.image}
                        alt={banner.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {banner?.name?.substring(0, 30)}...
                  </TableCell>
                  <TableCell>{banner?.title?.substring(0, 30)}...</TableCell>
                  <TableCell>{banner.startFrom}</TableCell>
                  <TableCell>{banner.bannerType}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(banner)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(banner)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {banners.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 6 : 5}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No banners found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Banner Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Banner</DialogTitle>
            <DialogDescription>Create a new banner</DialogDescription>
          </DialogHeader>
          <Form {...formAdd}>
            <form
              onSubmit={formAdd.handleSubmit(handleAddBanner)}
              className="space-y-4"
            >
              <FormField
                control={formAdd.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="startFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start From</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        disabled={formLoading}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="bannerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Banner"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Banner Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Banner</DialogTitle>
            <DialogDescription>Update banner information</DialogDescription>
          </DialogHeader>
          <Form {...formEdit}>
            <form
              onSubmit={formEdit.handleSubmit(handleUpdateBanner)}
              className="space-y-4"
            >
              <FormField
                control={formEdit.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="startFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start From</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        disabled={formLoading}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="bannerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Banner"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Banner Confirmation */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              banner{" "}
              <span className="font-semibold">{selectedBanner?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBanner}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
