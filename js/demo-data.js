// demo-data.js — Admin demo data (superhero edition 🦸🦇)
// These projects only appear in the admin account (speterson1477@gmail.com).
// All data is keyed by project.id so each project shows its own unique story.

// ─────────────────────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────────────────────
const DEMO_PROJECTS = [
  {
    id: 'proj-001',
    name: "Iron Man's Stark Tower Rebuild",
    client: 'Stark Industries',
    contractValue: '$4,200,000,000',
    contractType: 'GMP',
    location: 'New York, NY',
    startDate: '2024-03-01',
    plannedFinish: '2026-08-31',
    status: 'active',
    tags: ['⚙️ Tech', '🏙️ High-Rise', '🔴 Critical'],
    description: 'Full rebuild of Stark Tower following Avengers incident — 93 floors, arc-reactor power grid, and a rooftop landing pad rated for Mark L armour.',
    uploads: 8,
    latestScore: 71,
    latestScoreRag: 'amber',
    createdAt: '2024-02-15',
    updatedAt: '2026-04-01'
  },
  {
    id: 'proj-002',
    name: "Captain America's Super-Soldier Bunker",
    client: 'S.H.I.E.L.D.',
    contractValue: '$920,000,000',
    contractType: 'DBB',
    location: 'Washington, DC',
    startDate: '2025-01-15',
    plannedFinish: '2026-12-31',
    status: 'active',
    tags: ['🛡️ Defence', '🏛️ Government', '⭐ Federal'],
    description: 'Underground facility hardened to withstand vibranium-grade impact — 6 subterranean levels, classified training range, and a shield-polishing suite.',
    uploads: 4,
    latestScore: 87,
    latestScoreRag: 'green',
    createdAt: '2024-12-01',
    updatedAt: '2026-03-15'
  },
  {
    id: 'proj-003',
    name: "Thor's Bifrost Terminal & Asgardian Embassy",
    client: 'Asgardian Royal Council',
    contractValue: '$999,000,000',
    contractType: 'CM at Risk',
    location: 'Puente Antiguo, NM',
    startDate: '2024-09-01',
    plannedFinish: '2026-06-30',
    status: 'active',
    tags: ['🌈 Intergalactic', '🏛️ Cultural', '⚡ High-Voltage'],
    description: 'Mixed-realm terminal with rainbow-bridge docking bay, 18 diplomatic suites, enchanted hammer storage, and a ground-floor Pop-Tart café.',
    uploads: 6,
    latestScore: 58,
    latestScoreRag: 'red',
    createdAt: '2024-08-01',
    updatedAt: '2026-04-05'
  },
  {
    id: 'proj-004',
    name: "Batman's Batcave Expansion",
    client: 'Wayne Enterprises',
    contractValue: '$890,000,000',
    contractType: 'GMP',
    location: 'Gotham City, NJ',
    startDate: '2024-05-01',
    plannedFinish: '2026-10-31',
    status: 'active',
    tags: ['🦇 High-Tech', '🏗️ Underground', '⚠️ At Risk'],
    description: 'Complete modernization of the subterranean facility beneath Wayne Manor — expanding from 3 to 12 operational levels, including a new Batmobile vault, advanced computer core, medical bay, and trophy room.',
    uploads: 7,
    latestScore: 74,
    latestScoreRag: 'amber',
    createdAt: '2024-04-15',
    updatedAt: '2025-11-15'
  }
];

