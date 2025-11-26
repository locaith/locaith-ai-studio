import JSZip from 'jszip'

/**
 * Download website code as a ZIP file
 * @param htmlContent - The HTML content to include
 * @param projectName - Name for the ZIP file
 */
export async function downloadWebsiteZip(
    htmlContent: string,
    projectName: string
): Promise<void> {
    try {
        // Create a new ZIP instance
        const zip = new JSZip()

        // Add the HTML file
        zip.file('index.html', htmlContent)

        // Add a README
        const readme = `# ${projectName}

## Website được tạo bởi Locaith AI Studio

### Cách sử dụng:
1. Mở file index.html bằng trình duyệt web
2. Hoặc upload toàn bộ thư mục lên hosting của bạn

### Hỗ trợ:
- Website: https://locaith.ai
- Email: support@locaith.ai

---
Tạo ngày: ${new Date().toLocaleDateString('vi-VN')}
`
        zip.file('README.md', readme)

        // Generate the ZIP file
        const blob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 9 }
        })

        // Create download link
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${projectName.replace(/[^a-z0-9-]/gi, '-')}.zip`

        // Trigger download
        document.body.appendChild(link)
        link.click()

        // Cleanup
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    } catch (error) {
        console.error('Error creating ZIP file:', error)
        throw new Error('Không thể tạo file ZIP. Vui lòng thử lại.')
    }
}
