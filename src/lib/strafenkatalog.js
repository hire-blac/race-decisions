const STRAFENKATALOG = [
  { 
    cause: "Causing a collision (avoidable - both continue & no advantage)", 
    penalty: {
      training: "No penalty" ,
      qualifying: "No penalty" ,
      race: "Warning - Black/white" 
    }
  },
  { 
    cause: "Causing a collision (avoidable - both continue & gaining  advantage)",
    penalty: {
      training: "No penalty" ,
      qualifying: "No penalty" ,
      race: "Change of position or min. 10 sec time penalty"  
    }
  },
  { 
    cause: "Causing a collision (avoidable - other driver hast to stop)",
    penalty: {
      training: "No penalty" ,
      qualifying: "No penalty" ,
      race: "Drive through"  
    }
  },
  { 
    cause: "Forcing another driver off track (no advantage)", 
    penalty: {
      training: "Warning - Black/white" ,
      qualifying: "Warning - Black/white" ,
      race: "Warning - Black/white"  
    }
  },
  { 
    cause: "Forcing another driver off track (gaining advantage)",
    penalty: {
      training: "No penalty" ,
      qualifying: "No penalty" ,
      race: "Change of position or time penalty"  
    }
  },
  { 
    cause: "Forcing another driver off track dangerously",
    penalty: {
      training: "Grid penalty +3" ,
      qualifying: "Grid penalty +3" ,
      race: "Min. 10 sec time penalty"  
    }
  },
  { 
    cause: "Leaving the pit under red light",
    penalty: {
      training: "Grid penalty +5" ,
      qualifying: "Grid penalty +5" ,
      race: "Drive through"  
    }
  },
  { 
    cause: "Crossing white line pit exit",
    penalty: {
      training: "Warning - Black/white" ,
      qualifying: "Warning - Black/white" ,
      race: "Warning - Black/white"  
    } 
  },
  { 
    cause: "Crossing white line pit exit in case of recurrence",
    penalty: {
      training: "Grid penalty +3" ,
      qualifying: "Grid penalty +3" ,
      race: "Drive through"  
    }
  },
  { 
    cause: "Leaving the track and gaining an advantage (1st time)",

    penalty: {
      training: "No penalty" ,
      qualifying: "Cancellation of relevant lap time" ,
      race: "Change of position"  
    }
  },
  { 
    cause: "Leaving the track and gaining an advantage (2nd time)",
    penalty: {
      training: "No penalty" ,
      qualifying: "Cancellation of relevant lap time" ,
      race: "Change of position or time penalty +5 sec"  
    }
  },
  { 
    cause: "Leaving the track and gaining an advantage (3rd time)",

    penalty: {
      training: "Warning - Black/white" ,
      qualifying: "Cancellation of relevant lap time & Warning - Black/white" ,
      race: "Change of position or time penalty +5 sec"  
    }
  },
  { 
    cause: "Jump start (but stops)",
    penalty: {
      training: "No penalty" ,
      qualifying: "No penalty" ,
      race: "5 sec time penalty"  
    }
  },
  { 
    cause: "Jump start (don't stop)",
    penalty: {
      training: "No penalty" ,
      qualifying: "No penalty" ,
      race: "10 sec time penalty"  
    }
  },
  { 
    cause: "Inaccurate grid position",
    penalty: {
      training: "No penalty" ,
      qualifying: "No penalty" ,
      race: "5 sec time penalty"  
    }
  },
  { 
    cause: "Unsporting behaviour",
    penalty: {
      training: "Reported to the stewards" ,
      qualifying: "Reported to the stewards" ,
      race: "Reported to the stewards" 
    }
  },
];

export default STRAFENKATALOG;
