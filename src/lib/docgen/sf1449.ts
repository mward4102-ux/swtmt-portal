// SF 1449 — Solicitation/Contract/Order for Commercial Items
// This is a skeleton. The real SF 1449 is a two-page form with fixed box placements.
// TODO: Replace with an actual fillable PDF template using pdf-lib and a mapped field dictionary.
// For now this emits a docx cover sheet with the key fields so the bid has a working artifact.

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export async function generateSF1449(intake: any): Promise<{ buffer: Buffer; filename: string }> {
  const name = intake.company_name || 'Company';

  const doc = new Document({
    creator: 'SWTMT Portal',
    title: `${name} SF 1449 Draft`,
    sections: [{
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'STANDARD FORM 1449 — DRAFT COVER', bold: true, size: 28 })]
        }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: `Contractor: ${name}` }),
        new Paragraph({ text: `Solicitation Number: ${intake.solicitation_number || 'TBD'}` }),
        new Paragraph({ text: `Issue Date: ${new Date().toISOString().slice(0, 10)}` }),
        new Paragraph({ text: `UEI: ${intake.uei || ''}` }),
        new Paragraph({ text: `CAGE: ${intake.cage_code || ''}` }),
        new Paragraph({ text: '' }),
        new Paragraph({
          children: [new TextRun({
            text: 'NOTE: This is a placeholder cover sheet. Attach the fillable SF 1449 PDF as the official submission artifact. Extend this generator to map intake fields directly into the SF 1449 PDF via pdf-lib.',
            italics: true,
            size: 18,
            color: '888888'
          })]
        })
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  return { buffer, filename: `${name.replace(/[^a-z0-9]+/gi, '_')}_SF1449_Draft.docx` };
}
