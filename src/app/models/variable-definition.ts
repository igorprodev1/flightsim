export interface VariableDefinition {
  variableLabel?: string;
  systemType: string;
  systemId: string;
  systemName?: string;
  componentType: string;
  index: number;
  variableId: string;
  showRangeHint?: boolean;
  step?: number;
  tooltip?: string;
  precision?: number;
}
