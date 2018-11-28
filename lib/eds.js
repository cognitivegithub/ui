(function() {

var Crypto = {};

var CAPICOM_CERTIFICATE_FIND_SHA1_HASH = 0;
var CAPICOM_CURRENT_USER_STORE = 2;
var CAPICOM_STORE_OPEN_READ_ONLY = 0;
var CAPICOM_MY_STORE = 'My';
var CAPICOM_INFO_SUBJECT_SIMPLE_NAME = 0;
var CAPICOM_INFO_ISSUER_SIMPLE_NAME = 1;
var CAPICOM_INFO_SUBJECT_EMAIL_NAME = 2;
var CAPICOM_INFO_ISSUER_EMAIL_NAME = 3;
var CAPICOM_ENCODE_BASE64 = 0;
var CAPICOM_VERIFY_SIGNATURE_ONLY = 0;
var CAPICOM_VERIFY_SIGNATURE_AND_CERTIFICATE = 1;
var CAPICOM_CERT_INFO_SUBJECT_SIMPLE_NAME = 0;
var CAPICOM_CERT_INFO_ISSUER_SIMPLE_NAME = 1;
var CAPICOM_CERT_INFO_SUBJECT_EMAIL_NAME = 2;
var CAPICOM_CERT_INFO_ISSUER_EMAIL_NAME = 3;
var CAPICOM_CERT_INFO_SUBJECT_UPN = 4;
var CAPICOM_CERT_INFO_ISSUER_UPN = 5;
var CAPICOM_CERT_INFO_SUBJECT_DNS_NAME = 6;
var CAPICOM_CERT_INFO_ISSUER_DNS_NAME = 7;
var CAPICOM_CHECK_ONLINE_ALL = 0x000001EF;
var CAPICOM_CHECK_OFFLINE_REVOCATION_STATUS = 0x00000010;
var CAPICOM_CHECK_ONLINE_REVOCATION_STATUS = 0x00000008;
var CAPICOM_CHECK_SIGNATURE_VALIDITY = 0x00000004;
var CAPICOM_CHECK_TIME_VALIDITY = 0x00000002;
var CAPICOM_CHECK_TRUSTED_ROOT = 0x00000001;
var user_certificate = false;
var CAPICOM_OBJECTS = {};
var CAPICOM_ERROR = null;

function getCAPICOMObject(type) {
  var obj = null;
  if (CAPICOM_OBJECTS[type]) {
    return CAPICOM_OBJECTS[type];
  }
  if (undefined != window.ActiveXObject) {
    obj = new ActiveXObject("CAPICOM."+type);
    if (obj) {
      CAPICOM_OBJECTS[type] = obj;
    }
  }
  return obj;
}

function _to_hex(c)
{
    var digits = new Array('0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F');

    return digits[parseInt(c/16)] + digits[parseInt(c%16)];
}

// Convert unicode string: s to hex-string
function _to_utf8_hex(s) {
  var c, d = "";
  for (var i = 0; i < s.length; i++) {
    c = s.charCodeAt(i);
    if (c <= 0x7f) {
      d += _to_hex(c);
    } else if (c >= 0x80 && c <= 0x7ff) {
      d += _to_hex(((c >> 6) & 0x1f) | 0xc0);
      d += _to_hex((c & 0x3f) | 0x80);
    } else {
      d += _to_hex((c >> 12) | 0xe0);
      d += _to_hex(((c >> 6) & 0x3f) | 0x80);
      d += _to_hex((c & 0x3f) | 0x80);
    }
  }
  return d;
}

function signData(_data, convert_to_utf8, silent)
{
  var str='',signed_text='';
  if (_data=="") {
	  str="!Отсутствуют подписываемые данные!";
  } else {
    signed_text = SignText(_data, convert_to_utf8, silent);
    if (signed_text=="") {
      str="!Отсутствует подпись!";
    } else if (signed_text.charAt(0)=='!') {
      if (signed_text.indexOf('The requested operation has been cancelled by the user.')!=-1) {
        str = '!Операция отменена пользователем.';
      } else if (signed_text.indexOf("The signer's certificate is not valid for signing")!=-1) {
        str = '!Сертификат недействителен! Возможно истек срок его годности либо на вашем компьютере отсутствуют или некорректно настроены средства для работы с ЭП. Обратитесь к поставщику вашего сертификата и СКЗИ.';
      } else {
        str = '!' + signed_text.substr(1);
      }
    }
  }
  if(str)
  {
    if (window.Ext) {
      str = str.replace(/\n/g, '<br/>\n');
    }
    if(silent) {
      signed_text=str;
    } else {
      //alert(str.substr(1));
      signed_text=str;
    }
  }
  return signed_text;
}

function SignTextWorker(SigData, Signer, silent, data)
{
  if (data['convert_to_utf8'] == 1){
    var CU = getCAPICOMObject("Utilities");
    var text = _to_utf8_hex(data['text']);
    if (text.length%4) {
      text += '00';
    }
    SigData.Content=CU.HexToBinary(text);
  } else {
    SigData.Content=data['text'];
  }
  // retStr=SigData.Sign(Signer, true, CAPICOM_ENCODE_BASE64);
  return SigData.Sign(Signer, false, CAPICOM_ENCODE_BASE64);
}

function SignTextGecko(text) {
  var sign = window.crypto.signText(text, "ask" );
  if (sign.match(/^error:/)) {
    var error_map = {
      userCancel: 'The requested operation has been cancelled by the user.',
      noMatchingCert: 'В вашем браузере не установлено ни одного доступного сертификата ЭП.'
    };
    var error = sign.substr(6);
    error = error_map[error]||error;
    return '!'+error;
  }
  return sign;
}

function UseGeckoSigner() {
  return !((typeof(oCAPICOM) == "object") && (oCAPICOM.object != null)) && window.crypto && window.crypto.signText;
}

function SignText(text, convert_to_utf8, silent)
{
  if (UseGeckoSigner()) {
    return SignTextGecko(text);
  }
  var data = {'convert_to_utf8': convert_to_utf8, 'text': text};
  return SignWrapper(SignTextWorker, silent, data);
}

function validateCertificate(cert) {
  var validation = cert.IsValid();
  validation.CheckFlag = CAPICOM_CHECK_TIME_VALIDITY;
  if (!validation.Result) {
    return '! Срок действия сертификата истек или не наступил';
  }
  if (window.Main && Main.eds && Main.eds.client_norev) {
    return true;
  }
  validation.CheckFlag = CAPICOM_CHECK_TRUSTED_ROOT;
  if (!validation.Result) {
    return '! На вашем компьютере в реестре доверенных сертификатов отсутствует корневой сертификат удостоверяющего центра, выдавшего вам электронную подпись. '
          + 'Пожалуйста, обратитесь в ваш УЦ для получения консультации по устранению проблемы. '
          + 'Если сертификат был получен в УЦ ЕЭТП, обратитесь к инструкции по ссылке: <a href="http://www.roseltorg.ru/reestr_uc/" target="_blank">http://www.roseltorg.ru/reestr_uc/</a>.<br/>\n'
          + 'Для установки корневого сертификата из уже установленного личного сертификата ЭП:<ul class="normal-text">'
          + '<li>Шаг 1. Обновите страницу с помощью F5</li>'
          + '<li>Шаг 2. Предпримите еще одну попытку подписи, чтобы открылся список сертификатов, установленных на Вашем компьютере.</li>'
          + '<li>Шаг 3. Выберите из списка нужный вам сертификат и нажмите на него.</li>'
          + '<li>Шаг 4. Нажмите на кнопку «Просмотр сертификата».</li>'
          + '<li>Шаг 5. Выберите вкладку «Путь сертификации».</li>'
          + '<li>Шаг 6. Выбрать подсвеченный красным сертификат и нажать на него.</li>'
          + '<li>Шаг 7. Далее нажать кнопку «Просмотр сертификата».</li>'
          + '<li>Шаг 8. В этом разделе пошагово выполнить следующие команды: «Установить сертификат» → «Далее» → «Поместить все сертификаты в следующее хранилище» → «Обзор» → «Доверенные корневые центры сертификации» → «Ок» → «Далее» → «Готово» → «Да» → и «Ок» до конца запрашиваемых команд.</li>'
          + '</ul>'
          ;
  }

  validation.CheckFlag = CAPICOM_CHECK_SIGNATURE_VALIDITY;
  if (!validation.Result) {
    return '! Подпись сертификата некорректна. Удостоверьтесь в доступности носителя с ключем или попробуйте переустановить сертификат';
  }

  //validation.CheckFlag = CAPICOM_CHECK_ONLINE_REVOCATION_STATUS;
  validation.CheckFlag = CAPICOM_CHECK_ONLINE_ALL;
  if (!validation.Result) {
    var issuer = cert.IssuerName;
    var m;
    if (issuer) {
      issuer = issuer.toString();
      m = issuer.match(/O=([^,]+)/);
      if (m && m[1]) {
        issuer = m[1];
        if ('"' == issuer.charAt(0)) {
          issuer = issuer.substr(1, issuer.length-2).replace(/""/g, '"');
        }
      }
    }

    return '! <br/>'
         + '<b>Сертификат отозван или недействителен</b>.<br/>\n'
         + 'Пожалуйста, обратитесь в удостоверяющий центр, выдавший сертификат, для получения консультации по устранению проблемы.<br/>\n'
         + (issuer?('Издатель сертификата: <b>'+issuer+'</b>'):'')
         ;
  }
  return true;
}

function SignWrapper(worker, silent, data)
{
  var retStr = "";
  var str;
  try
  {
    if (IsCAPICOMInstalled() != true)
    {
      if (CAPICOM_ERROR) {
        str = CAPICOM_ERROR;
      } else {
        if (window.Ext && !Ext.isIE && !window.ActiveXObject) {
          str="Поддержка ЭП в вашем браузере отсутствует. Для использования функций ЭП необходим браузер с поддержкой ActiveX, например Internet Explorer.";
        } else {
          str="Библиотека CAPICOM не может быть загружена, возможно из-за низких прав доступа на данной локальной машине.";
        }
      }
      if(silent)
        return '! '+str;
      else
        return '! '+str;
    }
    else
    {
      if ( !user_certificate )
      {
        var MyStore = getCAPICOMObject("Store");
        MyStore.Open(CAPICOM_CURRENT_USER_STORE, CAPICOM_MY_STORE, CAPICOM_STORE_OPEN_READ_ONLY);
        var Certificates = MyStore.Certificates;
        Certificates = Certificates.Select("Список сертификатов", "Выберите сертификат для подписи документа:");
        user_certificate = Certificates.Item(1);
      }
      if ( !user_certificate )
      {
        return '! Отсутствует сертификат для подписи';
      }
      var validation = validateCertificate(user_certificate);
      if (true!==validation) {
        return validation||'! Сертификат отозван или недействителен';
      }
      var SigData = getCAPICOMObject("SignedData");
      var Signer = getCAPICOMObject("Signer");
      Signer.Certificate = user_certificate;

      retStr = worker(SigData, Signer, silent, data);
      if (!retStr) {
        user_certificate = false;
        return '! Подписание не удалось';
      }
    }
  }
  catch(e)
  {
    user_certificate = false;
    //showException(e);
    if(silent)
      retStr='! '+e;
    else
      retStr='! Исключение: '+e;
  }
  return retStr;
}

var Base64 = {

  // private property
  _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  // public method for encoding
  encode : function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = Base64._utf8_encode(input);
    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output = output +
      this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
      this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
    }
    return output;
  },

  // public method for decoding
  decode : function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {
      enc1 = this._keyStr.indexOf(input.charAt(i++));
      enc2 = this._keyStr.indexOf(input.charAt(i++));
      enc3 = this._keyStr.indexOf(input.charAt(i++));
      enc4 = this._keyStr.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output = output + String.fromCharCode(chr1);
      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }
    }
    //output = Base64._utf8_decode(output);
    //output = Base64._utf8_encode(output);
    return Base64._collapseBytes(output);
  },

  _collapseBytes: function(str) {
    var output = "";
    var l = str.length;
    var i, chr1, chr2, chr3;
    for (i=0; i<l; i+=2) {
      if (i+1<l) {
        chr1 = str.charCodeAt(i);
        chr2 = str.charCodeAt(i+1);
        chr3 = String.fromCharCode(chr1+(chr2<<8));
        output += chr3;
      } else {
        chr1 = str.charCodeAt(i);
        output += String.fromCharCode(chr1);
      }
    }
    return output;
  },

  // private method for UTF-8 encoding
  _utf8_encode : function (string) {
    //string = string.replace(/\r\n/g,"\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      }
      else if((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  },

  // private method for UTF-8 decoding
  _utf8_decode : function (utftext) {
    var string = "";
    var i = 0;
    var c =0, c1 = 0, c2 = 0;

    while ( i < utftext.length ) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      }
      else if((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i+1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      }
      else {
        c1 = utftext.charCodeAt(i+1);
        c2 = utftext.charCodeAt(i+2);
        string += String.fromCharCode(((c & 15) << 12) | ((c1 & 63) << 6) | (c2 & 63));
        i += 3;
      }
    }
    return string;
  }
}

