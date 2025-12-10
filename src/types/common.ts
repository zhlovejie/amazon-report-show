export type CallbackPrams = {
  status: "ok" | "error";
  message?:string;
  orderData?:Array<any>;
  storageData?:Array<any>;
};