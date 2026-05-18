// demo-data.js — Admin demo data (Batcave edition 🦇)
// Only visible in the admin account (speterson1477@gmail.com).
// isDemo:true on all objects ensures they are never written to Supabase/IndexedDB.

// ─────────────────────────────────────────────────────────────
// PROJECT
// ─────────────────────────────────────────────────────────────
const DEMO_PROJECTS = [
  {
    id: 'proj-004', isDemo: true,
    name: "Batman's Batcave Expansion",
    client: 'Wayne Enterprises',
    contractValue: '$890,000,000',
    contractType: 'GMP',
    location: 'Gotham City, NJ',
    startDate: '2024-05-01',
    plannedFinish: '2026-10-31',
    status: 'active',
    tags: ['🦇 High-Tech', '🏗️ Underground', '⚠️ At Risk'],
    description: 'Complete modernization of the subterranean facility beneath Wayne Manor — expanding from 3 to 12 operational levels with a new Batmobile vault, advanced computer core, medical bay, and trophy room.',
    uploads: 7,
    latestScore: 74,
    latestScoreRag: 'amber',
    createdAt: '2024-04-15',
    updatedAt: '2025-11-15'
  }
];

// ─────────────────────────────────────────────────────────────
// SCHEDULE VERSIONS  (isDemo:true + isReal:true so comparison works)
// ─────────────────────────────────────────────────────────────
const DEMO_SCHEDULE_VERSIONS = [
  { id: 'vb1', projectId: 'proj-004', isDemo: true, isReal: true, version: 'Baseline', dataDate: '2024-05-01', uploadDate: '2024-05-06', filename: 'Batcave_Baseline.xer',  overallScore: 88, activityCount: 1105, relationshipCount: 12840, milestoneCount: 42, plannedFinish: '2026-10-31', criticalPath: { projectDuration: 640 }, status: 'published' },
  { id: 'vb2', projectId: 'proj-004', isDemo: true, isReal: true, version: 'Update 1', dataDate: '2024-08-01', uploadDate: '2024-08-07', filename: 'Batcave_Update1.xer',   overallScore: 84, activityCount: 1118, relationshipCount: 12990, milestoneCount: 43, plannedFinish: '2026-11-14', criticalPath: { projectDuration: 655 }, status: 'published' },
  { id: 'vb3', projectId: 'proj-004', isDemo: true, isReal: true, version: 'Update 2', dataDate: '2024-11-01', uploadDate: '2024-11-08', filename: 'Batcave_Update2.xer',   overallScore: 79, activityCount: 1136, relationshipCount: 13120, milestoneCount: 44, plannedFinish: '2026-12-05', criticalPath: { projectDuration: 672 }, status: 'published' },
  { id: 'vb4', projectId: 'proj-004', isDemo: true, isReal: true, version: 'Update 3', dataDate: '2025-02-01', uploadDate: '2025-02-09', filename: 'Batcave_Update3.xer',   overallScore: 71, activityCount: 1194, relationshipCount: 13340, milestoneCount: 45, plannedFinish: '2026-12-19', criticalPath: { projectDuration: 710 }, status: 'published' },
  { id: 'vb5', projectId: 'proj-004', isDemo: true, isReal: true, version: 'Update 4', dataDate: '2025-05-01', uploadDate: '2025-05-08', filename: 'Batcave_Update4.xer',   overallScore: 65, activityCount: 1221, relationshipCount: 13510, milestoneCount: 46, plannedFinish: '2027-02-10', criticalPath: { projectDuration: 748 }, status: 'published' },
  { id: 'vb6', projectId: 'proj-004', isDemo: true, isReal: true, version: 'Update 5', dataDate: '2025-08-01', uploadDate: '2025-08-07', filename: 'Batcave_Update5.xer',   overallScore: 69, activityCount: 1238, relationshipCount: 13580, milestoneCount: 46, plannedFinish: '2027-01-15', criticalPath: { projectDuration: 520 }, status: 'published' },
  { id: 'vb7', projectId: 'proj-004', isDemo: true, isReal: true, version: 'Update 6', dataDate: '2025-11-01', uploadDate: '2025-11-08', filename: 'Batcave_Update6.xer',   overallScore: 74, activityCount: 1247, relationshipCount: 13640, milestoneCount: 47, plannedFinish: '2026-12-19', criticalPath: { projectDuration: 495 }, status: 'current' }
];