function Base64Decode(data, compat)
{
  var CU;
  if ( !compat && (CU = getCAPICOMObject("Utilities")) ) {
    return CU.Base64Decode(data);
  }
  return Base64.decode(data);
}

function Base64Encode(data)
{
  return Base64.encode(data);
}

function SignFileWorker(SigData, Signer, silent, data)
{
  var CU = getCAPICOMObject("Utilities");
  if (data['co_sign']) {
    SigData.Content = Base64Decode(data['data']);
    var signature = Base64Decode(data['co_sign']);
    SigData.Verify(signature, CAPICOM_VERIFY_SIGNATURE_ONLY);
    return SigData.CoSign(Signer, CAPICOM_ENCODE_BASE64);
  } else {
    var content = Base64Decode(data['data'], data.bugfix);
    /*if (data.bugfix) {
      content = content + '\x00';
    }*/
    SigData.Content = content;
    return SigData.Sign(Signer, data['detached'], CAPICOM_ENCODE_BASE64);
  }
  //return false;
}

function SignFile(data, co_sign, silent, detached, bugfix)
{
  if (undefined == detached) {
    detached = true;
  }
  var sdata = {'data': data, 'co_sign': co_sign, 'detached': detached, bugfix: bugfix||false};
  return SignWrapper(SignFileWorker, silent, sdata);
}

