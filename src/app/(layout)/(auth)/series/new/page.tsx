import { SeriesForm } from "@/components/series/SeriesForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewSeriesPage() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <Link
          href="/series"
          className="flex items-center text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay Lại Danh Sách
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tạo Series Mới</h1>
          <p className="text-muted-foreground">
            Nhập chủ đề bạn muốn tạo series học tập và AI sẽ tự động tạo nội dung
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6">
          <SeriesForm />
        </div>
      </div>
    </div>
  );
}
