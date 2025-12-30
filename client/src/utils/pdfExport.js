import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import { translateRoomType } from './translations';

/**
 * Export admin dashboard statistics to PDF
 */
export const exportAdminDashboardPDF = async (stats, currency, setExporting) => {
    try {
        setExporting(true);
        toast.loading('Dang tao bao cao PDF...', { id: 'export-pdf' });

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        let yPosition = 20;

        // Header
        pdf.setFillColor(59, 130, 246);
        pdf.rect(0, 0, pageWidth, 40, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(22);
        pdf.setFont('helvetica', 'bold');
        pdf.text('BAO CAO THONG KE HE THONG', pageWidth / 2, 20, { align: 'center' });
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Ngay xuat: ${new Date().toLocaleDateString('vi-VN')}`, pageWidth / 2, 30, { align: 'center' });

        yPosition = 50;

        // Overview section
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TONG QUAN THONG KE', 14, yPosition);
        yPosition += 10;

        const overviewData = [
            ['Tong so nguoi dung', stats.totalUsers.toLocaleString()],
            ['Tong so khach san', stats.totalHotels.toLocaleString()],
            ['Tong so phong', stats.totalRooms.toLocaleString()],
            ['Tong so dat phong', stats.totalBookings.toLocaleString()],
            ['Tong doanh thu', `${currency}${stats.totalRevenue.toLocaleString()}`],
            ['Tang truong doanh thu', `${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth}%`],
        ];

        autoTable(pdf, {
            startY: yPosition,
            head: [['Chi so', 'Gia tri']],
            body: overviewData,
            theme: 'grid',
            styles: { font: 'helvetica', fontSize: 10, cellPadding: 4 },
            headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [249, 250, 251] },
        });

        yPosition = pdf.lastAutoTable.finalY + 15;

        // Booking status section
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PHAN BO TRANG THAI DAT PHONG', 14, yPosition);
        yPosition += 10;

        const bookingStatusData = [
            ['Da xac nhan', stats.bookingStatusData.confirmed.toLocaleString()],
            ['Cho xu ly', stats.bookingStatusData.pending.toLocaleString()],
            ['Da huy', stats.bookingStatusData.cancelled.toLocaleString()],
        ];

        autoTable(pdf, {
            startY: yPosition,
            head: [['Trang thai', 'So luong']],
            body: bookingStatusData,
            theme: 'grid',
            styles: { font: 'helvetica', fontSize: 10, cellPadding: 4 },
            headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [249, 250, 251] },
        });

        yPosition = pdf.lastAutoTable.finalY + 15;

        // User role section
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PHAN BO VAI TRO NGUOI DUNG', 14, yPosition);
        yPosition += 10;

        const userRoleData = [
            ['Nguoi dung', stats.userRoleData.user.toLocaleString()],
            ['Chu khach san', stats.userRoleData.hotelOwner.toLocaleString()],
            ['Quan tri vien', stats.userRoleData.admin.toLocaleString()],
        ];

        autoTable(pdf, {
            startY: yPosition,
            head: [['Vai tro', 'So luong']],
            body: userRoleData,
            theme: 'grid',
            styles: { font: 'helvetica', fontSize: 10, cellPadding: 4 },
            headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [249, 250, 251] },
        });

        yPosition = pdf.lastAutoTable.finalY + 15;

        // Revenue by month
        if (stats.revenueByMonth && stats.revenueByMonth.length > 0) {
            if (yPosition > 250) {
                pdf.addPage();
                yPosition = 20;
            }

            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('DOANH THU THEO THANG', 14, yPosition);
            yPosition += 10;

            const revenueData = stats.revenueByMonth.map(item => [
                item.month || 'N/A',
                `${currency}${item.revenue.toLocaleString()}`
            ]);

            autoTable(pdf, {
                startY: yPosition,
                head: [['Thang', 'Doanh thu']],
                body: revenueData,
                theme: 'grid',
                styles: { font: 'helvetica', fontSize: 10, cellPadding: 4 },
                headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255], fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [249, 250, 251] },
            });

            yPosition = pdf.lastAutoTable.finalY + 15;
        }

        // Pending hotels
        if (stats.pendingHotels && stats.pendingHotels.length > 0) {
            if (yPosition > 250) {
                pdf.addPage();
                yPosition = 20;
            }

            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('KHACH SAN CHO DUYET', 14, yPosition);
            yPosition += 10;

            const pendingHotelsData = stats.pendingHotels.slice(0, 10).map(hotel => [
                hotel.name,
                hotel.owner?.name || 'N/A',
                new Date(hotel.createdAt).toLocaleDateString('vi-VN')
            ]);

            autoTable(pdf, {
                startY: yPosition,
                head: [['Ten khach san', 'Chu so huu', 'Ngay dang ky']],
                body: pendingHotelsData,
                theme: 'grid',
                styles: { font: 'helvetica', fontSize: 9, cellPadding: 3 },
                headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [249, 250, 251] },
                columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 60 }, 2: { cellWidth: 40 } },
            });
        }

        // Footer
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(128, 128, 128);
            pdf.text(`Trang ${i} / ${totalPages}`, pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
        }

        // Save
        const fileName = `BaoCaoThongKe_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);

        toast.success('Da xuat bao cao PDF thanh cong!', { id: 'export-pdf' });
    } catch (error) {
        console.error('Error exporting PDF:', error);
        toast.error('Co loi xay ra khi xuat PDF', { id: 'export-pdf' });
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
        toast.loading('Dang tao bao cao PDF...', { id: 'export-pdf' });

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        let yPosition = 20;

        // Header
        pdf.setFillColor(16, 185, 129);
        pdf.rect(0, 0, pageWidth, 40, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(22);
        pdf.setFont('helvetica', 'bold');
        pdf.text('BAO CAO THONG KE KHACH SAN', pageWidth / 2, 20, { align: 'center' });
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Ngay xuat: ${new Date().toLocaleDateString('vi-VN')}`, pageWidth / 2, 30, { align: 'center' });

        yPosition = 50;

        // Overview section
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TONG QUAN THONG KE', 14, yPosition);
        yPosition += 10;

        const overviewData = [
            ['Tong dat phong', stats.totalBookings.toLocaleString()],
            ['Tong phong', stats.totalRooms.toLocaleString()],
            ['Tong doanh thu', `${currency}${stats.totalRevenue.toLocaleString()}`],
            ['Tang truong doanh thu', `${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth}%`],
            ['Danh gia trung binh', `${stats.averageRating || 0} *`],
            ['Tong so danh gia', stats.totalReviews.toLocaleString()],
        ];

        autoTable(pdf, {
            startY: yPosition,
            head: [['Chi so', 'Gia tri']],
            body: overviewData,
            theme: 'grid',
            styles: { font: 'helvetica', fontSize: 10, cellPadding: 4 },
            headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [249, 250, 251] },
        });

        yPosition = pdf.lastAutoTable.finalY + 15;

        // Booking status section
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PHAN BO TRANG THAI DAT PHONG', 14, yPosition);
        yPosition += 10;

        const bookingStatusData = [
            ['Cho xu ly', stats.bookingStatusData.pending.toLocaleString()],
            ['Da xac nhan', stats.bookingStatusData.confirmed.toLocaleString()],
            ['Da huy', stats.bookingStatusData.cancelled.toLocaleString()],
            ['Hoan thanh', stats.bookingStatusData.completed.toLocaleString()],
        ].filter(([_, value]) => parseInt(value.replace(/,/g, '')) > 0);

        autoTable(pdf, {
            startY: yPosition,
            head: [['Trang thai', 'So luong']],
            body: bookingStatusData,
            theme: 'grid',
            styles: { font: 'helvetica', fontSize: 10, cellPadding: 4 },
            headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [249, 250, 251] },
        });

        yPosition = pdf.lastAutoTable.finalY + 15;

        // Revenue by month
        if (stats.revenueByMonth && stats.revenueByMonth.length > 0) {
            if (yPosition > 250) {
                pdf.addPage();
                yPosition = 20;
            }

            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('DOANH THU THEO THANG', 14, yPosition);
            yPosition += 10;

            const revenueData = stats.revenueByMonth.map(item => [
                item.month || 'N/A',
                `${currency}${item.revenue.toLocaleString()}`,
                (item.bookings || 0).toString()
            ]);

            autoTable(pdf, {
                startY: yPosition,
                head: [['Thang', 'Doanh thu', 'Dat phong']],
                body: revenueData,
                theme: 'grid',
                styles: { font: 'helvetica', fontSize: 10, cellPadding: 4 },
                headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [249, 250, 251] },
            });

            yPosition = pdf.lastAutoTable.finalY + 15;
        }

        // Recent bookings
        if (stats.recentBookings && stats.recentBookings.length > 0) {
            if (yPosition > 250) {
                pdf.addPage();
                yPosition = 20;
            }

            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('DAT PHONG GAN DAY', 14, yPosition);
            yPosition += 10;

            const recentBookingsData = stats.recentBookings.slice(0, 15).map(booking => [
                booking.user?.name || 'N/A',
                translateRoomType(booking.room?.roomType) || 'N/A',
                new Date(booking.checkInDate).toLocaleDateString('vi-VN'),
                `${currency}${(booking.totalPrice || 0).toLocaleString()}`
            ]);

            autoTable(pdf, {
                startY: yPosition,
                head: [['Khach hang', 'Loai phong', 'Ngay nhan', 'Tong tien']],
                body: recentBookingsData,
                theme: 'grid',
                styles: { font: 'helvetica', fontSize: 9, cellPadding: 3 },
                headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [249, 250, 251] },
                columnStyles: { 0: { cellWidth: 45 }, 1: { cellWidth: 45 }, 2: { cellWidth: 35 }, 3: { cellWidth: 45 } },
            });
        }

        // Footer
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(128, 128, 128);
            pdf.text(`Trang ${i} / ${totalPages}`, pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
        }

        // Save
        const fileName = `BaoCaoKhachSan_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);

        toast.success('Da xuat bao cao PDF thanh cong!', { id: 'export-pdf' });
    } catch (error) {
        console.error('Error exporting PDF:', error);
        toast.error('Co loi xay ra khi xuat PDF', { id: 'export-pdf' });
    } finally {
        setExporting(false);
    }
};
