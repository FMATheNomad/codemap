import { greet } from './utils/helper';
import { Config } from './config';
import * as fs from 'fs';

const config: Config = { name: 'codemap' };
console.log(greet(config.name));
