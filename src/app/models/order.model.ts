import { Trip } from "src/app/models/trip.model";

type OrderStatus = "ko" | "ok";

export class Order {
    status: OrderStatus;

    result: {
        trips: Trip[];
        custom: {
            prices: Price[];
        }
    } = { trips: [], custom: { prices: []}}
}

export class Price{
    value: Number;
}