// ─────────────────────────────────────────────────────────────
// SCHEDULE VERSIONS  (all projects combined)
// ─────────────────────────────────────────────────────────────
const DEMO_SCHEDULE_VERSIONS = [
  // ── Stark Tower (proj-001) ──
  { id: 'v1', projectId: 'proj-001', version: 'Baseline', dataDate: '2024-03-01', uploadDate: '2024-03-05', filename: 'StarkTower_Baseline.xer',  overallScore: 82, activityCount: 1210, relationshipCount: 14820, milestoneCount: 48, status: 'published' },
  { id: 'v2', projectId: 'proj-001', version: 'Update 1', dataDate: '2024-06-01', uploadDate: '2024-06-10', filename: 'StarkTower_Update1.xer',   overallScore: 79, activityCount: 1228, relationshipCount: 14970, milestoneCount: 49, status: 'published' },
  { id: 'v3', projectId: 'proj-001', version: 'Update 2', dataDate: '2024-09-01', uploadDate: '2024-09-08', filename: 'StarkTower_Update2.xer',   overallScore: 76, activityCount: 1245, relationshipCount: 15060, milestoneCount: 50, status: 'published' },
  { id: 'v4', projectId: 'proj-001', version: 'Update 3', dataDate: '2024-12-01', uploadDate: '2024-12-09', filename: 'StarkTower_Update3.xer',   overallScore: 74, activityCount: 1258, relationshipCount: 15130, milestoneCount: 50, status: 'published' },
  { id: 'v5', projectId: 'proj-001', version: 'Update 4', dataDate: '2025-03-01', uploadDate: '2025-03-07', filename: 'StarkTower_Update4.xer',   overallScore: 73, activityCount: 1263, relationshipCount: 15131, milestoneCount: 50, status: 'published' },
  { id: 'v6', projectId: 'proj-001', version: 'Update 5', dataDate: '2025-06-01', uploadDate: '2025-06-06', filename: 'StarkTower_Update5.xer',   overallScore: 70, activityCount: 1270, relationshipCount: 15131, milestoneCount: 50, status: 'published' },
  { id: 'v7', projectId: 'proj-001', version: 'Update 6', dataDate: '2025-09-01', uploadDate: '2025-09-05', filename: 'StarkTower_Update6.xer',   overallScore: 72, activityCount: 4629, relationshipCount: 15131, milestoneCount: 500, plannedFinish: '2026-10-21', criticalPath: { projectDuration: 580 }, status: 'published' },
  { id: 'v8', projectId: 'proj-001', version: 'Update 7', dataDate: '2026-01-01', uploadDate: '2026-01-10', filename: 'StarkTower_Update7.xer',   overallScore: 71, activityCount: 4698, relationshipCount: 15605, milestoneCount: 502, plannedFinish: '2026-11-14', criticalPath: { projectDuration: 549 }, status: 'current' },

  // ── Captain America Bunker (proj-002) ──
  { id: 'vc1', projectId: 'proj-002', version: 'Baseline', dataDate: '2025-01-15', uploadDate: '2025-01-20', filename: 'SoldierBunker_Baseline.xer', overallScore: 91, activityCount: 412, relationshipCount: 4810, milestoneCount: 18, status: 'published' },
  { id: 'vc2', projectId: 'proj-002', version: 'Update 1', dataDate: '2025-04-15', uploadDate: '2025-04-20', filename: 'SoldierBunker_Update1.xer',  overallScore: 89, activityCount: 425, relationshipCount: 4930, milestoneCount: 18, status: 'published' },
  { id: 'vc3', projectId: 'proj-002', version: 'Update 2', dataDate: '2025-07-15', uploadDate: '2025-07-22', filename: 'SoldierBunker_Update2.xer',  overallScore: 87, activityCount: 438, relationshipCount: 5010, milestoneCount: 19, status: 'published' },
  { id: 'vc4', projectId: 'proj-002', version: 'Update 3', dataDate: '2025-10-15', uploadDate: '2025-10-21', filename: 'SoldierBunker_Update3.xer',  overallScore: 87, activityCount: 451, relationshipCount: 5090, milestoneCount: 19, plannedFinish: '2026-12-31', criticalPath: { projectDuration: 440 }, status: 'current' },

  // ── Thor Bifrost (proj-003) ──
  { id: 'vt1', projectId: 'proj-003', version: 'Baseline', dataDate: '2024-09-01', uploadDate: '2024-09-08', filename: 'Bifrost_Baseline.xer', overallScore: 74, activityCount: 690, relationshipCount: 7200, milestoneCount: 28, status: 'published' },
  { id: 'vt2', projectId: 'proj-003', version: 'Update 1', dataDate: '2024-12-01', uploadDate: '2024-12-10', filename: 'Bifrost_Update1.xer',  overallScore: 69, activityCount: 712, relationshipCount: 7350, milestoneCount: 29, status: 'published' },
  { id: 'vt3', projectId: 'proj-003', version: 'Update 2', dataDate: '2025-03-01', uploadDate: '2025-03-09', filename: 'Bifrost_Update2.xer',  overallScore: 64, activityCount: 735, relationshipCount: 7480, milestoneCount: 30, status: 'published' },
  { id: 'vt4', projectId: 'proj-003', version: 'Update 3', dataDate: '2025-06-01', uploadDate: '2025-06-07', filename: 'Bifrost_Update3.xer',  overallScore: 61, activityCount: 748, relationshipCount: 7510, milestoneCount: 30, status: 'published' },
  { id: 'vt5', projectId: 'proj-003', version: 'Update 4', dataDate: '2025-09-01', uploadDate: '2025-09-06', filename: 'Bifrost_Update4.xer',  overallScore: 58, activityCount: 761, relationshipCount: 7540, milestoneCount: 31, status: 'published' },
  { id: 'vt6', projectId: 'proj-003', version: 'Update 5', dataDate: '2025-12-01', uploadDate: '2025-12-09', filename: 'Bifrost_Update5.xer',  overallScore: 58, activityCount: 774, relationshipCount: 7560, milestoneCount: 31, plannedFinish: '2026-09-15', criticalPath: { projectDuration: 290 }, status: 'current' },

  // ── Batman's Batcave (proj-004) ──
  { id: 'vb1', projectId: 'proj-004', version: 'Baseline', dataDate: '2024-05-01', uploadDate: '2024-05-06', filename: 'Batcave_Baseline.xer',  overallScore: 88, activityCount: 1105, relationshipCount: 12840, milestoneCount: 42, status: 'published' },
  { id: 'vb2', projectId: 'proj-004', version: 'Update 1', dataDate: '2024-08-01', uploadDate: '2024-08-07', filename: 'Batcave_Update1.xer',   overallScore: 84, activityCount: 1118, relationshipCount: 12990, milestoneCount: 43, status: 'published' },
  { id: 'vb3', projectId: 'proj-004', version: 'Update 2', dataDate: '2024-11-01', uploadDate: '2024-11-08', filename: 'Batcave_Update2.xer',   overallScore: 79, activityCount: 1136, relationshipCount: 13120, milestoneCount: 44, status: 'published' },
  { id: 'vb4', projectId: 'proj-004', version: 'Update 3', dataDate: '2025-02-01', uploadDate: '2025-02-09', filename: 'Batcave_Update3.xer',   overallScore: 71, activityCount: 1194, relationshipCount: 13340, milestoneCount: 45, status: 'published' },
  { id: 'vb5', projectId: 'proj-004', version: 'Update 4', dataDate: '2025-05-01', uploadDate: '2025-05-08', filename: 'Batcave_Update4.xer',   overallScore: 65, activityCount: 1221, relationshipCount: 13510, milestoneCount: 46, status: 'published' },
  { id: 'vb6', projectId: 'proj-004', version: 'Update 5', dataDate: '2025-08-01', uploadDate: '2025-08-07', filename: 'Batcave_Update5.xer',   overallScore: 69, activityCount: 1238, relationshipCount: 13580, milestoneCount: 46, plannedFinish: '2027-01-15', criticalPath: { projectDuration: 520 }, status: 'published' },
  { id: 'vb7', projectId: 'proj-004', version: 'Update 6', dataDate: '2025-11-01', uploadDate: '2025-11-08', filename: 'Batcave_Update6.xer',   overallScore: 74, activityCount: 1247, relationshipCount: 13640, milestoneCount: 47, plannedFinish: '2026-12-19', criticalPath: { projectDuration: 495 }, status: 'current' }
];

// ─────────────────────────────────────────────────────────────
// CATEGORY SCORES  — keyed by project.id (latest version)
// ─────────────────────────────────────────────────────────────
const DEMO_CATEGORY_SCORES = {
  'proj-001': {
    logicQuality:            { score: 68, weight: 0.25, label: 'Logic Quality' },
    dateIntegrity:           { score: 74, weight: 0.15, label: 'Date Integrity' },
    constraintsFloat:        { score: 65, weight: 0.15, label: 'Constraints & Float' },
    activityHygiene:         { score: 78, weight: 0.10, label: 'Activity Hygiene' },
    progressRealism:         { score: 71, weight: 0.15, label: 'Progress Realism' },
    criticalPathReliability: { score: 69, weight: 0.20, label: 'Critical Path Reliability' }
  },
  'proj-002': {
    logicQuality:            { score: 91, weight: 0.25, label: 'Logic Quality' },
    dateIntegrity:           { score: 90, weight: 0.15, label: 'Date Integrity' },
    constraintsFloat:        { score: 88, weight: 0.15, label: 'Constraints & Float' },
    activityHygiene:         { score: 93, weight: 0.10, label: 'Activity Hygiene' },
    progressRealism:         { score: 86, weight: 0.15, label: 'Progress Realism' },
    criticalPathReliability: { score: 83, weight: 0.20, label: 'Critical Path Reliability' }
  },
  'proj-003': {
    logicQuality:            { score: 52, weight: 0.25, label: 'Logic Quality' },
    dateIntegrity:           { score: 61, weight: 0.15, label: 'Date Integrity' },
    constraintsFloat:        { score: 49, weight: 0.15, label: 'Constraints & Float' },
    activityHygiene:         { score: 68, weight: 0.10, label: 'Activity Hygiene' },
    progressRealism:         { score: 57, weight: 0.15, label: 'Progress Realism' },
    criticalPathReliability: { score: 55, weight: 0.20, label: 'Critical Path Reliability' }
  },
  'proj-004': {
    logicQuality:            { score: 70, weight: 0.25, label: 'Logic Quality' },
    dateIntegrity:           { score: 78, weight: 0.15, label: 'Date Integrity' },
    constraintsFloat:        { score: 68, weight: 0.15, label: 'Constraints & Float' },
    activityHygiene:         { score: 80, weight: 0.10, label: 'Activity Hygiene' },
    progressRealism:         { score: 72, weight: 0.15, label: 'Progress Realism' },
    criticalPathReliability: { score: 76, weight: 0.20, label: 'Critical Path Reliability' }
  }
};

