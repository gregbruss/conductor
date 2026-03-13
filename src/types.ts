export interface Layer {
  id: string;
  label: string;
  code: string;       // may be multiple lines (dot-chained)
  muted: boolean;
}

export interface Section {
  id: string;
  name: string;
  code: string;
  bars: number;
}
