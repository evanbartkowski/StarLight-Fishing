const conditionMatches = (required, actual) => {
	if (required === undefined || required === null || required === 'ANY') return true;
	return Array.isArray(required) ? required.includes(actual) : required === actual;
};

export function isConditionMet(conditions, environment = {}) {
	if (!conditions) return true;
	return conditionMatches(conditions.weather, environment.weather)
		&& conditionMatches(conditions.time, environment.time)
		&& conditionMatches(conditions.timeOfDay, environment.time)
		&& (conditions.minZoneTier === undefined || environment.minZoneTier >= conditions.minZoneTier);
}
