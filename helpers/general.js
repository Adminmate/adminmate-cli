export function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function randomString(length, onlyDigit = false, onlyLowercase = false) {
  const _digit = '0123456789';
  const _lowercase = '0123456789abcdefghiklmnopqrstuvwxyz';
  const _all = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
  const chars = onlyDigit ? _digit : (onlyLowercase ? _lowercase : _all);
  let randomstring = '';
  let index = 0;

  for (let i = 0; i < length; i++) {
    index = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(index,index+1);
  }

  return randomstring;
}