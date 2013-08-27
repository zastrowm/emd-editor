/**
 * Utility classes
 */
module Utils {

  /**
   * Allows being alerted at various intervals
   */
  export class Timer {

    private timeoutId: number;

    /**
     * Construct a new timeout object
     * @param timeout how long after reset() is called that the callback should be invoked
     * @param callback the function to invoke when the timer elapses
     */
    constructor(private timeout: number, private callback: () => void) {

    }

    /**
     * Start the timer and have it invoke the callback when the timeout occurs
     */
    public reset() {
      // clear the old timeout
      clearTimeout(this.timeoutId);
      // set the new timeout
      this.timeoutId = setTimeout(this.callback, this.timeout);
    }
  }
}