/**
 * PDF Export Service
 * Generates HTML resume and exports as PDF
 */

import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import type { ResumeParsedData } from "@app-powerup/shared";

/**
 * Generate HTML resume from resume data
 */
function generateResumeHTML(data: ResumeParsedData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 8.5in;
          margin: 0;
          padding: 40px;
          background: white;
        }
        h1 {
          font-size: 24px;
          margin: 0 0 10px 0;
          border-bottom: 2px solid #0066cc;
          padding-bottom: 10px;
        }
        .contact-info {
          font-size: 12px;
          margin-bottom: 20px;
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }
        .contact-info span {
          display: inline-block;
        }
        h2 {
          font-size: 14px;
          margin: 20px 0 10px 0;
          color: #0066cc;
          text-transform: uppercase;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .entry {
          margin-bottom: 15px;
        }
        .entry-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
        }
        .entry-title {
          font-weight: bold;
          font-size: 13px;
        }
        .entry-date {
          font-size: 12px;
          color: #666;
        }
        .entry-subtitle {
          font-size: 12px;
          color: #666;
          font-style: italic;
        }
        .entry-description {
          font-size: 12px;
          line-height: 1.5;
          margin-top: 5px;
        }
        .summary {
          font-size: 12px;
          line-height: 1.6;
          margin-bottom: 15px;
        }
        .skills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }
        .skill-tag {
          background: #e8f0ff;
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 11px;
          color: #0066cc;
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <h1>${data.contact.fullName || "Unnamed Resume"}</h1>

      <!-- Contact Info -->
      <div class="contact-info">
        ${data.contact.email ? `<span>${data.contact.email}</span>` : ""}
        ${data.contact.phone ? `<span>${data.contact.phone}</span>` : ""}
        ${data.contact.location ? `<span>${data.contact.location}</span>` : ""}
        ${data.contact.linkedin ? `<span><a href="${data.contact.linkedin}">${data.contact.linkedin}</a></span>` : ""}
      </div>

      <!-- Professional Summary -->
      ${
        data.summary.text
          ? `
        <h2>Professional Summary</h2>
        <div class="summary">${data.summary.text}</div>
      `
          : ""
      }

      <!-- Experience -->
      ${
        data.experience.length > 0
          ? `
        <h2>Experience</h2>
        ${data.experience
          .map(
            (exp) => `
          <div class="entry">
            <div class="entry-header">
              <span class="entry-title">${exp.position}</span>
              <span class="entry-date">${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : " - Present"}</span>
            </div>
            <div class="entry-subtitle">${exp.company}</div>
            <div class="entry-description">${exp.description}</div>
          </div>
        `,
          )
          .join("")}
      `
          : ""
      }

      <!-- Education -->
      ${
        data.education.length > 0
          ? `
        <h2>Education</h2>
        ${data.education
          .map(
            (edu) => `
          <div class="entry">
            <div class="entry-header">
              <span class="entry-title">${edu.degree}</span>
              <span class="entry-date">${edu.graduationDate}</span>
            </div>
            <div class="entry-subtitle">${edu.school}</div>
            ${edu.field ? `<div class="entry-subtitle">Field: ${edu.field}</div>` : ""}
            ${edu.details ? `<div class="entry-description">${edu.details}</div>` : ""}
          </div>
        `,
          )
          .join("")}
      `
          : ""
      }

      <!-- Skills -->
      ${
        data.skills.length > 0
          ? `
        <h2>Skills</h2>
        <div class="skills">
          ${data.skills.map((skill) => `<span class="skill-tag">${skill.name}</span>`).join("")}
        </div>
      `
          : ""
      }
    </body>
    </html>
  `;
}

/**
 * Export resume as PDF and share it
 */
export async function exportResumePDF(data: ResumeParsedData): Promise<void> {
  try {
    const html = generateResumeHTML(data);
    const fileName = `${data.contact.fullName || "Resume"}_${new Date().toISOString().split("T")[0]}.pdf`;

    // Generate PDF
    const { uri } = await Print.printToFileAsync({ html });

    // Share the PDF directly from temporary location
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: "Export Resume",
    });
  } catch (error) {
    console.error("PDF Export Error:", error);
    throw new Error("Failed to export resume as PDF");
  }
}

/**
 * Export resume as PDF (save to device)
 */
export async function saveResumePDF(data: ResumeParsedData): Promise<string> {
  try {
    const html = generateResumeHTML(data);
    const fileName = `${data.contact.fullName || "Resume"}_${new Date().toISOString().split("T")[0]}.pdf`;

    // Generate PDF
    const { uri } = await Print.printToFileAsync({ html });

    // Return the generated PDF URI
    return uri;
  } catch (error) {
    console.error("PDF Save Error:", error);
    throw new Error("Failed to save resume as PDF");
  }
}
