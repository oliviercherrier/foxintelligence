import { RoundTrip } from "./roundTrip.model";

export class Trip {
    code: String;
    name: String;

    details: {
        price: number;

        roundTrips: RoundTrip[];
    } = {price: undefined, roundTrips: []};
}