// ─────────────────────────────────────────────────────────────
// CATEGORY SCORES  — latest version (Update 6)
// weighted overall: 70×.25 + 76×.20 + 78×.15 + 68×.15 + 72×.15 + 80×.10 = 73.7 ≈ 74
// ─────────────────────────────────────────────────────────────
const DEMO_CATEGORY_SCORES = {
  'proj-004': {
    logicQuality:            { score: 70, weight: 0.25, label: 'Logic Quality' },
    criticalPathReliability: { score: 76, weight: 0.20, label: 'Critical Path Reliability' },
    dateIntegrity:           { score: 78, weight: 0.15, label: 'Date Integrity' },
    constraintsFloat:        { score: 68, weight: 0.15, label: 'Constraints & Float' },
    progressRealism:         { score: 72, weight: 0.15, label: 'Progress Realism' },
    activityHygiene:         { score: 80, weight: 0.10, label: 'Activity Hygiene' }
  }
};

// ─────────────────────────────────────────────────────────────
// DIAGNOSTICS
// ─────────────────────────────────────────────────────────────
const DEMO_DIAGNOSTICS = {
  'proj-004': [
    {
      id: 'db001', category: 'Logic Quality', severity: 'critical',
      ruleKey: 'OPEN_ENDS_PREDECESSOR', dcmaPoint: 1,
      title: 'Activities Missing Predecessor Logic',
      description: 'Activities across the Level 4–7 cave expansion have no predecessor relationships, likely added during the emergency re-scope following the Level 5 partial cave-in and never integrated into the network.',
      count: 52, totalActivities: 1247, percent: 4.2, penalty: 9.1,
      recommendation: 'Prioritize Level 4–7 WBS activities for a logic review session. Add FS relationships to all cave reinforcement and MEP rough-in tasks. Target resolution within the next update cycle.',
      activities: [
        { id: 'BC1041', name: 'Install Batmobile Vault Blast Door - Pair A',    wbs: '3.2.1.1', startDate: '2025-09-01', finishDate: '2025-10-15', float: 0,  isCritical: true  },
        { id: 'BC1078', name: 'Rough-in Computer Core Power Conduits - Row 3',  wbs: '4.1.3.3', startDate: '2025-08-15', finishDate: '2025-09-30', float: -3, isCritical: true  },
        { id: 'BC1102', name: 'Cave Structural Shotcrete - Level 6 East Wall',  wbs: '1.6.2.4', startDate: '2025-07-20', finishDate: '2025-08-10', float: 6,  isCritical: false },
        { id: 'BC1155', name: 'Install Trophy Room Display Cases - Zone B',     wbs: '7.3.2',   startDate: '2025-11-01', finishDate: '2025-11-20', float: 21, isCritical: false },
        { id: 'BC1198', name: 'Medical Bay Surgical Suite Fit-Out',             wbs: '5.2.3.1', startDate: '2025-10-01', finishDate: '2025-11-15', float: 4,  isCritical: false }
      ]
    },
    {
      id: 'db002', category: 'Logic Quality', severity: 'critical',
      ruleKey: 'OPEN_ENDS_SUCCESSOR', dcmaPoint: 2,
      title: 'Activities Missing Successor Logic',
      description: 'Activities with no successor — primarily testing and commissioning tasks that were created without connection to downstream handover or beneficial occupancy milestones.',
      count: 41, totalActivities: 1247, percent: 3.3, penalty: 7.4,
      recommendation: 'Connect all commissioning and testing activities to their respective system complete milestones. Introduce a WBS Level 4 milestone for each major system to act as a logic aggregation point.',
      activities: [
        { id: 'BC2011', name: 'Batmobile Vault Systems Integration Test',  wbs: '3.2.4', startDate: '2025-10-20', finishDate: '2025-10-24', float: 0,  isCritical: true  },
        { id: 'BC2044', name: 'Computer Core Thermal Runaway Test',        wbs: '4.1.5', startDate: '2025-09-05', finishDate: '2025-09-07', float: -3, isCritical: true  },
        { id: 'BC2088', name: 'Emergency Escape Tunnel Ventilation Test',  wbs: '2.7.3', startDate: '2025-12-01', finishDate: '2025-12-03', float: 14, isCritical: false }
      ]
    },
    {
      id: 'db003', category: 'Constraints & Float', severity: 'high',
      ruleKey: 'NEGATIVE_FLOAT', dcmaPoint: 9,
      title: 'Negative Float Activities',
      description: 'Thirty-one activities carry negative total float, concentrated in the Batmobile Vault and Computer Core packages. The Level 5 cave-in (Feb 2025) introduced ~45 days of delay that has propagated through the network.',
      count: 31, totalActivities: 1247, percent: 2.5, penalty: 8.6,
      recommendation: 'Conduct a targeted recovery analysis for the Batmobile Vault and Computer Core work packages. Evaluate opportunities for resource acceleration and parallel sequencing on critical activities.',
      activities: [
        { id: 'BC1041', name: 'Install Batmobile Vault Blast Door - Pair A',    wbs: '3.2.1.1', startDate: '2025-09-01', finishDate: '2025-10-15', float: -6, isCritical: true },
        { id: 'BC1078', name: 'Rough-in Computer Core Power Conduits - Row 3',  wbs: '4.1.3.3', startDate: '2025-08-15', finishDate: '2025-09-30', float: -3, isCritical: true },
        { id: 'BC2044', name: 'Computer Core Thermal Runaway Test',             wbs: '4.1.5',   startDate: '2025-09-05', finishDate: '2025-09-07', float: -3, isCritical: true },
        { id: 'BC3091', name: 'Batmobile Vault Beneficial Occupancy',          wbs: '3.2.6',   startDate: '2025-11-30', finishDate: '2025-11-30', float: -9, isCritical: true },
        { id: 'BC4002', name: 'Primary Power Grid Energisation',               wbs: '6.1.4',   startDate: '2025-12-15', finishDate: '2025-12-15', float: -4, isCritical: true }
      ]
    },
    {
      id: 'db004', category: 'Constraints & Float', severity: 'high',
      ruleKey: 'EXCESSIVE_CONSTRAINTS', dcmaPoint: 6,
      title: 'Excessive Hard Constraints',
      description: "Wayne Enterprises security protocols and Alfred's operational readiness requirements have generated a high volume of hard Must Start On and Finish No Later Than constraints, many of which are driving artificial critical path issues.",
      count: 103, totalActivities: 1247, percent: 8.3, penalty: 6.2,
      recommendation: "Audit all MSO and FNLT constraints with Alfred's facilities team. Document which are genuine operational requirements vs. scheduling preferences. Replace discretionary constraints with SNET.",
      activities: []
    },
    {
      id: 'db005', category: 'Logic Quality', severity: 'high',
      ruleKey: 'EXCESSIVE_LAG', dcmaPoint: 4,
      title: 'Excessive Lag on Relationships',
      description: 'Twenty-eight relationships carry lag values exceeding 15 working days. Many appear to represent procurement lead times for specialised Wayne Enterprises equipment that should be tracked as discrete activities.',
      count: 28, totalActivities: 1247, percent: 2.2, penalty: 4.8,
      recommendation: 'Convert relationships with lag > 15 days into explicit procurement or fabrication activities. This will improve schedule transparency and allow proper resource and cost loading.',
      activities: []
    },
    {
      id: 'db006', category: 'Progress Realism', severity: 'medium',
      ruleKey: 'ACTUAL_DATES_AFTER_DATA_DATE',
      title: 'Actual Dates Beyond Data Date',
      description: 'Nine activities show actual completion dates after the current data date of Nov 1, 2025 — suggesting field progress was entered speculatively or the data date was not updated before submission.',
      count: 9, totalActivities: 1247, percent: 0.7, penalty: 3.1,
      recommendation: 'Advance the data date to the reporting period end date and re-statuse the schedule. Instruct field personnel that actual dates must not be entered for work not yet completed.',
      activities: []
    },
    {
      id: 'db007', category: 'Activity Hygiene', severity: 'medium',
      ruleKey: 'LONG_DURATION', dcmaPoint: 8,
      title: 'Long Duration Activities (>44 Working Days)',
      description: 'Twenty-two activities exceed 44 working days. The cave structural reinforcement and Wayne Manor interface work packages account for the majority.',
      count: 22, totalActivities: 1247, percent: 1.8, penalty: 2.4,
      recommendation: 'Break down Level 6–7 structural reinforcement activities into weekly or bi-weekly work packages. The Wayne Manor tunnel interface should be phased into three distinct areas.',
      activities: []
    },
    {
      id: 'db008', category: 'Critical Path Reliability', severity: 'medium',
      ruleKey: 'NEAR_CRITICAL_DENSITY',
      title: 'High Near-Critical Activity Count',
      description: 'One hundred and eighty-seven activities carry total float between 0 and 15 working days (15.0% of all activities) — well above the 10% DCMA threshold.',
      count: 187, totalActivities: 1247, percent: 15.0, penalty: 4.1,
      recommendation: 'Focus float recovery on the MEP and structural packages in Levels 4–7. Review near-critical activities in the Medical Bay for logic sequencing improvements.',
      activities: []
    }
  ]
};

