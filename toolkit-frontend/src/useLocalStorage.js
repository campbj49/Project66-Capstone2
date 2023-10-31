import { useState } from "react";
/** Hook for utilizing local storage
 * (key) => [keyState, setKeyState]
 * args:
 * -key: key value being retrieved from local storage
 * 
 * returns:
 * -keyState: state component that contains the data found in local storage
 * -setKeyState: state setter function that also updates local storage when the state changes
 */
function useLocalStorage(key) {
  // retreive the stored data
  let storedVal = localStorage.getItem(key); 
  const [value, setValue] = useState(storedVal);
  const updateLocalStorage = (updatedVal) => {
    setValue(updatedVal);
    localStorage.setItem(key, updatedVal);
  };
  
  // return piece of state AND a function to toggle it
  return [value, updateLocalStorage];
}

export default useLocalStorage;