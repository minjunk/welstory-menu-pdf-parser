export const MENU_REGEXP = {
  DATE: /(\d{1,12})\/(\d{1,31})/,
  MEAL: /(조식|중식|석식)\((\d{1,2}:\d{1,2})~(\d{1,2}:\d{1,2})\)$/,
  CORNER: /^(코너|Take|Plus)/,
};

export enum LINE_TYPE {
  COLUMN,
  BOX,
}
