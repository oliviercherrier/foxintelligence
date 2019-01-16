import { Passenger } from "./passenger.model";

type TrainType = "TGV" | "TER";

export class Train {
    departureTime: String;
    departureStation: String

    arrivalTime: String;
    arrivalStation: String

    type: TrainType
    number: String;

    passengers: Passenger[] = [];
}