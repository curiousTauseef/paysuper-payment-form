import Vue from 'vue';
import {
  extend,
  forEach,
  get,
  isEmpty,
  reduce,
} from 'lodash-es';
import webfontloader from 'webfontloader';
import localesScheme from '@/locales/scheme';
import fontsScheme from '@/fontsScheme';
import { gtagEvent } from '@/analytics';

function objectToCss(obj) {
  return reduce(obj, (result, value, key) => `${result}${key}:${value};`, '');
}

// eslint-disable-next-line import/prefer-default-export
export function $addCssRules(rules) {
  let styles = '';
  const styleElement = document.createElement('style');
  styleElement.type = 'text/css';

  forEach(rules, (rule, selector) => {
    const computedSelector = selector.replace(/{([A-Za-z0-9-_]+)}/g, (a, name) => this.$style[name]);
    if (!isEmpty(rule)) {
      const css = objectToCss(rule);
      styles += `${computedSelector}{${css}}`;
    }
  });

  styleElement.innerHTML = styles;
  styleElement.appendChild(document.createTextNode(''));
  document.head.appendChild(styleElement);

  this.$on('hook:destroyed', () => {
    // To destroyed components finish leave animations
    setTimeout(() => {
      styleElement.parentNode.removeChild(styleElement);
    }, 500);
  });
}

function $changeLocale(locale) {
  this.$i18n.locale = locale;
  const dir = localesScheme[locale].rtl ? 'rtl' : 'ltr';
  const wordBreak = localesScheme[locale].withoutSpaces ? 'break-word' : 'keep-all';

  document.body.style.direction = dir;
  document.body.style['word-break'] = wordBreak;

  const font = fontsScheme[localesScheme[locale].font || 'Quicksand'];
  if (!font.isLoaded) {
    webfontloader.load({
      google: {
        families: [font.googleFontQuery],
      },
    });
    font.isLoaded = true;
  }

  document.body.style.fontFamily = font.fontFamily;

  gtagEvent('setLocale', {
    event_category: 'userAction',
    event_label: locale,
  });
}

function $getFieldErrorMessages(fieldPath) {
  const field = get(this.$v, fieldPath);

  if (!field) {
    return [];
  }

  return Object.keys(field.$params).filter(name => !field[name])
    .map((name) => {
      const message = this.$t(`errorMessages.${name}`);
      const params = field.$params[name];
      return message.replace(/%(.+?)%/g, (a, variable) => params[variable]);
    });
}

function $isFieldInvalid(fieldPath) {
  const field = get(this.$v, fieldPath);
  if (!field) {
    return false;
  }
  return Boolean(field.$invalid && field.$dirty);
}

function $getPrice(value, currency) {
  const isVirtualCurrency = currency === 'virtual';
  const result = new Intl.NumberFormat(
    this.$i18n.locale,
    (isVirtualCurrency ? {} : { style: 'currency', currency }),
  ).format(value);

  if (isVirtualCurrency) {
    return `${result} VC`;
  }
  return result;
}

extend(Vue.prototype, {
  $addCssRules,
  $changeLocale,
  $getFieldErrorMessages,
  $isFieldInvalid,
  $getPrice,
});
