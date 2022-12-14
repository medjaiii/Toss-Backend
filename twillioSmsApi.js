import { createRequire } from 'module';

const require = createRequire(import.meta.url);

var Twilio = require('twilio');

let TWILIO_ACCOUNT_SID = 'AC75105ba91337e37d72ec7398551bbb28'
let TWILIO_AUTH_TOKEN= '1a2ac9916a2b16c4c8296e1d1729aa20'
let TWILIO_PHONE_NUMBER='+19787486909'
let SERVICE_SID = "VA4faaf6f9017f806704d8af242b074830"

const accountSid = TWILIO_ACCOUNT_SID;
const authToken = TWILIO_AUTH_TOKEN;
const test = new Twilio(accountSid,authToken)

const SendSms = (phone, message) => {
  const otpRes = test.verify
  .services(SERVICE_SID)
    .verifications
      .create({
         body: message,
         from: TWILIO_PHONE_NUMBER,
         to: `+${91}${phone}`,
         channel:"sms"
       })
      .then(data => console.log(data.sid));
  }


export default SendSms;
