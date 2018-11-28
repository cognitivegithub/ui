Application.Locale = {
  lang: 'ru',
  localizableProps : ['qtip','text','html','title','header','fieldLabel'],
  localeData : {
    en : {
  }
  },
  setLang : function (lang) {
    this.lang = lang;
  },
  translate : function (prop, value) {
    if (this.localeData[this.lang] && this.localeData[this.lang][value] && this.localizableProps.indexOf(prop) != -1) {
      return this.localeData[this.lang][value];
    } else {
      return value;
    }
  }
};

window.__ = function (value) {
  return Application.Locale.translate('text', value);
};
