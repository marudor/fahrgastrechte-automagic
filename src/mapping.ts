export default {
  date: {
    regex: /(\d\d)\.(\d\d)\.(\d\d)/,
    fields: ['S1F1', 'S1F2', 'S1F3'],
  },
  start: 'S1F4',
  departureShould: {
    regex: /(\d+):(\d+)/,
    fields: [
      ['S1F5', 'S1F19'],
      ['S1F6', 'S1F20'],
    ],
  },
  destination: 'S1F7',
  arrivalDate: {
    regex: /(\d+)\.(\d+)\.(\d+)/,
    fields: ['S1F10', 'S1F11', 'S1F12'],
  },
  arrivalShould: {
    regex: /(\d+):(\d+)/,
    fields: ['S1F8', 'S1F9'],
  },
  trainType: ['S1F13', 'S1F17'],
  trainId: ['S1F14', 'S1F18'],
  arrival: {
    regex: /(\d+):(\d+)/,
    fields: ['S1F15', 'S1F16'],
  },
  howtoMoney: 'S1F29',
  lastName: 'S2F4',
  firstName: 'S2F5',
  additionalAddress: 'S2F6',
  phone: 'S2F7',
  street: 'S2F8',
  streetNumber: 'S2F9',
  plz: 'S2F11',
  city: 'S2F12',
  bahncard100: 'S2F13',
  bahncard100Nr: 'S2F15',
  birthday: {
    regex: /(\d+)\.(\d+)\.(\d+)/,
    fields: ['S2F16', 'S2F17', 'S2F18'],
  },
  mail: 'S2F19',
  kontoName: 'S2F20',
  IBAN: 'S2F21',
  BIC: 'S2F22',
  anrede: 'S2F1',
};
