import { default as PDFParser, PDFDataReady, PDFPage } from 'pdf2json';
import { get } from 'lodash';
import WelstoryMenuParser, { MenuData, MenuMealData } from './WelstoryMenuParser';

export * from './types/menu';

async function readPDfPage(file: Buffer): Promise<PDFDataReady> {
  return new Promise((resolve, reject): void => {
    const pdf2Json = new PDFParser();
    pdf2Json.on('pdfParser_dataReady', (data) => resolve(data));
    pdf2Json.on('pdfParser_dataError', (error) => reject(error.parserError));
    pdf2Json.parseBuffer(file);
  });
}

export async function menuPdfParser(file: Buffer): Promise<MenuMealData[]>
export async function menuPdfParser(file: Buffer, date: Date): Promise<MenuData[]>
export async function menuPdfParser(file: Buffer, date?: Date): Promise<MenuData[] | MenuMealData[]> {
  const data = await readPDfPage(file);
  const page = get(data, 'formImage.Pages[0]') as PDFPage;
  if (!page) {
    throw new Error('PDF data does not exist.');
  }

  const parse = new WelstoryMenuParser(page);
  if (date) {
    return parse.getData(date);
  }
  return parse.getMeals();
}

export { WelstoryMenuParser };
