import { createThunkAdapter } from './index';

it('provides the transformed state as the result of getState to the thunk', function() {
	function externalGetUserTimezone(state) {
		return state.user.timezone;
	}

	function externalThunk(x, y, z) {
		return function(dispatch, getState) {
			const timezone = externalGetUserTimezone(getState());
			dispatch({
				type: 'EXTERNAL_ACTION',
				payload: { timezone, x, y, z }
			});
		};
	}

	const internalState = {
		environment: {
			userTimezone: 'America/Chicago'
		}
	};

	const externalThunkAdapter = createThunkAdapter(state => ({
		user: {
			timezone: state.environment.userTimezone
		}
	}));
	const adaptedExternalThunk = externalThunkAdapter(externalThunk);

	const x = 5;
	const y = 10;
	const z = 'z';
	const dispatch = jest.fn();
	const getState = jest.fn().mockReturnValue(internalState);
	adaptedExternalThunk(x, y, z)(dispatch, getState);

	expect(getState).toBeCalled();
	expect(dispatch).toBeCalledWith({
		type: 'EXTERNAL_ACTION',
		payload: {
			timezone: 'America/Chicago',
			// params to the thunk creator are preserved
			x: 5,
			y: 10,
			z: 'z'
		}
	});
});

it('passes wrapped getState to any thunks dispatched', function() {
	function externalSelector(state) {
		return state.user.timezone;
	}

	function externalThunkTwo(x, y, z) {
		return function(dispatch, getState) {
			const timezone = externalSelector(getState());
			dispatch({ type: 'EXTERNAL_ACTION', timezone, x, y, z });
		};
	}

	function externalThunkOne(x, y, z) {
		return function(dispatch, getState) {
			dispatch(externalThunkTwo(x, y, z));
		};
	}

	const externalThunkAdapter = createThunkAdapter(state => ({
		user: {
			timezone: state.environment.userTimezone
		}
	}));
	const adaptedExternalThunk = externalThunkAdapter(externalThunkOne);
	const internalState = {
		environment: {
			userTimezone: 'America/Chicago'
		}
	};
	const x = 'x';
	const y = 'y';
	const z = 'z';
	const dispatch = jest.fn();
	const getState = jest.fn().mockReturnValue(internalState);
	adaptedExternalThunk(x, y, z)(dispatch, getState);
	expect(dispatch.mock.calls).toHaveLength(1);
	expect(dispatch.mock.calls[0][0]).toEqual({
		type: 'EXTERNAL_ACTION',
		timezone: 'America/Chicago',
		x,
		y,
		z
	});
});

it('allows awaiting an adapted async thunk', async function() {
	const awaitableDelay = ms => new Promise(resolve => setTimeout(resolve, ms));
	const externalThunk = () => async (dispatch, getState) => {
		dispatch({ type: 'START' });
		await awaitableDelay(0);
		dispatch({ type: 'END' });
	};
	const adaptedExternalThunk = createThunkAdapter(x => x)(externalThunk);
	const internalThunk = () => async (dispatch, getState) => {
		await adaptedExternalThunk()(dispatch, getState);
		dispatch({ type: 'END_INTERNAL' });
	};
	const dispatch = jest.fn();
	const getState = jest.fn();
	await internalThunk()(dispatch, getState);
	expect(dispatch.mock.calls).toHaveLength(3);
	expect(dispatch.mock.calls[0][0].type).toBe('START');
	expect(dispatch.mock.calls[1][0].type).toBe('END');
	expect(dispatch.mock.calls[2][0].type).toBe('END_INTERNAL');
});
