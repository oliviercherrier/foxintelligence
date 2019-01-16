type PassengerType = "échangeable" | "non échangeable";

type PassengerAge = "(26 à 59 ans)" | "(4 à 11 ans)" | "(0 à 3 ans)"

export class Passenger {
    type: PassengerType;
    age: PassengerAge; 
}