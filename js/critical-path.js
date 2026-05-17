// critical-path.js
// Uses P6's own calculated dates and float rather than re-running CPM.
// P6 accounts for calendars, constraints, and resource leveling — we don't
// try to replicate that math. We just read what P6 already computed.

class CriticalPathAnalyzer {
  // These types are never schedulable and must never appear on the critical path.
  // LOE activities have float ≈ 0 by P6 design (they span the project);
  // WBS summaries roll up child data and have no independent schedule logic.
  static EXCLUDED = new Set(['TT_LOE', 'TT_WBS']);

  analyze(activities, relationships) {
    if (!activities || activities.length === 0) {
      return { criticalPath: [], longestPath: [], projectDuration: 0 };
    }

    const pd = s => s ? new Date(String(s).replace(' ', 'T')) : null;

    // Work only with real schedulable activities
    const realActs = activities.filter(a => !CriticalPathAnalyzer.EXCLUDED.has(a.type));

    // Critical = zero or negative P6-stored total float, real activity type only
    const criticalActivities = realActs.filter(a =>
      typeof a.totalFloat === 'number' && a.totalFloat <= 0
    );

    if (criticalActivities.length === 0) {
      return { criticalPath: [], longestPath: [], projectDuration: 0 };
    }

    // Build predecessor map restricted to real activities
    const realIds = new Set(realActs.map(a => a.id));
    const predMap = new Map(); // id → [predecessorId, ...]
    realActs.forEach(a => predMap.set(a.id, []));
    relationships.forEach(r => {
      if (realIds.has(r.predecessorId) && realIds.has(r.successorId)) {
        predMap.get(r.successorId)?.push(r.predecessorId);
      }
    });

    // Trace the longest chain of critical activities backwards from the one
    // with the latest early finish (= project end point on the critical path)
    const longestPath = this.traceLongestPath(criticalActivities, predMap, pd);

    // Project duration: span from earliest start to latest finish on the path
    const pathActs = longestPath.length > 0 ? longestPath : criticalActivities;
    const projectDuration = this.computeWorkingDays(pathActs, pd);

    return {
      criticalPath: criticalActivities,
      longestPath,
      projectDuration,
      activityMap: {}
    };
  }

  traceLongestPath(criticalActivities, predMap, pd) {
    const critSet = new Set(criticalActivities.map(a => a.id));
    const actMap  = new Map(criticalActivities.map(a => [a.id, a]));

    const finishOf = a => pd(a.earlyFinish || a.plannedFinish) || new Date(0);

    // Terminal = critical activity with the latest early finish
    const terminal = [...criticalActivities].sort((a, b) => finishOf(b) - finishOf(a))[0];

    const path    = [];
    const visited = new Set();
    let current   = terminal;

    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      path.unshift(current);

      // Among critical predecessors pick the one with the latest early finish
      // (the most constraining / most recently completing predecessor)
      const critPreds = (predMap.get(current.id) || [])
        .filter(pid => critSet.has(pid))
        .map(pid => actMap.get(pid))
        .filter(Boolean)
        .sort((a, b) => finishOf(b) - finishOf(a));

      current = critPreds[0] || null;
    }

    return path;
  }

  computeWorkingDays(activities, pd) {
    const starts   = activities.map(a => pd(a.earlyStart   || a.plannedStart)).filter(Boolean);
    const finishes = activities.map(a => pd(a.earlyFinish  || a.plannedFinish)).filter(Boolean);
    if (!starts.length || !finishes.length) return 0;
    const earliest = new Date(Math.min(...starts.map(d => d.getTime())));
    const latest   = new Date(Math.max(...finishes.map(d => d.getTime())));
    // Approximate working days (calendar days × 5/7, rounded)
    return Math.round((latest - earliest) / 86400000 * 5 / 7);
  }
}

window.CriticalPathAnalyzer = CriticalPathAnalyzer;
