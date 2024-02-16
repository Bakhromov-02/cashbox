export class FilterDto {
  /**
   * @example '2022-09-01'
   * @description 'YYYY-MM-DD'
   * @default today
   * */
  date?: string;

  /**
   * @example '2022-09'
   * @description 'YYYY-MM'
   * */
  month?: string;

  /**
   * @example '2022-09-02'
   * @description 'YYYY-MM-DD'
   * */
  from?: string;

  /**
   * @example '2022-09-07'
   * @description 'YYYY-MM-DD'
   * */
  to?: string;
}