function IsCAPICOMInstalled()
{
  CAPICOM_ERROR = null;
  if ((typeof(oCAPICOM) == "object") && (oCAPICOM.object != null)) {
    var objects = ['Utilities', 'Store', 'SignedData', 'Signer'];
    var obj, msg;
    for (var i=0; i<objects.length; i++) {
      msg = 'Библиотека CAPICOM загружена, однако не удалось получить доступ к одному из ее компонентов ('+objects[i]+').\n'+
            'Вероятно Вы или Ваш браузер запретили доступ к этому компоненту.\n'+
            'Разрешите доступ к компоненту. Такая ошибка может возникать по каждому из компонентов по очереди (до 4-х раз). '+
            'Для предотвращения таких ошибок внесите этот сайт в список доверенных.';
      try {
        obj = getCAPICOMObject(objects[i]);
      } catch (e) {
        msg += '\nПодробности ошибки: '+e+'';
        obj = null;
      }
      if (!obj) {
        CAPICOM_ERROR = msg;
        return false;
      }
    }
    return true;
  }
  return false;
}

function merge(obj1, obj2){
    for(var p in obj2){
        if(obj1[p]===undefined) obj1[p]=obj2[p];
    }
    return obj1;
}

function getSelectedRange(element) {
	if (typeof element.selectionStart !== 'undefined')
		return {
			start : element.selectionStart,
			end : element.selectionEnd
		};
	var pos = {
		start : 0,
		end : 0
	};
	var range = document.selection.createRange();
	if (!range || range.parentElement() != element)
		return pos;
	var dup = range.duplicate();
	if (element.type == 'text') {
		pos.start = 0 - dup.moveStart('character', -100000);
		pos.end = pos.start + range.text.length;
	} else {
		var value = element.value;
		var offset = value.length;
		dup.moveToElementText(element);
		dup.setEndPoint('StartToEnd', range);
		if (dup.text.length)
			offset -= value.match(/[\n\r]*$/)[0].length;
		pos.end = offset - dup.text.length;
		dup.setEndPoint('StartToStart', range);
		pos.start = offset - dup.text.length;
	}
	return pos;
}

