// src/models/liftModels.js

export class Lift {
    constructor(name, maxWeight) {
      this.name = name;
      this.maxWeight = maxWeight;
    }
  }
  
  export class WorkSet {
    constructor(repLift1, repLift2, repLift3, reps1, reps2, reps3) {
      this.repLift1 = repLift1;
      this.repLift2 = repLift2;
      this.repLift3 = repLift3;
      this.reps1 = reps1;
      this.reps2 = reps2;
      this.reps3 = reps3;
    }
  }
  
  export class TrackingLift {
    constructor(lift, date = new Date().toLocaleDateString(), id = null) {
      if (!(lift instanceof Lift)) {
        throw new Error("TrackingLift constructor expects a Lift instance for 'lift'.");
      }
      this.id = id; // This will be null initially, then populated after DB insert
      this.lift = lift;
      this.date = date;
    }
  }