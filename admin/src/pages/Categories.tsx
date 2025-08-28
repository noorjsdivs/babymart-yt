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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import type { Category } from "@/lib/type";
import { categorySchema } from "@/lib/validation";
import useAuthStore from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Edit,
  Loader2,
  Plus,
  RefreshCw,
  Trash,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type z from "zod";
import ImageUpload from "@/components/ui/image.upload";
import { toast } from "sonner";
import { AxiosError } from "axios";

type FormData = z.infer<typeof categorySchema>;

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); // Default page = 1
  const [perPage] = useState(10); // Default perPage = 10
  const [totalPages, setTotalPages] = useState(1); // Track total pages
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Default to ascending
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [formLoading, setFormLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { checkIsAdmin } = useAuthStore();
  const isAdmin = checkIsAdmin();

  const formAdd = useForm<FormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      image: "",
      categoryType: "Featured",
    },
  });

  const formEdit = useForm<FormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      image: "",
      categoryType: "Featured",
    },
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axiosPrivate.get("/categories", {
        params: { page, perPage, sortOrder },
      });
      setCategories(response?.data?.categories || []);
      setTotal(response?.data?.total || 0);
      setTotalPages(response?.data?.totalPages || 1);
    } catch (error) {
      console.log("Failed to fetch categories", error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, sortOrder]);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handleAddCategory = async (data: FormData) => {
    setFormLoading(true);
    try {
      await axiosPrivate.post("/categories", data);
      toast("Category created successfully");
      formAdd.reset();
      setIsAddModalOpen(false);
      setPage(1); // Reset to page 1 after adding
      fetchCategories();
    } catch (error: unknown) {
      console.log("Failed to create category", error);
      let errorMessage = "Failed to create category";
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      if (errorMessage.includes("already exists")) {
        formAdd.setError("name", { type: "manual", message: errorMessage });
      } else {
        toast(errorMessage);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (category: Category) => {
    setSelectedCategory(category);
    formEdit.reset({
      name: category.name,
      image: category.image || "",
      categoryType: category.categoryType,
    });
    setIsEditModalOpen(true);
  };
  const handleDelete = async (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateCategory = async (data: FormData) => {
    if (!selectedCategory) return;

    setFormLoading(true);
    try {
      await axiosPrivate.put(`/categories/${selectedCategory._id}`, data);
      toast("Category updated successfully");
      setIsEditModalOpen(false);
      fetchCategories();
    } catch (error: unknown) {
      console.log("Failed to update category", error);
      let errorMessage = "Failed to update category";
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      if (errorMessage.includes("already exists")) {
        formEdit.setError("name", { type: "manual", message: errorMessage });
      } else {
        toast(errorMessage);
      }
    } finally {
      setFormLoading(false);
    }
  };
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    try {
      await axiosPrivate.delete(`/categories/${selectedCategory._id}`);
      toast("Category deleted successfully");
      setIsDeleteModalOpen(false);
      setPage(1); // Reset to page 1 after deleting
      fetchCategories();
    } catch (error) {
      console.log("Failed to delete category", error);
      toast("Failed to delete category");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await axiosPrivate.get("/categories", {
        params: { page, perPage, sortOrder },
      });
      setCategories(response?.data?.categories || []);
      setTotal(response?.data?.total || 0);
      setTotalPages(response?.data?.totalPages || 1);
      toast("Categories refreshed successfully");
    } catch (error) {
      console.log("Failed to refresh categories", error);
      toast("Failed to refresh categories");
    } finally {
      setRefreshing(false);
    }
  };

  const handleSortChange = (newSortOrder: "asc" | "desc") => {
    setSortOrder(newSortOrder);
    setPage(1);
  };
  return (
    <div className="p-5 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-end gap-3">
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-sm font-medium">
            Total <span className="font-bold">{total}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
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
          <Select value={sortOrder} onValueChange={handleSortChange}>
            <SelectTrigger className="w-40 bg-background text-sm shadow-sm hover:bg-muted/10 focus:ring-2 focus:ring-ring">
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>
            <SelectContent className="">
              <SelectItem value="asc" className="flex items-center">
                <span className="flex items-center">
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Ascending
                </span>
              </SelectItem>
              <SelectItem value="desc" className="flex items-center">
                <span className="flex items-center">
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Descending
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          {isAdmin && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          )}
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created At</TableHead>
                  {isAdmin && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>
                      {category.image ? (
                        <div className="h-12 w-12 rounded overflow-hidden bg-muted">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell>{category.categoryType}</TableCell>
                    <TableCell>
                      {new Date(category.createdAt).toLocaleDateString()}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 5 : 4}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No categories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {total > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * perPage + 1} to{" "}
                {Math.min(page * perPage, total)} of {total} categories
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      {/* Add Category Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>Create a new product category</DialogDescription>
          </DialogHeader>
          <Form {...formAdd}>
            <form
              onSubmit={formAdd.handleSubmit(handleAddCategory)}
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
                name="categoryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Type</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        disabled={formLoading}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="" disabled>
                          Select a category type
                        </option>
                        <option value="Featured">Featured</option>
                        <option value="Hot Categories">Hot Categories</option>
                        <option value="Top Categories">Top Categories</option>
                      </select>
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
                    <FormLabel>Category Image (Optional)</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value ?? ""}
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
                    "Create Category"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/* Edit Category Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category information</DialogDescription>
          </DialogHeader>
          <Form {...formEdit}>
            <form
              onSubmit={formEdit.handleSubmit(handleUpdateCategory)}
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
                name="categoryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Type</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        disabled={formLoading}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="" disabled>
                          Select a category type
                        </option>
                        <option value="Featured">Featured</option>
                        <option value="Hot Categories">Hot Categories</option>
                        <option value="Top Categories">Top Categories</option>
                      </select>
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
                    <FormLabel>Category Image (Optional)</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value ?? ""}
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
                    "Update Category"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              category{" "}
              <span className="font-semibold">{selectedCategory?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formLoading}
              onClick={handleDeleteCategory}
              className="bg-destructive hover:bg-destructive/90"
            >
              {formLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
