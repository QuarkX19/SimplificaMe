// src/services/business/pdfService.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportResult {
  success: boolean;
  filename?: string;
  error?: string;
}

export const exportDashboardToPDF = async (
  elementId: string,
  title: string,
  onProgress?: (msg: string) => void
): Promise<ExportResult> => {
  const element = document.getElementById(elementId);
  if (!element) {
    return { success: false, error: `Elemento #${elementId} no encontrado.` };
  }

  try {
    onProgress?.('Capturando dashboard...');

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#02040a',
      logging: false,
      useCORS: true,
    });

    onProgress?.('Generando PDF...');

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

    // ✅ Encabezado
    pdf.setFontSize(10);
    pdf.setTextColor(150);
    pdf.text(`SimplificaME - Reporte Estratégico: ${title}`, 10, 10);

    // ✅ Imagen con soporte multipágina
    const startY = 15;
    let remainingHeight = imgHeight;
    let currentY = startY;
    let pageIndex = 0;

    while (remainingHeight > 0) {
      const availableHeight = pageHeight - currentY - 10;
      const sliceRatio = availableHeight / imgHeight;
      const sliceHeightPx = imgProps.height * sliceRatio;

      pdf.addImage(
        imgData, 'PNG',
        0, currentY,
        pageWidth, Math.min(remainingHeight, availableHeight)
      );

      remainingHeight -= availableHeight;
      pageIndex++;

      if (remainingHeight > 0) {
        pdf.addPage();
        currentY = 10;
        // Encabezado en páginas adicionales
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text(`${title} — Página ${pageIndex + 1}`, 10, 7);
      }
    }

    // ✅ Pie de página dinámico
    const footerY = pageHeight - 5;
    pdf.setFontSize(8);
    pdf.setTextColor(120);
    pdf.text(
      `Generado por AURON AI · ${new Date().toLocaleString('es-CO')}`,
      10,
      footerY
    );

    // ✅ Nombre de archivo sanitizado
    const safeName = title
      .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '')
      .replace(/\s+/g, '_');
    const filename = `${safeName}_${Date.now()}.pdf`;

    pdf.save(filename);
    onProgress?.('¡PDF generado exitosamente!');

    return { success: true, filename };

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[pdfService]', msg);
    return { success: false, error: msg };
  }
};