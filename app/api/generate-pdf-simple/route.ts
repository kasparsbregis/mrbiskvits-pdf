import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";

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

    // Create HTML content with modern A4-optimized invoice design
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="lv">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Rēķins #${invoiceNumber}</title>
          <style>
            @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap");

            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
              line-height: 1.3;
              color: #1a1a1a;
              background: #ffffff;
              width: 210mm;
              height: 297mm;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .invoice-page {
              width: 100%;
              height: 297mm;
              background: #ffffff;
              position: relative;
              overflow: hidden;
              display: flex;
              flex-direction: column;
            }

            /* Header Section */
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 18px 25px 15px 25px;
              position: relative;
              overflow: hidden;
              flex-shrink: 0;
            }

            .header::before {
              content: '';
              position: absolute;
              top: 0;
              right: 0;
              width: 200px;
              height: 200px;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 50%;
              transform: translate(50%, -50%);
            }

            .header-content {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              position: relative;
              z-index: 2;
            }

            .company-section {
              flex: 1;
            }

            .company-name {
              font-size: 20px;
              font-weight: 800;
              margin-bottom: 3px;
              letter-spacing: -0.5px;
            }

            .company-tagline {
              font-size: 12px;
              font-weight: 400;
              opacity: 0.9;
              margin-bottom: 8px;
            }

            .company-details {
              font-size: 12px;
              line-height: 1.4;
              opacity: 0.85;
            }

            .invoice-section {
              text-align: right;
              flex: 1;
            }

            .invoice-title {
              font-size: 28px;
              font-weight: 800;
              margin-bottom: 4px;
              letter-spacing: -1px;
            }

            .invoice-subtitle {
              font-size: 12px;
              font-weight: 500;
              opacity: 0.9;
              margin-bottom: 10px;
            }

            .invoice-meta {
              background: rgba(255, 255, 255, 0.15);
              backdrop-filter: blur(10px);
              padding: 12px;
              border-radius: 6px;
              border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .meta-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 14px;
            }

            .meta-row:last-child {
              margin-bottom: 0;
            }

            .meta-label {
              font-weight: 500;
              opacity: 0.8;
            }

            .meta-value {
              font-weight: 700;
            }

            /* Main Content */
            .main-content {
              padding: 20px 25px;
              background: #ffffff;
              flex: 1;
              display: flex;
              flex-direction: column;
            }

            /* Client Information */
            .client-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              gap: 15px;
            }

            .client-info, .sender-info {
              flex: 1;
            }

            .section-label {
              font-size: 12px;
              font-weight: 700;
              color: #667eea;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 15px;
            }

            .info-card {
              background: #f8fafc;
              border: 2px solid #e2e8f0;
              border-left: 4px solid #667eea;
              padding: 12px;
              border-radius: 6px;
            }

            .info-item {
              margin-bottom: 6px;
              font-size: 13px;
              color: #2d3748;
            }

            .info-item:last-child {
              margin-bottom: 0;
            }

            .info-label {
              font-weight: 600;
              color: #4a5568;
            }

            /* Services Table */
            .services-section {
              margin-bottom: 15px;
              flex: 1;
            }

            .services-table {
              width: 100%;
              border-collapse: collapse;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            }

            .services-table thead {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }

            .services-table th {
              padding: 10px 12px;
              text-align: left;
              font-weight: 700;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .services-table td {
              padding: 10px 12px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 12px;
              color: #2d3748;
            }

            .services-table tbody tr:last-child td {
              border-bottom: none;
            }

            .service-name {
              font-weight: 600;
              color: #1a202c;
            }

            .service-price {
              font-weight: 700;
              color: #667eea;
              text-align: right;
            }

            /* Totals Section */
            .totals-section {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 15px;
            }

            .totals-card {
              background: #f8fafc;
              border: 2px solid #e2e8f0;
              border-radius: 6px;
              padding: 15px;
              min-width: 220px;
            }

            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              font-size: 14px;
            }

            .total-row:last-child {
              margin-bottom: 0;
              padding-top: 15px;
              border-top: 2px solid #e2e8f0;
              font-size: 20px;
              font-weight: 800;
              color: #1a202c;
            }

            .total-label {
              font-weight: 600;
              color: #4a5568;
            }

            .total-amount {
              font-weight: 700;
              color: #667eea;
            }

            .grand-total .total-amount {
              color: #1a202c;
              font-size: 20px;
            }

            /* Footer */
            .footer {
              background: #f8fafc;
              padding: 15px 25px;
              border-top: 3px solid #667eea;
              flex-shrink: 0;
            }

            .footer-content {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .footer-left {
              flex: 1;
            }

            .footer-right {
              text-align: right;
              flex: 1;
            }

            .footer-text {
              font-size: 14px;
              color: #4a5568;
              margin-bottom: 5px;
            }

            .footer-note {
              font-size: 12px;
              color: #718096;
              font-style: italic;
            }

            .payment-info {
              background: #e6fffa;
              border: 1px solid #81e6d9;
              border-radius: 8px;
              padding: 20px;
              margin-top: 20px;
            }

            .payment-title {
              font-size: 16px;
              font-weight: 700;
              color: #234e52;
              margin-bottom: 10px;
            }

            .payment-details {
              font-size: 14px;
              color: #2d3748;
              line-height: 1.6;
            }

            /* Responsive adjustments for A4 */
            @media print {
              body {
                width: 210mm;
                height: 297mm;
              }
              
              .invoice-page {
                width: 210mm;
                min-height: 297mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-page">
            <!-- Header -->
            <div class="header">
              <div class="header-content">
                <div class="company-section">
                  <div class="company-name">MrBiskvits</div>
                  <div class="company-tagline">Profesionāli pakalpojumi</div>
                  <div class="company-details">
                    Rīga, Latvija<br>
                    +371 12345678<br>
                    info@mrbiskvits.lv<br>
                    www.mrbiskvits.lv
                  </div>
                </div>
                <div class="invoice-section">
                  <div class="invoice-title">RĒĶINS</div>
                  <div class="invoice-subtitle">Pakalpojumu rēķins</div>
                  <div class="invoice-meta">
                    <div class="meta-row">
                      <span class="meta-label">Rēķina Nr.</span>
                      <span class="meta-value">${invoiceNumber}</span>
                    </div>
                    <div class="meta-row">
                      <span class="meta-label">Datums</span>
                      <span class="meta-value">${date}</span>
                    </div>
                    <div class="meta-row">
                      <span class="meta-label">Termiņš</span>
                      <span class="meta-value">15 dienas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Main Content -->
            <div class="main-content">
              <!-- Client Information -->
              <div class="client-section">
                <div class="sender-info">
                  <div class="section-label">Sūtītājs</div>
                  <div class="info-card">
                    <div class="info-item">
                      <span class="info-label">Uzņēmums:</span> MrBiskvits
                    </div>
                    <div class="info-item">
                      <span class="info-label">Adrese:</span> Rīga, Latvija
                    </div>
                    <div class="info-item">
                      <span class="info-label">Reģ. Nr.:</span> 123456789
                    </div>
                    <div class="info-item">
                      <span class="info-label">PVN Nr.:</span> LV123456789
                    </div>
                  </div>
                </div>
                <div class="client-info">
                  <div class="section-label">Saņēmējs</div>
                  <div class="info-card">
                    <div class="info-item">
                      <span class="info-label">Nosaukums:</span> ${recipientName}
                    </div>
                    <div class="info-item">
                      <span class="info-label">Reģ. Nr.:</span> ${registrationNumber}
                    </div>
                    <div class="info-item">
                      <span class="info-label">Adrese:</span> Latvija
                    </div>
                  </div>
                </div>
              </div>

              <!-- Services Table -->
              <div class="services-section">
                <table class="services-table">
                  <thead>
                    <tr>
                      <th style="width: 60%;">Pakalpojuma nosaukums</th>
                      <th style="width: 20%;">Daudzums</th>
                      <th style="width: 20%;">Cena (€)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${selectedOptions
                      .map(
                        (service: {
                          name: string;
                          price: number;
                          quantity: number;
                        }) => `
                      <tr>
                        <td class="service-name">${service.name}</td>
                        <td>${service.quantity}</td>
                        <td class="service-price">€${(
                          service.price * service.quantity
                        ).toFixed(2)}</td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>

              <!-- Totals -->
              <div class="totals-section">
                <div class="totals-card">
                  <div class="total-row">
                    <span class="total-label">Starpsumma:</span>
                    <span class="total-amount">€${selectedOptions
                      .reduce(
                        (
                          sum: number,
                          service: {
                            name: string;
                            price: number;
                            quantity: number;
                          }
                        ) => sum + service.price * service.quantity,
                        0
                      )
                      .toFixed(2)}</span>
                  </div>
                  <div class="total-row">
                    <span class="total-label">PVN (21%):</span>
                    <span class="total-amount">€${(
                      selectedOptions.reduce(
                        (
                          sum: number,
                          service: {
                            name: string;
                            price: number;
                            quantity: number;
                          }
                        ) => sum + service.price * service.quantity,
                        0
                      ) * 0.21
                    ).toFixed(2)}</span>
                  </div>
                  <div class="total-row grand-total">
                    <span class="total-label">Kopā:</span>
                    <span class="total-amount">€${(
                      selectedOptions.reduce(
                        (
                          sum: number,
                          service: {
                            name: string;
                            price: number;
                            quantity: number;
                          }
                        ) => sum + service.price * service.quantity,
                        0
                      ) * 1.21
                    ).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <div class="footer-content">
                <div class="footer-left">
                  <div class="footer-text">
                    <strong>MrBiskvits</strong> - Profesionāli pakalpojumi
                  </div>
                  <div class="footer-note">
                    Paldies par jūsu uzticību!
                  </div>
                </div>
                <div class="footer-right">
                  <div class="payment-info">
                    <div class="payment-title">Maksājuma informācija</div>
                    <div class="payment-details">
                      <strong>Konts:</strong> LV42HABA123456789<br>
                      <strong>Banka:</strong> SEB Banka<br>
                      <strong>Maksājuma mērķis:</strong> Rēķins #${invoiceNumber}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Generate PDF using Vercel-compatible Puppeteer
    // Check if running on Vercel/serverless environment
    const isServerless = !!(
      process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME
    );

    let browser;

    if (isServerless) {
      // Production (Vercel/Serverless) - use @sparticuz/chromium
      console.log("Running in serverless environment, using @sparticuz/chromium");
      
      const executablePath = await chromium.executablePath();
      console.log("Chromium executable path:", executablePath);

      browser = await puppeteerCore.launch({
        args: chromium.args,
        executablePath: executablePath,
        headless: chromium.headless,
      });
    } else {
      // Development - use regular puppeteer
      console.log("Running in development environment, using puppeteer");
      
      browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        headless: true,
      });
    }

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
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
