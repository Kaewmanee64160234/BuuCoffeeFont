export interface ReportIngredientLog{
    WithdrawalID : number;
    ReturnID : number;
    WithdrawalDate :String;
    ReturnDate:String;
    shopType:String;
    ingredientIngredientId: number;
    ingredientName:String;
    WithdrawalQuantity: number;
    ReturnQuantity: number;
    TotalUsedLogQuantity: number;
    TotalUnit:String;
    LastLogCreatedDate :String;
}