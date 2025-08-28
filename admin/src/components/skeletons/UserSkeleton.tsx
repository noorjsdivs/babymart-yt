import React from "react";
import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const UserSkeleton = ({ isAdmin }: { isAdmin?: boolean }) => {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-6 w-12" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-48" />
          {isAdmin && <Skeleton className="h-9 w-32" />}
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead className="font-semibold">
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead className="font-semibold">
                <Skeleton className="h-4 w-20" />
              </TableHead>
              <TableHead className="font-semibold">
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead className="font-semibold">
                <Skeleton className="h-4 w-20" />
              </TableHead>
              <TableHead className="font-semibold">
                <Skeleton className="h-4 w-16" />
              </TableHead>
              {isAdmin && (
                <TableHead className="font-semibold">
                  <Skeleton className="h-4 w-16" />
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index} className="hover:bg-gray-50">
                <TableCell>
                  <Skeleton className="h-12 w-12 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
};

export default UserSkeleton;