// ─────────────────────────────────────────────────────────────
// DIAGNOSTICS  — keyed by project.id
// ─────────────────────────────────────────────────────────────
const DEMO_DIAGNOSTICS = {

  // ── Stark Tower ──────────────────────────────────────────────
  'proj-001': [
    {
      id: 'd001', category: 'Logic Quality', severity: 'critical',
      ruleKey: 'OPEN_ENDS_PREDECESSOR', dcmaPoint: 1,
      title: 'Activities Missing Predecessor Logic',
      description: 'Activities have no predecessor relationship, creating open-end logic gaps that prevent valid critical path calculation.',
      count: 47, totalActivities: 1284, percent: 3.7, penalty: 8.2,
      recommendation: 'Add finish-to-start relationships from preceding activities or milestones. Focus on Level 3 activities in the MEP and Structural WBS.',
      activities: [
        { id: 'A1042', name: 'Install Arc Reactor Cooling System', wbs: '3.4.2.1', startDate: '2025-08-15', finishDate: '2025-10-30', float: 0,  isCritical: true  },
        { id: 'A1087', name: 'Rough-in Vibranium Shielding - Floor 8', wbs: '3.3.4.8', startDate: '2025-07-01', finishDate: '2025-08-15', float: 4,  isCritical: false },
        { id: 'A1093', name: 'Install Stark Armour Cladding - Levels 12-16', wbs: '2.5.3.2', startDate: '2025-06-20', finishDate: '2025-09-10', float: -2, isCritical: true  },
        { id: 'A1102', name: 'Pour Arc-Reactor Containment Slab - Level 18', wbs: '2.2.4.18', startDate: '2025-09-01', finishDate: '2025-09-22', float: -5, isCritical: true  },
        { id: 'A1115', name: 'Install AI Lab Climate Control - Level 93', wbs: '3.2.1.4', startDate: '2025-11-01', finishDate: '2025-12-15', float: 0,  isCritical: true  }
      ]
    },
    {
      id: 'd002', category: 'Logic Quality', severity: 'critical',
      ruleKey: 'OPEN_ENDS_SUCCESSOR', dcmaPoint: 2,
      title: 'Activities Missing Successor Logic',
      description: 'Activities have no successor relationship, meaning work can extend without impacting any downstream activities.',
      count: 38, totalActivities: 1284, percent: 3.0, penalty: 6.8,
      recommendation: 'Connect these activities to their downstream work packages. Validate that all work feeds into summary milestones or subsequent WBS phases.',
      activities: [
        { id: 'A2011', name: 'Vibranium Tensile Testing - Level 20', wbs: '2.2.4.20', startDate: '2025-10-15', finishDate: '2025-10-17', float: 12, isCritical: false },
        { id: 'A2034', name: 'Survey & Layout - Arc Reactor Penthouse', wbs: '3.1.5', startDate: '2025-10-01', finishDate: '2025-10-05', float: 0,  isCritical: true  }
      ]
    },
    {
      id: 'd003', category: 'Constraints & Float', severity: 'high',
      ruleKey: 'NEGATIVE_FLOAT', dcmaPoint: 9,
      title: 'Negative Float Activities',
      description: 'Activities with negative total float indicate the schedule cannot achieve its planned dates without acceleration or logic changes.',
      count: 23, totalActivities: 1284, percent: 1.8, penalty: 7.4,
      recommendation: 'Investigate constraints driving negative float. Remove non-essential FNLT constraints and verify the data date is set correctly.',
      activities: [
        { id: 'A1093', name: 'Install Stark Armour Cladding - Levels 12-16', wbs: '2.5.3.2', startDate: '2025-06-20', finishDate: '2025-09-10', float: -2, isCritical: true },
        { id: 'A1102', name: 'Pour Arc-Reactor Containment Slab - Level 18', wbs: '2.2.4.18', startDate: '2025-09-01', finishDate: '2025-09-22', float: -5, isCritical: true },
        { id: 'A1201', name: 'Install Repulsor-Lift Elevator - Cab 3', wbs: '4.2.3', startDate: '2025-12-01', finishDate: '2025-12-30', float: -8, isCritical: true }
      ]
    },
    {
      id: 'd004', category: 'Constraints & Float', severity: 'high',
      ruleKey: 'EXCESSIVE_CONSTRAINTS', dcmaPoint: 6,
      title: 'Excessive Hard Constraints',
      description: 'Activities with Must Start On or Finish No Later Than constraints override schedule logic and can mask critical path issues.',
      count: 89, totalActivities: 1284, percent: 6.9, penalty: 5.1,
      recommendation: 'Audit all FNLT and MSO constraints. Replace with soft constraints where possible. Hard constraints should only be used for regulatory or contractual milestone dates.',
      activities: []
    },
    {
      id: 'd005', category: 'Logic Quality', severity: 'high',
      ruleKey: 'EXCESSIVE_LAG', dcmaPoint: 4,
      title: 'Excessive Lag on Relationships',
      description: 'Relationships with lag values exceeding 15 working days may indicate missing activities or hidden work not captured in the schedule.',
      count: 34, totalActivities: 1284, percent: 2.6, penalty: 4.3,
      recommendation: 'Review all relationships with lag > 15 days. Consider breaking into discrete activities if the lag represents real work.',
      activities: []
    },
    {
      id: 'd006', category: 'Activity Hygiene', severity: 'medium',
      ruleKey: 'LONG_DURATION', dcmaPoint: 8,
      title: 'Long Duration Activities (>44 Working Days)',
      description: 'Activities exceeding 44 working days may be too broad and reduce schedule visibility and control.',
      count: 28, totalActivities: 1284, percent: 2.2, penalty: 2.8,
      recommendation: 'Break down activities exceeding 44 working days into measurable work packages to improve earned value accuracy and schedule control.',
      activities: []
    },
    {
      id: 'd007', category: 'Progress Realism', severity: 'medium',
      ruleKey: 'ACTUAL_DATES_AFTER_DATA_DATE',
      title: 'Actual Dates Beyond Data Date',
      description: 'Activities have actual start or finish dates later than the schedule data date, indicating future-dated actuals.',
      count: 12, totalActivities: 1284, percent: 0.9, penalty: 3.2,
      recommendation: 'Verify the data date is set correctly. Review all activities with actual dates > data date and correct or remove erroneous entries.',
      activities: []
    },
    {
      id: 'd008', category: 'Critical Path Reliability', severity: 'medium',
      ruleKey: 'NEAR_CRITICAL_DENSITY',
      title: 'High Near-Critical Activity Count',
      description: 'Activities with total float between 0 and 15 working days represent near-critical risk. Elevated counts signal a fragile schedule.',
      count: 156, totalActivities: 1284, percent: 12.1, penalty: 3.8,
      recommendation: 'Review near-critical activities for logic errors or unnecessary constraints driving float down. Prioritize resource loading for near-critical MEP and interior finish activities.',
      activities: []
    }
  ],

  // ── Captain America Bunker ────────────────────────────────────
  'proj-002': [
    {
      id: 'dc001', category: 'Logic Quality', severity: 'low',
      ruleKey: 'OPEN_ENDS_PREDECESSOR', dcmaPoint: 1,
      title: 'Activities Missing Predecessor Logic',
      description: 'A small number of activities lack predecessor relationships. Overall logic quality is strong but these gaps should be closed.',
      count: 8, totalActivities: 451, percent: 1.8, penalty: 2.1,
      recommendation: 'Review the 8 open-end activities and add appropriate FS or SS relationships. Most appear to be commissioning tasks missing tie-ins to installation complete milestones.',
      activities: [
        { id: 'SC1044', name: 'Commission Blast Door Control System', wbs: '5.3.2', startDate: '2026-08-01', finishDate: '2026-08-15', float: 8, isCritical: false },
        { id: 'SC1078', name: 'Final Shield Rack Calibration', wbs: '4.2.1', startDate: '2026-09-10', finishDate: '2026-09-14', float: 12, isCritical: false }
      ]
    },
    {
      id: 'dc002', category: 'Constraints & Float', severity: 'medium',
      ruleKey: 'EXCESSIVE_CONSTRAINTS', dcmaPoint: 6,
      title: 'Excessive Hard Constraints',
      description: 'Federal security compliance milestones have generated a cluster of hard Must Finish On constraints.',
      count: 19, totalActivities: 451, percent: 4.2, penalty: 3.5,
      recommendation: 'Confirm which hard constraints are contractually mandated federal milestones vs. scheduler preferences. Replace discretionary FNLT constraints with SNET where possible.',
      activities: []
    },
    {
      id: 'dc003', category: 'Activity Hygiene', severity: 'low',
      ruleKey: 'LONG_DURATION', dcmaPoint: 8,
      title: 'Long Duration Activities (>44 Working Days)',
      description: 'A few classified procurement activities exceed the recommended 44-working-day threshold.',
      count: 5, totalActivities: 451, percent: 1.1, penalty: 1.2,
      recommendation: 'Where classification allows, break procurement activities into discrete phases (award, shop drawings, fabrication, delivery) to improve schedule visibility.',
      activities: []
    }
  ],

  // ── Thor Bifrost ──────────────────────────────────────────────
  'proj-003': [
    {
      id: 'dt001', category: 'Logic Quality', severity: 'critical',
      ruleKey: 'OPEN_ENDS_PREDECESSOR', dcmaPoint: 1,
      title: 'Activities Missing Predecessor Logic',
      description: 'A high volume of activities lack predecessor relationships — the interdimensional nature of the project has made standard scheduling conventions difficult to enforce.',
      count: 74, totalActivities: 774, percent: 9.6, penalty: 14.2,
      recommendation: 'Engage the Asgardian technical advisor to clarify construction sequence for non-Midgard work packages. Impose a logic gate at the WBS Level 3 review.',
      activities: [
        { id: 'BF2201', name: 'Install Rainbow Bridge Chromatic Emitters', wbs: '2.1.3', startDate: '2025-10-01', finishDate: '2025-12-15', float: -12, isCritical: true },
        { id: 'BF2245', name: 'Asgardian Runestone Placement - Zone A', wbs: '2.2.1', startDate: '2025-09-15', finishDate: '2025-10-30', float: -8, isCritical: true },
        { id: 'BF3010', name: 'Enchanted Concrete Cure - Level 4 Slab', wbs: '1.4.2', startDate: '2025-11-01', finishDate: '2025-11-22', float: 0, isCritical: true }
      ]
    },
    {
      id: 'dt002', category: 'Logic Quality', severity: 'critical',
      ruleKey: 'OPEN_ENDS_SUCCESSOR', dcmaPoint: 2,
      title: 'Activities Missing Successor Logic',
      description: 'Activities with no successors — predominately Asgardian craft-specific tasks that were added without integration into the baseline network.',
      count: 61, totalActivities: 774, percent: 7.9, penalty: 12.4,
      recommendation: 'Require all new activity additions to pass a logic-gate QC check. Connect orphan tasks to their downstream work packages or project finish milestone.',
      activities: [
        { id: 'BF4411', name: 'Bifrost Alignment Calibration - Phase 2', wbs: '3.4.1', startDate: '2025-12-01', finishDate: '2025-12-10', float: 0, isCritical: true }
      ]
    },
    {
      id: 'dt003', category: 'Constraints & Float', severity: 'critical',
      ruleKey: 'NEGATIVE_FLOAT', dcmaPoint: 9,
      title: 'Negative Float Activities',
      description: 'Over 10% of activities carry negative float, reflecting an unrealistic schedule that cannot meet current milestone targets without significant recovery action.',
      count: 87, totalActivities: 774, percent: 11.2, penalty: 15.0,
      recommendation: 'Conduct a full schedule recovery workshop. Identify the top 10 negative-float drivers and develop a recovery plan addressing logic errors, constraint removal, and resource acceleration.',
      activities: [
        { id: 'BF2201', name: 'Install Rainbow Bridge Chromatic Emitters', wbs: '2.1.3', startDate: '2025-10-01', finishDate: '2025-12-15', float: -12, isCritical: true },
        { id: 'BF2245', name: 'Asgardian Runestone Placement - Zone A', wbs: '2.2.1', startDate: '2025-09-15', finishDate: '2025-10-30', float: -8, isCritical: true },
        { id: 'BF5501', name: 'Bifrost Terminal Substantial Completion', wbs: '6.1', startDate: '2026-09-15', finishDate: '2026-09-15', float: -21, isCritical: true }
      ]
    },
    {
      id: 'dt004', category: 'Progress Realism', severity: 'high',
      ruleKey: 'ACTUAL_DATES_AFTER_DATA_DATE',
      title: 'Actual Dates Beyond Data Date',
      description: 'Activities show actuals recorded after the schedule data date, suggesting the data date has not been updated or progress was entered speculatively.',
      count: 34, totalActivities: 774, percent: 4.4, penalty: 7.8,
      recommendation: 'Advance the data date to the current reporting period and re-run the schedule. Remove any speculative future actuals entered by field personnel.',
      activities: []
    },
    {
      id: 'dt005', category: 'Critical Path Reliability', severity: 'high',
      ruleKey: 'NEAR_CRITICAL_DENSITY',
      title: 'High Near-Critical Activity Count',
      description: 'Nearly one-quarter of all activities have less than 15 days of float, creating a very high probability of further schedule slippage.',
      count: 189, totalActivities: 774, percent: 24.4, penalty: 8.3,
      recommendation: 'Prioritize float recovery in the MEP and Bifrost alignment work packages. Consider parallel-pathing installation sequences where Asgardian safety protocols permit.',
      activities: []
    },
    {
      id: 'dt006', category: 'Activity Hygiene', severity: 'high',
      ruleKey: 'LONG_DURATION', dcmaPoint: 8,
      title: 'Long Duration Activities (>44 Working Days)',
      description: 'Inter-realm procurement and enchantment activities routinely exceed 44 working days without sub-task breakdown.',
      count: 41, totalActivities: 774, percent: 5.3, penalty: 6.1,
      recommendation: 'Break down long procurement cycles into award, fabrication, transport, and delivery phases. Enchantment curing activities should be tracked at weekly increments.',
      activities: []
    }
  ],

  // ── Batman's Batcave ──────────────────────────────────────────
  'proj-004': [
    {
      id: 'db001', category: 'Logic Quality', severity: 'critical',
      ruleKey: 'OPEN_ENDS_PREDECESSOR', dcmaPoint: 1,
      title: 'Activities Missing Predecessor Logic',
      description: 'Activities across the Level 4–7 cave expansion have no predecessor relationships, likely added during the emergency re-scope following the Level 5 partial cave-in and never integrated into the network.',
      count: 52, totalActivities: 1247, percent: 4.2, penalty: 9.1,
      recommendation: 'Prioritize Level 4–7 WBS activities for a logic review session. Add FS relationships to all cave reinforcement and MEP rough-in tasks. Target resolution within the next update cycle.',
      activities: [
        { id: 'BC1041', name: 'Install Batmobile Vault Blast Door - Pair A', wbs: '3.2.1.1', startDate: '2025-09-01', finishDate: '2025-10-15', float: 0,  isCritical: true  },
        { id: 'BC1078', name: 'Rough-in Computer Core Power Conduits - Row 3', wbs: '4.1.3.3', startDate: '2025-08-15', finishDate: '2025-09-30', float: -3, isCritical: true  },
        { id: 'BC1102', name: 'Cave Structural Shotcrete - Level 6 East Wall', wbs: '1.6.2.4', startDate: '2025-07-20', finishDate: '2025-08-10', float: 6,  isCritical: false },
        { id: 'BC1155', name: 'Install Trophy Room Display Cases - Zone B', wbs: '7.3.2', startDate: '2025-11-01', finishDate: '2025-11-20', float: 21, isCritical: false },
        { id: 'BC1198', name: 'Medical Bay Surgical Suite Fit-Out', wbs: '5.2.3.1', startDate: '2025-10-01', finishDate: '2025-11-15', float: 4,  isCritical: false }
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
        { id: 'BC2011', name: 'Batmobile Vault Systems Integration Test', wbs: '3.2.4', startDate: '2025-10-20', finishDate: '2025-10-24', float: 0,  isCritical: true  },
        { id: 'BC2044', name: 'Computer Core Thermal Runaway Test', wbs: '4.1.5', startDate: '2025-09-05', finishDate: '2025-09-07', float: -3, isCritical: true  },
        { id: 'BC2088', name: 'Emergency Escape Tunnel Ventilation Test', wbs: '2.7.3', startDate: '2025-12-01', finishDate: '2025-12-03', float: 14, isCritical: false }
      ]
    },
    {
      id: 'db003', category: 'Constraints & Float', severity: 'high',
      ruleKey: 'NEGATIVE_FLOAT', dcmaPoint: 9,
      title: 'Negative Float Activities',
      description: 'Thirty-one activities carry negative total float, concentrated in the Batmobile Vault and Computer Core WBS packages — the two most schedule-critical systems. The cave-in event on Level 5 (Feb 2025) introduced approximately 45 days of delay that has propagated through the network.',
      count: 31, totalActivities: 1247, percent: 2.5, penalty: 8.6,
      recommendation: 'Conduct a targeted recovery analysis for the Batmobile Vault and Computer Core work packages. Evaluate opportunities for resource acceleration and parallel sequencing on critical activities.',
      activities: [
        { id: 'BC1041', name: 'Install Batmobile Vault Blast Door - Pair A', wbs: '3.2.1.1', startDate: '2025-09-01', finishDate: '2025-10-15', float: -6, isCritical: true  },
        { id: 'BC1078', name: 'Rough-in Computer Core Power Conduits - Row 3', wbs: '4.1.3.3', startDate: '2025-08-15', finishDate: '2025-09-30', float: -3, isCritical: true  },
        { id: 'BC2044', name: 'Computer Core Thermal Runaway Test', wbs: '4.1.5', startDate: '2025-09-05', finishDate: '2025-09-07', float: -3, isCritical: true  },
        { id: 'BC3091', name: 'Batmobile Vault Beneficial Occupancy', wbs: '3.2.6', startDate: '2025-11-30', finishDate: '2025-11-30', float: -9, isCritical: true  },
        { id: 'BC4002', name: 'Primary Power Grid Energisation', wbs: '6.1.4', startDate: '2025-12-15', finishDate: '2025-12-15', float: -4, isCritical: true  }
      ]
    },
    {
      id: 'db004', category: 'Constraints & Float', severity: 'high',
      ruleKey: 'EXCESSIVE_CONSTRAINTS', dcmaPoint: 6,
      title: 'Excessive Hard Constraints',
      description: 'Wayne Enterprises security protocols and Alfred\'s operational readiness requirements have generated a high volume of hard Must Start On and Finish No Later Than constraints, many of which are driving artificial critical path issues.',
      count: 103, totalActivities: 1247, percent: 8.3, penalty: 6.2,
      recommendation: 'Audit all MSO and FNLT constraints with Alfred\'s facilities team. Document which are genuine operational requirements vs. scheduling preferences. Replace discretionary constraints with SNET.',
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
      description: 'Twenty-two activities exceed 44 working days. The cave structural reinforcement and Wayne Manor interface work packages account for the majority of these.',
      count: 22, totalActivities: 1247, percent: 1.8, penalty: 2.4,
      recommendation: 'Break down Level 6–7 structural reinforcement activities into weekly or bi-weekly work packages. The Wayne Manor tunnel interface should be phased into three distinct areas.',
      activities: []
    },
    {
      id: 'db008', category: 'Critical Path Reliability', severity: 'medium',
      ruleKey: 'NEAR_CRITICAL_DENSITY',
      title: 'High Near-Critical Activity Count',
      description: 'One hundred and eighty-seven activities carry total float between 0 and 15 working days, representing 15.0% of all schedule activities — well above the 10% DCMA threshold.',
      count: 187, totalActivities: 1247, percent: 15.0, penalty: 4.1,
      recommendation: 'Focus float recovery on the MEP and structural packages in Levels 4–7. Review near-critical activities in the Medical Bay for logic sequencing improvements.',
      activities: []
    }
  ]
};

