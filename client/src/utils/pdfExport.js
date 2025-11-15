import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { translateRoomType, translateBookingStatus } from './translations';

/**
 * Export admin dashboard statistics to PDF
 */
export const exportAdminDashboardPDF = async (stats, currency, setExporting) => {
    try {
        setExporting(true);
        toast.loading('Đang tạo báo cáo PDF...', { id: 'export-pdf' });

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let yPosition = 25;
        const margin = 20;
        const lineHeight = 8;
        const sectionSpacing = 12;

        // Helper function to add new page if needed
        const checkPageBreak = (requiredSpace = 20) => {
            if (yPosition > pageHeight - requiredSpace) {
                pdf.addPage();
                yPosition = 25;
                return true;
            }
            return false;
        };

        // Header với background
        pdf.setFillColor(59, 130, 246); // Blue color
        pdf.rect(0, 0, pageWidth, 35, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('BÁO CÁO THỐNG KÊ HỆ THỐNG', pageWidth / 2, 18, { align: 'center' });
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}`, pageWidth / 2, 28, { align: 'center' });
        
        pdf.setTextColor(0, 0, 0);
        yPosition = 45;

        // Tổng quan thống kê
        pdf.setFillColor(249, 250, 251); // Light gray background
        pdf.rect(margin - 5, yPosition - 7, pageWidth - 2 * margin + 10, 8, 'F');
        
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 41, 59);
        pdf.text('1. TỔNG QUAN THỐNG KÊ', margin, yPosition);
        yPosition += sectionSpacing;

        pdf.setFontSize(13);
        pdf.setTextColor(0, 0, 0);
        const overviewData = [
            [`Tổng số người dùng:`, `${stats.totalUsers.toLocaleString()}`],
            [`Tổng số khách sạn:`, `${stats.totalHotels.toLocaleString()}`],
            [`Tổng số phòng:`, `${stats.totalRooms.toLocaleString()}`],
            [`Tổng số đặt phòng:`, `${stats.totalBookings.toLocaleString()}`],
            [`Tổng doanh thu:`, `${currency}${stats.totalRevenue.toLocaleString()}`],
            [`Tăng trưởng doanh thu:`, `${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth}%`],
        ];

        overviewData.forEach(([label, value], index) => {
            checkPageBreak(25);
            
            // Alternating row background
            if (index % 2 === 0) {
                pdf.setFillColor(249, 250, 251);
                pdf.rect(margin - 2, yPosition - 6, pageWidth - 2 * margin + 4, lineHeight + 2, 'F');
            }
            
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.setTextColor(51, 51, 51);
            pdf.text(label, margin + 5, yPosition);
            
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(13);
            pdf.setTextColor(30, 41, 59);
            pdf.text(value, pageWidth - margin - 30, yPosition, { align: 'right' });
            yPosition += lineHeight + 2;
        });

        yPosition += 8;

        // Trạng thái đặt phòng
        checkPageBreak(35);
        pdf.setFillColor(249, 250, 251);
        pdf.rect(margin - 5, yPosition - 7, pageWidth - 2 * margin + 10, 8, 'F');
        
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 41, 59);
        pdf.text('2. PHÂN BỐ TRẠNG THÁI ĐẶT PHÒNG', margin, yPosition);
        yPosition += sectionSpacing;

        pdf.setFontSize(13);
        pdf.setTextColor(0, 0, 0);
        const bookingStatusData = [
            [`Đã xác nhận:`, `${stats.bookingStatusData.confirmed.toLocaleString()}`, [16, 185, 129]], // Green
            [`Chờ xử lý:`, `${stats.bookingStatusData.pending.toLocaleString()}`, [59, 130, 246]], // Blue
            [`Đã hủy:`, `${stats.bookingStatusData.cancelled.toLocaleString()}`, [239, 68, 68]], // Red
        ];

        bookingStatusData.forEach(([label, value, color]) => {
            checkPageBreak(25);
            pdf.setFillColor(249, 250, 251);
            pdf.rect(margin - 2, yPosition - 6, pageWidth - 2 * margin + 4, lineHeight + 2, 'F');
            
            // Color dot
            pdf.setFillColor(...color);
            pdf.circle(margin + 8, yPosition, 2, 'F');
            
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.setTextColor(51, 51, 51);
            pdf.text(label, margin + 15, yPosition);
            
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(13);
            pdf.setTextColor(30, 41, 59);
            pdf.text(value, pageWidth - margin - 30, yPosition, { align: 'right' });
            yPosition += lineHeight + 2;
        });

        yPosition += 8;

        // Phân bố vai trò người dùng
        checkPageBreak(35);
        pdf.setFillColor(249, 250, 251);
        pdf.rect(margin - 5, yPosition - 7, pageWidth - 2 * margin + 10, 8, 'F');
        
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 41, 59);
        pdf.text('3. PHÂN BỐ VAI TRÒ NGƯỜI DÙNG', margin, yPosition);
        yPosition += sectionSpacing;

        pdf.setFontSize(13);
        pdf.setTextColor(0, 0, 0);
        const userRoleData = [
            [`Người dùng:`, `${stats.userRoleData.user.toLocaleString()}`, [59, 130, 246]],
            [`Chủ khách sạn:`, `${stats.userRoleData.hotelOwner.toLocaleString()}`, [16, 185, 129]],
            [`Quản trị viên:`, `${stats.userRoleData.admin.toLocaleString()}`, [139, 92, 246]],
        ];

        userRoleData.forEach(([label, value, color]) => {
            checkPageBreak(25);
            pdf.setFillColor(249, 250, 251);
            pdf.rect(margin - 2, yPosition - 6, pageWidth - 2 * margin + 4, lineHeight + 2, 'F');
            
            pdf.setFillColor(...color);
            pdf.circle(margin + 8, yPosition, 2, 'F');
            
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.setTextColor(51, 51, 51);
            pdf.text(label, margin + 15, yPosition);
            
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(13);
            pdf.setTextColor(30, 41, 59);
            pdf.text(value, pageWidth - margin - 30, yPosition, { align: 'right' });
            yPosition += lineHeight + 2;
        });

        yPosition += 8;

        // Doanh thu theo tháng
        if (stats.revenueByMonth && stats.revenueByMonth.length > 0) {
            checkPageBreak(45);
            pdf.setFillColor(249, 250, 251);
            pdf.rect(margin - 5, yPosition - 7, pageWidth - 2 * margin + 10, 8, 'F');
            
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(30, 41, 59);
            pdf.text('4. DOANH THU THEO THÁNG', margin, yPosition);
            yPosition += sectionSpacing;

            // Table header
            pdf.setFillColor(59, 130, 246);
            pdf.rect(margin - 2, yPosition - 6, pageWidth - 2 * margin + 4, lineHeight + 4, 'F');
            
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            pdf.text('Tháng', margin + 5, yPosition + 2);
            pdf.text('Doanh thu', pageWidth - margin - 30, yPosition + 2, { align: 'right' });
            yPosition += lineHeight + 6;

            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            stats.revenueByMonth.forEach((item, index) => {
                checkPageBreak(25);
                
                if (index % 2 === 0) {
                    pdf.setFillColor(249, 250, 251);
                    pdf.rect(margin - 2, yPosition - 6, pageWidth - 2 * margin + 4, lineHeight + 2, 'F');
                }
                
                pdf.text(item.month || 'N/A', margin + 5, yPosition);
                pdf.setFont('helvetica', 'bold');
                pdf.text(`${currency}${item.revenue.toLocaleString()}`, pageWidth - margin - 30, yPosition, { align: 'right' });
                pdf.setFont('helvetica', 'normal');
                yPosition += lineHeight + 2;
            });
            yPosition += 6;
        }

        // Khách sạn chờ duyệt
        if (stats.pendingHotels && stats.pendingHotels.length > 0) {
            checkPageBreak(45);
            pdf.setFillColor(249, 250, 251);
            pdf.rect(margin - 5, yPosition - 7, pageWidth - 2 * margin + 10, 8, 'F');
            
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(30, 41, 59);
            pdf.text('5. KHÁCH SẠN CHỜ DUYỆT', margin, yPosition);
            yPosition += sectionSpacing;

            // Table header
            pdf.setFillColor(59, 130, 246);
            pdf.rect(margin - 2, yPosition - 6, pageWidth - 2 * margin + 4, lineHeight + 4, 'F');
            
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            pdf.text('Tên khách sạn', margin + 5, yPosition + 2);
            pdf.text('Chủ sở hữu', pageWidth - margin - 40, yPosition + 2, { align: 'right' });
            yPosition += lineHeight + 6;

            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            stats.pendingHotels.slice(0, 10).forEach((hotel, index) => {
                checkPageBreak(25);
                
                if (index % 2 === 0) {
                    pdf.setFillColor(249, 250, 251);
                    pdf.rect(margin - 2, yPosition - 6, pageWidth - 2 * margin + 4, lineHeight + 2, 'F');
                }
                
                const hotelName = hotel.name.length > 40 ? hotel.name.substring(0, 37) + '...' : hotel.name;
                pdf.text(hotelName, margin + 5, yPosition);
                pdf.text(hotel.owner?.username || 'N/A', pageWidth - margin - 40, yPosition, { align: 'right' });
                yPosition += lineHeight + 2;
            });
            yPosition += 6;
        }

        // Người dùng bị báo cáo
        if (stats.reportedUsers && stats.reportedUsers.length > 0) {
            checkPageBreak(45);
            pdf.setFillColor(249, 250, 251);
            pdf.rect(margin - 5, yPosition - 7, pageWidth - 2 * margin + 10, 8, 'F');
            
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(30, 41, 59);
            pdf.text('6. NGƯỜI DÙNG BỊ BÁO CÁO', margin, yPosition);
            yPosition += sectionSpacing;

            // Table header
            pdf.setFillColor(239, 68, 68);
            pdf.rect(margin - 2, yPosition - 6, pageWidth - 2 * margin + 4, lineHeight + 4, 'F');
            
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            pdf.text('Tên người dùng', margin + 5, yPosition + 2);
            pdf.text('Email', pageWidth - margin - 60, yPosition + 2);
            pdf.text('Số lần BC', pageWidth - margin - 10, yPosition + 2, { align: 'right' });
            yPosition += lineHeight + 6;

            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            stats.reportedUsers.slice(0, 10).forEach((user, index) => {
                checkPageBreak(25);
                
                if (index % 2 === 0) {
                    pdf.setFillColor(249, 250, 251);
                    pdf.rect(margin - 2, yPosition - 6, pageWidth - 2 * margin + 4, lineHeight + 2, 'F');
                }
                
                pdf.text(user.username, margin + 5, yPosition);
                const email = user.email.length > 30 ? user.email.substring(0, 27) + '...' : user.email;
                pdf.text(email, pageWidth - margin - 60, yPosition);
                pdf.setFont('helvetica', 'bold');
                pdf.text(`${user.reportCount || 0}`, pageWidth - margin - 10, yPosition, { align: 'right' });
                pdf.setFont('helvetica', 'normal');
                yPosition += lineHeight + 2;
            });
        }

        // Footer
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(128, 128, 128);
            pdf.setDrawColor(200, 200, 200);
            pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
            pdf.text(
                `Trang ${i} / ${totalPages}`,
                pageWidth / 2,
                pageHeight - 8,
                { align: 'center' }
            );
        }

        // Save PDF
        const fileName = `BaoCaoThongKe_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);

        toast.success('Đã xuất báo cáo PDF thành công!', { id: 'export-pdf' });
    } catch (error) {
        console.error('Error exporting PDF:', error);
        toast.error('Có lỗi xảy ra khi xuất PDF', { id: 'export-pdf' });
    } finally {
        setExporting(false);
    }
};

