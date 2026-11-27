const conditionMatches = (required, actual) => {
	if (required === undefined || required === null || required === 'ANY') return true;
	return Array.isArray(required) ? required.includes(actual) : required === actual;
};

const eventMatches = (required, actualEvent) => {
	if (required === undefined || required === null || required === 'ANY') return true;
	const activeId = typeof actualEvent === 'string'
		? actualEvent
		: (actualEvent && actualEvent.active ? actualEvent.id : null);
	if (!activeId) return false;
	return Array.isArray(required) ? required.includes(activeId) : required === activeId;
};

export function isConditionMet(conditions, environment = {}) {
	if (!conditions) return true;
	return conditionMatches(conditions.weather, environment.weather)
		&& conditionMatches(conditions.time, environment.time)
		&& conditionMatches(conditions.timeOfDay, environment.time)
		&& eventMatches(conditions.event ?? conditions.events, environment.event)
		&& (conditions.minZoneTier === undefined || environment.minZoneTier >= conditions.minZoneTier);
}
