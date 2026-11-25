module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    userProfile: {
      id: 1,
      username: "demo_user",
      email: "demo@herhealth.com",
      firstName: "Sophia",
      lastName: "Jenkins",
      dateOfBirth: "1996-05-14"
    },
    periodSummary: {
      averageCycleLengthDays: 28,
      averagePeriodDurationDays: 5,
      estimatedNextPeriodStart: "2026-12-15",
      medicalDisclaimer: "Cycle calculation is an estimate derived from your logged history. It is for tracking purposes only and not a medical prediction."
    },
    waterProgress: {
      date: new Date().toISOString().split("T")[0],
      currentAmountMl: 1500,
      dailyGoalMl: 2000,
      percentageCompleted: 75,
      goalReached: false
    },
    latestWellness: {
      id: 1,
      recordDate: new Date().toISOString().split("T")[0],
      mood: "Calm & Grounded",
      sleepHours: 7.50,
      sleepQuality: 4,
      stressLevel: 2,
      wellnessNotes: "Practiced 15 minutes of guided mindfulness."
    },
    recentSymptoms: [
      {
        id: 1,
        recordDate: new Date().toISOString().split("T")[0],
        symptomType: "Pelvic Pain & Cramping",
        severityScale: 3,
        painLevel: 3,
        energyLevel: 3,
        dailyObservations: "Mild cramping"
      }
    ],
    cyclePhaseAdvice: "Nurture your body with gentle hydration, balanced whole foods, and restorative rest."
  });
};