function getSelectionStart(element) {
	return getSelectedRange(element).start;
}

function getSelectionEnd(element) {
	return getSelectedRange(element).end;
}

function setCaretPosition(element, pos) {
	if (pos == 'end')
		pos = element.value.length;
	selectRange(element, pos, pos);
}

function getCaretPosition(element) {
	return getSelectedRange(element).start;
}

function selectRange(element, start, end) {
	if (element.setSelectionRange) {
		element.focus();
		element.setSelectionRange(start, end);
	} else {
		var value = element.value;
		var diff = value.substr(start, end - start).replace(/\r/g, '').length;
		start = value.substr(0, start).replace(/\r/g, '').length;
		var range = element.createTextRange();
		range.collapse(true);
		range.moveEnd('character', start + diff);
		range.moveStart('character', start);
		range.select();
	}
}

function strToArr(string) {
	var arr = [];
	var p = 0;
	var temp_char = '';
	while (true) {
		temp_char = string.substr(p, 1);
		if (temp_char.length) {
			arr.push(temp_char);
			p++;
		} else {
			break;
		}
	}
	return arr;
}

function formatNumber(n, c, d, t) {
	var c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined
			? "."
			: t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0)
			.toFixed(c))
			+ "", j = (j = i.length) > 3 ? j % 3 : 0;
	return s + (j ? i.substr(0, j) + t : "")
			+ i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t)
			+ (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
}

function tidy(string) {
	string = string.replace(/\s/g, '');
	string = string.replace(/\,/, '.');
	return string;
}

function getCertificates() {
  var MyStore = getCAPICOMObject("Store");
  MyStore.Open(CAPICOM_CURRENT_USER_STORE, CAPICOM_MY_STORE, CAPICOM_STORE_OPEN_READ_ONLY);
  var Certificates = MyStore.Certificates;
  var count = Certificates.Count();
  var certs = new Array();
  for (var i=1; i<=count; i++) {
    var cert = Certificates.Item(i);
    var data = {subject: cert.SubjectName(),
                validfor: cert.ValidToDate()
               };
    certs.push(data);
  }
  return certs;
}

