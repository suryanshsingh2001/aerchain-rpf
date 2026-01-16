'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteRfpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rfpTitle: string;
  onConfirm: () => void;
}

export function DeleteRfpDialog({
  open,
  onOpenChange,
  rfpTitle,
  onConfirm,
}: DeleteRfpDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete RFP</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{rfpTitle}&quot;? This action cannot be
            undone and will also delete all associated proposals.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
