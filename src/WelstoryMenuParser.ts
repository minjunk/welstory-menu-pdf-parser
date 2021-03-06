import { PDFPage, PDFPagesFills } from 'pdf2json';
import { groupBy, sortBy, flattenDeep } from 'lodash';

import { LINE_TYPE, MENU_REGEXP } from './constants';
import {
  prettyTexts, splitText, parseText,
  parseDate, setDateTime, getNearCell,
} from './utils';
import {
  MenuCell, MenuDate, MenuMeal, MenuCorner,
  MenuText, MenuData, MenuMealData,
} from './types/menu';

export { MenuData, MenuMealData };

/**
 * Welstory 구내식당 메뉴 Parser
 */
export class WelstoryMenuParser {
  private cells: MenuCell[] = [];

  private date: MenuDate[] = [];
  private meals: MenuMeal[] = [];
  private corners: MenuCorner[] = [];
  private menus: MenuData[] = [];

  private texts: MenuText[] = [];

  private verticalLines: PDFPagesFills = [];
  private horizonLines: PDFPagesFills = [];

  /**
   * Creates an instance of PDFMenuParser.
   * @param {object} page PDF 데이터의 개별 페이지
   */
  public constructor(page: PDFPage) {
    if (!page.Fills || !page.Texts) return;

    // 데이터 분류 값을 미리 설정
    const fills = page.Fills;
    const texts = page.Texts;

    // 코너를 생성할때 사용 될 수평선을 따로 캐싱
    this.verticalLines = sortBy(fills.filter(o => o.w > o.h && !o.clr), 'y');
    this.horizonLines = sortBy(fills.filter(o => o.w < o.h && !o.clr), 'x');

    // 문자열을 파싱하기 편하도록 변형
    this.texts = prettyTexts(texts);

    // 테이블의 데이터를 분리
    this.parseTable();
    this.parseMenu();
  }

  /**
   * 메뉴를 파싱하기 이전에 테이블의 셀별로 데이터를 구분
   */
  private parseTable(): void {
    const hLines = this.horizonLines;
    const firstColumn = splitText(hLines.slice(0, 2), this.texts, LINE_TYPE.COLUMN);
    const horizon = splitText(hLines.slice(1), this.texts, LINE_TYPE.COLUMN);

    // 식사
    const {
      x: firstLeft,
      w: firstWidth,
      column: meals,
    } = firstColumn.shift();
    const firstColumnLines = this.verticalLines.reduce((arr, o) => {
      if (Math.round(o.x - firstWidth) <= firstLeft) {
        return arr.concat(o);
      }
      return arr;
    }, []);
    const mealsRow = splitText(firstColumnLines, meals, LINE_TYPE.BOX);
    mealsRow.forEach(({ x, y, texts }) => {
      const text = parseText(texts).join('');
      const matched = text.match(MENU_REGEXP.MEAL);
      this.meals.push({
        x, y,
        text: matched[1],
        startTime: matched[2],
        endTime: matched[3],
      });
    });

    // 코너
    const { column: corners } = horizon.shift();
    const cornersRow = splitText(this.verticalLines, corners, LINE_TYPE.BOX);
    cornersRow.forEach(({ x, y, texts }) => {
      const text = parseText(texts).join('');
      const nearMeal = getNearCell(this.meals, (o) => o.y <= y);
      this.corners.push({
        x, y,
        meal: nearMeal,
        text,
      });
    });

    // 세로
    horizon.forEach(({ x, w, column }) => {
      // 가로
      if (column) {
        const row = splitText(this.verticalLines, column, LINE_TYPE.BOX);
        row.forEach(({ y, h, texts }) => {
          this.cells.push({
            x,
            y,
            w,
            h,
            texts,
          });
        });
      }
    });
  }

  /**
   * 메뉴 파싱
   */
  private parseMenu(): void {
    this.cells.forEach(({ x, y, texts: cellText }) => {
      const texts = parseText(cellText);
      const text = flattenDeep(texts).join('');
      const date = parseDate(text);

      // 데이터 등록
      if (date) {
        // 날짜
        this.date.push({ x, y, value: date });
      } else {
        const { value: menuDate } = getNearCell(this.date, o => o.x <= x);
        const corner = getNearCell(this.corners, o => o.y <= y);
        const { startTime, endTime } = corner.meal;
        const startDateTime = setDateTime(menuDate, startTime);
        const endDateTime = setDateTime(menuDate, endTime);
        this.menus.push({
          x, y,
          texts,
          text: texts.join('\n'),
          meal: corner.meal,
          corner,
          date: menuDate,
          startDateTime,
          endDateTime,
        });
      }
    });
  }

  /**
   * 기본 데이터 세트
   * @param date 해당 날짜만 필터링
   */
  getData(date?: Date): MenuData[] {
    if (date) {
      return this.menus.filter(o => {
        return o.date.toString() === date.toString();
      });
    }
    return this.menus;
  }

  /**
   * 식사별로 구분되어 있는 데이터 세트 (구글 캘린더에 등록하기 위한 용도)
   */
  getMeals(): MenuMealData[] {
    const group = Object.values(groupBy(this.menus, 'startDateTime'));
    return group.map(meals => {
      const mealName = meals[0].meal.text;
      const cornerName = meals.map(o => {
        return o.corner.text.indexOf('코너') === 0 ? o.texts[0] : null;
      }).filter(Boolean).join('/');
      const summary = cornerName ? `${mealName}(${cornerName})` : mealName;
      const description = meals.map(meal => {
        return [meal.corner.text]
          .concat(meal.texts.map(text => `- ${text}`)).join('\n');
      }).join('\n\n');
      return {
        mealName,
        summary,
        description,
        meals,
        startDateTime: meals[0].startDateTime,
        endDateTime: meals[0].endDateTime,
      } as MenuMealData;
    });
  }
}

export default WelstoryMenuParser;