var EDSHash = {
  binl2str: function (bin, chrsz){
    var str = "";
    var mask = (1 << chrsz) - 1;
    for(var i = 0; i < bin.length * 32; i += chrsz) {
      str += String.fromCharCode((bin[i>>5] >>> (i % 32)) & mask);
    }
    return str;
  },
  str2binl: function (str, chrsz){
    var bin = [];
    var mask = (1 << chrsz) - 1;
    for(var i = 0; i < str.length * chrsz; i += chrsz) {
      bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
    }
    return bin;
  },
  str2bin: function (str){
    var bin = [];
    for(var i = 0; i < str.length; i ++) {
      bin[i] = str.charCodeAt(i);
    }
    return bin;
  },
  binl2hex: function (binarray, hexcase){
    var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
    var str = "";
    for(var i = 0; i < binarray.length * 4; i++) {
      str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) + hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
    }
    return str;
  },
  bin2hex: function (binarray, hexcase){
    var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
    var str = "";
    for(var i = 0; i < binarray.length; i++) {
      str += hex_tab.charAt((binarray[i]>>4)&0x0F) + hex_tab.charAt(binarray[i]&0x0F);
    }
    return str;
  },
  zero: function (len) {
    var t = [];
    for (var i=0; i<len; i++) {
      t.push(0);
    }
    return t;
  },
  copy: function (to, from) {
    var len = from.length;
    for (var i=0; i<len; i++) {
      to[i] = from[i];
    }
  },
  isString: function (object) {
    return Object.prototype.toString.call(object) == "[object String]";
  },

   /**
   * Вспомогательное свойство для хранения байтовой таблицы вычисления CRC32.
   * Таблица вычисляется по требованию. Жрёт 1КБ памяти.
   */
  crcTable: function() {
    var table = [];
    var c, i, j;

    for (i = 0; i < 256; c = ++i) {
      for (j = 0; j < 8; j++)
        c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;

      table[i] = c;
    }
    return table;
  }
};

//  Usage: string Ext.util.MD5 ( string str [, bool raw_output ][, bool hexcase ][, number charset {8(ASCII):16(UNICODE)} ] )
//  [code]
//  var MD5Hash = Ext.util.MD5("testtext"); //returns 0ea2d99c9848117666c38abce16bb43e
//  var MD5Hash = Ext.util.MD5("testtext",false,true); //returns 0EA2D99C9848117666C38ABCE16BB43E
//  var MD5Hash = Ext.util.MD5("testtext",true); //returns binary string
var MD5Hash = function(s,raw,hexcase,chrsz) {
  raw = raw || false;
  hexcase = hexcase || false;
  chrsz = chrsz || 8;

  var str2binl = EDSHash.str2binl;
  var binl2str = EDSHash.binl2str;
  var binl2hex = EDSHash.binl2hex;

  function safe_add(x, y){
    var lsw = (x & 0xFFFF) + (y & 0xFFFF);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
  }
  function bit_rol(num, cnt){
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function md5_cmn(q, a, b, x, s, t){
    return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
  }
  function md5_ff(a, b, c, d, x, s, t){
    return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
  }
  function md5_gg(a, b, c, d, x, s, t){
    return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
  }
  function md5_hh(a, b, c, d, x, s, t){
    return md5_cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5_ii(a, b, c, d, x, s, t){
    return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
  }

  function core_md5(x, len){
    x[len >> 5] |= 0x80 << ((len) % 32);
    x[(((len + 64) >>> 9) << 4) + 14] = len;
    var a =  1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d =  271733878;
    for(var i = 0; i < x.length; i += 16){
      var olda = a;
      var oldb = b;
      var oldc = c;
      var oldd = d;
      a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
      d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
      c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
      b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
      a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
      d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
      c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
      b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
      a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
      d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
      c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
      b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
      a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
      d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
      c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
      b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);
      a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
      d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
      c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
      b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
      a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
      d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
      c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
      b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
      a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
      d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
      c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
      b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
      a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
      d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
      c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
      b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);
      a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
      d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
      c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
      b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
      a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
      d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
      c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
      b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
      a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
      d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
      c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
      b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
      a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
      d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
      c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
      b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);
      a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
      d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
      c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
      b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
      a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
      d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
      c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
      b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
      a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
      d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
      c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
      b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
      a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
      d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
      c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
      b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);
      a = safe_add(a, olda);
      b = safe_add(b, oldb);
      c = safe_add(c, oldc);
      d = safe_add(d, oldd);
    }
    return [a, b, c, d];
  }

  return (raw ? binl2str(core_md5(str2binl(s, chrsz), s.length * chrsz), chrsz)
              : binl2hex(core_md5(str2binl(s, chrsz), s.length * chrsz), hexcase)
         );
};

