export type Action = {type:string, [key:string]:any};
export type PassthroughAction = {type:string, args:any[]};
export type PassthroughActionCreator = (...args:any[]) => PassthroughAction;
export type Reducer = (state:any, action:Action) => any;
export type InteractionReducer = (state:any, ...args:any[]) => any;
