/* eslint guard-for-in: 0 */
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
// @ts-ignore
import { Iconv } from 'iconv';
// @ts-ignore
import async from 'async';
import fs from 'fs';
import path from 'path';
// @ts-ignore
import temp from 'temp';

// @ts-ignore
const iconv = new Iconv('UTF-8', 'UTF-16');

function normalizeArgs(extendArgs: any, maybeCallback: any) {
  let args = extendArgs;
  let callback = maybeCallback;
  // Check if extendArgs is our callback, adds backwards compat

  if (typeof extendArgs === 'function') {
    callback = extendArgs;
    args = [];
  } else if (!(extendArgs instanceof Array)) {
    args = [];
  }

  return { args, callback };
}

function isAbsolute(Path: string) {
  return (
    (path.isAbsolute && path.isAbsolute(Path)) ||
    path.normalize(`${Path}/`) === path.normalize(`${path.resolve(Path)}/`)
  );
}

// Escape data and return it as a buffer
function escapeFdf(data: any) {
  let escaped = new Buffer([]);
  let buf;

  if (typeof data === 'string' || data instanceof Buffer) {
    // @ts-ignore
    buf = new Buffer(data);
  } else if (typeof data.toString === 'function') {
    buf = new Buffer(data.toString());
  } else {
    buf = new Buffer(Object.prototype.toString.call(data));
  }

  for (let i = 0; i < buf.length; i += 1) {
    const c1 = String.fromCharCode(buf[i]);
    const c2 = String.fromCharCode(buf[i + 1]);

    if (c1 === '(' || c1 === ')') {
      escaped = Buffer.concat([escaped, new Buffer(`\\${c1}`)]);
    } else if (c1 === '\r' && c2 === '\n') {
      escaped = Buffer.concat([escaped, new Buffer('\r')]);
    } else {
      escaped = Buffer.concat([escaped, new Buffer([buf[i]])]);
    }
  }

  return escaped;
}

function createHandlePdftkExit(tempNameResult: string, callback: any) {
  return (code: number) => {
    if (code) {
      return callback(new Error(`Non 0 exit code from pdftk spawn: ${code}`));
    }

    async.waterfall(
      [
        (cb: Function) => {
          fs.readFile(tempNameResult, (err, filledPdf) => cb(err, filledPdf));
        },
        (filledPdf: any, cb: Function) => {
          fs.unlink(tempNameResult, err => cb(err, filledPdf));
        },
      ],
      (err: any, result: any) => {
        callback(err, result);
      }
    );
  };
}

function writeFdfToPdftk(child: ChildProcessWithoutNullStreams, data: any) {
  child.stdin.write(exports.generateFdf(data));
  child.stdin.end();
}

function handlePdftkError(
  child: ChildProcessWithoutNullStreams,
  callback: Function
) {
  child.on('error', err => {
    callback(err);
  });

  child.stderr.on('data', (data: any) => {
    // eslint-disable-next-line no-console
    console.error(`stderr: ${data}`);
  });
}

function handlePdftkExit(
  child: ChildProcessWithoutNullStreams,
  tempNameResult: any,
  callback: Function
) {
  child.on('exit', createHandlePdftkExit(tempNameResult, callback));
}

export function generateFdf(data: any) {
  const header = new Buffer(
    '%FDF-1.2\n\u00e2\u00e3\u00cf\u00d3\n1 0 obj \n<<\n/FDF \n<<\n/Fields [\n'
  );

  const footer = new Buffer(
    ']\n>>\n>>\nendobj \ntrailer\n\n<<\n/Root 1 0 R\n>>\n%%EOF\n'
  );

  let body = new Buffer([]);

  for (const key in data) {
    const name = escapeFdf(key);
    const value = escapeFdf(data[key]);

    body = Buffer.concat([body, new Buffer('<<\n/T (')]);
    body = Buffer.concat([body, iconv.convert(name.toString())]);
    body = Buffer.concat([body, new Buffer(')\n/V (')]);
    body = Buffer.concat([body, iconv.convert(value.toString())]);
    body = Buffer.concat([body, new Buffer(')\n>>\n')]);
  }

  const fdf = Buffer.concat([header, body, footer]);

  return fdf;
}

export function generatePdf(
  data: Object,
  templatePath: string,
  extendArgs: any,
  callback: any
) {
  const tempNameResult = temp.path({ suffix: '.pdf' });
  const pdfPath = isAbsolute(templatePath)
    ? templatePath
    : path.join(__dirname, templatePath);

  const normalized = normalizeArgs(extendArgs, callback);

  const args = normalized.args;
  const cb = normalized.callback;

  const processArgs = [
    pdfPath,
    'fill_form',
    '-',
    'output',
    tempNameResult,
  ].concat(args);

  const child = spawn('pdftk', processArgs);

  handlePdftkError(child, cb);
  handlePdftkExit(child, tempNameResult, cb);
  writeFdfToPdftk(child, data);
}
