import { LINE_TYPE } from '../constants';

interface MenuBase {
  /**
   * X 좌표
   */
  x: number;

  /**
   * Y 좌표
   */
  y: number;
}

export interface MenuCell extends MenuBase {
  w: number;
  h: number;
  texts: MenuText[];
}

export interface MenuDate extends MenuBase {
  value: Date;
}

export interface MenuMeal extends MenuBase {
  text: string;
  startTime: string;
  endTime: string;
}

export interface MenuCorner extends MenuBase {
  meal: MenuMeal;
  text: string;
}

export interface MenuData extends MenuBase {
  meal: MenuMeal;
  corner: MenuCorner;
  text: string;
  texts: string[];
  date: Date;
  startDateTime: Date;
  endDateTime: Date;
}

export interface MenuText extends MenuBase {
  text: string;
}

export interface MenuCellText {
  type: LINE_TYPE;

  /**
   * X 좌표
   */
  x: number;

  /**
   * Y 좌표
   */
  y: number;

  /**
   * 너비
   */
  w: number;

  /**
   * 높이
   */
  h: number;

  /**
   * Column
   */
  column?: MenuMeal[];

  texts?: MenuText[];
}

export interface MenuMealData {
  mealName: string;
  summary: string;
  description: string;
  meals: MenuData[];
  startDateTime: Date;
  endDateTime: Date;
}

export type LineDirection = 'x' | 'y';
