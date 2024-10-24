import type { User } from "../user.type";
import type { Meal } from "./meal.type";

export interface CateringEvent {
    cashierId: number;
    eventName?: string;
    eventDate?: Date;
    eventLocation?: string;
    attendeeCount?: number
    cashierAmount?: number;
    createdDate?: Date;
    deletedAt?: string;
    user?: User;
    meals?: Meal[];

 }