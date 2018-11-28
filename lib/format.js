
Ext.apply(Ext.util.Format, {
  numberFormat: {
    decimalSeparator: ',',
    decimalPrecision: 2,
    groupingSeparator: ' ',
    groupingSize: 3,
    hideNullDecimal: false,
    currencySymbol: ''
  },
  getFormattedPriceFloat: function(cmpId) {
    return (Ext.getCmp(cmpId).getValue() != '') ? parseFloat(Ext.getCmp(cmpId).getValue().replace(/[^\d\,\.]/g, '').replace(',', '.')) : 0;
  },
  getFormattedValueFloat: function(val) {
    return (val != '') ? parseFloat(val.replace(/[^\d\,\.]/g, '').replace(',', '.')) : 0;
  },
  preparePriceForSubmit: function(cmpId) {
    var cmp = Ext.getCmp(cmpId);
    if (cmp) cmp.setValue(cmp.getValue().replace(/[^\d\,\.]/g, '').replace(',', '.'));
  },
  formatPriceOnTheFly: function(cmpId) {
    var oField = Ext.get(cmpId).dom;
    var iCaretPos = 0;
    if (document.selection) {
      oField.focus ();
      var oSel = document.selection.createRange ();
      oSel.moveStart ('character', -oField.value.length);
      iCaretPos = oSel.text.length;
    }
    else if (oField.selectionStart || oField.selectionStart == '0')
      iCaretPos = oField.selectionStart;

    var cmp = Ext.getCmp(cmpId);
    var value = cmp.getValue();
    if (value == '') return;
    var sum = value.replace(/[^\d\,\.]/g, '').replace('.', ',');
    var parts = sum.split(',');
    var part1 = parts[0];
    var part2 = '';
    for(var i=1; i<parts.length; ++i) part2 = part2+parts[i];
    var ret = Ext.util.Format.formatPrice(part1, Ext.util.Format.numberFormat);
    if (parts.length > 1) ret += ','+part2.substring(0, 2);
    if (cmp.getValue() != ret) cmp.setValue(ret);

    //substr = ret.substr
    cmp.selectText(iCaretPos, iCaretPos);
  },
  makePriceFormat: function(obj) {
  },
  comboRenderer : function(combo, nameField){
    return function(value, meta, record){
        var recordCombo = combo.findRecord(combo.valueField, value);
      if (recordCombo) {
        return recordCombo.get(combo.displayField);
      } else if (nameField) {
        return record.get(nameField);
      } else {
        return combo.valueNotFoundText;
      }
    }
  },
  formatPrice: function(value, numberFormat, name) {
    var format = Ext.apply(Ext.apply({}, Ext.util.Format.numberFormat), numberFormat);
    var digit, decimal;
    if (value == null) return '';
    if (value === 'Без НДС') {
      return value;
    }
    if (typeof value !== 'number') {
      value = String(value);
      if (format.currencySymbol) {
        value = value.replace(format.currencySymbol, '');
      }
      if (format.groupingSeparator) {
        value = value.replace(new RegExp(format.groupingSeparator, 'g'), '');
      }
      if (format.decimalSeparator !== '.') {
        value = value.replace(format.decimalSeparator, '.');
      }
      value = parseFloat(value);
    }
    var neg = value < 0;
    value = Math.abs(value).toFixed(format.decimalPrecision);
    var i = value.indexOf('.');
    if (i >= 0) {
      if (format.decimalSeparator !== '.') {
        digit = value.slice(0, i);
        decimal = value.slice(i+1);
        if(format.hideNullDecimal) {
          value = digit;
          if(parseInt(decimal)>0) {
            value = value + format.decimalSeparator + decimal;
          }
        } else {
          value = digit + format.decimalSeparator + decimal;
        }
      }
    } else {
      i = value.length;
    }
    if (format.groupingSeparator) {
      while (i > format.groupingSize) {
        i -= format.groupingSize;
        value = value.slice(0, i) + format.groupingSeparator + value.slice(i);
      }
    }
    if (format.currencySymbol) {
      value = format.currencySymbol + value;
    }
    if (neg) {
      value = '-' + value;
    }
    if (name && Ext.isString(name)) {
      value += ' '+name;
    }
    return value;
  },
  formatOffersStep: function(val) {
    return Ext.util.Format.formatPrice(val, {decimalPrecision: 4});
  },
  bool: function(val) {
    return val?'Да':'Нет';
  },
  localDateRenderer: function(value) {
    value = parseDate(value);
    if (!value) {
      return '';
    }
    var tz = Ext.util.Format.date(value, 'Z');
    tz = Number(tz)/3600;
    if (!Main.config.show_gmt){
      return Ext.util.Format.date(value, 'd.m.Y H:i');
    }
    return Ext.util.Format.date(value, 'd.m.Y H:i')+' [GMT&nbsp;'+((tz>=-0)?'+':'-')+tz+']';
    },
  localDateOnlyRenderer: function(value) {
    value = parseDate(value);
    if (!value) {
      return '';
    }
    return Ext.util.Format.date(value, 'd.m.Y');
  },
  localDateText: function(value) {
    return Ext.util.Format.localDateRenderer(value).replace('&nbsp;', ' ');
  },
  //2013/12/16 3759 ptanya только месяц и год
  localMonthYearOnlyRenderer: function(value) {
    value = parseDate(value);
    if (!value) {
      return '';
    }
    return Ext.util.Format.date(value, 'm.Y');
  },
  humanizeSize: function(bytes) {
    var types = [ 'б', 'кб', 'Мб', 'Гб', 'Тб' ];
    for ( var i = 0; bytes >= 1024 && i < types.length-1; i++ ) {
      bytes /= 1024;
    }
    return Math.round(bytes*100)/100.0 + " " + types[i];
  },
  declencionRus: function(n, one, two, more) {
    n = Number(n);
    n = n%100;
    if (undefined===two && undefined===more && Ext.isArray(one)) {
      two = one[1];
      more = one[2];
      one = one[0];
    }
    if (10<n && 20>n)
    {
      return more;
    }
    n = n%10;
    if (1==n)
    {
      return one;
    }
    if (2<=n && 4>=n)
    {
      return two;
    }
    return more;
  },
  formatInterval: function(seconds, params) {
    var strs = {
      d: ['день', 'дня', 'дней'],
      h: ['час', 'часа', 'часов'],
      m: ['минуту', 'минуты', 'минут'],
      s: ['секунду', 'секунды', 'секунд'],
      zs: ['сейчас', 'ровно']
    }
    if (params) {
      if (params.isMs) {
        seconds/=1000;
      }
      if ('nominative' == params.langCase) {
        strs.m[0] = 'минута';
        strs.s[0] = 'секунда';
        //strs.zs[0] = 'нисколько';
      }
    } else {
      params = {};
    }
    var days = Math.floor(seconds/86400);
    var str = [];
    seconds = Math.floor(seconds)%86400;
    if (days>0) {
      str.push(days+' '+Ext.util.Format.declencionRus(days, strs.d));
    }
    var hours = Math.floor(seconds/3600);
    seconds = Math.floor(seconds)%3600;
    if (hours>0 && (!params.lowPrecision||0==days)) {
      str.push(hours+' '+Ext.util.Format.declencionRus(hours, strs.h));
    }
    var minutes = Math.floor(seconds/60);
    seconds = Math.floor(seconds)%60;
    if (minutes>0 && 0==days && (!params.lowPrecision||2>=hours)) {
      str.push(minutes+' '+Ext.util.Format.declencionRus(minutes, strs.m));
    }
    if (params.lowPrecision) {
      if (0==hours && 0==minutes) {
        str = ['меньше минуты'];
      }
    } else {
      seconds = Math.floor(seconds);
      if (0==hours && 0==days) {
        if (0!=seconds) {
          str.push(seconds+' '+Ext.util.Format.declencionRus(seconds, strs.s));
        } else {
          if (0==minutes) {
            str.push(strs.zs[0]);
          } else {
            str.push(strs.zs[1]);
          }
        }
      }
    }
    return str.join(' ');
  },
  digitalInterval: function(seconds, is_msec) {
    if (isNaN(seconds)) {
      return '--:--';
    } else {
      if (is_msec) {
        seconds = seconds/1000;
      }
      var sign = (seconds<0?'-':'');
      seconds = Math.abs(seconds);
      var str = '';
      if (seconds>3600) {
        str += lz(Math.floor(seconds/3600))+':';
        seconds = Math.floor(seconds)%3600;
      }
      str = sign+str+lz(Math.floor(seconds/60)) + ':' + lz(Math.floor(seconds)%60);
      return str;
    }
  },
  account: function(acct) {
    var n = Main.config.etp_id+String.leftPad(acct.toString(), 7, '0');
    return n+(checkSumINN(n+'0')||'X');
  },
  countryFlag: function(name) {
    if (!name) {
      return '';
    }
    name = name.toLowerCase();
    return '<i class="b-fg b-fg_'+name+'"><img src="/images/flags/fg.png"/></i>';
  },
  nl2br: function(str) {
    if (!str) {
      return '';
    }
    return ('' + str).replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br />' + '$2');
  }
});

(function(fm){
  var synonims = {
    'bool': ['boolRenderer'],
    'formatPrice': ['price'],
    'formatInterval': ['interval']
  };
  for (var i in synonims) {
    if (synonims.hasOwnProperty(i)) {
      for (var j=0; j<synonims[i].length; j++) {
        fm[ synonims[i][j] ] = fm[ i ];
      }
    }
  }
})(Ext.util.Format);
