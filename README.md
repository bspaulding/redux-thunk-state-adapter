# redux-thunk-state-adapter

A utility to provide a facade of getState to an externally owned thunk.
This is useful when you are sharing action creators which compose selectors
that assume a certain state shape.

## Usage

```javascript
import { createThunkAdapter } from 'redux-thunk-state-adapter';
import { externalThunkCreator } from 'some-module';

// provide a transform function to map InternalState -> ExternalState
const externalThunkAdapter = createThunkAdapter((state) => ({
	user: {
		timezone: state.environment.userTimezone
	}
}));

const adaptedExternalThunk = externalThunkAdapter(externalThunkCreator);
```
