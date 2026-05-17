// critical-path.js
// Priority: use P6's own driving_path_flag (most accurate — P6 computed it with
// full calendar/constraint awareness). Fall back to totalFloat <= 0 if the flag
// is absent (older XER exports that don't include it).

class CriticalPathAnalyzer {
  static EXCLUDED = new Set(['TT_LOE', 'TT_WBS']);

  analyze(activities, relationships) {
    if (!activities || activities.length === 0) {
      return { criticalPath: [], longestPath: [], projectDuration: 0 };
    }

    const pd = s => s ? new Date(String(s).replace(' ', 'T')) : null;
    const realActs = activities.filter(a => !CriticalPathAnalyzer.EXCLUDED.has(a.type));

    // Determine whether the XER export includes P6's driving path flag
    const hasDrivingFlag = realActs.some(a => a.drivingPath === true);

    let criticalActivities;
    if (hasDrivingFlag) {
      // Use P6's own computation — most accurate
      criticalActivities = realActs.filter(a => a.drivingPath === true);
    } else {
      // Fall back: zero/negative P6 float, excluding LOE/WBS (already filtered above)
      criticalActivities = realActs.filter(a =>
        typeof a.totalFloat === 'number' && a.totalFloat <= 0
      );
    }

    if (criticalActivities.length === 0) {
      return { criticalPath: [], longestPath: [], projectDuration: 0 };
    }

    // Build predecessor map (real activities only)
    const realIds = new Set(realActs.map(a => a.id));
    const predMap = new Map();
    realActs.forEach(a => predMap.set(a.id, []));
    relationships.forEach(r => {
      if (realIds.has(r.predecessorId) && realIds.has(r.successorId)) {
        predMap.get(r.successorId)?.push(r.predecessorId);
      }
    });

    const longestPath = this.traceLongestPath(criticalActivities, predMap, pd);
    const pathActs = longestPath.length > 0 ? longestPath : criticalActivities;
    const projectDuration = this.computeWorkingDays(pathActs, pd);

    return { criticalPath: criticalActivities, longestPath, projectDuration, activityMap: {} };
  }

  traceLongestPath(criticalActivities, predMap, pd) {
    const critSet = new Set(criticalActivities.map(a => a.id));
    const actMap  = new Map(criticalActivities.map(a => [a.id, a]));
    const finishOf = a => pd(a.earlyFinish || a.plannedFinish) || new Date(0);

    // Start from the critical activity with the latest early finish
    const terminal = [...criticalActivities].sort((a, b) => finishOf(b) - finishOf(a))[0];

    const path    = [];
    const visited = new Set();
    let current   = terminal;

    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      path.unshift(current);

      // Follow the critical predecessor with the latest early finish
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
    return Math.round((latest - earliest) / 86400000 * 5 / 7);
  }
}

window.CriticalPathAnalyzer = CriticalPathAnalyzer;
