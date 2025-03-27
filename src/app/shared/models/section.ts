export interface Section {
  text?: string;
  ul?: string[];
  children?: Section[];
}
export interface protocol {
    project?: string;
    sections?: Section[];
}
