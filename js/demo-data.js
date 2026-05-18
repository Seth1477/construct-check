// demo-data.js — Admin demo data (Batcave edition 🦇)
// Only visible in the admin account (speterson1477@gmail.com).
// isDemo:true on all objects ensures they are never written to Supabase/IndexedDB.

// ─── Helpers (private — not exported) ────────────────────────
const _rag = s => s >= 85 ? 'green' : s >= 70 ? 'amber' : 'red';

// Build categoryScores object from flat score numbers
function _catScores(s) {
  const W = { logicQuality:0.25, dateIntegrity:0.15, constraintsFloat:0.15, activityHygiene:0.10, progressRealism:0.15, criticalPathReliability:0.20 };
  const L = { logicQuality:'Logic Quality', dateIntegrity:'Date Integrity', constraintsFloat:'Constraints & Float', activityHygiene:'Activity Hygiene', progressRealism:'Progress Realism', criticalPathReliability:'Critical Path Reliability' };
  const M = { logicQuality:60, dateIntegrity:50, constraintsFloat:50, activityHygiene:40, progressRealism:50, criticalPathReliability:50 };
  return Object.fromEntries(Object.keys(W).map(k => [k, {
    score: s[k], weight: W[k], penalty: Math.min(M[k], 100 - s[k]),
    maxPenalty: M[k], label: L[k], rag: _rag(s[k])
  }]));
}

// Build activityLookup from array of totalFloat values
function _mkActs(prefix, floats) {
  const NAMES = ['Excavate & Rock Anchor Install','Install Blast-Proof Partition','MEP Rough-in','Shotcrete Placement','Steel Erection','Equipment Placement','Concrete Pour','Commissioning & Testing','Control Panel Wiring','Structural Inspection','HVAC Installation','Plumbing Rough-in','Fire Protection Install','Electrical Terminations','Finishes & Cladding','Structural Steel Connections','Utility Tunneling','Ventilation Ducting','Access Control Install','Communications Cabling','Cave Wall Treatment','Blast Door Installation','Emergency Exit Provision','Vault Door Erection','Computer Core Rack Install','Power Grid Connection','Drainage Installation','Waterproofing System','Medical Equipment Install','Tactical Display Assembly','Server Room Fit-Out','Climate Control Calibration','Emergency Generator Install','UPS System Commission','Security Scanning Install','Alfred Lift Installation','Bat-Winch Mechanism','Turntable Install','Hangar Door System','Loading Bay Equipment','Dispatch Console Install','Vehicle Bay Markings','Obstacle Training Grid','Trophy Room Casework','Gyrojet Calibration Chamber','Utility Bridge Install','Backup Communications','Water Treatment System','Bat-Signal Mounting','Cave Structural Survey'];
  return floats.map((f, i) => ({
    id: `${prefix}_${String(i+1).padStart(3,'0')}`,
    name: NAMES[i % NAMES.length],
    totalFloat: f,
    status: 'TK_NotStart',
    isCritical: f <= 1,
    type: 'TT_Task'
  }));
}

// Build a simplified DCMA compliance block
function _mkDCMA(passed, failed) {
  return { tested: passed + failed, passed, failed, notApplicable: 14 - passed - failed };
}

