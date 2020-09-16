import { VariableDefinition } from './variable-definition';

export class SystemVariable {
  sys_type: string;
  sys_id: string;
  sys_name: string;
  cmp_type: string;
  cmp_index: number;
  var_id: any;
  var_value?: number | string | string[] | number[];

  isEquals(v: SystemVariable): boolean  {
    return
    this.sys_type === v.sys_type &&
    this.sys_id === v.sys_id &&
    this.sys_name === v.sys_name &&
    this.cmp_type === v.cmp_type &&
    this.cmp_index === v.cmp_index &&
    this.var_id === v.var_id;
  }

  static fromVariableDefinition(vd: VariableDefinition): SystemVariable {
    return {
      sys_type: vd.systemType,
      sys_id: vd.systemId,
      sys_name: vd.systemName,
      cmp_type: vd.componentType,
      cmp_index: vd.index,
      var_id: vd.variableId
    } as SystemVariable;
  }
}
