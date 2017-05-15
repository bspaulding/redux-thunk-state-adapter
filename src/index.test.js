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

	const externalThunkAdapter = createThunkAdapter((state) => ({
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