function GostHash(s) {
  var block, Sum, H, newH, L;
  var pos = 0, posIB = 0;
  var blklen = 32;
  var c, i, j;
  var buf = EDSHash.isString(s)?EDSHash.str2bin(s):s;
  var len = buf.length;

  // ГОСТ 28147-89
  /*var S = [ // S-блоки, используемые ЦБ РФ
    [ 4, 10,  9,  2, 13,  8,  0, 14,  6, 11,  1, 12,  7, 15,  5,  3],
    [14, 11,  4, 12,  6, 13, 15, 10,  2,  3,  8,  1,  0,  7,  5,  9],
    [ 5,  8,  1, 13, 10,  3,  4,  2, 14, 15, 12,  7,  6,  0,  9, 11],
    [ 7, 13, 10,  1,  0,  8,  9, 15, 14,  4,  6, 12, 11,  2,  5,  3],
    [ 6, 12,  7,  1,  5, 15, 13,  8,  4, 10,  9, 14,  0,  3, 11,  2],
    [ 4, 11, 10,  0,  7,  2,  1, 13,  3,  6,  8,  5,  9, 12, 15, 14],
    [13, 11,  4,  1,  3, 15,  5,  9,  0, 10, 14,  7,  6,  8,  2, 12],
    [ 1, 15, 13,  0,  5,  7, 10,  4,  9,  2,  3, 14,  6, 11,  8, 12],
  ];*/
  var S = [
    [0xA,0x4,0x5,0x6,0x8,0x1,0x3,0x7,0xD,0xC,0xE,0x0,0x9,0x2,0xB,0xF],
    [0x5,0xF,0x4,0x0,0x2,0xD,0xB,0x9,0x1,0x7,0x6,0x3,0xC,0xE,0xA,0x8],
    [0x7,0xF,0xC,0xE,0x9,0x4,0x1,0x0,0x3,0xB,0x5,0x2,0x6,0xA,0x8,0xD],
    [0x4,0xA,0x7,0xC,0x0,0xF,0x2,0x8,0xE,0x1,0x6,0x5,0xD,0xB,0x9,0x3],
    [0x7,0x6,0x4,0xB,0x9,0xC,0x2,0xA,0x1,0x8,0x0,0xE,0xF,0xD,0x3,0x5],
    [0x7,0x6,0x2,0x4,0xD,0x9,0xF,0x0,0xA,0x1,0x5,0xB,0x8,0xE,0xC,0x3],
    [0xD,0xE,0x4,0x1,0x7,0x0,0x5,0xA,0x3,0xC,0x8,0xF,0x6,0x2,0x9,0xB],
    [0x1,0x3,0xA,0x9,0x5,0xB,0x4,0xF,0x8,0x6,0x7,0xE,0xD,0x0,0x2,0xC]];

  function E_f(A, K, R, o) { // Функция f в ГОСТ 28147-89
    var c = 0; //Складываем по модулю 2^32. c - перенос  в следующий разряд
    var i, x, tmp, nTmp;
    for (i = 0; i < 4; i++) {
      c += A[i] + K[o+i];
      R[i] = c & 0xFF;
      c >>= 8;
    }

    for (i = 0; i < 8; i++) {                  // Заменяем 4х-битные кусочки согласно S-блокам
      x = R[i >> 1] & ((i & 1) ? 0xF0 : 0x0F);   // x - 4х-битный кусочек
      R[i >> 1] ^= x;                                // Обнуляем соответствующие биты
      x >>= (i & 1) ? 4 : 0;                         // сдвигаем x либо на 0, либо на 4 бита влево
      x = S[i][x];                                   // Заменяем согласно S-блоку
      R[i >> 1] |= x << ((i & 1) ? 4 : 0);           //
    }

    tmp = R[3]; // Сдвигаем на 8 бит (1 байт) влево
    R[3] = R[2];
    R[2] = R[1];
    R[1] = R[0];
    R[0] = tmp;

    tmp = R[0] >> 5; // Сдвигаем еще на 3 бита влево
    for (i = 1; i < 4; i++) {
      nTmp = R[i] >> 5;
      R[i] = 0xFF&((R[i] << 3) | tmp);
      tmp = nTmp;
    }
    R[0] = 0xFF&((R[0] << 3) | tmp);
  }

  function E(D, K, R, o) { // ГОСТ 28147-89
    var A = [], B = [];                                //Инициализация блоков A и B
    var i, step, tmp;
    for (i = 0; i < 4; i++) A[i] = D[o+i];
    for (i = 0; i < 4; i++) B[i] = D[o+i + 4];

    for (step = 0; step < 3; step++)         // K1..K24 идут в прямом порядке - три цикла K1..K8
      for (i = 0; i < 32; i += 4) {
        tmp = []
        E_f(A, K, tmp, i);              // (K + i) - массив K с i-го элемента
        for (j = 0; j < 4; j++) tmp[j] ^= B[j];
        EDSHash.copy(B, A);
        EDSHash.copy(A, tmp);
      }
    for (i = 28; i >= 0; i -= 4) { // А K25..K32 идут в обратном порядке
      tmp = [];
      E_f(A, K, tmp, i);
      for (j = 0; j < 4; j++) tmp[j] ^= B[j];
      EDSHash.copy(B, A);
      EDSHash.copy(A, tmp);
    }
    for (i = 0; i < 4; i++) R[o+i] = B[i];      //Возвращаем результат
    for (i = 0; i < 4; i++) R[o+i + 4] = A[i];
  }

  // GOST R 34.11-94
  function A(Y, R) {
    var i;
    for (i = 0; i < 24; i++) R[i] = Y[i + 8];
    for (i = 0; i < 8; i++) R[i + 24] = Y[i] ^ Y[i + 8];
  }
  function fi(arg) { // Функция фи. Отличие от функции в статье - нумерация не 1..32, а 0..31
    var i = arg & 0x03;
    var k = arg >> 2;k++;
    return (i << 3) + k - 1;
  }
  function P(Y, R) {
    for (var i = 0; i < 32; i++) R[i] = Y[fi(i)];
  }

  function psi(arr, p) {
    var i, y16;
    while (p--) {
      y16 = [0, 0];
      y16[0] ^= arr[ 0];y16[1] ^= arr[ 1];
      y16[0] ^= arr[ 2];y16[1] ^= arr[ 3];
      y16[0] ^= arr[ 4];y16[1] ^= arr[ 5];
      y16[0] ^= arr[ 6];y16[1] ^= arr[ 7];
      y16[0] ^= arr[24];y16[1] ^= arr[25];
      y16[0] ^= arr[30];y16[1] ^= arr[31];
      for (i = 0; i < 30; i++) arr[i] = arr[i + 2];
      arr[30] = y16[0];arr[31] = y16[1];
    }
  }
  function f(H, M, newH) { // Функция f
    var C = [];
    C[0] = EDSHash.zero(blklen);
    C[1] = EDSHash.zero(blklen);
    C[2] = [0x00, 0xFF, 0x00, 0xFF, 0x00, 0xFF, 0x00, 0xFF, 0xFF, 0x00, 0xFF, 0x00, 0xFF, 0x00, 0xFF, 0x00,
            0x00, 0xFF, 0xFF, 0x00, 0xFF, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0xFF];
    C[3] = EDSHash.zero(blklen);

    var U = [], V = [], W = [], K = [], tmp = [];
    var i, step, t;
    EDSHash.copy(U, H);
    EDSHash.copy(V, M);
    for (i = 0; i < 32; i++)
      W[i] = U[i] ^ V[i];
    K[0] = EDSHash.zero(blklen);
    K[1] = EDSHash.zero(blklen);
    K[2] = EDSHash.zero(blklen);
    K[3] = EDSHash.zero(blklen);
    P(W, K[0]);

    for (step = 1; step < 4; step++) {
      A(U, tmp);
      for (i = 0; i < 32; i++) U[i] = tmp[i] ^ C[step][i];
      A(V, tmp);A(tmp, V);
      for (i = 0; i < 32; i++) W[i] = U[i] ^ V[i];
      P(W, K[step]);
    }

    var S = EDSHash.zero(blklen);
    for (i = 0; i < 32; i += 8)
      E(H, K[i >> 3], S, i);

    psi(S, 12);
    for (i = 0; i < 32; i++) S[i] ^= M[i];
    psi(S, 1 );
    for (i = 0; i < 32; i++) S[i] ^= H[i];
    psi(S, 61);
    EDSHash.copy(newH, S);
  }

  Sum = EDSHash.zero(blklen);
  H = EDSHash.zero(blklen);
  block = EDSHash.zero(blklen);
  newH = EDSHash.zero(blklen);
  L = EDSHash.zero(blklen);

  while ((posIB < len) || pos) {
    if (posIB < len)
      block[pos++] = buf[posIB++];
    else
      block[pos++] = 0;
    if (pos == 32) {
      pos = 0;

      c = 0;
      for (i = 0; i < 32; i++) {
        c += block[i] + Sum[i];
        Sum[i] = c & 0xFF;
        c >>= 8;
      }

      f(H, block, newH);
      EDSHash.copy(H, newH);
    }
  }

  c = len << 3;
  for (i = 0; i < 32; i++) {
    L[i] = c & 0xFF;
    c >>= 8;
  }
  f(H, L, newH);
  EDSHash.copy(H, newH);
  f(H, Sum, newH);
  return EDSHash.bin2hex(newH);
}

