import * as util from 'util';
import { PDFPageTexts, PDFPagesFill, PDFPagesFills } from 'pdf2json';
import {
  map, sortBy, groupBy, result,
} from 'lodash';
import urldecode from 'urldecode';
import {
  LINE_TYPE, MENU_REGEXP
} from './constants';
import {
  MenuDate, MenuMeal, MenuCorner, MenuText,
  MenuCellText, LineDirection
} from './types/menu';

export function nonFix(n: number): number {
  return n * 1000;
}

export function inArea(
  texts: MenuText[],
  start: PDFPagesFill,
  end: PDFPagesFill,
  direction: LineDirection
): MenuText[] {
  return texts.filter(o => {
    const value = nonFix(o[direction]);
    return nonFix(start[direction]) < value && nonFix(end[direction]) > value;
  });
}

type NearCells = MenuMeal | MenuDate | MenuCorner;
export function getNearCell(
  collection: NearCells[],
  condition: (condition: NearCells) => boolean
): NearCells {
  return collection.reduce((previousValue, value) => {
    if (condition(value)) {
      return value;
    }
    return previousValue;
  })
}

export function splitText(
  lines: PDFPagesFills,
  texts: MenuText[],
  type: LINE_TYPE = LINE_TYPE.BOX
): MenuCellText[] {
  const direction = type === LINE_TYPE.COLUMN ? 'x' : 'y';
  const childrenKey = type === LINE_TYPE.COLUMN ? 'column' : 'texts';
  const textsArr = sortBy(texts, direction);
  return lines.map((obj, idx, arr) => {
    const next = arr[idx + 1];
    const children = next && inArea(textsArr, obj, next, direction);
    return {
      type,
      ...obj,
      [childrenKey]: children,
    };
  })
  .filter(o => o[childrenKey] && o[childrenKey].length);
}

export function prettyTexts(texts: PDFPageTexts): MenuText[] {
  return texts.map((o) => ({
    x: o.sw ? (o.x + o.sw) : o.x,
    y: o.sw ? (o.y + o.sw) : o.y,
    text: (urldecode(result(o, 'R[0].T')) || '').trim(),
  }));
}

export function parseText(texts: MenuText[]): string[] {
  const text: MenuText[] = texts.reduce((prev, current) => {
    const last = prev[prev.length - 1];
    // 이전 문자열이 현재 문자열에도 존재하면 이전 문자열을 제외
    if (last && current && current.text.indexOf(last.text) > -1) {
      prev.pop();
    }
    return prev.concat(current);
  }, []);

  // 줄단위로 분리되는 같은 줄 텍스트 합침
  return map(groupBy(text, 'y'), arr => map(arr, 'text').join(''));
}

export function parseDate(text: string): Date {
  const dateMatch = text.match(MENU_REGEXP.DATE);
  if (dateMatch && dateMatch[0]) {
    const year = new Date().getFullYear();
    const month = parseInt(dateMatch[1], 10) - 1;
    const day = parseInt(dateMatch[2], 10);
    return new Date(year, month, day);
  }
  return null;
}

/**
 * 날짜
 */
export function setDateTime(date: Date, timeStr: string): Date {
  const time = timeStr.split(':');
  const newDate = new Date(date);
  newDate.setHours(Number(time[0]));
  newDate.setMinutes(Number(time[1]));
  return newDate;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function log(...messages: any): void {
  console.log(...messages.map((o: any) => {
    if (typeof o === 'object') {
      return util.inspect(o, true, 6, true);
    }
    return o;
  }));
}
/* eslint-enable @typescript-eslint/no-explicit-any */
