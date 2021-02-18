export class Defer {
  public resolve: any;
  public reject: any;
  public promise: any;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
