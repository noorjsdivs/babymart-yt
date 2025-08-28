import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const ProductSkeleton = ({ isAdmin }: { isAdmin?: boolean }) => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Image</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Brand</TableHead>
          {isAdmin && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(10)].map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="h-12 w-12 rounded overflow-hidden bg-gray-200 animate-pulse"></div>
            </TableCell>
            <TableCell>
              <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div>
            </TableCell>
            <TableCell>
              <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded"></div>
            </TableCell>
            <TableCell>
              <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded"></div>
            </TableCell>
            <TableCell>
              <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded"></div>
            </TableCell>
            <TableCell>
              <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded"></div>
            </TableCell>
            <TableCell>
              <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded"></div>
            </TableCell>
            <TableCell>
              <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded"></div>
            </TableCell>
            {isAdmin && (
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <div className="h-8 w-8 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-8 w-8 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default ProductSkeleton;
