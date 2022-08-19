import fetcher from 'node-fetch';
import AdmZip from 'adm-zip';

export default class App {
  #lastName = '';

  constructor() {
    this.#boot();
  }

  async extractor() {
    console.log(new Date(), '[Extractor]: Start');
    const res = await fetcher(process.env.PARSE_URL);
    if (res.status === 200) {
      const zip = new AdmZip(await res.buffer());
      zip.extractAllTo('./data', true);
      this.#lastName = zip.getEntries()[0].entryName;
    } else {
      throw new Error('[Extractor-Error]: Couldnt download data ZIP');
    }
    console.log(new Date(), '[Extractor]: Data is ready to use');
  }

  async #boot() {
    console.log(new Date(), '[App]: Start');
    await this.extractor();

    console.log(new Date(), '[App]: Finish App');
  }
}