/**
 * Вычисляет хеш CRC32 указанной строки или массива бинарных данных.
 * Использование: var hash = Crc32.compute('some string or array of bytes');
 * @param {String} buf Данные (строка или массив).
 * @return {Integer} CRC32.
 */
function CRC32Hash(buf) {
  var c = 0xFFFFFFFF, i;

  if (typeof buf === 'string') {
    buf = EDSHash.str2bin(buf);
  }

  if (typeof EDSHash.crcTable === 'function')
    EDSHash.crcTable = EDSHash.crcTable();

  for (i = 0; i < buf.length; i++)
    c = EDSHash.crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);

  return ~c;
}

if (window.Ext) {
  Ext.util.MD5 = MD5Hash;
  Ext.util.GOST = GostHash;
  Ext.util.CRC32 = CRC32Hash;
  Ext.util.Base64 = {
    encode: Base64Encode,
    decode: Base64Decode
  }
}

Crypto.IsCAPICOMInstalled = IsCAPICOMInstalled;
Crypto.SignText = SignText;
Crypto.SignFile = SignFile;
Crypto.signData = signData;
window.Crypto = Crypto;

(function(){
  for (var i in Crypto) {
    if (Crypto.hasOwnProperty(i)) {
      window[i] = Crypto[i];
    }
  }
})();

})();

