import { Train } from "./train.model";

type RoundTripType = "Aller"  | "Retour";

export class RoundTrip {
    type: RoundTripType;
    date: Date;

    trains: Train[] = [];
}