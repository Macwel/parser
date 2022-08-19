export default class App {
  constructor() {
    this.#boot();
  }

  async #boot() {
    console.log(new Date(), '[App]: Start');
    console.log(new Date(), '[App]: Finish App');
  }
}
