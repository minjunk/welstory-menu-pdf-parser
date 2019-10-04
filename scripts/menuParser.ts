#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

import { menuPdfParser } from '../src/index';
import { log } from '../src/utils';

/* eslint-disable @typescript-eslint/explicit-function-return-type */
(async () => {
  const filePath = path.join(process.cwd(), process.argv[2]);
  const file = fs.readFileSync(filePath);
  const menu = await menuPdfParser(file, process.argv[3] && new Date(`${process.argv[3]} 00:00:00`));
  if (process.env.DEBUG) {
    log(menu);
  }
})();
