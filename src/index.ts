import PDFParser, { PDFDataReady } from 'pdf2json';
import { get } from 'lodash';
import WelstoryMenuParser, { MenuData } from './WelstoryMenuParser';

async function readPDfPage(file: Buffer): Promise<PDFDataReady> {
  return new Promise((resolve, reject): void => {
    const pdf2Json = new PDFParser();
    pdf2Json.on('pdfParser_dataReady', (data) => resolve(data));
    pdf2Json.on('pdfParser_dataError', (error) => reject(error.parserError));
    pdf2Json.parseBuffer(file);
  });
}

export async function menuPdfParser(file: Buffer, date?: Date): Promise<MenuData[]> {
  const data = await readPDfPage(file);
  const page = get(data, 'formImage.Pages[0]');
  if (!page) {
    throw new Error('PDF data does not exist.');
  }

  const parse = new WelstoryMenuParser(page);
  return parse.getData(date);
}

export { WelstoryMenuParser };
