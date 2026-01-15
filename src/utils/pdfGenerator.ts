
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generateReiPdf = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error(`Element with id ${elementId} not found`);
    }

    try {
        // Force a specific width for the element during capture to ensure layout consistency
        const originalStyle = element.style.width;
        element.style.width = '1200px';

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 1200,
        });

        // Restore original style
        element.style.width = originalStyle;

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm (slightly less to account for small margins)
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 2; // Initial padding at the top

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position + 2, imgWidth, imgHeight, undefined, 'FAST');
            heightLeft -= pageHeight;
        }

        pdf.save(`${filename}.pdf`);
        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};