// ─────────────────────────────────────────────────────────────
// MILESTONES
// ─────────────────────────────────────────────────────────────
const DEMO_MILESTONES = {
  'proj-004': [
    { id: 'mb001', name: 'Cave System Levels 1–3 Structural Complete', plannedDate: '2024-10-01', forecastDate: '2024-10-03', actualDate: '2024-10-03', variance: 2,  status: 'complete',  isCritical: true  },
    { id: 'mb002', name: 'Structural Reinforcement & Shotcrete Complete', plannedDate: '2025-01-15', forecastDate: '2025-01-20', actualDate: '2025-01-22', variance: 7,  status: 'complete',  isCritical: true  },
    { id: 'mb003', name: 'Primary Power Grid Online',           plannedDate: '2025-06-30', forecastDate: '2025-08-07', actualDate: null, variance: 38, status: 'slipping', isCritical: true  },
    { id: 'mb004', name: 'Batmobile Vault Operational',         plannedDate: '2025-09-30', forecastDate: '2025-11-20', actualDate: null, variance: 51, status: 'at_risk',  isCritical: true  },
    { id: 'mb005', name: 'Computer Core Installation Complete', plannedDate: '2025-10-31', forecastDate: '2025-12-03', actualDate: null, variance: 33, status: 'slipping', isCritical: true  },
    { id: 'mb006', name: 'Medical Bay Operational',             plannedDate: '2026-02-28', forecastDate: '2026-03-04', actualDate: null, variance: 4,  status: 'on_track',  isCritical: false },
    { id: 'mb007', name: 'Substantial Completion',              plannedDate: '2026-10-31', forecastDate: '2027-01-11', actualDate: null, variance: 71, status: 'slipping', isCritical: true  }
  ]
};