// ─── Rule builder helper ──────────────────────────────────────
function _mkRule(ruleKey, count, totalActivities, pct, penalty, severity, passFail, category, extra) {
  const DCMA_POINT = {
    OPEN_ENDS_PREDECESSOR:1, OPEN_ENDS_SUCCESSOR:1, NEGATIVE_LAG_LEADS:2,
    EXCESSIVE_LAG:3, NON_FS_RELATIONSHIPS:4, FUTURE_ACTUALS:9,
    NEGATIVE_FLOAT:null, EXCESSIVE_CONSTRAINTS:6, LONG_DURATION:8,
    OUT_OF_SEQUENCE:14, BEHIND_SCHEDULE:13
  };
  const SOURCE = {
    OPEN_ENDS_PREDECESSOR:'DCMA', OPEN_ENDS_SUCCESSOR:'DCMA', NEGATIVE_LAG_LEADS:'DCMA',
    EXCESSIVE_LAG:'DCMA', NON_FS_RELATIONSHIPS:'DCMA', FUTURE_ACTUALS:'DCMA',
    NEGATIVE_FLOAT:'DCMA', EXCESSIVE_CONSTRAINTS:'DCMA', LONG_DURATION:'DCMA',
    OUT_OF_SEQUENCE:'DCMA', BEHIND_SCHEDULE:'DCMA',
    RELATIONSHIP_DENSITY:'Industry', HIGH_FLOAT:'Industry', LOE_PERCENTAGE:'Industry',
    ZERO_DURATION_NON_MILESTONE:'Industry', INPROGRESS_NO_ACTUAL_START:'Industry',
    COMPLETE_NO_ACTUAL_FINISH:'Industry', STARTED_NO_PROGRESS:'Industry',
    NEAR_CRITICAL_DENSITY:'Industry', LOE_CRITICAL:'Industry', CRITICAL_RATIO:'Industry'
  };
  const CAT_MAP = {
    OPEN_ENDS_PREDECESSOR:'logicQuality', OPEN_ENDS_SUCCESSOR:'logicQuality',
    NEGATIVE_LAG_LEADS:'logicQuality', EXCESSIVE_LAG:'logicQuality',
    NON_FS_RELATIONSHIPS:'logicQuality', RELATIONSHIP_DENSITY:'logicQuality',
    FUTURE_ACTUALS:'dateIntegrity', INPROGRESS_NO_ACTUAL_START:'dateIntegrity',
    COMPLETE_NO_ACTUAL_FINISH:'dateIntegrity', INVALID_FORECAST_DATES:'dateIntegrity',
    NEGATIVE_FLOAT:'constraintsFloat', EXCESSIVE_CONSTRAINTS:'constraintsFloat',
    HIGH_FLOAT:'constraintsFloat',
    LONG_DURATION:'activityHygiene', LOE_PERCENTAGE:'activityHygiene',
    ZERO_DURATION_NON_MILESTONE:'activityHygiene',
    STARTED_NO_PROGRESS:'progressRealism', BEHIND_SCHEDULE:'progressRealism',
    OUT_OF_SEQUENCE:'progressRealism',
    NEAR_CRITICAL_DENSITY:'criticalPathReliability', LOE_CRITICAL:'criticalPathReliability',
    CRITICAL_RATIO:'criticalPathReliability'
  };
  const TITLES = {
    OPEN_ENDS_PREDECESSOR:'Activities Missing Predecessor Logic',
    OPEN_ENDS_SUCCESSOR:'Activities Missing Successor Logic',
    NEGATIVE_LAG_LEADS:'Leads (Negative Lag Relationships)',
    EXCESSIVE_LAG:'Relationships with Positive Lag',
    NON_FS_RELATIONSHIPS:'Non Finish-to-Start Relationships',
    RELATIONSHIP_DENSITY:'Relationship Density Ratio',
    FUTURE_ACTUALS:'Actual Dates Beyond Data Date',
    INPROGRESS_NO_ACTUAL_START:'In-Progress Activities Missing Actual Start',
    COMPLETE_NO_ACTUAL_FINISH:'Complete Activities Missing Actual Finish',
    NEGATIVE_FLOAT:'Negative Float Activities',
    EXCESSIVE_CONSTRAINTS:'Excessive Hard Constraints',
    HIGH_FLOAT:'High Float Activities (>44 Days)',
    LONG_DURATION:'Long Duration Activities (>44 Working Days)',
    LOE_PERCENTAGE:'Level of Effort Activity Ratio',
    ZERO_DURATION_NON_MILESTONE:'Zero-Duration Non-Milestone Activities',
    OUT_OF_SEQUENCE:'Out-of-Sequence Progress',
    BEHIND_SCHEDULE:'Behind Schedule Activities',
    STARTED_NO_PROGRESS:'Started Activities with No Reported Progress',
    NEAR_CRITICAL_DENSITY:'Near-Critical Activity Density',
    LOE_CRITICAL:'LOE Activities on Critical Path',
    CRITICAL_RATIO:'Critical Path Length Index (CPLI)',
    INVALID_FORECAST_DATES:'Invalid Forecast Dates'
  };
  const THRESHOLDS = {
    OPEN_ENDS_PREDECESSOR:'< 5% of incomplete activities (DCMA #1)',
    OPEN_ENDS_SUCCESSOR:'< 5% of incomplete activities (DCMA #1)',
    NEGATIVE_LAG_LEADS:'0 relationships (DCMA #2 — leads not allowed)',
    EXCESSIVE_LAG:'< 5% of relationships (DCMA #3)',
    NON_FS_RELATIONSHIPS:'< 10% non-FS / ≥ 90% FS (DCMA #4)',
    RELATIONSHIP_DENSITY:'1.4 to 2.5 relationships per activity',
    FUTURE_ACTUALS:'0 activities (DCMA #9)',
    INPROGRESS_NO_ACTUAL_START:'0 in-progress activities without actual start',
    COMPLETE_NO_ACTUAL_FINISH:'0 complete activities without actual finish',
    NEGATIVE_FLOAT:'0 activities (negative float indicates constraint-driven delays)',
    EXCESSIVE_CONSTRAINTS:'< 5% of activities (DCMA #6)',
    HIGH_FLOAT:'< 10% of activities',
    LONG_DURATION:'< 5% of activities (DCMA #8)',
    LOE_PERCENTAGE:'< 5% of activities',
    ZERO_DURATION_NON_MILESTONE:'0 activities',
    OUT_OF_SEQUENCE:'0 activities (DCMA #14)',
    BEHIND_SCHEDULE:'0 activities (DCMA #13)',
    STARTED_NO_PROGRESS:'0 activities',
    NEAR_CRITICAL_DENSITY:'< 10% of activities within 15 days float',
    LOE_CRITICAL:'0 LOE activities on critical path',
    CRITICAL_RATIO:'CPLI ≥ 0.95',
    INVALID_FORECAST_DATES:'0 activities'
  };
  const DESCS = {
    OPEN_ENDS_PREDECESSOR:'Activities with no predecessor create open-end logic gaps that distort float and the critical path.',
    OPEN_ENDS_SUCCESSOR:'Activities with no successor create dangling endpoints; float calculations become unreliable.',
    NEGATIVE_LAG_LEADS:'Negative lag compresses logic and is rejected by DCMA. They distort float calculations and can hide late finishes.',
    EXCESSIVE_LAG:'Lags often substitute for missing activities. Each lag should be justified or replaced.',
    NON_FS_RELATIONSHIPS:'SS, FF, and SF relationships are harder to validate and can mask critical path issues.',
    RELATIONSHIP_DENSITY:'The schedule relationship density is within acceptable bounds indicating good logic connectivity.',
    FUTURE_ACTUALS:'Activities show actual completion dates after the current data date — data date was not updated before submission.',
    INPROGRESS_NO_ACTUAL_START:'In-progress activities without an actual start date have been status-checked as started without proper scheduling updates.',
    COMPLETE_NO_ACTUAL_FINISH:'Activities marked complete but lacking an actual finish date cannot be validated.',
    NEGATIVE_FLOAT:'Activities carry negative total float indicating constraint-driven delays that will cascade to project completion.',
    EXCESSIVE_CONSTRAINTS:'Hard Must Start On and Finish No Later Than constraints generate artificial critical path issues.',
    HIGH_FLOAT:'Activities with excessively high float may indicate missing logic or scope gaps in the network.',
    LONG_DURATION:'Activities exceeding 44 working days are difficult to monitor and should be decomposed.',
    LOE_PERCENTAGE:'High LOE percentage inflates the overall activity count without adding schedule value.',
    ZERO_DURATION_NON_MILESTONE:'Non-milestone activities with zero duration are likely placeholder tasks that add schedule risk.',
    OUT_OF_SEQUENCE:'Activities have been progressed before their predecessors are complete, violating logical sequence.',
    BEHIND_SCHEDULE:'In-progress or not-started activities with forecasted dates behind the data date.',
    STARTED_NO_PROGRESS:'Activities marked as started show no percent complete or remaining duration progress.',
    NEAR_CRITICAL_DENSITY:'High near-critical density means many activities are close to becoming critical, reducing schedule buffer.',
    LOE_CRITICAL:'Level-of-Effort activities appearing on the critical path distort criticality analysis.',
    CRITICAL_RATIO:'The Critical Path Length Index measures schedule efficiency. Values below 0.95 indicate the project needs acceleration to meet its deadline.',
    INVALID_FORECAST_DATES:'Activities have forecast dates that are logically inconsistent or fall outside project bounds.'
  };
  const RECS = {
    OPEN_ENDS_PREDECESSOR:'Add logical predecessor relationships to all flagged activities to close open ends.',
    OPEN_ENDS_SUCCESSOR:'Add logical successor relationships or link to a project finish milestone.',
    NEGATIVE_LAG_LEADS:'Convert leads to FS+0 relationships with explicit predecessor splits.',
    EXCESSIVE_LAG:'Replace lags with explicit activities representing the elapsed work or wait.',
    NON_FS_RELATIONSHIPS:'Convert SS/FF relationships to FS where possible.',
    RELATIONSHIP_DENSITY:'Maintain current relationship density as activities are added.',
    FUTURE_ACTUALS:'Advance the data date to the reporting period end date and re-status the schedule.',
    INPROGRESS_NO_ACTUAL_START:'Add actual start dates to all in-progress activities.',
    COMPLETE_NO_ACTUAL_FINISH:'Add actual finish dates to all complete activities.',
    NEGATIVE_FLOAT:'Conduct recovery analysis. Evaluate acceleration opportunities on critical activities.',
    EXCESSIVE_CONSTRAINTS:'Audit all MSO and FNLT constraints. Replace discretionary constraints with SNET.',
    HIGH_FLOAT:'Review high-float activities for missing downstream logic connections.',
    LONG_DURATION:'Break down long activities into weekly or bi-weekly work packages.',
    LOE_PERCENTAGE:'Review LOE activities and replace with measurable work packages where possible.',
    ZERO_DURATION_NON_MILESTONE:'Add duration estimates or convert to milestones.',
    OUT_OF_SEQUENCE:'Investigate out-of-sequence work and update logic or investigate field conditions.',
    BEHIND_SCHEDULE:'Develop a recovery plan for all behind-schedule work packages.',
    STARTED_NO_PROGRESS:'Update progress for all in-progress activities at the next status cycle.',
    NEAR_CRITICAL_DENSITY:'Focus float recovery on near-critical packages. Review logic for sequencing improvements.',
    LOE_CRITICAL:'Review LOE activity relationships to ensure they are not artificially controlling the critical path.',
    CRITICAL_RATIO:'Develop schedule compression alternatives for critical path activities.',
    INVALID_FORECAST_DATES:'Review and correct all activities with forecast dates outside project bounds.'
  };
  return {
    ruleKey,
    dcmaPoint: DCMA_POINT[ruleKey] !== undefined ? DCMA_POINT[ruleKey] : null,
    source: SOURCE[ruleKey] || 'Industry',
    category: category || CAT_MAP[ruleKey] || 'logicQuality',
    severity,
    title: TITLES[ruleKey] || ruleKey,
    count,
    totalActivities,
    percent: pct,
    penalty,
    affectedIds: [],
    pass: passFail,
    threshold: THRESHOLDS[ruleKey] || '',
    description: DESCS[ruleKey] || '',
    recommendation: RECS[ruleKey] || '',
    ...extra
  };
}