/**
 * Export owner dashboard statistics to PDF
 */
export const exportOwnerDashboardPDF = async (stats, currency, setExporting) => {
    try {
        setExporting(true);
        toast.loading('Đang tạo báo cáo PDF...', { id: 'export-pdf' });

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let yPosition = 25;
        const margin = 20;
        const lineHeight = 8;
        const sectionSpacing = 12;

        // Helper function to add new page if needed
        const checkPageBreak = (requiredSpace = 20) => {
            if (yPosition > pageHeight - requiredSpace) {
                pdf.addPage();
                yPosition = 25;
                return true;
            }
            return false;
        };

        // Header với background
        pdf.setFillColor(16, 185, 129); // Green color
        pdf.rect(0, 0, pageWidth, 35, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('BÁO CÁO THỐNG KÊ KHÁCH SẠN', pageWidth / 2, 18, { align: 'center' });
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}`, pageWidth / 2, 28, { align: 'center' });
        
        pdf.setTextColor(0, 0, 0);
        yPosition = 45;

        // Tổng quan thống kê
        pdf.setFillColor(249, 250, 251);
        pdf.rect(margin - 5, yPosition - 7, pageWidth - 2 * margin + 10, 8, 'F');
        
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 41, 59);
        pdf.text('1. TỔNG QUAN THỐNG KÊ', margin, yPosition);
        yPosition += sectionSpacing;

        pdf.setFontSize(13);
        pdf.setTextColor(0, 0, 0);
        const overviewData = [
            [`Tổng đặt phòng:`, `${stats.totalBookings.toLocaleString()}`],
            [`Tổng phòng:`, `${stats.totalRooms.toLocaleString()}`],
            [`Tổng doanh thu:`, `${currency}${stats.totalRevenue.toLocaleString()}`],
            [`Tăng trưởng doanh thu:`, `${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth}%`],
            [`Đánh giá trung bình:`, `${stats.averageRating || 0} ⭐`],
            [`Tổng số đánh giá:`, `${stats.totalReviews.toLocaleString()}`],
        ];

        overviewData.forEach(([label, value], index) => {
            checkPageBreak(25);
            
            if (index % 2 === 0) {
                pdf.setFillColor(249, 250, 251);
                pdf.rect(margin - 2, yPosition - 6, pageWidth - 2 * margin + 4, lineHeight + 2, 'F');
            }
            
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.setTextColor(51, 51, 51);
            pdf.text(label, margin + 5, yPosition);
            
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(13);
            pdf.setTextColor(30, 41, 59);
            pdf.text(value, pageWidth - margin - 30, yPosition, { align: 'right' });
            yPosition += lineHeight + 2;
        });

        yPosition += 8;

        // Trạng thái đặt phòng
        checkPageBreak(35);
        pdf.setFillColor(249, 250, 251);
        pdf.rect(margin - 5, yPosition - 7, pageWidth - 2 * margin + 10, 8, 'F');
        
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 41, 59);
        pdf.text('2. PHÂN BỐ TRẠNG THÁI ĐẶT PHÒNG', margin, yPosition);
        yPosition += sectionSpacing;

        pdf.setFontSize(13);
        pdf.setTextColor(0, 0, 0);
        const bookingStatusData = [
            [`Chờ xử lý:`, `${stats.bookingStatusData.pending.toLocaleString()}`, [245, 158, 11]], // Yellow
            [`Đã xác nhận:`, `${stats.bookingStatusData.confirmed.toLocaleString()}`, [16, 185, 129]], // Green
            [`Đã hủy:`, `${stats.bookingStatusData.cancelled.toLocaleString()}`, [239, 68, 68]], // Red
            [`Hoàn thành:`, `${stats.bookingStatusData.completed.toLocaleString()}`, [59, 130, 246]], // Blue
        ].filter(([_, value]) => parseInt(value.replace(/,/g, '')) > 0);

        bookingStatusData.forEach(([label, value, color]) => {
            checkPageBreak(25);
            pdf.setFillColor(249, 250, 251);
            pdf.rect(margin - 2, yPosition - 6, pageWidth - 2 * margin + 4, lineHeight + 2, 'F');
            
            pdf.setFillColor(...color);
            pdf.circle(margin + 8, yPosition, 2, 'F');
            
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.setTextColor(51, 51, 51);
            pdf.text(label, margin + 15, yPosition);
            
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(13);
            pdf.setTextColor(30, 41, 59);
            pdf.text(value, pageWidth - margin - 30, yPosition, { align: 'right' });
            yPosition += lineHeight + 2;
        });

        yPosition += 8;

        // Doanh thu theo tháng
        if (stats.revenueByMonth && stats.revenueByMonth.length > 0) {
            checkPageBreak(45);
            pdf.setFillColor(249, 250, 251);
            pdf.rect(margin - 5, yPosition - 7, pageWidth - 2 * margin + 10, 8, 'F');
            
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(30, 41, 59);
            pdf.text('3. DOANH THU THEO THÁNG', margin, yPosition);
            yPosition += sectionSpacing;

            // Table header
            pdf.setFillColor(16, 185, 129);
            pdf.rect(margin - 2, yPosition - 6, pageWidth - 2 * margin + 4, lineHeight + 4, 'F');
            
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            pdf.text('Tháng', margin + 5, yPosition + 2);
            pdf.text('Doanh thu', pageWidth - margin - 50, yPosition + 2);
            pdf.text('Đặt phòng', pageWidth - margin - 10, yPosition + 2, { align: 'right' });
            yPosition += lineHeight + 6;

            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            stats.revenueByMonth.forEach((item, index) => {
                checkPageBreak(25);
                
                if (index % 2 === 0) {
                    pdf.setFillColor(249, 250, 251);
                    pdf.rect(margin - 2, yPosition - 6, pageWidth - 2 * margin + 4, lineHeight + 2, 'F');
                }
                
                pdf.text(item.month || 'N/A', margin + 5, yPosition);
                pdf.setFont('helvetica', 'bold');
                pdf.text(`${currency}${item.revenue.toLocaleString()}`, pageWidth - margin - 50, yPosition);
                pdf.text(`${item.bookings || 0}`, pageWidth - margin - 10, yPosition, { align: 'right' });
                pdf.setFont('helvetica', 'normal');
                yPosition += lineHeight + 2;
            });
            yPosition += 6;
        }

        // Đặt phòng gần đây
        if (stats.recentBookings && stats.recentBookings.length > 0) {
            checkPageBreak(50);
            pdf.setFillColor(249, 250, 251);
            pdf.rect(margin - 5, yPosition - 7, pageWidth - 2 * margin + 10, 8, 'F');
            
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(30, 41, 59);
            pdf.text('4. ĐẶT PHÒNG GẦN ĐÂY', margin, yPosition);
            yPosition += sectionSpacing;

            // Table header
            pdf.setFillColor(59, 130, 246);
            pdf.rect(margin - 2, yPosition - 6, pageWidth - 2 * margin + 4, lineHeight + 4, 'F');
            
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            pdf.text('Khách hàng', margin + 5, yPosition + 2);
            pdf.text('Phòng', pageWidth - margin - 100, yPosition + 2);
            pdf.text('Ngày nhận', pageWidth - margin - 60, yPosition + 2);
            pdf.text('Tổng tiền', pageWidth - margin - 10, yPosition + 2, { align: 'right' });
            yPosition += lineHeight + 6;

            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            stats.recentBookings.slice(0, 15).forEach((booking, index) => {
                checkPageBreak(25);
                
                if (index % 2 === 0) {
                    pdf.setFillColor(249, 250, 251);
                    pdf.rect(margin - 2, yPosition - 6, pageWidth - 2 * margin + 4, lineHeight + 2, 'F');
                }
                
                const username = (booking.user?.username || 'N/A').length > 15 
                    ? (booking.user?.username || 'N/A').substring(0, 12) + '...' 
                    : (booking.user?.username || 'N/A');
                pdf.text(username, margin + 5, yPosition);
                
                const roomType = translateRoomType(booking.room?.roomType) || 'N/A';
                const roomTypeShort = roomType.length > 12 ? roomType.substring(0, 9) + '...' : roomType;
                pdf.text(roomTypeShort, pageWidth - margin - 100, yPosition);
                
                pdf.text(new Date(booking.checkInDate).toLocaleDateString('vi-VN'), pageWidth - margin - 60, yPosition);
                
                pdf.setFont('helvetica', 'bold');
                pdf.text(`${currency}${(booking.totalPrice || 0).toLocaleString()}`, pageWidth - margin - 10, yPosition, { align: 'right' });
                pdf.setFont('helvetica', 'normal');
                yPosition += lineHeight + 2;
            });
        }

        // Footer
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(128, 128, 128);
            pdf.setDrawColor(200, 200, 200);
            pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
            pdf.text(
                `Trang ${i} / ${totalPages}`,
                pageWidth / 2,
                pageHeight - 8,
                { align: 'center' }
            );
        }

        // Save PDF
        const fileName = `BaoCaoKhachSan_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);

        toast.success('Đã xuất báo cáo PDF thành công!', { id: 'export-pdf' });
    } catch (error) {
        console.error('Error exporting PDF:', error);
        toast.error('Có lỗi xảy ra khi xuất PDF', { id: 'export-pdf' });
    } finally {
        setExporting(false);
    }
};

