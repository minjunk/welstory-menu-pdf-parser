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

/**
 * 시작, 끝의 좌표를 기준으로 내부 텍스트 데이터를 필터링
 * @param texts 매뉴 텍스트
 * @param start 시작 지점의 라인
 * @param end 끝 지점의 라인
 * @param direction 좌표
 */
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

/**
 * `getNearCell` 함수에서 사용되는 타입 세트
 */
type NearCells = MenuMeal | MenuDate | MenuCorner;

/**
 * 입력된 컬렉션에서 조건에 해당하는 가장 가까운 셀을 찾음
 * @param collection 가까운 셀을 찾기위한 목록
 * @param condition 조건
 */
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

/**
 * 라인을 기준으로 텍스트를 구분한다.
 * @param lines 라인 목록
 * @param texts 텍스트 세트
 * @param type 라인의 종류
 */
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

/**
 * 지저분하게 구분되어 있는 텍스트를 정리
 * @param texts 텍스트 세트
 */
export function prettyTexts(texts: PDFPageTexts): MenuText[] {
  return texts.map((o) => ({
    x: o.sw ? (o.x + o.sw) : o.x,
    y: o.sw ? (o.y + o.sw) : o.y,
    text: (urldecode(result(o, 'R[0].T')) || '').trim(),
  }));
}

/**
 * 텍스트 세트에서 텍스트 값만 가져옴
 * @param texts 텍스트 세트
 */
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

/**
 * 텍스트 값으로 되어 있는 날짜를 `Date` 형식으로 변환
 * @param text 날짜 텍스트
 */
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
  * 날찌에 식사별 시간 텍스트를 추가
  * @param date 날짜
  * @param timeStr 식사별 시간 텍스트
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
