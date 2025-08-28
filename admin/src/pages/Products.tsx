import ProductSkeleton from "@/components/skeletons/ProductSkeleton";
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
import ImageUpload from "@/components/ui/image.upload";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import type { Brand, Category, Product } from "@/lib/type";
import { productSchema } from "@/lib/validation";
import useAuthStore from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
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
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";

type FormData = z.infer<typeof productSchema>;

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); // Default page = 1
  const [perPage] = useState(10); // Default perPage = 10
  const [totalPages, setTotalPages] = useState(1); // Track total pages
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Default to ascending
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { checkIsAdmin } = useAuthStore();
  const isAdmin = checkIsAdmin();

  const formAdd = useForm<FormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discountPercentage: 10,
      stock: 10,
      category: "",
      brand: "",
      image: "",
    },
  });

  const formEdit = useForm<FormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discountPercentage: 0,
      stock: 0,
      category: "",
      brand: "",
      image: "",
    },
  });

  const fetchProducts = async (resetPage = false) => {
    setLoading(true);
    try {
      const currentPage = resetPage ? 1 : page;
      const response = await axiosPrivate.get("/products", {
        params: { page: currentPage, perPage, sortOrder },
      });
      setProducts(response.data.products || []);
      setTotal(response.data.total || 0);
      setTotalPages(
        response.data.totalPages ||
          Math.ceil((response.data.total || 0) / perPage)
      );

      // If we reset the page, update the page state
      if (resetPage) {
        setPage(1);
      }
    } catch (error) {
      console.log("Failed to load products", error);
      toast("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosPrivate.get("/categories", {
        params: { page: 1, perPage: 100, sortOrder: "asc" },
      });
      setCategories(response.data.categories || []);
    } catch (error) {
      console.log("Failed to load categories", error);
      toast("Failed to load categories");
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axiosPrivate.get("/brands", {
        params: { page: 1, perPage: 100, sortOrder: "asc" },
      });
      setBrands(response.data.brands || response.data || []);
    } catch (error) {
      console.log("Failed to load brands", error);
      toast("Failed to load brands");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, sortOrder]);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages && page * perPage < total) {
      setPage(page + 1);
    }
  };

  const handleAddProduct = async (data: FormData) => {
    setFormLoading(true);
    try {
      await axiosPrivate.post("/products", {
        ...data,
        price: Number(data.price),
        discountPercentage: Number(data.discountPercentage),
        stock: Number(data.stock),
      });
      toast("Product created successfully");
      formAdd.reset();
      setIsAddModalOpen(false);
      fetchProducts(true); // Reset to page 1 and refetch
    } catch (error: unknown) {
      console.log("Failed to create product", error);
      let errorMessage = "Failed to create product";
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

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    formEdit.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPercentage: product.discountPercentage,
      stock: product.stock,
      category: product.category._id,
      brand: product.brand._id,
      image: product.image,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateProduct = async (data: FormData) => {
    if (!selectedProduct) return;

    setFormLoading(true);
    try {
      await axiosPrivate.put(`/products/${selectedProduct._id}`, {
        ...data,
        price: Number(data.price),
        discountPercentage: Number(data.discountPercentage),
        stock: Number(data.stock),
      });
      toast("Product updated successfully");
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (error: unknown) {
      console.log("Failed to update product", error);
      let errorMessage = "Failed to update product";
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
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      await axiosPrivate.delete(`/products/${selectedProduct._id}`);
      toast("Product deleted successfully");
      setIsDeleteModalOpen(false);
      fetchProducts(true); // Reset to page 1 and refetch
    } catch (error) {
      console.log("Failed to delete product", error);
      toast("Failed to delete product");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await axiosPrivate.get("/products", {
        params: { page, perPage, sortOrder },
      });
      setProducts(response?.data?.products || []);
      setTotal(response?.data?.total || 0);
      setTotalPages(response?.data?.totalPages || 1);
      toast("Products refreshed successfully");
    } catch (error) {
      console.log("Failed to refresh products", error);
      toast("Failed to refresh products");
    } finally {
      setRefreshing(false);
    }
  };

  const handleSortChange = (value: "asc" | "desc") => {
    setSortOrder(value);
    setPage(1); // Reset to page 1 when sort order changes
  };

  return (
    <div className="p-5 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-end gap-3">
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-sm font-medium">
            Total <span className="font-bold">{total}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-2 shadow-sm">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-background text-sm shadow-sm hover:bg-muted/10 focus:ring-2 focus:ring-ring"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Select value={sortOrder} onValueChange={handleSortChange}>
            <SelectTrigger
              className="w-40 bg-background text-sm shadow-sm hover:bg-muted/10 focus:ring-2 focus:ring-ring"
              aria-label="Sort order"
            >
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>
            <SelectContent>
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
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          )}
        </div>
      </div>
      {loading ? (
        <ProductSkeleton isAdmin={isAdmin} />
      ) : (
        <>
          <div className="rounded-lg border border-border/50 shadow-sm bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 bg-muted/30">
                    <TableHead className="w-[80px] font-semibold">
                      Image
                    </TableHead>
                    <TableHead className="font-semibold min-w-[200px]">
                      Name
                    </TableHead>
                    <TableHead className="font-semibold">Price</TableHead>
                    <TableHead className="font-semibold">Discount</TableHead>
                    <TableHead className="font-semibold">Stock</TableHead>
                    <TableHead className="font-semibold">Rating</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Brand</TableHead>
                    {isAdmin && (
                      <TableHead className="text-right font-semibold min-w-[100px]">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product, index) => (
                    <TableRow
                      key={product._id}
                      className={`border-b border-border/30 transition-colors hover:bg-muted/50 ${
                        index % 2 === 0 ? "bg-background" : "bg-muted/20"
                      }`}
                    >
                      <TableCell className="py-3">
                        <div className="h-12 w-12 rounded-md overflow-hidden bg-muted shadow-sm border flex-shrink-0">
                          <img
                            src={product?.image}
                            alt={product?.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-image.jpg";
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        <div
                          className="max-w-[200px] truncate"
                          title={product?.name}
                        >
                          {product?.name}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600 whitespace-nowrap">
                        ${product.price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800 whitespace-nowrap">
                          {product.discountPercentage}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap ${
                            product.stock > 10
                              ? "bg-green-100 text-green-800"
                              : product.stock > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 whitespace-nowrap">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium">
                            {product.averageRating.toFixed(1)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 whitespace-nowrap max-w-[100px] truncate">
                          {product?.category?.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 whitespace-nowrap max-w-[100px] truncate">
                          {product?.brand?.name}
                        </span>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(product)}
                              className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 flex-shrink-0"
                              title="Edit product"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(product)}
                              className="h-8 w-8 hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                              title="Delete product"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={isAdmin ? 9 : 8}
                        className="text-center py-12 text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                            <Plus className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">No products found</p>
                            <p className="text-sm">
                              Start by adding your first product
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          {/* Pagination Controls */}
          {total > perPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card rounded-lg border border-border/50 px-4 py-3 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium">
                    {(page - 1) * perPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(page * perPage, total)}
                  </span>{" "}
                  of <span className="font-medium">{total}</span> products
                </div>
                <div className="text-sm text-muted-foreground">
                  Page <span className="font-medium">{page}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                  className="disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={page >= totalPages || page * perPage >= total}
                  className="disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Simple pagination for single page */}
          {total > 0 && total <= perPage && (
            <div className="text-center text-sm text-muted-foreground bg-card rounded-lg border border-border/50 px-4 py-3">
              Showing all <span className="font-medium">{total}</span> products
            </div>
          )}
        </>
      )}
      {/* Add Product Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>Create a new product</DialogDescription>
          </DialogHeader>
          <Form {...formAdd}>
            <form
              onSubmit={formAdd.handleSubmit(handleAddProduct)}
              className="space-y-2"
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={formLoading}
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={formAdd.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={formLoading}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formAdd.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount (%)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          max="100"
                          disabled={formLoading}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={formAdd.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={formLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={formAdd.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={formLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand._id} value={brand._id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Image</FormLabel>
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
                    "Create Product"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>
          <Form {...formEdit}>
            <form
              onSubmit={formEdit.handleSubmit(handleUpdateProduct)}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={formLoading}
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={formEdit.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={formLoading}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formEdit.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount (%)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          max="100"
                          disabled={formLoading}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={formEdit.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={formLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={formEdit.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={formLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand._id} value={brand._id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Image</FormLabel>
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
                    "Update Product"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product{" "}
              <span className="font-semibold">{selectedProduct?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Products;
