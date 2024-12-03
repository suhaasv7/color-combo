declare module "color-namer" {
  interface ColorName {
    name: string;
    hex: string;
    distance: number;
  }

  interface ColorNames {
    ntc: ColorName[];
    basic: ColorName[];
    roygbiv: ColorName[];
    html: ColorName[];
    x11: ColorName[];
    pantone: ColorName[];
    [key: string]: ColorName[]; // Add this index signature
  }

  function namer(color: string): ColorNames;
  export default namer;
}