// ─────────────────────────────────────────────────────────────
// MILESTONES  — keyed by project.id
// ─────────────────────────────────────────────────────────────
const DEMO_MILESTONES = {
  'proj-001': [
    { id: 'm001', name: 'Foundation Complete',         plannedDate: '2024-10-15', forecastDate: '2024-10-18', actualDate: '2024-10-18', variance: 3,  status: 'complete',  isCritical: true  },
    { id: 'm002', name: 'Tower Structure Topped Out',  plannedDate: '2025-06-30', forecastDate: '2025-07-22', actualDate: null,           variance: 22, status: 'slipping',  isCritical: true  },
    { id: 'm003', name: 'Tower Exterior Enclosed',     plannedDate: '2025-09-30', forecastDate: '2025-11-15', actualDate: null,           variance: 46, status: 'slipping',  isCritical: true  },
    { id: 'm004', name: 'Arc Systems Rough-In Complete', plannedDate: '2026-01-31', forecastDate: '2026-03-30', actualDate: null,         variance: 58, status: 'at_risk',   isCritical: true  },
    { id: 'm005', name: 'Interior Finishes Complete',  plannedDate: '2026-05-31', forecastDate: '2026-07-15', actualDate: null,           variance: 45, status: 'at_risk',   isCritical: false },
    { id: 'm006', name: 'Substantial Completion',      plannedDate: '2026-08-31', forecastDate: '2026-11-14', actualDate: null,           variance: 75, status: 'slipping',  isCritical: true  }
  ],
  'proj-002': [
    { id: 'mc001', name: 'Mobilisation & Site Prep Complete', plannedDate: '2025-03-15', forecastDate: '2025-03-15', actualDate: '2025-03-14', variance: -1, status: 'complete',  isCritical: false },
    { id: 'mc002', name: 'Level B1 & B2 Excavation Complete', plannedDate: '2025-07-01', forecastDate: '2025-07-01', actualDate: '2025-06-28', variance: -3, status: 'complete',  isCritical: true  },
    { id: 'mc003', name: 'Structural Frame Levels B1–B6 Complete', plannedDate: '2026-02-28', forecastDate: '2026-03-07', actualDate: null, variance: 7,  status: 'on_track',  isCritical: true  },
    { id: 'mc004', name: 'MEP Rough-In Complete',      plannedDate: '2026-07-31', forecastDate: '2026-08-10', actualDate: null,           variance: 10, status: 'on_track',  isCritical: true  },
    { id: 'mc005', name: 'Training Range Operational', plannedDate: '2026-10-31', forecastDate: '2026-11-05', actualDate: null,           variance: 5,  status: 'on_track',  isCritical: false },
    { id: 'mc006', name: 'Substantial Completion',     plannedDate: '2026-12-31', forecastDate: '2027-01-07', actualDate: null,           variance: 7,  status: 'on_track',  isCritical: true  }
  ],
  'proj-003': [
    { id: 'mt001', name: 'Site Preparation & Geotechnical Complete', plannedDate: '2024-12-01', forecastDate: '2025-01-15', actualDate: '2025-01-20', variance: 50, status: 'complete',  isCritical: true  },
    { id: 'mt002', name: 'Bifrost Platform Substructure Complete',   plannedDate: '2025-04-30', forecastDate: '2025-07-15', actualDate: null,          variance: 76, status: 'slipping',  isCritical: true  },
    { id: 'mt003', name: 'Rainbow Bridge Emitter Array Installed',   plannedDate: '2025-08-31', forecastDate: '2026-01-10', actualDate: null,          variance: 131, status: 'slipping', isCritical: true  },
    { id: 'mt004', name: 'Diplomatic Suites Interior Complete',      plannedDate: '2025-12-31', forecastDate: '2026-04-30', actualDate: null,          variance: 120, status: 'at_risk',  isCritical: false },
    { id: 'mt005', name: 'Bifrost Terminal First Activation Test',   plannedDate: '2026-03-15', forecastDate: '2026-07-01', actualDate: null,          variance: 108, status: 'slipping', isCritical: true  },
    { id: 'mt006', name: 'Substantial Completion',                   plannedDate: '2026-06-30', forecastDate: '2026-11-20', actualDate: null,          variance: 143, status: 'slipping', isCritical: true  }
  ],
  'proj-004': [
    { id: 'mb001', name: 'Cave System Levels 1–3 Structural Complete', plannedDate: '2024-10-01', forecastDate: '2024-10-03', actualDate: '2024-10-03', variance: 2,  status: 'complete',  isCritical: true  },
    { id: 'mb002', name: 'Structural Reinforcement & Shotcrete Complete', plannedDate: '2025-01-15', forecastDate: '2025-01-20', actualDate: '2025-01-22', variance: 7,  status: 'complete',  isCritical: true  },
    { id: 'mb003', name: 'Primary Power Grid Online',              plannedDate: '2025-06-30', forecastDate: '2025-08-07', actualDate: null,           variance: 38, status: 'slipping',  isCritical: true  },
    { id: 'mb004', name: 'Batmobile Vault Operational',            plannedDate: '2025-09-30', forecastDate: '2025-11-20', actualDate: null,           variance: 51, status: 'at_risk',   isCritical: true  },
    { id: 'mb005', name: 'Computer Core Installation Complete',    plannedDate: '2025-10-31', forecastDate: '2025-12-03', actualDate: null,           variance: 33, status: 'slipping',  isCritical: true  },
    { id: 'mb006', name: 'Medical Bay Operational',                plannedDate: '2026-02-28', forecastDate: '2026-03-04', actualDate: null,           variance: 4,  status: 'on_track',  isCritical: false },
    { id: 'mb007', name: 'Substantial Completion',                 plannedDate: '2026-10-31', forecastDate: '2027-01-11', actualDate: null,           variance: 71, status: 'slipping',  isCritical: true  }
  ]
};

