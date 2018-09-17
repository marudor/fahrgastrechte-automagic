// @flow
const defaults = {
  date: '',
  start: '',
  departureShould: '',
  destination: '',
  // arrivalDate: '',
  arrivalShould: '',
  trainType: '',
  trainId: '',
  delay: '',
  lastName: '',
  firstName: '',
  additionalAddress: '',
  phone: '',
  street: '',
  streetNumber: '',
  plz: '',
  city: '',
  bahncard100: '',
  bahncard100Nr: '',
  birthday: '',
  mail: '',
  kontoName: '',
  IBAN: '',
  BIC: '',
  anrede: 'Herr',
  howtoMoney: 'Auszahlung oder Uberweisung',
};

let override = {};

try {
  // $FlowFixMe
  override = require('../defaults.json');
} catch (e) {
  // We ignore missing override
}

export default {
  ...defaults,
  ...override,
};
