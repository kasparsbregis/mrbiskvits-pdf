import { NextRequest, NextResponse } from "next/server";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from "@react-pdf/renderer";

// Register fonts that support Latvian characters
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
      fontWeight: 300,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf",
      fontWeight: 400,
      fontStyle: "italic",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
      fontWeight: 500,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: 700,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bolditalic-webfont.ttf",
      fontWeight: 700,
      fontStyle: "italic",
    },
  ],
});

export async function POST(request: NextRequest) {
  try {
    const { recipientName, registrationNumber, selectedOptions } =
      await request.json();

    // Generate invoice number and date
    const invoiceNumber = `INV-${new Date().getFullYear()}${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}${String(new Date().getDate()).padStart(
      2,
      "0"
    )}-${Math.floor(Math.random() * 1000)}`;
    const date = new Date().toLocaleDateString("lv-LV");

    // Calculate totals
    const subtotal = selectedOptions.reduce(
      (sum: number, service: { price: number; quantity: number }) =>
        sum + service.price * service.quantity,
      0
    );
    const vat = subtotal * 0.21;
    const total = subtotal + vat;

    // Define styles for PDF with modern, rounded design
    const styles = StyleSheet.create({
      page: {
        padding: 0,
        fontFamily: "Roboto",
        fontSize: 10,
        backgroundColor: "#f9fafb",
      },
      header: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        backgroundColor: "#667eea",
        padding: 18,
        color: "#ffffff",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
      },
      headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
      },
      companySection: {
        flex: 1,
      },
      companyName: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
        letterSpacing: 0.5,
      },
      companyTagline: {
        fontSize: 9,
        marginBottom: 6,
        opacity: 0.95,
      },
      companyDetails: {
        fontSize: 8,
        lineHeight: 1.5,
        opacity: 0.9,
      },
      invoiceSection: {
        flex: 1,
        alignItems: "flex-end",
      },
      invoiceTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 4,
        letterSpacing: 1,
      },
      invoiceSubtitle: {
        fontSize: 9,
        marginBottom: 8,
        opacity: 0.95,
      },
      invoiceMeta: {
        backgroundColor: "rgba(255,255,255,0.25)",
        padding: 10,
        borderRadius: 10,
        minWidth: 190,
      },
      metaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 5,
      },
      metaLabel: {
        fontWeight: "normal",
        fontSize: 9,
      },
      metaValue: {
        fontWeight: "bold",
        fontSize: 9,
      },
      mainContent: {
        padding: 18,
        paddingBottom: 140,
      },
      clientSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
        gap: 12,
      },
      clientInfo: {
        flex: 1,
      },
      sectionLabel: {
        fontSize: 8,
        fontWeight: "bold",
        color: "#667eea",
        textTransform: "uppercase",
        marginBottom: 8,
        letterSpacing: 1.2,
      },
      infoCard: {
        backgroundColor: "#ffffff",
        borderLeft: "3px solid #667eea",
        padding: 10,
        borderRadius: 10,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      infoItem: {
        marginBottom: 4,
        fontSize: 9,
        lineHeight: 1.4,
      },
      servicesSection: {
        marginBottom: 16,
      },
      table: {
        width: "100%",
        marginBottom: 14,
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: "#ffffff",
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      tableHeader: {
        flexDirection: "row",
        backgroundColor: "#667eea",
        color: "#ffffff",
        padding: 8,
        fontWeight: "bold",
        fontSize: 9,
      },
      tableRow: {
        flexDirection: "row",
        borderBottom: "1px solid #f1f5f9",
        padding: 8,
        fontSize: 9,
        backgroundColor: "#ffffff",
      },
      tableCol1: { width: "60%" },
      tableCol2: { width: "20%" },
      tableCol3: { width: "20%", textAlign: "right", fontWeight: "bold" },
      totalsSection: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: 16,
      },
      totalsCard: {
        backgroundColor: "#ffffff",
        borderRadius: 10,
        padding: 12,
        minWidth: 220,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
        fontSize: 10,
      },
      grandTotal: {
        paddingTop: 10,
        marginTop: 6,
        borderTop: "2px solid #e2e8f0",
        fontSize: 14,
        fontWeight: "bold",
        color: "#1e293b",
      },
      footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#ffffff",
        padding: 14,
        borderTop: "3px solid #667eea",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      },
      footerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
      },
      footerLeft: {
        flex: 1,
      },
      footerText: {
        fontSize: 10,
        marginBottom: 4,
        fontWeight: "bold",
        color: "#1e293b",
      },
      footerNote: {
        fontSize: 8,
        fontStyle: "italic",
        color: "#64748b",
      },
      paymentInfo: {
        backgroundColor: "#ecfdf5",
        border: "1.5px solid #a7f3d0",
        borderRadius: 10,
        padding: 10,
        maxWidth: 260,
      },
      paymentTitle: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#065f46",
        marginBottom: 6,
      },
      paymentDetails: {
        fontSize: 8,
        lineHeight: 1.6,
        color: "#064e3b",
      },
    });

    // Create PDF Document with React components
    const InvoiceDocument = () => (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.companySection}>
                <Text style={styles.companyName}>MrBiskvits</Text>
                <Text style={styles.companyTagline}>
                  Profesionāli pakalpojumi
                </Text>
                <Text style={styles.companyDetails}>
                  Rīga, Latvija{"\n"}
                  +371 12345678{"\n"}
                  info@mrbiskvits.lv{"\n"}
                  www.mrbiskvits.lv
                </Text>
              </View>
              <View style={styles.invoiceSection}>
                <Text style={styles.invoiceTitle}>RĒĶINS</Text>
                <Text style={styles.invoiceSubtitle}>Pakalpojumu rēķins</Text>
                <View style={styles.invoiceMeta}>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Rēķina Nr.</Text>
                    <Text style={styles.metaValue}>{invoiceNumber}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Datums</Text>
                    <Text style={styles.metaValue}>{date}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Termiņš</Text>
                    <Text style={styles.metaValue}>15 dienas</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Client Information */}
            <View style={styles.clientSection}>
              <View style={styles.clientInfo}>
                <Text style={styles.sectionLabel}>SŪTĪTĀJS</Text>
                <View style={styles.infoCard}>
                  <Text style={styles.infoItem}>Uzņēmums: MrBiskvits</Text>
                  <Text style={styles.infoItem}>Adrese: Rīga, Latvija</Text>
                  <Text style={styles.infoItem}>Reģ. Nr.: 123456789</Text>
                  <Text style={styles.infoItem}>PVN Nr.: LV123456789</Text>
                </View>
              </View>
              <View style={styles.clientInfo}>
                <Text style={styles.sectionLabel}>SAŅĒMĒJS</Text>
                <View style={styles.infoCard}>
                  <Text style={styles.infoItem}>
                    Nosaukums: {recipientName}
                  </Text>
                  <Text style={styles.infoItem}>
                    Reģ. Nr.: {registrationNumber}
                  </Text>
                  <Text style={styles.infoItem}>Adrese: Latvija</Text>
                </View>
              </View>
            </View>

            {/* Services Table */}
            <View style={styles.servicesSection}>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableCol1}>Pakalpojuma nosaukums</Text>
                  <Text style={styles.tableCol2}>Daudzums</Text>
                  <Text style={styles.tableCol3}>Cena (€)</Text>
                </View>
                {selectedOptions.map(
                  (
                    service: { name: string; price: number; quantity: number },
                    index: number
                  ) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCol1}>{service.name}</Text>
                      <Text style={styles.tableCol2}>{service.quantity}</Text>
                      <Text style={styles.tableCol3}>
                        €{(service.price * service.quantity).toFixed(2)}
                      </Text>
                    </View>
                  )
                )}
              </View>
            </View>

            {/* Totals */}
            <View style={styles.totalsSection}>
              <View style={styles.totalsCard}>
                <View style={styles.totalRow}>
                  <Text>Starpsumma:</Text>
                  <Text>€{subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text>PVN (21%):</Text>
                  <Text>€{vat.toFixed(2)}</Text>
                </View>
                <View style={[styles.totalRow, styles.grandTotal]}>
                  <Text>Kopā:</Text>
                  <Text>€{total.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerContent}>
              <View style={styles.footerLeft}>
                <Text style={styles.footerText}>
                  MrBiskvits - Profesionāli pakalpojumi
                </Text>
                <Text style={styles.footerNote}>
                  Paldies par jūsu uzticību!
                </Text>
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>Maksājuma informācija</Text>
                <Text style={styles.paymentDetails}>
                  Konts: LV42HABA123456789{"\n"}
                  Banka: SEB Banka{"\n"}
                  Maksājuma mērķis: Rēķins #{invoiceNumber}
                </Text>
              </View>
            </View>
          </View>
        </Page>
      </Document>
    );

    // Generate PDF stream
    const pdfDoc = pdf(<InvoiceDocument />);
    const pdfStream = await pdfDoc.toBlob();

    return new NextResponse(pdfStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="rekins.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });

    return NextResponse.json(
      {
        error: "PDF generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
