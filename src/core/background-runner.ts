export class backgroundRunner {
  async runInBackground<T = any>(func: () => T): Promise<T> {
    console.log('Start running background task: ', func);
    try {
      const res = await func();
      console.log('Background task succesfully completed with result: ', res);
      return res;
    } catch (err) {
      console.log('Background task failed with error: ', err);
    }
  }
}
