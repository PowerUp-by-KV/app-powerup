/**
 * PDF Export Service
 * Generates HTML resume and exports as PDF
 */

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { ResumeParsedData, Experience, Education, Skill } from "@/services/resume-api";

/**
 * Escape HTML special characters to prevent injection
 */
function escapeHTML(text: string | undefined): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Validate and sanitize URLs
 */
function sanitizeURL(url: string | undefined): string {
  if (!url) return "";
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return "";
  }
  return escapeHTML(url);
}

/**
 * Generate HTML resume from resume data
 */
function generateResumeHTML(data: ResumeParsedData): string {
  const experienceList = data.experience || [];
  const educationList = data.education || [];
  const skillList = data.skills || [];

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
      <h1>${escapeHTML(data.contact?.fullName) || "Unnamed Resume"}</h1>

      <!-- Contact Info -->
      <div class="contact-info">
        ${data.contact?.email ? `<span>${escapeHTML(data.contact.email)}</span>` : ""}
        ${data.contact?.phone ? `<span>${escapeHTML(data.contact.phone)}</span>` : ""}
        ${data.contact?.location ? `<span>${escapeHTML(data.contact.location)}</span>` : ""}
        ${data.contact?.linkedin ? `<span><a href="${sanitizeURL(data.contact.linkedin)}">${escapeHTML(data.contact.linkedin)}</a></span>` : ""}
      </div>

      <!-- Professional Summary -->
      ${
        data.summary?.text
          ? `
        <h2>Professional Summary</h2>
        <div class="summary">${escapeHTML(data.summary.text)}</div>
      `
          : ""
      }

      <!-- Experience -->
      ${
        experienceList.length > 0
          ? `
        <h2>Experience</h2>
        ${experienceList
          .map(
            (exp: Experience) => `
          <div class="entry">
            <div class="entry-header">
              <span class="entry-title">${escapeHTML(exp.position)}</span>
              <span class="entry-date">${escapeHTML(exp.startDate)}${exp.endDate ? ` - ${escapeHTML(exp.endDate)}` : " - Present"}</span>
            </div>
            <div class="entry-subtitle">${escapeHTML(exp.company)}</div>
            <div class="entry-description">${escapeHTML(exp.description)}</div>
          </div>
        `,
          )
          .join("")}
      `
          : ""
      }

      <!-- Education -->
      ${
        educationList.length > 0
          ? `
        <h2>Education</h2>
        ${educationList
          .map(
            (edu: Education) => `
          <div class="entry">
            <div class="entry-header">
              <span class="entry-title">${escapeHTML(edu.degree)}</span>
              <span class="entry-date">${escapeHTML(edu.graduationDate)}</span>
            </div>
            <div class="entry-subtitle">${escapeHTML(edu.school)}</div>
            ${edu.field ? `<div class="entry-subtitle">Field: ${escapeHTML(edu.field)}</div>` : ""}
            ${edu.details ? `<div class="entry-description">${escapeHTML(edu.details)}</div>` : ""}
          </div>
        `,
          )
          .join("")}
      `
          : ""
      }

      <!-- Skills -->
      ${
        skillList.length > 0
          ? `
        <h2>Skills</h2>
        <div class="skills">
          ${skillList
            .map((skill: Skill | string) => {
              const name = typeof skill === "string" ? skill : skill.name;
              return `<span class="skill-tag">${escapeHTML(name)}</span>`;
            })
            .join("")}
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

    const { uri } = await Print.printToFileAsync({ html });

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

    const { uri } = await Print.printToFileAsync({ html });

    return uri;
  } catch (error) {
    console.error("PDF Save Error:", error);
    throw new Error("Failed to save resume as PDF");
  }
}
