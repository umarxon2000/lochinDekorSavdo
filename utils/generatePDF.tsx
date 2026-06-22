import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Uchinchi parametr sifatida customerInfo qo'shildi
export const generatePDF = (
  items: any[], 
  totalSum: number, 
  customerInfo?: { name: string; phone: string }
) => {
  const doc = new jsPDF();
  const now = new Date();
  const dateString = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

  // 1. Sarlavha (Kompaniya nomi)
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235); // Ko'k rang
  doc.text("EXCLUSIVE DEKOR", 105, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Qurilish materiallari hisob-fakturasi", 105, 22, { align: 'center' });

  // 2. Mijoz va Sana ma'lumotlari
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 28, 196, 28); // Gorizontal chiziq

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Mijoz ma'lumotlari:", 14, 35);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);
  doc.text(`Ismi: ${customerInfo?.name || "Kiritilmagan"}`, 14, 42);
  doc.text(`Tel: ${customerInfo?.phone || "Kiritilmagan"}`, 14, 48);

  doc.setFontSize(10);
  doc.text(`Sana: ${dateString}`, 196, 42, { align: 'right' });
  doc.text(`Check №: ${Math.floor(Math.random() * 100000)}`, 196, 48, { align: 'right' });

  // 3. Jadval tayyorlash
  const tableData = items.map((item, index) => [
    index + 1,
    item.name,
    `${item.inputValue} ${item.unit === 'm2' ? 'm²' : item.unit}`, // Kiritilgan metr/kvadrat
    `${item.calculatedPieces} dona`,                             // Hisoblangan dona
    `${item.pricePerUnit.toLocaleString()} so'm`,
    `${item.totalPrice.toLocaleString()} so'm`
  ]);

  autoTable(doc, {
    startY: 55,
    head: [['№', 'Mahsulot nomi', 'Hajmi', 'Miqdori', 'Narxi', 'Jami']],
    body: tableData,
    foot: [['', '', '', '', 'UMUMIY SUMMA:', `${totalSum.toLocaleString()} so'm`]],
    theme: 'striped',
    headStyles: { 
      fillColor: [37, 99, 235], 
      fontSize: 10,
      halign: 'center' 
    },
    columnStyles: {
      0: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'right' },
      5: { halign: 'right' },
    },
    footStyles: { 
      fillColor: [241, 245, 249], 
      textColor: [0, 0, 0], 
      fontSize: 11,
      fontStyle: 'bold',
      halign: 'right'
    },
    styles: { font: "helvetica", cellPadding: 3 },
  });

  // 4. Pastki qism (Futer)
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text("Xaridingiz uchun rahmat!", 105, finalY + 15, { align: 'center' });
  doc.text("Exclusive Dekor - Sifatli qurilish materiallari", 105, finalY + 22, { align: 'center' });

  // 5. Saqlash (Mijoz ismi bilan)
  const fileName = customerInfo?.name 
    ? `Check_${customerInfo.name.replace(/\s+/g, '_')}.pdf` 
    : `Check_${Date.now()}.pdf`;
    
  doc.save(fileName);
};