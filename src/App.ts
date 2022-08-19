import fetcher from 'node-fetch';
import AdmZip from 'adm-zip';
import * as fs from 'fs';
import iconv from 'iconv-lite';
import path from 'path';
import * as xmljs from 'xml-js';
import type { ElementCompact } from 'xml-js';
import { IC } from './interfaces';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({});

export default class App {
  #lastName = '';
  #path = path.resolve(__dirname, '../data/');
  #arr = [];

  constructor() {
    this.#boot();
  }

  async extractor(): Promise<void> {
    console.log(new Date(), '[Extractor]: Start');
    const res = await fetcher(process.env.PARSE_URL);
    if (res.status === 200) {
      // check for a successful response
      const zip = new AdmZip(await res.buffer()); // convert received response to buffer and init instance
      zip.extractAllTo('./data', true); // extract zip to ./data folder
      this.#lastName = zip.getEntries()[0].entryName; // get name of file in zip
    } else {
      throw new Error('[Extractor-Error]: Couldnt download data ZIP');
    }
    console.log(new Date(), '[Extractor]: Data is ready to use');
  }

  async decoder(): Promise<void> {
    console.log(new Date(), '[Decoder]: Start');
    fs.createReadStream(`${this.#path}/${this.#lastName}`)
      .pipe(iconv.decodeStream('win1251'))
      .pipe(iconv.encodeStream('UTF-16'))
      .pipe(fs.createWriteStream(`${this.#path}/decode_${this.#lastName}`));
    console.log(new Date(), '[Decoder]: Finish decoder');
  }

  async parseXmlToJSON(): Promise<ElementCompact> {
    console.log(new Date(), '[parseXmlToJSON]: Start');
    const file = fs.readFileSync(`${this.#path}/${this.#lastName}`); // read file, response is buffer
    const content = await iconv.decode(file, 'win1251'); // decode buffer to win1251
    const x = xmljs.xml2js(content, {
      compact: true,
      ignoreDoctype: true,
      attributesKey: 'attributes',
    }); // convert xml to json
    console.log(new Date(), '[parseXmlToJSON]: Finish');
    return x;
  }

  async parser(item: IC): Promise<boolean> {
    if (Array.isArray(item?.Accounts)) {
      item.Accounts.forEach((acc) => {
        this.#arr.push({
          bic: item.attributes.BIC,
          name: item.ParticipantInfo.attributes.NameP,
          corrAccount: acc.attributes.Account,
        });
      });
      return true;
    } else if (item?.Accounts) {
      this.#arr.push({
        bic: item.attributes.BIC,
        name: item.ParticipantInfo.attributes.NameP,
        corrAccount: item.Accounts.attributes.Account,
      });
      return true;
    }
  }

  async #boot(): Promise<void> {
    console.log(new Date(), '[App]: Start');
    await this.extractor();
    await this.decoder();
    const jsonObj = await this.parseXmlToJSON();

    console.log(new Date(), '[Main-Parser]: Start');
    await Promise.all(
      jsonObj['ED807'].BICDirectoryEntry.map(
        async (item: IC) => await this.parser(item),
      ),
    );
    console.log(new Date(), '[Main-Parser]: Finish parser');
    console.log(new Date(), '[DB]: Start push data to db');
    await prisma.account.createMany({ data: [...this.#arr] });
    console.log(new Date(), '[DB]: Finish push data to db');
    console.log(new Date(), '[App]: Finish App');
  }
}
