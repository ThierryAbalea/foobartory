export interface RawMaterial {
  serialNumber: string;
}
export type Foo = RawMaterial;
export type Bar = RawMaterial;

export interface Foobar {
  serialNumber: string;
  fooSerialNumber: string;
  barSerialNumber: string;
}
