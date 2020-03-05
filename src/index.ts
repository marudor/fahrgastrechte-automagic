/* eslint-disable no-console */
/* eslint-disable no-process-exit */
import { DateTime } from 'luxon';
import { promises as fs } from 'fs';
import { generatePdf } from './fillPdf';
import { outputFolder, syncFile } from './paths';
import defaultData from './default';
// @ts-ignore
import fontManager from 'fontmanager-redux';
// @ts-ignore
import hummus from 'hummus';
import mapping from './mapping';
import path from 'path';
// @ts-ignore
import prompt from 'prompt';

interface ObjMapping {
  fields: any[];
  regex: RegExp;
}

interface DataType {
  [key: string]: string;
}

const pdfTemplate = path.resolve(__dirname, '../template/fahrgastrechte.pdf');
const signaturePath = path.resolve(__dirname, '../signature.png');

let data = defaultData;

function constructSimple(fieldMapping: string | string[], fieldData: string) {
  const r: any = {};

  if (Array.isArray(fieldMapping)) {
    fieldMapping.forEach(k => {
      r[k] = fieldData;
    });
  } else {
    r[fieldMapping] = fieldData;
  }

  return r;
}

function constructObject(obj: ObjMapping, fieldData: string) {
  const groups = fieldData.match(obj.regex);

  if (groups) {
    let result = {};

    obj.fields.forEach((field, index) => {
      result = {
        ...result,
        ...constructSimple(field, groups[index + 1]),
      };
    });

    return result;
  }
}

function correctConstruct(fieldMapping: any, fieldData: any) {
  if (typeof fieldMapping === 'string' || Array.isArray(fieldMapping)) {
    return constructSimple(fieldMapping, fieldData);
  }

  return constructObject(fieldMapping, fieldData);
}

function constructData(fieldDatas: DataType) {
  let result = {};

  Object.keys(fieldDatas).forEach((key: any) => {
    // @ts-ignore
    const fieldMapping = mapping[key];
    const fieldData = fieldDatas[key];

    if (!fieldMapping) {
      return;
    }

    result = {
      ...result,
      ...correctConstruct(fieldMapping, fieldData),
    };
  });

  return result;
}

async function addDateAndSignature(resultPath: string) {
  // eslint-disable-next-line no-sync
  const font = fontManager.findFontSync({ family: 'Sans Serif' });
  const writer = hummus.createWriterToModify(resultPath, {
    modifiedFilePath: resultPath,
  });

  const page = new hummus.PDFPageModifier(writer, 1);

  const ctx = page.startContext().getContext();

  const stringDate = DateTime.local().toFormat('dd.MM.yy');

  ctx.writeText(stringDate, 40, 215, {
    size: 12,
    font: writer.getFontForFile(font.path),
  });
  try {
    await fs.access(signaturePath);
    ctx.drawImage(140, 210, signaturePath, {
      transformation: {
        width: 100,
        height: 50,
        proportional: true,
      },
    });
  } catch (e) {
    // We ignore non existant signature and just do not add any
  }

  page.endContext().writePage();
  writer.end();
}

async function checkLastSend() {
  try {
    const lastSend = (await fs.readFile(syncFile, 'utf8')).trim();
    const files = await fs.readdir(outputFolder, 'utf8');

    while (files[0] !== lastSend) {
      files.shift();
    }
    files.shift();
    console.log(
      `You have ${files.length} unsent files - you may want to send them!`
    );
  } catch (e) {
    // ignore
  }
}

const yesterdayString = DateTime.local()
  .minus({ days: 1 })
  .toFormat('dd.MM.yy');

prompt.start();
prompt.get(
  {
    properties: {
      date: {
        pattern: /(\d+)\.(\d+)\.(\d+)/,
        description: 'Reisedatum (dd.MM.yy)',
        default: yesterdayString,
        required: true,
      },
      start: {
        description: 'Startbahnhof',
        required: true,
      },
      departureShould: {
        pattern: /(\d+):(\d+)/,
        description: 'Abfahrt laut Fahrplan (HH:mm)',
        required: true,
      },
      destination: {
        description: 'Zielbahnhof',
        required: true,
      },
      arrivalShould: {
        pattern: /(\d+):(\d+)/,
        description: 'Ankunft laut Fahrplan (HH:mm)',
        required: true,
      },
      trainType: {
        pattern: /(ICE|IC|TGV|EC|RE|IRE|RB|RJ|NJ)/,
        description: 'Zugtyp',
        required: true,
      },
      trainId: {
        pattern: /\d+/,
        description: 'Zugnummer',
      },
      // arrivalDate: {
      //   pattern: /(\d+)\.(\d+)\.(\d+)/,
      //   description: 'Ankunftsdatum (DD.MM.YYYY)',
      //   required: true,
      // },
      delay: {
        pattern: /(\d+)/,
        description: 'Verspätung (in min)',
        required: true,
      },
    },
  },
  (err: any, result: any) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    }
    const { delay, ...inputData } = result;

    const arrival = DateTime.fromFormat(
      `${inputData.date} ${inputData.arrivalShould}`,
      'dd.MM.yy HH:mm'
    ).plus(Number.parseInt(delay, 10) * 1000 * 60);

    data = {
      ...data,
      ...inputData,
      arrivalDate: arrival.toFormat('dd.MM.yy'),
      arrival: arrival.toFormat('HH:mm'),
    };

    const mappedData = constructData(data);

    // console.log(mappedData);
    //
    generatePdf(
      mappedData,
      pdfTemplate,
      ['need_appearances'],
      async (err2: any, output: any) => {
        if (err2) {
          // eslint-disable-next-line no-console
          console.error(err2);
        } else {
          try {
            await fs.stat(outputFolder);
          } catch (e) {
            // Propably missing folder
            await fs.mkdir(outputFolder);
          }
          const date = DateTime.fromFormat(inputData.date, 'dd.MM.yy');
          const resultPath = path.resolve(
            outputFolder,
            `Fahrgastrechte-${date.toFormat('yy-MM-dd')}.pdf`
          );

          try {
            // eslint-disable-next-line no-async-promise-executor
            await new Promise(async resolve => {
              try {
                if (await fs.stat(resultPath)) {
                  prompt.get(
                    {
                      properties: {
                        overwrite: {
                          description: `file for ${date.toFormat(
                            'yy-MM-dd'
                          )} already exits. Are you sure to overwrite? (y/N)`,
                          default: 'N',
                        },
                      },
                    },
                    (err: any, result: any) => {
                      if (err) {
                        console.error(err);
                        process.exit(1);
                      }
                      if (result.overwrite !== 'y') {
                        console.log('Not overwriting');
                        process.exit(1);
                      }
                      resolve();
                    }
                  );
                }
              } catch (e) {
                resolve();
              }
            });
          } catch (e) {
            // ignore
          }

          await fs.writeFile(resultPath, output);
          await addDateAndSignature(resultPath);

          await checkLastSend();
        }
      }
    );
  }
);