// ─────────────────────────────────────────────────────────────
// CRITICAL PATH
// ─────────────────────────────────────────────────────────────
const DEMO_CRITICAL_PATH = {
  'proj-004': [
    { id: 'cpb01', name: 'Structural Reinforcement Complete',      duration: 0,  earlyStart: '2025-01-22', earlyFinish: '2025-01-22', float: 0,  isMilestone: true  },
    { id: 'cpb02', name: 'Level 4–7 Cave Excavation',             duration: 55, earlyStart: '2025-01-23', earlyFinish: '2025-04-15', float: 0,  isMilestone: false },
    { id: 'cpb03', name: 'Structural Shotcrete - Levels 4–7',     duration: 40, earlyStart: '2025-04-16', earlyFinish: '2025-06-11', float: 0,  isMilestone: false },
    { id: 'cpb04', name: 'Rough-in Computer Core Power Conduits', duration: 50, earlyStart: '2025-06-12', earlyFinish: '2025-08-20', float: -3, isMilestone: false },
    { id: 'cpb05', name: 'Computer Core Installation Complete',   duration: 0,  earlyStart: '2025-12-03', earlyFinish: '2025-12-03', float: 0,  isMilestone: true  },
    { id: 'cpb06', name: 'Batmobile Vault Blast Door Install',    duration: 45, earlyStart: '2025-09-01', earlyFinish: '2025-10-31', float: -6, isMilestone: false },
    { id: 'cpb07', name: 'Batmobile Vault Operational',           duration: 0,  earlyStart: '2025-11-20', earlyFinish: '2025-11-20', float: 0,  isMilestone: true  },
    { id: 'cpb08', name: 'Primary Power Grid Energisation',       duration: 20, earlyStart: '2025-12-15', earlyFinish: '2026-01-12', float: -4, isMilestone: false },
    { id: 'cpb09', name: 'All-Systems Integration Testing',       duration: 35, earlyStart: '2026-01-13', earlyFinish: '2026-03-04', float: 0,  isMilestone: false },
    { id: 'cpb10', name: 'Substantial Completion',                duration: 0,  earlyStart: '2027-01-11', earlyFinish: '2027-01-11', float: 0,  isMilestone: true  }
  ]
};

