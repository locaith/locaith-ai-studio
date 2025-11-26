// Vietnamese localization for Web Builder
export const vi = {
    generation: {
        analyzing: '🔍 Đang phân tích yêu cầu của bạn...',
        planning: '📋 Đang lên kế hoạch thiết kế...',
        building: '🔨 Đang xây dựng cấu trúc website...',
        styling: '🎨 Đang tạo giao diện đẹp mắt...',
        optimizing: '⚡ Đang tối ưu hóa hiệu suất...',
        finalizing: '✨ Đang hoàn thiện chi tiết...',
        complete: '🎉 Tuyệt vời! Website của bạn đã hoàn tất. Bạn có thể xem bản xem trước ngay bây giờ.',
    },

    deployment: {
        starting: '🚀 Đang khởi động quá trình deploy...',
        uploading: '📤 Đang tải website lên server...',
        processing: '⚙️ Đang xử lý và tối ưu...',
        success: '✅ Deploy thành công!',
        failed: '❌ Deploy thất bại',
        urlLabel: 'Link website của bạn:',
        copyButton: 'Sao chép link',
        copied: '✓ Đã sao chép!',
        openButton: 'Mở website',
        redeploying: '🔄 Đang cập nhật website...',
    },

    errors: {
        generic: '❌ Đã xảy ra lỗi: {error}',
        network: '❌ Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.',
        auth: '❌ Vui lòng đăng nhập để tiếp tục.',
        suggestion: '💡 Gợi ý: {suggestion}',
        fixButton: '🔧 Tự động sửa lỗi',
        retryButton: '🔄 Thử lại',
        fixing: '🔧 Đang tự động sửa lỗi...',
    },

    actions: {
        save: 'Lưu',
        publish: 'Xuất bản',
        download: 'Tải về',
        edit: 'Chỉnh sửa',
        preview: 'Xem trước',
        downloadZip: '📦 Tải mã nguồn (ZIP)',
    },

    messages: {
        welcome: '👋 Xin chào! Hãy mô tả website bạn muốn tạo.',
        saving: '💾 Đang lưu dự án...',
        saved: '✓ Đã lưu',
        sessionExpired: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.',
    }
}

export type LocaleStrings = typeof vi