// ─────────────────────────────────────────────────────────────
// WBS HIERARCHY  — Batman's Batcave Expansion
// ─────────────────────────────────────────────────────────────
const BATCAVE_WBS = [
  { id:'wbs-root',     parentId:null,           name:"Batman's Batcave Expansion"    },
  { id:'wbs-proj',     parentId:'wbs-root',     name:'Project Milestones'            },
  { id:'wbs-constr',   parentId:'wbs-proj',     name:'Construction Milestones'       },
  { id:'wbs-contract', parentId:'wbs-proj',     name:'Contract Key Dates'            },
  { id:'wbs-wayne',    parentId:'wbs-root',     name:'Wayne Enterprises Systems'     },
  { id:'wbs-tech',     parentId:'wbs-wayne',    name:'Technology & Commissioning'    }
];

// ─────────────────────────────────────────────────────────────
// SCHEDULE VERSIONS  (isDemo:true + isReal:true so comparison works)
// ─────────────────────────────────────────────────────────────
const DEMO_SCHEDULE_VERSIONS = [

  // ── vb1 Baseline ─────────────────────────────────────────
  (function() {
    const actCount = 1105, relCount = 2072, critCount = 55, negFloat = 0, msCount = 42;
    const scores = { logicQuality:90, dateIntegrity:91, constraintsFloat:87, activityHygiene:93, progressRealism:86, criticalPathReliability:85 };
    const overall = 88;
    const rules = [
      _mkRule('OPEN_ENDS_PREDECESSOR',   14, actCount, 1.8,  4, 'medium', true,  'logicQuality'),
      _mkRule('OPEN_ENDS_SUCCESSOR',     22, actCount, 2.8,  6, 'medium', true,  'logicQuality'),
      _mkRule('NEGATIVE_LAG_LEADS',       0, relCount, 0.0,  0, 'low',    true,  'logicQuality'),
      _mkRule('EXCESSIVE_LAG',            0, relCount, 0.0,  0, 'low',    true,  'logicQuality'),
      _mkRule('NON_FS_RELATIONSHIPS',     0, relCount, 0.0,  0, 'low',    true,  'logicQuality'),
      _mkRule('RELATIONSHIP_DENSITY',     0, relCount, 0.0,  0, 'low',    true,  'logicQuality'),
      _mkRule('FUTURE_ACTUALS',           4, actCount, 0.4,  5, 'medium', true,  'dateIntegrity'),
      _mkRule('INPROGRESS_NO_ACTUAL_START',0, actCount, 0.0, 0, 'low',    true,  'dateIntegrity'),
      _mkRule('COMPLETE_NO_ACTUAL_FINISH', 6, actCount, 0.5, 4, 'low',    true,  'dateIntegrity'),
      _mkRule('NEGATIVE_FLOAT',           0, actCount, 0.0,  0, 'low',    true,  'constraintsFloat'),
      _mkRule('EXCESSIVE_CONSTRAINTS',   18, actCount, 1.6,  5, 'medium', true,  'constraintsFloat'),
      _mkRule('HIGH_FLOAT',              44, actCount, 4.0,  8, 'low',    true,  'constraintsFloat'),
      _mkRule('LONG_DURATION',            8, actCount, 0.7,  4, 'low',    true,  'activityHygiene'),
      _mkRule('LOE_PERCENTAGE',          12, actCount, 1.1,  3, 'low',    true,  'activityHygiene'),
      _mkRule('ZERO_DURATION_NON_MILESTONE',0,actCount,0.0,  0, 'low',    true,  'activityHygiene'),
      _mkRule('OUT_OF_SEQUENCE',          0, actCount, 0.0,  0, 'low',    true,  'progressRealism'),
      _mkRule('BEHIND_SCHEDULE',         31, actCount, 2.8,  8, 'medium', true,  'progressRealism'),
      _mkRule('STARTED_NO_PROGRESS',     14, actCount, 1.3,  6, 'medium', true,  'progressRealism'),
      _mkRule('NEAR_CRITICAL_DENSITY',   38, actCount, 3.4, 10, 'low',    true,  'criticalPathReliability'),
      _mkRule('LOE_CRITICAL',             0, actCount, 0.0,  0, 'low',    true,  'criticalPathReliability'),
      _mkRule('CRITICAL_RATIO',           0, actCount, 0.0,  5, 'low',    true,  'criticalPathReliability'),
      _mkRule('INPROGRESS_NO_ACTUAL_START',0,actCount, 0.0,  0, 'low',    true,  'dateIntegrity'),
      _mkRule('INVALID_FORECAST_DATES',   0, actCount, 0.0,  0, 'low',    true,  'dateIntegrity'),
    ];
    const milestones = [
      { id:'ms1_1', name:'Cave System Levels 1–3 Structural Complete', plannedDate:'2024-10-01', earlyFinish:'2024-10-01', actualDate:null, status:'on_track', isCritical:true,  variance:0, wbsId:'wbs-constr'   },
      { id:'ms1_2', name:'Structural Reinforcement & Shotcrete Complete', plannedDate:'2025-01-15', earlyFinish:'2025-01-15', actualDate:null, status:'on_track', isCritical:true,  variance:0, wbsId:'wbs-constr'   },
      { id:'ms1_3', name:'Primary Power Grid Online',           plannedDate:'2025-06-30', earlyFinish:'2025-06-30', actualDate:null, status:'on_track', isCritical:true,  variance:0, wbsId:'wbs-contract' },
      { id:'ms1_4', name:'Batmobile Vault Operational',         plannedDate:'2025-09-30', earlyFinish:'2025-09-30', actualDate:null, status:'on_track', isCritical:true,  variance:0, wbsId:'wbs-contract' },
      { id:'ms1_5', name:'Computer Core Installation Complete', plannedDate:'2025-10-31', earlyFinish:'2025-10-31', actualDate:null, status:'on_track', isCritical:true,  variance:0, wbsId:'wbs-contract' },
      { id:'ms1_6', name:'Medical Bay Operational',             plannedDate:'2026-02-28', earlyFinish:'2026-02-28', actualDate:null, status:'on_track', isCritical:false, variance:0, wbsId:'wbs-tech'     },
      { id:'ms1_7', name:'Substantial Completion',              plannedDate:'2026-10-31', earlyFinish:'2026-10-31', actualDate:null, status:'on_track', isCritical:true,  variance:0, wbsId:'wbs-contract' }
    ];
    return {
      id:'vb1', projectId:'proj-004', isDemo:true, isReal:true,
      version:'Baseline', dataDate:'2024-05-01', uploadDate:'2024-05-06',
      filename:'Batcave_Baseline.xer', overallScore:overall,
      activityCount:actCount, relationshipCount:relCount,
      milestoneCount:msCount, plannedFinish:'2026-10-31',
      criticalPath:{ projectDuration:640 }, status:'published',
      analysisResults:{
        rules, categoryScores:_catScores(scores),
        overallScore:overall, rag:_rag(overall),
        activityCount:actCount, relationshipCount:relCount,
        criticalCount:critCount, negativeFloatCount:negFloat,
        milestoneCount:msCount, dataDate:'2024-05-01'
      },
      activityLookup:_mkActs('vb1',[35,42,28,51,67,33,41,19,45,38,29,55,71,22,48,36,44,30,58,47,62,25,39,53,31,64,43,56,77,28,41,35,60,48,23,37,52,44,33,68,21,47,56,39,29,43,71,25,38,55,19,46,32,61,44,37,50,27,43,34]),
      wbsLookup: BATCAVE_WBS,
      milestones
    };
  })(),

  // ── vb2 Update 1 ─────────────────────────────────────────
  (function() {
    const actCount = 1118, relCount = 2096, critCount = 62, negFloat = 0, msCount = 43;
    const scores = { logicQuality:86, dateIntegrity:88, constraintsFloat:82, activityHygiene:90, progressRealism:82, criticalPathReliability:81 };
    const overall = 84;
    const rules = [
      _mkRule('OPEN_ENDS_PREDECESSOR',   19, actCount, 2.4,  6, 'medium',   true,  'logicQuality'),
      _mkRule('OPEN_ENDS_SUCCESSOR',     31, actCount, 3.9,  8, 'medium',   true,  'logicQuality'),
      _mkRule('NEGATIVE_LAG_LEADS',       3, relCount, 0.14,10, 'critical', false, 'logicQuality'),
      _mkRule('EXCESSIVE_LAG',            0, relCount, 0.0,  0, 'low',      true,  'logicQuality'),
      _mkRule('NON_FS_RELATIONSHIPS',     0, relCount, 0.0,  0, 'low',      true,  'logicQuality'),
      _mkRule('RELATIONSHIP_DENSITY',     0, relCount, 0.0,  0, 'low',      true,  'logicQuality'),
      _mkRule('FUTURE_ACTUALS',           7, actCount, 0.6,  6, 'medium',   true,  'dateIntegrity'),
      _mkRule('INPROGRESS_NO_ACTUAL_START',5,actCount, 0.4,  6, 'medium',   true,  'dateIntegrity'),
      _mkRule('COMPLETE_NO_ACTUAL_FINISH', 0, actCount, 0.0, 0, 'low',      true,  'dateIntegrity'),
      _mkRule('INVALID_FORECAST_DATES',   0, actCount, 0.0,  0, 'low',      true,  'dateIntegrity'),
      _mkRule('NEGATIVE_FLOAT',           0, actCount, 0.0,  0, 'low',      true,  'constraintsFloat'),
      _mkRule('EXCESSIVE_CONSTRAINTS',   27, actCount, 2.4,  8, 'medium',   true,  'constraintsFloat'),
      _mkRule('HIGH_FLOAT',              52, actCount, 4.7, 10, 'low',      true,  'constraintsFloat'),
      _mkRule('LONG_DURATION',           11, actCount, 1.0,  5, 'low',      true,  'activityHygiene'),
      _mkRule('LOE_PERCENTAGE',          14, actCount, 1.3,  5, 'low',      true,  'activityHygiene'),
      _mkRule('ZERO_DURATION_NON_MILESTONE',0,actCount,0.0,  0, 'low',      true,  'activityHygiene'),
      _mkRule('OUT_OF_SEQUENCE',          0, actCount, 0.0,  0, 'low',      true,  'progressRealism'),
      _mkRule('BEHIND_SCHEDULE',         44, actCount, 3.9, 10, 'medium',   true,  'progressRealism'),
      _mkRule('STARTED_NO_PROGRESS',     18, actCount, 1.6,  8, 'medium',   true,  'progressRealism'),
      _mkRule('NEAR_CRITICAL_DENSITY',   56, actCount, 5.0, 12, 'medium',   true,  'criticalPathReliability'),
      _mkRule('LOE_CRITICAL',             4, actCount, 0.4,  7, 'medium',   true,  'criticalPathReliability'),
      _mkRule('CRITICAL_RATIO',           0, actCount, 0.0,  0, 'low',      true,  'criticalPathReliability'),
    ];
    const milestones = [
      { id:'ms2_1', name:'Cave System Levels 1–3 Structural Complete', plannedDate:'2024-10-01', earlyFinish:'2024-10-04', actualDate:null, status:'on_track', isCritical:true,  variance:3, wbsId:'wbs-constr'   },
      { id:'ms2_2', name:'Structural Reinforcement & Shotcrete Complete', plannedDate:'2025-01-15', earlyFinish:'2025-01-17', actualDate:null, status:'on_track', isCritical:true,  variance:2, wbsId:'wbs-constr'   },
      { id:'ms2_3', name:'Primary Power Grid Online',           plannedDate:'2025-06-30', earlyFinish:'2025-07-08', actualDate:null, status:'on_track', isCritical:true,  variance:8, wbsId:'wbs-contract' },
      { id:'ms2_4', name:'Batmobile Vault Operational',         plannedDate:'2025-09-30', earlyFinish:'2025-10-07', actualDate:null, status:'on_track', isCritical:true,  variance:7, wbsId:'wbs-contract' },
      { id:'ms2_5', name:'Computer Core Installation Complete', plannedDate:'2025-10-31', earlyFinish:'2025-11-07', actualDate:null, status:'on_track', isCritical:true,  variance:7, wbsId:'wbs-contract' },
      { id:'ms2_6', name:'Medical Bay Operational',             plannedDate:'2026-02-28', earlyFinish:'2026-03-04', actualDate:null, status:'on_track', isCritical:false, variance:4, wbsId:'wbs-tech'     },
      { id:'ms2_7', name:'Substantial Completion',              plannedDate:'2026-10-31', earlyFinish:'2026-11-08', actualDate:null, status:'on_track', isCritical:true,  variance:8, wbsId:'wbs-contract' }
    ];
    return {
      id:'vb2', projectId:'proj-004', isDemo:true, isReal:true,
      version:'Update 1', dataDate:'2024-08-01', uploadDate:'2024-08-07',
      filename:'Batcave_Update1.xer', overallScore:overall,
      activityCount:actCount, relationshipCount:relCount,
      milestoneCount:msCount, plannedFinish:'2026-11-14',
      criticalPath:{ projectDuration:655 }, status:'published',
      analysisResults:{
        rules, categoryScores:_catScores(scores),
        overallScore:overall, rag:_rag(overall),
        activityCount:actCount, relationshipCount:relCount,
        criticalCount:critCount, negativeFloatCount:negFloat,
        milestoneCount:msCount, dataDate:'2024-08-01'
      },
      activityLookup:_mkActs('vb2',[31,38,24,47,63,29,37,16,41,34,25,51,67,18,44,32,40,26,54,43,59,21,35,49,27,60,39,52,73,24,37,31,56,44,19,33,48,40,29,64,17,43,52,35,25,39,67,21,34,51,15,42,28,57,40,33,46,23,39,30]),
      wbsLookup: BATCAVE_WBS,
      milestones
    };
  })(),

  // ── vb3 Update 2 ─────────────────────────────────────────
  (function() {
    const actCount = 1136, relCount = 2130, critCount = 78, negFloat = 3, msCount = 44;
    const scores = { logicQuality:81, dateIntegrity:83, constraintsFloat:76, activityHygiene:86, progressRealism:77, criticalPathReliability:77 };
    const overall = 79;
    const rules = [
      _mkRule('OPEN_ENDS_PREDECESSOR',   28, actCount, 3.5, 10, 'high',     true,  'logicQuality'),
      _mkRule('OPEN_ENDS_SUCCESSOR',     39, actCount, 4.9,  9, 'high',     true,  'logicQuality'),
      _mkRule('NEGATIVE_LAG_LEADS',       5, relCount, 0.23,12, 'critical', false, 'logicQuality'),
      _mkRule('EXCESSIVE_LAG',            0, relCount, 0.0,  0, 'low',      true,  'logicQuality'),
      _mkRule('NON_FS_RELATIONSHIPS',     0, relCount, 0.0,  0, 'low',      true,  'logicQuality'),
      _mkRule('RELATIONSHIP_DENSITY',     0, relCount, 0.0,  0, 'low',      true,  'logicQuality'),
      _mkRule('FUTURE_ACTUALS',          11, actCount, 1.0,  9, 'high',     true,  'dateIntegrity'),
      _mkRule('INPROGRESS_NO_ACTUAL_START',8,actCount, 0.7,  8, 'medium',   true,  'dateIntegrity'),
      _mkRule('COMPLETE_NO_ACTUAL_FINISH', 0, actCount, 0.0, 0, 'low',      true,  'dateIntegrity'),
      _mkRule('INVALID_FORECAST_DATES',   0, actCount, 0.0,  0, 'low',      true,  'dateIntegrity'),
      _mkRule('NEGATIVE_FLOAT',           3, actCount, 0.3,  8, 'high',     true,  'constraintsFloat'),
      _mkRule('EXCESSIVE_CONSTRAINTS',   44, actCount, 3.9, 11, 'high',     true,  'constraintsFloat'),
      _mkRule('HIGH_FLOAT',              61, actCount, 5.4, 13, 'medium',   true,  'constraintsFloat'),
      _mkRule('LONG_DURATION',           16, actCount, 1.4,  8, 'medium',   true,  'activityHygiene'),
      _mkRule('LOE_PERCENTAGE',          18, actCount, 1.6,  6, 'low',      true,  'activityHygiene'),
      _mkRule('ZERO_DURATION_NON_MILESTONE',0,actCount,0.0,  0, 'low',      true,  'activityHygiene'),
      _mkRule('OUT_OF_SEQUENCE',          9, actCount, 0.8,  5, 'medium',   true,  'progressRealism'),
      _mkRule('BEHIND_SCHEDULE',         57, actCount, 5.0, 12, 'high',     true,  'progressRealism'),
      _mkRule('STARTED_NO_PROGRESS',     22, actCount, 1.9, 11, 'high',     true,  'progressRealism'),
      _mkRule('NEAR_CRITICAL_DENSITY',   78, actCount, 6.9, 14, 'medium',   true,  'criticalPathReliability'),
      _mkRule('LOE_CRITICAL',             6, actCount, 0.5,  9, 'medium',   true,  'criticalPathReliability'),
      _mkRule('CRITICAL_RATIO',           0, actCount, 0.0,  0, 'low',      true,  'criticalPathReliability'),
    ];
    const milestones = [
      { id:'ms3_1', name:'Cave System Levels 1–3 Structural Complete', plannedDate:'2024-10-01', earlyFinish:'2024-10-03', actualDate:'2024-10-03', status:'complete',  isCritical:true,  variance:2,  wbsId:'wbs-constr'   },
      { id:'ms3_2', name:'Structural Reinforcement & Shotcrete Complete', plannedDate:'2025-01-15', earlyFinish:'2025-01-21', actualDate:null, status:'on_track', isCritical:true,  variance:6,  wbsId:'wbs-constr'   },
      { id:'ms3_3', name:'Primary Power Grid Online',           plannedDate:'2025-06-30', earlyFinish:'2025-07-24', actualDate:null, status:'slipping',  isCritical:true,  variance:24, wbsId:'wbs-contract' },
      { id:'ms3_4', name:'Batmobile Vault Operational',         plannedDate:'2025-09-30', earlyFinish:'2025-10-22', actualDate:null, status:'slipping',  isCritical:true,  variance:22, wbsId:'wbs-contract' },
      { id:'ms3_5', name:'Computer Core Installation Complete', plannedDate:'2025-10-31', earlyFinish:'2025-11-25', actualDate:null, status:'slipping',  isCritical:true,  variance:25, wbsId:'wbs-contract' },
      { id:'ms3_6', name:'Medical Bay Operational',             plannedDate:'2026-02-28', earlyFinish:'2026-03-10', actualDate:null, status:'on_track',  isCritical:false, variance:10, wbsId:'wbs-tech'     },
      { id:'ms3_7', name:'Substantial Completion',              plannedDate:'2026-10-31', earlyFinish:'2026-11-25', actualDate:null, status:'slipping',  isCritical:true,  variance:25, wbsId:'wbs-contract' }
    ];
    return {
      id:'vb3', projectId:'proj-004', isDemo:true, isReal:true,
      version:'Update 2', dataDate:'2024-11-01', uploadDate:'2024-11-08',
      filename:'Batcave_Update2.xer', overallScore:overall,
      activityCount:actCount, relationshipCount:relCount,
      milestoneCount:msCount, plannedFinish:'2026-12-05',
      criticalPath:{ projectDuration:672 }, status:'published',
      analysisResults:{
        rules, categoryScores:_catScores(scores),
        overallScore:overall, rag:_rag(overall),
        activityCount:actCount, relationshipCount:relCount,
        criticalCount:critCount, negativeFloatCount:negFloat,
        milestoneCount:msCount, dataDate:'2024-11-01'
      },
      activityLookup:_mkActs('vb3',[22,30,17,41,56,23,31,10,35,27,19,45,60,13,38,25,33,19,48,36,52,15,28,43,21,54,32,46,67,18,30,24,49,37,13,27,41,33,22,57,11,36,45,28,18,32,60,14,27,44,9,35,21,50,33,26,39,17,32,23]),
      wbsLookup: BATCAVE_WBS,
      milestones
    };
  })(),

  // ── vb4 Update 3 ─────────────────────────────────────────
  (function() {
    const actCount = 1194, relCount = 2240, critCount = 105, negFloat = 12, msCount = 45;
    const scores = { logicQuality:72, dateIntegrity:76, constraintsFloat:66, activityHygiene:79, progressRealism:70, criticalPathReliability:70 };
    const overall = 71;
    const rules = [
      _mkRule('OPEN_ENDS_PREDECESSOR',   47, actCount, 5.6, 18, 'critical', false, 'logicQuality'),
      _mkRule('OPEN_ENDS_SUCCESSOR',     58, actCount, 6.9, 10, 'critical', false, 'logicQuality'),
      _mkRule('NEGATIVE_LAG_LEADS',       8, relCount, 0.36,14, 'critical', false, 'logicQuality'),
      _mkRule('EXCESSIVE_LAG',           48, relCount, 3.6,  8, 'high',     true,  'logicQuality'),
      _mkRule('NON_FS_RELATIONSHIPS',     0, relCount, 0.0,  0, 'low',      true,  'logicQuality'),
      _mkRule('RELATIONSHIP_DENSITY',     0, relCount, 0.0,  0, 'low',      true,  'logicQuality'),
      _mkRule('FUTURE_ACTUALS',          14, actCount, 1.2, 14, 'high',     true,  'dateIntegrity'),
      _mkRule('INPROGRESS_NO_ACTUAL_START',13,actCount,1.1, 10, 'high',     true,  'dateIntegrity'),
      _mkRule('COMPLETE_NO_ACTUAL_FINISH', 0, actCount, 0.0, 0, 'low',      true,  'dateIntegrity'),
      _mkRule('INVALID_FORECAST_DATES',   0, actCount, 0.0,  0, 'low',      true,  'dateIntegrity'),
      _mkRule('NEGATIVE_FLOAT',          12, actCount, 1.0, 16, 'critical', false, 'constraintsFloat'),
      _mkRule('EXCESSIVE_CONSTRAINTS',   74, actCount, 6.2, 16, 'high',     true,  'constraintsFloat'),
      _mkRule('HIGH_FLOAT',              72, actCount, 6.0, 10, 'medium',   true,  'constraintsFloat'),
      _mkRule('LONG_DURATION',           21, actCount, 1.8, 12, 'high',     true,  'activityHygiene'),
      _mkRule('LOE_PERCENTAGE',          24, actCount, 2.0,  9, 'medium',   true,  'activityHygiene'),
      _mkRule('ZERO_DURATION_NON_MILESTONE',0,actCount,0.0,  0, 'low',      true,  'activityHygiene'),
      _mkRule('OUT_OF_SEQUENCE',         18, actCount, 1.5,  8, 'high',     true,  'progressRealism'),
      _mkRule('BEHIND_SCHEDULE',         74, actCount, 6.2, 16, 'critical', false, 'progressRealism'),
      _mkRule('STARTED_NO_PROGRESS',     34, actCount, 2.8, 14, 'high',     true,  'progressRealism'),
      _mkRule('NEAR_CRITICAL_DENSITY',  105, actCount, 8.8, 22, 'high',     true,  'criticalPathReliability'),
      _mkRule('LOE_CRITICAL',             9, actCount, 0.8,  8, 'high',     true,  'criticalPathReliability'),
      _mkRule('CRITICAL_RATIO',           0, actCount, 0.0,  0, 'low',      true,  'criticalPathReliability'),
    ];
    const milestones = [
      { id:'ms4_1', name:'Cave System Levels 1–3 Structural Complete', plannedDate:'2024-10-01', earlyFinish:'2024-10-03', actualDate:'2024-10-03', status:'complete',  isCritical:true,  variance:2,  wbsId:'wbs-constr'   },
      { id:'ms4_2', name:'Structural Reinforcement & Shotcrete Complete', plannedDate:'2025-01-15', earlyFinish:'2025-01-22', actualDate:'2025-01-22', status:'complete',  isCritical:true,  variance:7,  wbsId:'wbs-constr'   },
      { id:'ms4_3', name:'Primary Power Grid Online',           plannedDate:'2025-06-30', earlyFinish:'2025-08-15', actualDate:null, status:'slipping',  isCritical:true,  variance:46, wbsId:'wbs-contract' },
      { id:'ms4_4', name:'Batmobile Vault Operational',         plannedDate:'2025-09-30', earlyFinish:'2025-11-05', actualDate:null, status:'slipping',  isCritical:true,  variance:36, wbsId:'wbs-contract' },
      { id:'ms4_5', name:'Computer Core Installation Complete', plannedDate:'2025-10-31', earlyFinish:'2025-12-09', actualDate:null, status:'slipping',  isCritical:true,  variance:39, wbsId:'wbs-contract' },
      { id:'ms4_6', name:'Medical Bay Operational',             plannedDate:'2026-02-28', earlyFinish:'2026-03-19', actualDate:null, status:'on_track',  isCritical:false, variance:19, wbsId:'wbs-tech'     },
      { id:'ms4_7', name:'Substantial Completion',              plannedDate:'2026-10-31', earlyFinish:'2026-12-24', actualDate:null, status:'slipping',  isCritical:true,  variance:54, wbsId:'wbs-contract' }
    ];
    return {
      id:'vb4', projectId:'proj-004', isDemo:true, isReal:true,
      version:'Update 3', dataDate:'2025-02-01', uploadDate:'2025-02-09',
      filename:'Batcave_Update3.xer', overallScore:overall,
      activityCount:actCount, relationshipCount:relCount,
      milestoneCount:msCount, plannedFinish:'2026-12-19',
      criticalPath:{ projectDuration:710 }, status:'published',
      analysisResults:{
        rules, categoryScores:_catScores(scores),
        overallScore:overall, rag:_rag(overall),
        activityCount:actCount, relationshipCount:relCount,
        criticalCount:critCount, negativeFloatCount:negFloat,
        milestoneCount:msCount, dataDate:'2025-02-01'
      },
      activityLookup:_mkActs('vb4',[3,7,1,12,5,18,8,22,2,6,9,16,1,4,8,21,25,30,17,11,13,34,19,38,23,16,10,26,31,43,8,14,5,24,20,11,33,27,15,19,7,30,42,17,9,23,38,13,26,21,8,35,18,44,31,14,25,10,20,16]),
      wbsLookup: BATCAVE_WBS,
      milestones
    };
  })(),

  // ── vb5 Update 4 (cave-in worst) ─────────────────────────
  (function() {
    const actCount = 1221, relCount = 2290, critCount = 148, negFloat = 28, msCount = 46;
    const scores = { logicQuality:63, dateIntegrity:70, constraintsFloat:58, activityHygiene:74, progressRealism:64, criticalPathReliability:64 };
    const overall = 65;
    const rules = [
      _mkRule('OPEN_ENDS_PREDECESSOR',   62, actCount, 7.4, 22, 'critical', false, 'logicQuality'),
      _mkRule('OPEN_ENDS_SUCCESSOR',     79, actCount, 9.4, 15, 'critical', false, 'logicQuality'),
      _mkRule('NEGATIVE_LAG_LEADS',      14, relCount, 0.61,18, 'critical', false, 'logicQuality'),
      _mkRule('EXCESSIVE_LAG',           68, relCount, 5.1, 12, 'high',     false, 'logicQuality'),
      _mkRule('NON_FS_RELATIONSHIPS',     0, relCount, 0.0,  0, 'low',      true,  'logicQuality'),
      _mkRule('RELATIONSHIP_DENSITY',     0, relCount, 0.0,  0, 'low',      true,  'logicQuality'),
      _mkRule('FUTURE_ACTUALS',          17, actCount, 1.4, 18, 'critical', false, 'dateIntegrity'),
      _mkRule('INPROGRESS_NO_ACTUAL_START',18,actCount,1.5, 12, 'high',     true,  'dateIntegrity'),
      _mkRule('COMPLETE_NO_ACTUAL_FINISH', 0, actCount, 0.0, 0, 'low',      true,  'dateIntegrity'),
      _mkRule('INVALID_FORECAST_DATES',   0, actCount, 0.0,  0, 'low',      true,  'dateIntegrity'),
      _mkRule('NEGATIVE_FLOAT',          28, actCount, 2.3, 22, 'critical', false, 'constraintsFloat'),
      _mkRule('EXCESSIVE_CONSTRAINTS',  103, actCount, 8.4, 20, 'critical', false, 'constraintsFloat'),
      _mkRule('HIGH_FLOAT',              87, actCount, 7.1, 10, 'medium',   true,  'constraintsFloat'),
      _mkRule('LONG_DURATION',           24, actCount, 2.0, 14, 'high',     true,  'activityHygiene'),
      _mkRule('LOE_PERCENTAGE',          31, actCount, 2.5, 12, 'medium',   true,  'activityHygiene'),
      _mkRule('ZERO_DURATION_NON_MILESTONE',0,actCount,0.0,  0, 'low',      true,  'activityHygiene'),
      _mkRule('OUT_OF_SEQUENCE',         28, actCount, 2.3, 12, 'high',     true,  'progressRealism'),
      _mkRule('BEHIND_SCHEDULE',         84, actCount, 6.9, 20, 'critical', false, 'progressRealism'),
      _mkRule('STARTED_NO_PROGRESS',     37, actCount, 3.0, 16, 'high',     true,  'progressRealism'),
      _mkRule('NEAR_CRITICAL_DENSITY',  148, actCount,12.1, 28, 'critical', false, 'criticalPathReliability'),
      _mkRule('LOE_CRITICAL',            11, actCount, 0.9,  8, 'high',     true,  'criticalPathReliability'),
      _mkRule('CRITICAL_RATIO',           0, actCount, 0.0,  0, 'low',      true,  'criticalPathReliability'),
    ];
    const milestones = [
      { id:'ms5_1', name:'Cave System Levels 1–3 Structural Complete', plannedDate:'2024-10-01', earlyFinish:'2024-10-03', actualDate:'2024-10-03', status:'complete',  isCritical:true,  variance:2,   wbsId:'wbs-constr'   },
      { id:'ms5_2', name:'Structural Reinforcement & Shotcrete Complete', plannedDate:'2025-01-15', earlyFinish:'2025-01-22', actualDate:'2025-01-22', status:'complete',  isCritical:true,  variance:7,   wbsId:'wbs-constr'   },
      { id:'ms5_3', name:'Primary Power Grid Online',           plannedDate:'2025-06-30', earlyFinish:'2025-08-21', actualDate:null, status:'slipping',  isCritical:true,  variance:52,  wbsId:'wbs-contract' },
      { id:'ms5_4', name:'Batmobile Vault Operational',         plannedDate:'2025-09-30', earlyFinish:'2025-12-08', actualDate:null, status:'slipping',  isCritical:true,  variance:69,  wbsId:'wbs-contract' },
      { id:'ms5_5', name:'Computer Core Installation Complete', plannedDate:'2025-10-31', earlyFinish:'2025-12-17', actualDate:null, status:'slipping',  isCritical:true,  variance:47,  wbsId:'wbs-contract' },
      { id:'ms5_6', name:'Medical Bay Operational',             plannedDate:'2026-02-28', earlyFinish:'2026-04-02', actualDate:null, status:'at_risk',   isCritical:false, variance:33,  wbsId:'wbs-tech'     },
      { id:'ms5_7', name:'Substantial Completion',              plannedDate:'2026-10-31', earlyFinish:'2027-02-10', actualDate:null, status:'slipping',  isCritical:true,  variance:102, wbsId:'wbs-contract' }
    ];
    return {
      id:'vb5', projectId:'proj-004', isDemo:true, isReal:true,
      version:'Update 4', dataDate:'2025-05-01', uploadDate:'2025-05-08',
      filename:'Batcave_Update4.xer', overallScore:overall,
      activityCount:actCount, relationshipCount:relCount,
      milestoneCount:msCount, plannedFinish:'2027-02-10',
      criticalPath:{ projectDuration:748 }, status:'published',
      analysisResults:{
        rules, categoryScores:_catScores(scores),
        overallScore:overall, rag:_rag(overall),
        activityCount:actCount, relationshipCount:relCount,
        criticalCount:critCount, negativeFloatCount:negFloat,
        milestoneCount:msCount, dataDate:'2025-05-01'
      },
      activityLookup:_mkActs('vb5',[-8,-5,-12,-3,-7,-1,-9,-4,-6,-11,-2,0,1,-3,-6,0,-1,2,3,4,5,3,6,7,4,2,8,5,3,6,1,0,-1,7,5,3,2,1,0,10,13,16,9,12,14,7,11,8,15,18,22,19,15,21,16,18,20,13,11,-2]),
      wbsLookup: BATCAVE_WBS,
      milestones
    };
  })(),

  // ── vb6 Update 5 (recovery begins) ───────────────────────
  (function() {
    const actCount = 1238, relCount = 2321, critCount = 112, negFloat = 18, msCount = 46;
    const scores = { logicQuality:67, dateIntegrity:73, constraintsFloat:62, activityHygiene:77, progressRealism:67, criticalPathReliability:68 };
    const overall = 69;
    const rules = [
      _mkRule('OPEN_ENDS_PREDECESSOR',   52, actCount, 6.2, 18, 'critical', false, 'logicQuality'),
      _mkRule('OPEN_ENDS_SUCCESSOR',     64, actCount, 7.6, 15, 'critical', false, 'logicQuality'),
      _mkRule('NEGATIVE_LAG_LEADS',       9, relCount, 0.39,14, 'critical', false, 'logicQuality'),
      _mkRule('EXCESSIVE_LAG',            0, relCount, 0.0,  0, 'low',      true,  'logicQuality'),
      _mkRule('NON_FS_RELATIONSHIPS',     0, relCount, 0.0,  0, 'low',      true,  'logicQuality'),
      _mkRule('RELATIONSHIP_DENSITY',     0, relCount, 0.0,  0, 'low',      true,  'logicQuality'),
      _mkRule('FUTURE_ACTUALS',          13, actCount, 1.1, 14, 'high',     true,  'dateIntegrity'),
      _mkRule('INPROGRESS_NO_ACTUAL_START',14,actCount,1.1, 13, 'high',     true,  'dateIntegrity'),
      _mkRule('COMPLETE_NO_ACTUAL_FINISH', 0, actCount, 0.0, 0, 'low',      true,  'dateIntegrity'),
      _mkRule('INVALID_FORECAST_DATES',   0, actCount, 0.0,  0, 'low',      true,  'dateIntegrity'),
      _mkRule('NEGATIVE_FLOAT',          18, actCount, 1.5, 18, 'critical', false, 'constraintsFloat'),
      _mkRule('EXCESSIVE_CONSTRAINTS',   88, actCount, 7.1, 18, 'high',     false, 'constraintsFloat'),
      _mkRule('HIGH_FLOAT',              79, actCount, 6.4, 10, 'medium',   true,  'constraintsFloat'),
      _mkRule('LONG_DURATION',           22, actCount, 1.8, 12, 'high',     true,  'activityHygiene'),
      _mkRule('LOE_PERCENTAGE',          27, actCount, 2.2, 11, 'medium',   true,  'activityHygiene'),
      _mkRule('ZERO_DURATION_NON_MILESTONE',0,actCount,0.0,  0, 'low',      true,  'activityHygiene'),
      _mkRule('OUT_OF_SEQUENCE',         21, actCount, 1.7,  9, 'medium',   true,  'progressRealism'),
      _mkRule('BEHIND_SCHEDULE',         77, actCount, 6.2, 18, 'critical', false, 'progressRealism'),
      _mkRule('STARTED_NO_PROGRESS',     31, actCount, 2.5, 15, 'high',     true,  'progressRealism'),
      _mkRule('NEAR_CRITICAL_DENSITY',  112, actCount, 9.0, 24, 'high',     true,  'criticalPathReliability'),
      _mkRule('LOE_CRITICAL',             9, actCount, 0.7,  8, 'high',     true,  'criticalPathReliability'),
      _mkRule('CRITICAL_RATIO',           0, actCount, 0.0,  0, 'low',      true,  'criticalPathReliability'),
    ];
    const milestones = [
      { id:'ms6_1', name:'Cave System Levels 1–3 Structural Complete', plannedDate:'2024-10-01', earlyFinish:'2024-10-03', actualDate:'2024-10-03', status:'complete',  isCritical:true,  variance:2,  wbsId:'wbs-constr'   },
      { id:'ms6_2', name:'Structural Reinforcement & Shotcrete Complete', plannedDate:'2025-01-15', earlyFinish:'2025-01-22', actualDate:'2025-01-22', status:'complete',  isCritical:true,  variance:7,  wbsId:'wbs-constr'   },
      { id:'ms6_3', name:'Primary Power Grid Online',           plannedDate:'2025-06-30', earlyFinish:'2025-09-15', actualDate:null, status:'slipping',  isCritical:true,  variance:77, wbsId:'wbs-contract' },
      { id:'ms6_4', name:'Batmobile Vault Operational',         plannedDate:'2025-09-30', earlyFinish:'2025-11-20', actualDate:null, status:'slipping',  isCritical:true,  variance:51, wbsId:'wbs-contract' },
      { id:'ms6_5', name:'Computer Core Installation Complete', plannedDate:'2025-10-31', earlyFinish:'2025-12-03', actualDate:null, status:'slipping',  isCritical:true,  variance:33, wbsId:'wbs-contract' },
      { id:'ms6_6', name:'Medical Bay Operational',             plannedDate:'2026-02-28', earlyFinish:'2026-03-07', actualDate:null, status:'on_track',  isCritical:false, variance:7,  wbsId:'wbs-tech'     },
      { id:'ms6_7', name:'Substantial Completion',              plannedDate:'2026-10-31', earlyFinish:'2027-01-27', actualDate:null, status:'slipping',  isCritical:true,  variance:88, wbsId:'wbs-contract' }
    ];
    return {
      id:'vb6', projectId:'proj-004', isDemo:true, isReal:true,
      version:'Update 5', dataDate:'2025-08-01', uploadDate:'2025-08-07',
      filename:'Batcave_Update5.xer', overallScore:overall,
      activityCount:actCount, relationshipCount:relCount,
      milestoneCount:msCount, plannedFinish:'2027-01-15',
      criticalPath:{ projectDuration:520 }, status:'published',
      analysisResults:{
        rules, categoryScores:_catScores(scores),
        overallScore:overall, rag:_rag(overall),
        activityCount:actCount, relationshipCount:relCount,
        criticalCount:critCount, negativeFloatCount:negFloat,
        milestoneCount:msCount, dataDate:'2025-08-01'
      },
      activityLookup:_mkActs('vb6',[-3,-1,0,1,2,4,6,8,3,5,7,9,2,11,13,16,11,14,18,21,24,17,20,23,15,12,19,22,26,30,34,37,28,32,35,-1,0,2,4,5,3,7,4,6,14,17,11,21,18,25,27,31,23,16,20,28,35,39,13,8]),
      wbsLookup: BATCAVE_WBS,
      milestones
    };
  })(),

  // ── vb7 Update 6 (continuing recovery) ───────────────────
  (function() {
    const actCount = 1247, relCount = 2338, critCount = 87, negFloat = 8, msCount = 47;
    const scores = { logicQuality:70, dateIntegrity:78, constraintsFloat:68, activityHygiene:80, progressRealism:72, criticalPathReliability:76 };
    const overall = 74;
    const rules = [
      _mkRule('OPEN_ENDS_PREDECESSOR',   41, actCount, 4.9, 14, 'high',     true,  'logicQuality'),
      _mkRule('OPEN_ENDS_SUCCESSOR',     52, actCount, 6.2, 16, 'critical', false, 'logicQuality'),
      _mkRule('NEGATIVE_LAG_LEADS',       5, relCount, 0.21,12, 'critical', false, 'logicQuality'),
      _mkRule('EXCESSIVE_LAG',            0, relCount, 0.0,  0, 'low',      true,  'logicQuality'),
      _mkRule('NON_FS_RELATIONSHIPS',     0, relCount, 0.0,  0, 'low',      true,  'logicQuality'),
      _mkRule('RELATIONSHIP_DENSITY',     0, relCount, 0.0,  0, 'low',      true,  'logicQuality'),
      _mkRule('FUTURE_ACTUALS',           9, actCount, 0.7, 12, 'high',     true,  'dateIntegrity'),
      _mkRule('INPROGRESS_NO_ACTUAL_START',9,actCount, 0.7, 10, 'medium',   true,  'dateIntegrity'),
      _mkRule('COMPLETE_NO_ACTUAL_FINISH', 0, actCount, 0.0, 0, 'low',      true,  'dateIntegrity'),
      _mkRule('INVALID_FORECAST_DATES',   0, actCount, 0.0,  0, 'low',      true,  'dateIntegrity'),
      _mkRule('NEGATIVE_FLOAT',           8, actCount, 0.6, 12, 'high',     true,  'constraintsFloat'),
      _mkRule('EXCESSIVE_CONSTRAINTS',   71, actCount, 5.7, 14, 'high',     true,  'constraintsFloat'),
      _mkRule('HIGH_FLOAT',              68, actCount, 5.5, 10, 'medium',   true,  'constraintsFloat'),
      _mkRule('LONG_DURATION',           18, actCount, 1.4, 10, 'medium',   true,  'activityHygiene'),
      _mkRule('LOE_PERCENTAGE',          22, actCount, 1.8, 10, 'low',      true,  'activityHygiene'),
      _mkRule('ZERO_DURATION_NON_MILESTONE',0,actCount,0.0,  0, 'low',      true,  'activityHygiene'),
      _mkRule('OUT_OF_SEQUENCE',         14, actCount, 1.1,  6, 'medium',   true,  'progressRealism'),
      _mkRule('BEHIND_SCHEDULE',         67, actCount, 5.4, 16, 'high',     false, 'progressRealism'),
      _mkRule('STARTED_NO_PROGRESS',     24, actCount, 1.9, 12, 'medium',   true,  'progressRealism'),
      _mkRule('NEAR_CRITICAL_DENSITY',   87, actCount, 7.0, 18, 'medium',   true,  'criticalPathReliability'),
      _mkRule('LOE_CRITICAL',             7, actCount, 0.6,  6, 'low',      true,  'criticalPathReliability'),
      _mkRule('CRITICAL_RATIO',           0, actCount, 0.0,  0, 'low',      true,  'criticalPathReliability'),
    ];
    const milestones = [
      { id:'ms7_1', name:'Cave System Levels 1–3 Structural Complete', plannedDate:'2024-10-01', earlyFinish:'2024-10-03', actualDate:'2024-10-03', status:'complete',  isCritical:true,  variance:2,  wbsId:'wbs-constr'   },
      { id:'ms7_2', name:'Structural Reinforcement & Shotcrete Complete', plannedDate:'2025-01-15', earlyFinish:'2025-01-22', actualDate:'2025-01-22', status:'complete',  isCritical:true,  variance:7,  wbsId:'wbs-constr'   },
      { id:'ms7_3', name:'Primary Power Grid Online',           plannedDate:'2025-06-30', earlyFinish:'2025-08-07', actualDate:'2025-08-07', status:'complete',  isCritical:true,  variance:38, wbsId:'wbs-contract' },
      { id:'ms7_4', name:'Batmobile Vault Operational',         plannedDate:'2025-09-30', earlyFinish:'2025-11-20', actualDate:null, status:'at_risk',   isCritical:true,  variance:51, wbsId:'wbs-contract' },
      { id:'ms7_5', name:'Computer Core Installation Complete', plannedDate:'2025-10-31', earlyFinish:'2025-12-03', actualDate:null, status:'slipping',  isCritical:true,  variance:33, wbsId:'wbs-contract' },
      { id:'ms7_6', name:'Medical Bay Operational',             plannedDate:'2026-02-28', earlyFinish:'2026-03-04', actualDate:null, status:'on_track',  isCritical:false, variance:4,  wbsId:'wbs-tech'     },
      { id:'ms7_7', name:'Substantial Completion',              plannedDate:'2026-10-31', earlyFinish:'2027-01-11', actualDate:null, status:'slipping',  isCritical:true,  variance:72, wbsId:'wbs-contract' }
    ];
    return {
      id:'vb7', projectId:'proj-004', isDemo:true, isReal:true,
      version:'Update 6', dataDate:'2025-11-01', uploadDate:'2025-11-08',
      filename:'Batcave_Update6.xer', overallScore:overall,
      activityCount:actCount, relationshipCount:relCount,
      milestoneCount:msCount, plannedFinish:'2026-12-19',
      criticalPath:{ projectDuration:495 }, status:'current',
      analysisResults:{
        rules, categoryScores:_catScores(scores),
        overallScore:overall, rag:_rag(overall),
        activityCount:actCount, relationshipCount:relCount,
        criticalCount:critCount, negativeFloatCount:negFloat,
        milestoneCount:msCount, dataDate:'2025-11-01'
      },
      activityLookup:_mkActs('vb7',[-1,0,1,3,5,7,9,2,4,6,8,11,13,16,11,14,18,21,24,17,27,20,23,26,15,12,19,30,34,37,41,28,32,35,38,25,31,43,47,51,36,40,44,33,46,50,39,42,45,48,52,55,29,43,37,41,34,49,35,21]),
      wbsLookup: BATCAVE_WBS,
      milestones
    };
  })()

];

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
// DIAGNOSTICS  (fallback — used when no version is selected)
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
// MILESTONES  (fallback — used when no version is selected)
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