function checkSum(string, weights, mod1, mod2) {
  mod1 = mod1 || 11;
  mod2 = mod2 || 10;
  var sum = 0;
  var i;
  for (i=0; i<string.length; i+=1)
  {
    if (weights.length>i) {
      sum += parseInt(string.charAt(i), 10)*weights[i];
    }
  }
  sum %= mod1;
  sum %= mod2;
  return sum;
}

function validateBankCorAccount(kor, bik)
{
  if (kor.length>0 && bik.length>6)
  {
    var weights = [7,1,3,7,1,3,7,1,3,7,1,3,7,1,3,7,1,3,7,1,3,7,1];
    var data = '0'+bik.substr(4, 2)+kor;
    if ( 0 != checkSum(data, weights, 10) )
    {
      return false;
    }
  }
  return true;
}

function validateBankAccount(acc, bik)
{
  if ( acc.length>0 && bik.length>6 )
  {
    var weights = [7,1,3,7,1,3,7,1,3,7,1,3,7,1,3,7,1,3,7,1,3,7,1];
    var data = bik.substr(bik.length-3)+acc;
    if ( 0 != checkSum(data, weights, 10) )
    {
      return false
    }
  }
  return true;
}

/**
 * Проверка результата подписи. Выдает алерт/мессаджбокс если была ошибка
 * @param signatureValue результат работы Sign*
 * @return bool статус подписи, true если все хорошо
 */
function checkSignatureResult(signatureValue, failure) {
  if (!signatureValue || signatureValue.charAt(0)=='!') {
    var t = signatureValue?signatureValue.substr(1):'Отсутствует ЭП';
    if (window.Ext) {
      Ext.MessageBox.alert('Ошибка', t, failure);
    } else {
      alert('Ошибка: '+t);
    }
    return false;
  }
  return true;
}

/**
 * Подпись строки. Проверяет режим ЭП и результат подписи, отображает сообщение
 * с ошибкой при необходимости
 * @param text текст для подписи
 * @param failure каллбек фейла
 * @return String|false возвращает либо строку с подписью, либо false если подпись не удалась
 */
function getSignature(text, failure) {
  if(window.Main && Main.eds && Main.eds.mode == 'none') {
    return 'null signature: '+text;
  }
  var signatureValue = signData(text, 1);
  if (!checkSignatureResult(signatureValue, failure)) {
    return false;
  }
  return signatureValue;
}

/**
 * Подписать текст ЭП. Спрашивает подтверждения, отображает ошибки клиенту
 * @param text текст для подписи
 * @param success каллбек при успехе подписи. Получает один параметр: ЭП
 * @param failure каллбек для неудачи подписи.
 * @return ничего не возвращает, работает только на каллбеках
 */
function getSignatureEx(text, success, failure) {
  function signer() {
    var signature = getSignature(text, failure);
    if (false!==signature && success) {
      success(signature);
    }
  }

  if (window.Main && Main.eds && Main.eds.warn_usage) {
    var title = 'Подвердите выполнение подписи';
    var warning = 'Внимание! В соответствии с п.1 ст.6 ФЗ РФ от 6 апреля 2011 г. N 63-ФЗ "Об электронной подписи", '+
                  'подписание информации квалифицированной электронной подписью является юридически значимым действием, '+
                  'влекущим ответственность за достоверность подписанной электронной подписью информации! '+
                  'Вы уверены, что необходимо выполнить подписание?';
    if (window.Ext) {
      Ext.MessageBox.confirm(title, warning, function(b){
        if ('yes'==b) {
          signer();
        } else if (failure) {
          failure(1);
        }
      });
    } else {
      if (window.confirm(warning)) {
        signer();
      } else if (failure) {
        failure(1);
      }
    }
  } else {
    signer();
  }
}