// ─────────────────────────────────────────────────────────────
// CRITICAL PATH  — keyed by project.id
// ─────────────────────────────────────────────────────────────
const DEMO_CRITICAL_PATH = {
  'proj-001': [
    { id: 'cp001', name: 'Tower Structure Topped Out',            duration: 0,  earlyStart: '2025-07-22', earlyFinish: '2025-07-22', float: 0,  isMilestone: true  },
    { id: 'cp002', name: 'Install Stark Armour Cladding - Lvl 12-24', duration: 60, earlyStart: '2025-07-23', earlyFinish: '2025-10-21', float: -2, isMilestone: false },
    { id: 'cp003', name: 'Tower Exterior Enclosed',               duration: 0,  earlyStart: '2025-11-15', earlyFinish: '2025-11-15', float: 0,  isMilestone: true  },
    { id: 'cp004', name: 'Rough-in Arc Systems - Floors 1–8',    duration: 55, earlyStart: '2025-11-17', earlyFinish: '2026-02-02', float: 0,  isMilestone: false },
    { id: 'cp005', name: 'Rough-in Arc Systems - Floors 9–16',   duration: 55, earlyStart: '2026-01-15', earlyFinish: '2026-04-01', float: 0,  isMilestone: false },
    { id: 'cp006', name: 'Install Arc Reactor Cooling System',    duration: 55, earlyStart: '2025-08-15', earlyFinish: '2025-10-30', float: 0,  isMilestone: false },
    { id: 'cp007', name: 'Arc Systems Rough-In Complete',         duration: 0,  earlyStart: '2026-03-30', earlyFinish: '2026-03-30', float: 0,  isMilestone: true  },
    { id: 'cp008', name: 'Interior Finishes - Labs & Command Suite', duration: 80, earlyStart: '2026-04-01', earlyFinish: '2026-07-20', float: 0, isMilestone: false },
    { id: 'cp009', name: 'Arc Reactor Commissioning & Testing',   duration: 30, earlyStart: '2026-07-21', earlyFinish: '2026-09-03', float: 0,  isMilestone: false },
    { id: 'cp010', name: 'Substantial Completion',                duration: 0,  earlyStart: '2026-11-14', earlyFinish: '2026-11-14', float: 0,  isMilestone: true  }
  ],
  'proj-002': [
    { id: 'cpc01', name: 'Level B1 & B2 Excavation Complete',    duration: 0,  earlyStart: '2025-06-28', earlyFinish: '2025-06-28', float: 0,  isMilestone: true  },
    { id: 'cpc02', name: 'Pour Structural Slab B3',               duration: 30, earlyStart: '2025-07-01', earlyFinish: '2025-08-12', float: 0,  isMilestone: false },
    { id: 'cpc03', name: 'Steel Frame Levels B3–B6',              duration: 75, earlyStart: '2025-08-13', earlyFinish: '2025-11-26', float: 0,  isMilestone: false },
    { id: 'cpc04', name: 'Structural Frame B1–B6 Complete',       duration: 0,  earlyStart: '2026-03-07', earlyFinish: '2026-03-07', float: 0,  isMilestone: true  },
    { id: 'cpc05', name: 'MEP Rough-In Levels B1–B6',             duration: 90, earlyStart: '2026-03-10', earlyFinish: '2026-07-17', float: 0,  isMilestone: false },
    { id: 'cpc06', name: 'Classified Systems Integration',        duration: 45, earlyStart: '2026-07-18', earlyFinish: '2026-09-19', float: 0,  isMilestone: false },
    { id: 'cpc07', name: 'Substantial Completion',                duration: 0,  earlyStart: '2027-01-07', earlyFinish: '2027-01-07', float: 0,  isMilestone: true  }
  ],
  'proj-003': [
    { id: 'cpt01', name: 'Site Preparation Complete',             duration: 0,  earlyStart: '2025-01-20', earlyFinish: '2025-01-20', float: 0,   isMilestone: true  },
    { id: 'cpt02', name: 'Bifrost Platform Excavation',           duration: 50, earlyStart: '2025-01-21', earlyFinish: '2025-04-01', float: 0,   isMilestone: false },
    { id: 'cpt03', name: 'Runestone Foundation Installation',     duration: 65, earlyStart: '2025-04-02', earlyFinish: '2025-07-01', float: -8,  isMilestone: false },
    { id: 'cpt04', name: 'Rainbow Bridge Emitter Array Installed',duration: 0,  earlyStart: '2026-01-10', earlyFinish: '2026-01-10', float: 0,   isMilestone: true  },
    { id: 'cpt05', name: 'Bifrost Alignment - Phase 1',           duration: 40, earlyStart: '2026-01-13', earlyFinish: '2026-03-10', float: 0,   isMilestone: false },
    { id: 'cpt06', name: 'Bifrost Alignment - Phase 2',           duration: 40, earlyStart: '2026-03-11', earlyFinish: '2026-05-06', float: -12, isMilestone: false },
    { id: 'cpt07', name: 'Substantial Completion',                duration: 0,  earlyStart: '2026-11-20', earlyFinish: '2026-11-20', float: 0,   isMilestone: true  }
  ],
  'proj-004': [
    { id: 'cpb01', name: 'Structural Reinforcement Complete',     duration: 0,  earlyStart: '2025-01-22', earlyFinish: '2025-01-22', float: 0,  isMilestone: true  },
    { id: 'cpb02', name: 'Level 4–7 Cave Excavation',            duration: 55, earlyStart: '2025-01-23', earlyFinish: '2025-04-15', float: 0,  isMilestone: false },
    { id: 'cpb03', name: 'Structural Shotcrete - Levels 4–7',    duration: 40, earlyStart: '2025-04-16', earlyFinish: '2025-06-11', float: 0,  isMilestone: false },
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
// COMPARISON  — keyed by project.id (most recent pair)
// ─────────────────────────────────────────────────────────────
const DEMO_COMPARISON = {
  'proj-001': {
    baseline: { id: 'v7', version: 'Update 6', dataDate: '2025-09-01', overallScore: 72 },
    current:  { id: 'v8', version: 'Update 7', dataDate: '2026-01-01', overallScore: 71 },
    summary: {
      finishDateMovement: 24, criticalPathSlip: 18, scoreChange: -1,
      negativeFloatDelta: 5, activitiesAdded: 12, activitiesDeleted: 4,
      activitiesChanged: 87, logicChanges: 23
    },
    milestoneChanges: [
      { id: 'm002', name: 'Tower Structure Topped Out',    priorForecast: '2025-07-15', currentForecast: '2025-07-22', variance: 7,  direction: 'slipped' },
      { id: 'm003', name: 'Tower Exterior Enclosed',       priorForecast: '2025-10-30', currentForecast: '2025-11-15', variance: 16, direction: 'slipped' },
      { id: 'm004', name: 'Arc Systems Rough-In Complete', priorForecast: '2026-02-28', currentForecast: '2026-03-30', variance: 30, direction: 'slipped' },
      { id: 'm006', name: 'Substantial Completion',        priorForecast: '2026-10-21', currentForecast: '2026-11-14', variance: 24, direction: 'slipped' }
    ],
    activityChanges: [
      { id: 'A1042', name: 'Install Arc Reactor Cooling System', changeType: 'date_change', priorStart: '2025-07-01', newStart: '2025-08-15', priorFinish: '2025-09-15', newFinish: '2025-10-30', startVariance: 45, finishVariance: 45, floatChange: -5 },
      { id: 'A1093', name: 'Install Stark Armour Cladding - Levels 12-16', changeType: 'date_change', priorStart: '2025-05-15', newStart: '2025-06-20', priorFinish: '2025-08-01', newFinish: '2025-09-10', startVariance: 36, finishVariance: 40, floatChange: -8 },
      { id: 'A2099', name: 'Excavation - Underground Lab Structure', changeType: 'completed', priorStart: '2024-03-15', newStart: '2024-03-15', priorFinish: '2024-06-01', newFinish: '2024-05-28', startVariance: 0, finishVariance: -4, floatChange: 0 }
    ]
  },

  'proj-002': {
    baseline: { id: 'vc3', version: 'Update 2', dataDate: '2025-07-15', overallScore: 87 },
    current:  { id: 'vc4', version: 'Update 3', dataDate: '2025-10-15', overallScore: 87 },
    summary: {
      finishDateMovement: 7, criticalPathSlip: 4, scoreChange: 0,
      negativeFloatDelta: 0, activitiesAdded: 13, activitiesDeleted: 0,
      activitiesChanged: 28, logicChanges: 6
    },
    milestoneChanges: [
      { id: 'mc003', name: 'Structural Frame Complete',   priorForecast: '2026-03-01', currentForecast: '2026-03-07', variance: 6, direction: 'slipped' },
      { id: 'mc006', name: 'Substantial Completion',      priorForecast: '2026-12-28', currentForecast: '2027-01-07', variance: 7, direction: 'slipped' }
    ],
    activityChanges: [
      { id: 'SC1044', name: 'Commission Blast Door Control System', changeType: 'date_change', priorStart: '2026-07-25', newStart: '2026-08-01', priorFinish: '2026-08-08', newFinish: '2026-08-15', startVariance: 7, finishVariance: 7, floatChange: -2 }
    ]
  },

  'proj-003': {
    baseline: { id: 'vt5', version: 'Update 4', dataDate: '2025-09-01', overallScore: 58 },
    current:  { id: 'vt6', version: 'Update 5', dataDate: '2025-12-01', overallScore: 58 },
    summary: {
      finishDateMovement: 45, criticalPathSlip: 38, scoreChange: 0,
      negativeFloatDelta: 12, activitiesAdded: 13, activitiesDeleted: 2,
      activitiesChanged: 108, logicChanges: 41
    },
    milestoneChanges: [
      { id: 'mt002', name: 'Bifrost Platform Substructure Complete', priorForecast: '2025-06-15', currentForecast: '2025-07-15', variance: 30, direction: 'slipped' },
      { id: 'mt003', name: 'Rainbow Bridge Emitter Array Installed', priorForecast: '2025-11-20', currentForecast: '2026-01-10', variance: 51, direction: 'slipped' },
      { id: 'mt006', name: 'Substantial Completion',                 priorForecast: '2026-10-06', currentForecast: '2026-11-20', variance: 45, direction: 'slipped' }
    ],
    activityChanges: [
      { id: 'BF2201', name: 'Install Rainbow Bridge Chromatic Emitters', changeType: 'date_change', priorStart: '2025-09-01', newStart: '2025-10-01', priorFinish: '2025-11-01', newFinish: '2025-12-15', startVariance: 30, finishVariance: 44, floatChange: -14 },
      { id: 'BF2245', name: 'Asgardian Runestone Placement - Zone A',    changeType: 'date_change', priorStart: '2025-08-15', newStart: '2025-09-15', priorFinish: '2025-09-30', newFinish: '2025-10-30', startVariance: 31, finishVariance: 30, floatChange: -9 }
    ]
  },

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
      { id: 'BC1041', name: 'Install Batmobile Vault Blast Door - Pair A', changeType: 'date_change', priorStart: '2025-09-15', newStart: '2025-09-01', priorFinish: '2025-11-01', newFinish: '2025-10-15', startVariance: -14, finishVariance: -17, floatChange: 4 },
      { id: 'BC1078', name: 'Rough-in Computer Core Power Conduits - Row 3', changeType: 'date_change', priorStart: '2025-08-28', newStart: '2025-08-15', priorFinish: '2025-10-14', newFinish: '2025-09-30', startVariance: -13, finishVariance: -14, floatChange: 3 },
      { id: 'BC5001', name: 'Level 5 Emergency Structural Repair - Zone C', changeType: 'completed', priorStart: '2025-04-01', newStart: '2025-04-01', priorFinish: '2025-07-31', newFinish: '2025-07-25', startVariance: 0, finishVariance: -7, floatChange: 0 }
    ]
  }
};

