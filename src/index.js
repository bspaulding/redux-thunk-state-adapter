export function createThunkAdapter(transformState) {
  return function(thunkCreator) {
    return function() {
      const params = Array.prototype.slice.call(arguments);
      const thunk = thunkCreator.apply(null, params);
      return function(dispatch, getState) {
        const getState$ = () => transformState(getState());
        thunk(dispatch, getState$);
      }
    }
  }
}