// ─────────────────────────────────────────────────────────────
// COMPARISON  (Update 5 → Update 6: a recovery story)
// ─────────────────────────────────────────────────────────────
const DEMO_COMPARISON = {
  'proj-004': {
    baseline: { id: 'vb6', version: 'Update 5', dataDate: '2025-08-01', overallScore: 69 },
    current:  { id: 'vb7', version: 'Update 6', dataDate: '2025-11-01', overallScore: 74 },
    summary: {
      finishDateMovement: -5, criticalPathSlip: -3, scoreChange: 5,
      negativeFloatDelta: -4, activitiesAdded: 18, activitiesDeleted: 7,
      activitiesChanged: 64, logicChanges: 31
    },
    milestoneChanges: [
      { id: 'mb003', name: 'Primary Power Grid Online',           priorForecast: '2025-08-21', currentForecast: '2025-08-07', variance: -14, direction: 'improved' },
      { id: 'mb004', name: 'Batmobile Vault Operational',         priorForecast: '2025-12-08', currentForecast: '2025-11-20', variance: -18, direction: 'improved' },
      { id: 'mb005', name: 'Computer Core Installation Complete', priorForecast: '2025-12-17', currentForecast: '2025-12-03', variance: -14, direction: 'improved' },
      { id: 'mb007', name: 'Substantial Completion',              priorForecast: '2027-01-27', currentForecast: '2027-01-11', variance: -16, direction: 'improved' }
    ],
    activityChanges: [
      { id: 'BC1041', name: 'Install Batmobile Vault Blast Door - Pair A',        changeType: 'date_change', priorStart: '2025-09-15', newStart: '2025-09-01', priorFinish: '2025-11-01', newFinish: '2025-10-15', startVariance: -14, finishVariance: -17, floatChange: 4 },
      { id: 'BC1078', name: 'Rough-in Computer Core Power Conduits - Row 3',      changeType: 'date_change', priorStart: '2025-08-28', newStart: '2025-08-15', priorFinish: '2025-10-14', newFinish: '2025-09-30', startVariance: -13, finishVariance: -14, floatChange: 3 },
      { id: 'BC5001', name: 'Level 5 Emergency Structural Repair - Zone C',       changeType: 'completed',   priorStart: '2025-04-01', newStart: '2025-04-01', priorFinish: '2025-07-31', newFinish: '2025-07-25', startVariance: 0, finishVariance: -7, floatChange: 0 }
    ]
  }
};

// ─────────────────────────────────────────────────────────────
// SCORE HISTORY  (88 → 84 → 79 → 71 → 65 → 69 → 74)
// ─────────────────────────────────────────────────────────────
const DEMO_SCORE_HISTORY = {
  'proj-004': [
    { version: 'Baseline', dataDate: '2024-05-01', overallScore: 88, logicQuality: 90, dateIntegrity: 91, constraintsFloat: 87, activityHygiene: 93, progressRealism: 86, criticalPathReliability: 85 },
    { version: 'Update 1', dataDate: '2024-08-01', overallScore: 84, logicQuality: 86, dateIntegrity: 88, constraintsFloat: 82, activityHygiene: 90, progressRealism: 82, criticalPathReliability: 81 },
    { version: 'Update 2', dataDate: '2024-11-01', overallScore: 79, logicQuality: 81, dateIntegrity: 83, constraintsFloat: 76, activityHygiene: 86, progressRealism: 77, criticalPathReliability: 77 },
    { version: 'Update 3', dataDate: '2025-02-01', overallScore: 71, logicQuality: 72, dateIntegrity: 76, constraintsFloat: 66, activityHygiene: 79, progressRealism: 70, criticalPathReliability: 70 },
    { version: 'Update 4', dataDate: '2025-05-01', overallScore: 65, logicQuality: 63, dateIntegrity: 70, constraintsFloat: 58, activityHygiene: 74, progressRealism: 64, criticalPathReliability: 64 },
    { version: 'Update 5', dataDate: '2025-08-01', overallScore: 69, logicQuality: 67, dateIntegrity: 73, constraintsFloat: 62, activityHygiene: 77, progressRealism: 67, criticalPathReliability: 68 },
    { version: 'Update 6', dataDate: '2025-11-01', overallScore: 74, logicQuality: 70, dateIntegrity: 78, constraintsFloat: 68, activityHygiene: 80, progressRealism: 72, criticalPathReliability: 76 }
  ]
};
