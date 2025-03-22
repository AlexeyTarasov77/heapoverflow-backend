export class backgroundRunner {
  async runInBackground<T = any>(func: () => T, taskName?: string): Promise<T> {
    let msg = 'Start running background task'
    taskName && (msg += ": " + taskName)
    console.log(msg);
    try {
      const res = await func();
      console.log('Background task succesfully completed with result: ', res);
      return res;
    } catch (err) {
      console.log('Background task failed with error: ', err);
    }
  }
}