// ─────────────────────────────────────────────────────────────
// SCORE HISTORY  — keyed by project.id
// ─────────────────────────────────────────────────────────────
const DEMO_SCORE_HISTORY = {
  'proj-001': [
    { version: 'Baseline', dataDate: '2024-03-01', overallScore: 82, logicQuality: 80, dateIntegrity: 85, constraintsFloat: 79, activityHygiene: 88, progressRealism: 84, criticalPathReliability: 80 },
    { version: 'Update 1', dataDate: '2024-06-01', overallScore: 79, logicQuality: 77, dateIntegrity: 82, constraintsFloat: 76, activityHygiene: 85, progressRealism: 79, criticalPathReliability: 77 },
    { version: 'Update 2', dataDate: '2024-09-01', overallScore: 76, logicQuality: 74, dateIntegrity: 79, constraintsFloat: 73, activityHygiene: 82, progressRealism: 76, criticalPathReliability: 74 },
    { version: 'Update 3', dataDate: '2024-12-01', overallScore: 74, logicQuality: 72, dateIntegrity: 77, constraintsFloat: 70, activityHygiene: 80, progressRealism: 74, criticalPathReliability: 72 },
    { version: 'Update 4', dataDate: '2025-03-01', overallScore: 73, logicQuality: 71, dateIntegrity: 76, constraintsFloat: 68, activityHygiene: 79, progressRealism: 73, criticalPathReliability: 70 },
    { version: 'Update 5', dataDate: '2025-06-01', overallScore: 70, logicQuality: 68, dateIntegrity: 74, constraintsFloat: 66, activityHygiene: 78, progressRealism: 71, criticalPathReliability: 68 },
    { version: 'Update 6', dataDate: '2025-09-01', overallScore: 72, logicQuality: 70, dateIntegrity: 75, constraintsFloat: 67, activityHygiene: 79, progressRealism: 72, criticalPathReliability: 70 },
    { version: 'Update 7', dataDate: '2026-01-01', overallScore: 71, logicQuality: 68, dateIntegrity: 74, constraintsFloat: 65, activityHygiene: 78, progressRealism: 71, criticalPathReliability: 69 }
  ],
  'proj-002': [
    { version: 'Baseline', dataDate: '2025-01-15', overallScore: 91, logicQuality: 92, dateIntegrity: 93, constraintsFloat: 90, activityHygiene: 94, progressRealism: 89, criticalPathReliability: 88 },
    { version: 'Update 1', dataDate: '2025-04-15', overallScore: 89, logicQuality: 91, dateIntegrity: 91, constraintsFloat: 89, activityHygiene: 93, progressRealism: 87, criticalPathReliability: 86 },
    { version: 'Update 2', dataDate: '2025-07-15', overallScore: 87, logicQuality: 90, dateIntegrity: 90, constraintsFloat: 88, activityHygiene: 92, progressRealism: 85, criticalPathReliability: 83 },
    { version: 'Update 3', dataDate: '2025-10-15', overallScore: 87, logicQuality: 91, dateIntegrity: 90, constraintsFloat: 88, activityHygiene: 93, progressRealism: 86, criticalPathReliability: 83 }
  ],
  'proj-003': [
    { version: 'Baseline', dataDate: '2024-09-01', overallScore: 74, logicQuality: 72, dateIntegrity: 76, constraintsFloat: 70, activityHygiene: 80, progressRealism: 74, criticalPathReliability: 73 },
    { version: 'Update 1', dataDate: '2024-12-01', overallScore: 69, logicQuality: 67, dateIntegrity: 71, constraintsFloat: 63, activityHygiene: 76, progressRealism: 69, criticalPathReliability: 68 },
    { version: 'Update 2', dataDate: '2025-03-01', overallScore: 64, logicQuality: 61, dateIntegrity: 67, constraintsFloat: 57, activityHygiene: 72, progressRealism: 64, criticalPathReliability: 63 },
    { version: 'Update 3', dataDate: '2025-06-01', overallScore: 61, logicQuality: 58, dateIntegrity: 64, constraintsFloat: 53, activityHygiene: 70, progressRealism: 61, criticalPathReliability: 59 },
    { version: 'Update 4', dataDate: '2025-09-01', overallScore: 58, logicQuality: 55, dateIntegrity: 61, constraintsFloat: 49, activityHygiene: 68, progressRealism: 57, criticalPathReliability: 55 },
    { version: 'Update 5', dataDate: '2025-12-01', overallScore: 58, logicQuality: 52, dateIntegrity: 61, constraintsFloat: 49, activityHygiene: 68, progressRealism: 57, criticalPathReliability: 55 }
  ],
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
