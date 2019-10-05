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

/**
 * 메뉴의 테이블 셀
 */
export interface MenuCell extends MenuBase {
  /**
   * 너비(Width)
   */
  w: number;

  /**
   * 높이(Height)
   */
  h: number;

  /**
   * 텍스트 세트
   */
  texts: MenuText[];
}

/**
 * 식사 날짜 데이터
 */
export interface MenuDate extends MenuBase {
  /**
   * 메뉴 날짜
   */
  value: Date;
}

/**
 * 식사
 */
export interface MenuMeal extends MenuBase {
  /**
   * 식사 이름
   */
  text: string;

  /**
   * 식사 시작 시간
   */
  startTime: string;

  /**
   * 식사 종료 시간
   */
  endTime: string;
}

/**
 * 식사 종류(코너)
 */
export interface MenuCorner extends MenuBase {
  meal: MenuMeal;

  /**
   * 코너 이름
   */
  text: string;
}

/**
 * 식사 메뉴
 */
export interface MenuData extends MenuBase {
  meal: MenuMeal;
  corner: MenuCorner;

  /**
   * 메뉴를 내려쓰기로 붙여놓은 값
   */
  text: string;

  /**
   * 메뉴의 텍스트 값
   */
  texts: string[];

  /**
   * 식사 날짜
   */
  date: Date;

  /**
   * 메뉴의 식당 시작 시간
   */
  startDateTime: Date;

  /**
   * 메뉴의 식당 종료 시간
   */
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
  /**
   * 메뉴 이름
   * 코너의 메인 메뉴 이름이 괄호로 포함되어 있다.
   */
  mealName: string;

  /**
   * 메뉴를 구글 캘린더에 등록하기 위한 제목 텍스트
   */
  summary: string;

  /**
   * 메뉴를 구글 캘린더에 등록하기 위한 내용 텍스트
   */
  description: string;

  /**
   * 메뉴 데이터 컬렉션
   */
  meals: MenuData[];

  /**
   * 메뉴의 식당 시작 시간
   */
  startDateTime: Date;

  /**
   * 메뉴의 식당 종료 시간
   */
  endDateTime: Date;
}

export type LineDirection = 'x' | 'y';
