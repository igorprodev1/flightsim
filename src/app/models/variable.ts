export interface Variable {
  value: string | number | any;
  type: string;
  readOnly: boolean,
  range: any,
  id: string
}