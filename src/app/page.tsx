export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Tạo Series Kiến Thức với AI
          </h1>
          <p className="text-xl text-muted-foreground">
            Tạo ra các chuỗi bài học toàn diện về bất kỳ chủ đề nào với sự hỗ
            trợ của AI. Chỉ cần nhập chủ đề, chúng tôi sẽ tạo ra một series bài
            học có cấu trúc cho bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Tạo Series Nhanh Chóng</h3>
            <p className="text-muted-foreground">
              Tạo series học tập hoàn chỉnh với các tập có cấu trúc trong vài
              giây
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Nội Dung từ AI</h3>
            <p className="text-muted-foreground">
              Mỗi tập được tạo với nội dung chi tiết và phù hợp
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Tùy Chỉnh Linh Hoạt</h3>
            <p className="text-muted-foreground">
              Chỉnh sửa và tinh chỉnh nội dung theo nhu cầu của bạn
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
