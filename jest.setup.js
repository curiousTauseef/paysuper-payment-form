/* eslint-disable */
const puppeteer = require('puppeteer');
const { configureToMatchImageSnapshot } = require('jest-image-snapshot');

const toMatchImageSnapshot = configureToMatchImageSnapshot({
  customDiffConfig: {
    threshold: '0.5'
  },
  failureThreshold: '0.05',
  failureThresholdType: 'percent'
});
expect.extend({ toMatchImageSnapshot });

beforeAll(async () => {
  global.browser = await puppeteer.launch();
  global.page = await global.browser.newPage();
});
afterAll(() => {
  global.browser.close();
});
