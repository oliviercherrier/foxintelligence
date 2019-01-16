import { Injectable } from '@angular/core';
import { Order } from '../../models/order.model';
import { RoundTrip } from 'src/app/models/roundTrip.model';
import { Trip } from 'src/app/models/trip.model';
import { Train } from 'src/app/models/train.model';
import { Passenger } from 'src/app/models/passenger.model';
import * as moment from 'moment';

moment.locale('fr');
@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor() { }
  public cleanHtml(html) {
      return html.replace(/\\r\\n/g, '').
        replace(/\\"/g, '"').
        replace(/ " /g, '');
      
  }

  public cleanTextContent(str: string ): string {
    return str.replace(/ /g, "");
  }

  public fromOrderEmail(orderEmail: string): Order{
    /**
     *  Create HTML document from string
    */
    orderEmail = this.cleanHtml(orderEmail);
    let doc = new DOMParser().parseFromString(orderEmail, "text/html");


    /**
     *  Initialize business objets
    */
    let order = new Order();
    order.status = "ok";
    let trip = new Trip();
    order.result.trips.push(trip);

    /**
     *  Parse HTML to fullfill business object
    */

    // Get custom prices product-header
    try {
      let productHeaderElements = doc.getElementsByClassName("product-header");
      for (let productHeaderElement of Array.from(productHeaderElements)){
        let regex = /([\d]*)+[\,][\d]{2}/gm;
        order.result.custom.prices.push({
          value: Number.parseFloat(regex.exec(productHeaderElement.innerHTML)[0].replace(/,/,"."))
        })
      }
    } catch (error) {
      throw "Error when trying to get custom prices";
    }


    // Get name and code of the trip
    try {
      let tripPnrElements = doc.getElementsByClassName("block-pnr");

      for (let tripPnrElement of Array.from(tripPnrElements)){
  
        if (tripPnrElement.previousElementSibling.textContent.indexOf("Votre Carte de réduction") != -1){
          trip.code = tripPnrElement.getElementsByClassName("pnr-ref")[0].getElementsByClassName("pnr-info")[0].textContent;
          trip.code = this.cleanTextContent(trip.code.toString());
      
          trip.name = tripPnrElement.getElementsByClassName("pnr-name")[0].getElementsByClassName("pnr-info")[0].textContent;
          trip.name = this.cleanTextContent(trip.name.toString());
  
          break;
        }
      }
    } catch (error) {
      throw "Error when trying to get name or code of trip";
    }


    // Get price of the trip
    try {
      let priceStr = doc.getElementsByClassName("total-amount")[0].getElementsByClassName("very-important")[0].textContent;
      trip.details.price = Number.parseFloat(this.cleanTextContent(priceStr.replace(/€/g, "").replace(/,/,".")));
    } catch (error) {
      throw "Error when trying to get price of trip";
    }


    // Get round trips data
    let roundTripsHTML = doc.getElementsByClassName("product-details");

    for (const roundTripHtml of Array.from(roundTripsHTML)){
      let roundTrip = new RoundTrip();

      // Date of round trip
      try {
        var m = moment(roundTripHtml.previousElementSibling.textContent, " DD MMMM YYYY ","fr");
        roundTrip.date = m.toDate();
      } catch (error) {
        throw "Error when trying to get date of round trip";
      }

      // Type of round trip
      try {
        let travelWay = roundTripHtml.getElementsByClassName("travel-way")[0].textContent;


        switch (roundTripHtml.getElementsByClassName("travel-way")[0].textContent) {
          case " Aller ":
            roundTrip.type = "Aller"
            break;
  
          case " Retour ":
            roundTrip.type = "Retour"
            break;
  
          default:
            throw "Invalid type of round trip: \"" + roundTripHtml.getElementsByClassName("travel-way")[0].textContent +"\"";
            break;
        }
      } catch (error) {
        throw "Error when trying to resolve type of round trip";
       
      }

      // Get train information

      // FIXME: we only manage one train in a roundTrip, contrary to the model that allow to manage several train in a round trip.
      //        Need example to address this case
      let train = new Train();
      roundTrip.trains.push(train);


      // Get departure time
      try {
        train.departureTime =  roundTripHtml.getElementsByClassName("origin-destination-hour segment-departure")[0].textContent;
        train.departureTime = this.cleanTextContent(train.departureTime.toString()).replace(/h/, ":");
      } catch (error) {
        throw "Error when trying to resolve departure time";
      }
      
      // Get departure station
      try {
        train.departureStation =  roundTripHtml.getElementsByClassName("origin-destination-station segment-departure")[0].textContent;
      } catch (error) {
        throw "Error when trying to resolve departure station";
      }

      // Get arrival time
      try {
        train.arrivalTime =  roundTripHtml.getElementsByClassName("origin-destination-border origin-destination-hour segment-arrival")[0].textContent;
        train.arrivalTime = this.cleanTextContent(train.arrivalTime.toString()).replace(/h/, ":");
      } catch (error) {
        throw "Error when trying to resolve arrival time";
      }

      // Get arrival station
      try {
        train.arrivalStation =  roundTripHtml.getElementsByClassName("origin-destination-border origin-destination-station segment-arrival")[0].textContent;
      } catch (error) {
        throw "Error when trying to resolve arrival station";
      }
      
      // Get train type and number
      try {
        let trainTypeAndNumberElement = roundTripHtml.getElementsByClassName("segment");
        switch (trainTypeAndNumberElement[0].textContent) {
          case " TGV ":
            train.type = "TGV";
            break;
        
          default:
            throw "Invalid type of train: \"" + trainTypeAndNumberElement[0].textContent +"\"";
        }

        train.number = this.cleanTextContent(trainTypeAndNumberElement[1].textContent);

      } catch (error) {
        throw "Error when trying to resolve type or number of train with a departure at \"" + train.departureTime + "\" from \"" +  train.departureStation + "\"";
      }

      // Load passengers
      try {
        let passengersHtml = roundTripHtml.nextElementSibling;

        // Get all passengers typology (including age)

        let passengersAges = passengersHtml.getElementsByClassName("typology");

        // Get all passengers ages 
        let passengersTypes = passengersHtml.getElementsByClassName("fare-detailsstyle=");

        for(let i=0; i<passengersAges.length; i++){
          let passengerAge = passengersAges[i];
          
          let passengerType = passengersTypes[i];
          
          let passenger = new Passenger();
          train.passengers.push(passenger);
          
          // Set age of passenger
          if (passengerAge.textContent.indexOf("26 à 59 ans") != -1){
            passenger.age = "(26 à 59 ans)"
          }
          else if(passengerAge.textContent.indexOf("4 à 11 ans") != -1){
            passenger.age = "(4 à 11 ans)"
          }
          else if(passengerAge.textContent.indexOf("0 à 3 ans") != -1){
            passenger.age = "(0 à 3 ans)"
          }
          else {
            throw "Unable to find age for passengers. Founded age of passenger is: \"" + passengerAge + "\"";
          }

          // Set type of passenger
          if (passengerType.textContent.indexOf("Billet échangeable") != -1){
            passenger.type = "échangeable";
          }
          else if (passengerType.textContent.indexOf("Billet non échangeable") != -1){
            passenger.type = "non échangeable";
          }
          else {
            throw "Unable to find age for passengers. Founded type of passenger is: \"" + passengerAge + "\"";
          }
          
        }

      } catch (error) {
        throw "Error when trying to resolve passengers of train with a departure at \"" + train.departureTime + "\" from \"" +  train.departureStation + "\"";
      }
      
      trip.details.roundTrips.push(roundTrip);
    }
    return order;
  }
}
