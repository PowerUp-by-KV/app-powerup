/**
 * Expo Router route: /resume/builder
 *
 * Entry point for the "Craft Your Resume" wizard.
 * Delegates all rendering to the isolated ResumeBuilderWizard
 * from the resume-builder feature domain.
 *
 * DO NOT import from @/features/resume/ here — that domain
 * belongs exclusively to the Resume Parser / Score flow.
 */
import { ResumeBuilderWizard } from "@/features/resume-builder";

export default ResumeBuilderWizard;
