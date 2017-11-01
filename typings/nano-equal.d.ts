declare module 'nano-equal' {
  interface NanoEqual {
    (a:any, b:any):boolean;
  }
  var nanoEqual:NanoEqual;

  export = nanoEqual;
}
