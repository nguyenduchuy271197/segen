import { Button } from "./button";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message?: string;
  retry?: () => void;
}

export function ErrorMessage({
  message = "Đã xảy ra lỗi",
  retry,
}: ErrorMessageProps) {
  return (
    <div className="rounded-lg border border-destructive p-4 text-center">
      <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
      <p className="text-destructive mb-4">{message}</p>
      {retry && (
        <Button onClick={retry} variant="outline">
          Thử Lại
        </Button>
      )}
    </div>
  );
}
